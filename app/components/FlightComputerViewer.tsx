"use client";

/**
 * FlightComputerViewer
 *
 * Renders the DAQ V4.1 flight computer (the KRAKENBANE I avionics board) from
 * its CAD export, with technical callouts anchored to real component positions.
 *
 * Notes on the asset:
 *  - Source CAD export is 11.4 MB / 13,579 primitives. The served model is
 *    meshopt-compressed and material-joined down to 1.0 MB / 27 draw calls
 *    (see `npm run model:optimize`), which is what makes this viable on the web.
 *  - Meshopt requires a decoder, wired up below.
 *
 * Performance / correctness decisions:
 *  - Labels are positioned by mutating DOM style directly inside the render
 *    loop rather than through React state, to avoid 60 re-renders a second.
 *  - Rendering pauses when the canvas scrolls out of view and when the tab is
 *    hidden.
 *  - Motion is a slow yaw drift, not a full turntable spin, so the callouts
 *    stay readable. Disabled entirely under `prefers-reduced-motion`.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader, RoomEnvironment } from "three-stdlib";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { BOARD_ANNOTATIONS } from "../data/board";
import { VIEWER } from "../data/copy";
import styles from "./FlightComputerViewer.module.css";

/** Remembers the label toggle between visits. */
const LABELS_STORAGE_KEY = "daq-viewer-labels";

const MODEL_URL = "/models/DAQ-V4.1-web.glb";

/** Model is normalised so its longest edge equals this many world units. */
const MODEL_SCALE = 1;

/** Initial camera framing, in degrees. */
const AZIMUTH_START = 62;
const ELEVATION_START = 30;
const ELEVATION_MIN = -12;
const ELEVATION_MAX = 78;

const FOV = 30;
/**
 * Extra breathing room around the fitted bounding box. Kept a little generous
 * so the callout columns down each edge don't sit on top of the board.
 */
const FIT_PADDING = 1.2;

/** Idle drift: amplitude in degrees and period in seconds. */
const DRIFT_AMPLITUDE = 7;
const DRIFT_PERIOD = 18;

const DRAG_SENSITIVITY = 0.32;
/** How quickly the camera eases toward its target angles (per frame, at 60fps). */
const EASE = 0.09;

/* ---------------------------- callout layout ---------------------------- */

/** One annotation's screen position: `x`/`y` is the part, `ly` the label row. */
type Slot = { i: number; x: number; y: number; ly: number };

/** Inset of the label columns from the panel edge. */
const COLUMN_PAD = 12;
/** Short horizontal run where the leader line meets the label. */
const LEADER_STUB = 12;
/** Keep labels this far from the top and bottom edges. */
const EDGE_MARGIN = 10;
/** Vertical space kept clear at the top of the right column for the toggle. */
const TOGGLE_RESERVE = 30;

/**
 * Spreads a column of labels vertically so none overlap, staying as close to
 * each label's ideal y as the available height allows.
 */
function packColumn(items: Slot[], h: number, labelH: number, topInset = 0) {
  if (items.length === 0) return;
  const gap = labelH + 8;
  // `ly` is the label's centre, so keep half a box clear of each edge.
  const half = labelH / 2;
  const top = EDGE_MARGIN + topInset + half;
  const bottom = h - EDGE_MARGIN - half;

  items.sort((a, b) => a.y - b.y);

  // Honour each label's desired y, pushing later ones down to clear it.
  let prev = -Infinity;
  for (const it of items) {
    it.ly = Math.max(it.y, prev + gap);
    prev = it.ly;
  }

  // If that ran past the bottom, shift the whole column up...
  const overflow = items[items.length - 1].ly - bottom;
  if (overflow > 0) for (const it of items) it.ly -= overflow;

  // ...then re-assert the top margin, cascading down again.
  prev = top - gap;
  for (const it of items) {
    it.ly = Math.max(it.ly, prev + gap);
    prev = it.ly;
  }
}

type Status = "loading" | "ready" | "error" | "unsupported";

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Smallest camera distance that keeps every corner of `box` inside the frustum.
 * Projects the corners onto the camera basis instead of using a bounding sphere,
 * which matters here because the board is long and thin — a sphere fit would
 * leave far too much empty space.
 */
function fitDistance(
  box: THREE.Box3,
  target: THREE.Vector3,
  dir: THREE.Vector3,
  fovDeg: number,
  aspect: number
): number {
  const vFov = (fovDeg * Math.PI) / 180;
  const tanV = Math.tan(vFov / 2);
  const tanH = tanV * aspect;

  const back = dir.clone().normalize();
  const right = new THREE.Vector3()
    .crossVectors(new THREE.Vector3(0, 1, 0), back)
    .normalize();
  if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
  const up = new THREE.Vector3().crossVectors(back, right).normalize();

  const corner = new THREE.Vector3();
  const rel = new THREE.Vector3();
  let distance = 0;

  for (let i = 0; i < 8; i++) {
    corner.set(
      i & 1 ? box.max.x : box.min.x,
      i & 2 ? box.max.y : box.min.y,
      i & 4 ? box.max.z : box.min.z
    );
    rel.subVectors(corner, target);
    const x = Math.abs(rel.dot(right));
    const y = Math.abs(rel.dot(up));
    const z = rel.dot(back);
    distance = Math.max(distance, x / tanH + z, y / tanV + z);
  }
  return distance * FIT_PADDING;
}

/** Soft elliptical shadow so the board reads as sitting in space, not floating blankly. */
function makeContactShadow(): THREE.Mesh {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(0,0,0,0.5)");
  g.addColorStop(0.45, "rgba(0,0,0,0.22)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      opacity: 0.85,
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = -1;
  return mesh;
}

/**
 * Nudge the CAD materials toward something that photographs well: real ENIG
 * gold on the pads, a richer soldermask, and environment reflections on metal.
 * Materials keep their `mat_N` names through the optimisation pipeline, so they
 * can still be addressed individually.
 */
function refineMaterial(material: THREE.MeshStandardMaterial) {
  switch (material.name) {
    // Gold-plated pads.
    case "mat_21":
      material.color.setRGB(0.83, 0.68, 0.22);
      material.metalness = 1;
      material.roughness = 0.28;
      break;
    // Bare copper / vias.
    case "mat_22":
      material.color.setRGB(0.72, 0.45, 0.28);
      material.metalness = 1;
      material.roughness = 0.38;
      break;
    // Silkscreen.
    case "mat_23":
      material.color.setRGB(0.93, 0.94, 0.95);
      material.metalness = 0;
      material.roughness = 0.75;
      break;
    // Soldermask. Stays translucent so the copper pour reads through it.
    case "mat_24":
      material.color.setRGB(0.035, 0.14, 0.09);
      material.metalness = 0;
      material.roughness = 0.42;
      material.depthWrite = false;
      break;
    // FR-4 substrate.
    case "mat_25":
      material.color.setRGB(0.1, 0.12, 0.11);
      material.metalness = 0;
      material.roughness = 0.85;
      break;
    default:
      // Component bodies: keep authored colour, just make the shading plausible.
      if (material.metalness > 0.5) {
        material.roughness = Math.max(0.25, material.roughness);
      } else {
        material.roughness = 0.55;
        material.metalness = 0.15;
      }
  }
  material.envMapIntensity = 1.15;
  material.needsUpdate = true;
}

const FlightComputerViewer = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const leaderRefs = useRef<(SVGPolylineElement | null)[]>([]);
  const leaderSvgRef = useRef<SVGSVGElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [labelsOn, setLabelsOn] = useState(true);

  /**
   * The render loop reads this ref rather than the state value, so toggling
   * labels never has to re-create the three.js scene.
   */
  const labelsOnRef = useRef(true);

  const setLabelRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      labelRefs.current[index] = el;
    },
    []
  );

  const setDotRef = useCallback(
    (index: number) => (el: HTMLSpanElement | null) => {
      dotRefs.current[index] = el;
    },
    []
  );

  const setLeaderRef = useCallback(
    (index: number) => (el: SVGPolylineElement | null) => {
      leaderRefs.current[index] = el;
    },
    []
  );

  // Restore the saved preference on mount.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LABELS_STORAGE_KEY);
      if (saved !== null) {
        const on = saved === "true";
        setLabelsOn(on);
        labelsOnRef.current = on;
      }
    } catch {
      /* localStorage can be unavailable in private modes — default stays on. */
    }
  }, []);

  const toggleLabels = useCallback(() => {
    setLabelsOn((prev) => {
      const next = !prev;
      labelsOnRef.current = next;
      try {
        window.localStorage.setItem(LABELS_STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    if (!supportsWebGL()) {
      setStatus("unsupported");
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------------------------------------------------------------- setup */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 100);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearAlpha(0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    renderer.domElement.classList.add(styles.canvas);

    /* -------------------------------------------------------- environment  */
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;

    /* ------------------------------------------------------------- lights  */
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(1.4, 2.2, 1.1);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x9cc4ff, 0.75);
    fill.position.set(-1.7, 0.7, -0.9);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.9);
    rim.position.set(-0.4, 1.1, -2);
    scene.add(rim);

    scene.add(new THREE.AmbientLight(0xffffff, 0.18));

    /* -------------------------------------------------------------- pivot  */
    const pivot = new THREE.Group();
    scene.add(pivot);

    // Markers live in pivot space at `anchor * MODEL_SCALE`, which lines up with
    // the model because of how it is centred and normalised below.
    const markers = BOARD_ANNOTATIONS.map((a) => {
      const marker = new THREE.Object3D();
      marker.position.set(
        a.anchor[0] * MODEL_SCALE,
        a.anchor[1] * MODEL_SCALE,
        a.anchor[2] * MODEL_SCALE
      );
      pivot.add(marker);
      return marker;
    });

    /* ------------------------------------------------------ camera state   */
    const state = {
      azimuth: (AZIMUTH_START * Math.PI) / 180,
      elevation: (ELEVATION_START * Math.PI) / 180,
      targetAzimuth: (AZIMUTH_START * Math.PI) / 180,
      targetElevation: (ELEVATION_START * Math.PI) / 180,
      distance: 3,
      baseAzimuth: (AZIMUTH_START * Math.PI) / 180,
      userEngaged: false,
    };
    const target = new THREE.Vector3(0, 0, 0);
    const modelBox = new THREE.Box3();

    let disposed = false;
    let raf = 0;
    let visible = true;
    let loaded = false;

    const recomputeDistance = () => {
      if (!loaded) return;
      const aspect = Math.max(camera.aspect, 0.0001);
      const dir = new THREE.Vector3(
        Math.sin(state.azimuth) * Math.cos(state.elevation),
        Math.sin(state.elevation),
        Math.cos(state.azimuth) * Math.cos(state.elevation)
      );
      state.distance = fitDistance(modelBox, target, dir, FOV, aspect);
    };

    let warnedAboutSize = false;

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) {
        // A zero-sized container renders nothing at all, and it is not obvious
        // from the page why. Say so once instead of failing quietly.
        if (process.env.NODE_ENV !== "production" && !warnedAboutSize) {
          warnedAboutSize = true;
          console.warn(
            `[FlightComputerViewer] container measured ${w}x${h}; the canvas cannot be sized. ` +
              `Give the parent of .wrapper a definite height.`
          );
        }
        return;
      }
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      // Keep the leader-line overlay in CSS pixel coordinates.
      leaderSvgRef.current?.setAttribute("viewBox", `0 0 ${w} ${h}`);
      recomputeDistance();
    };

    /* --------------------------------------------------------------- load  */
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;

        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = MODEL_SCALE / maxDim;

        // Centre the model on the origin, then normalise its size. A marker at
        // `anchor * MODEL_SCALE` in pivot space now lands on the right component.
        gltf.scene.position.set(-center.x, -center.y, -center.z);
        const scaled = new THREE.Group();
        scaled.add(gltf.scene);
        scaled.scale.setScalar(scale);
        pivot.add(scaled);

        gltf.scene.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.frustumCulled = false;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            if ((m as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
              refineMaterial(m as THREE.MeshStandardMaterial);
            }
          });
        });

        modelBox.setFromObject(scaled);

        // Contact shadow, sized to the board and sat just under it.
        const shadow = makeContactShadow();
        const boardSize = modelBox.getSize(new THREE.Vector3());
        shadow.scale.set(boardSize.x * 3.4, boardSize.z * 1.9, 1);
        shadow.position.y = modelBox.min.y - 0.035;
        pivot.add(shadow);

        loaded = true;
        resize();
        setStatus("ready");
      },
      (event) => {
        if (event.total > 0) {
          setProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
        }
      },
      (err) => {
        console.error("[FlightComputerViewer] failed to load model", err);
        if (!disposed) setStatus("error");
      }
    );

    /* ------------------------------------------------------------ pointer  */
    let pointerId: number | null = null;
    let lastX = 0;
    let lastY = 0;
    let axisLocked: "none" | "horizontal" | "vertical" = "none";
    let startX = 0;
    let startY = 0;

    const el = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (pointerId !== null) return;
      pointerId = e.pointerId;
      lastX = startX = e.clientX;
      lastY = startY = e.clientY;
      axisLocked = e.pointerType === "touch" ? "none" : "horizontal";
      state.userEngaged = true;
      setIsDragging(true);
      if (e.pointerType !== "touch") el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;

      // On touch, decide once whether this gesture belongs to the model or to
      // the page. A mostly-vertical swipe must still scroll the page.
      if (axisLocked === "none") {
        const dx = Math.abs(e.clientX - startX);
        const dy = Math.abs(e.clientY - startY);
        if (dx < 6 && dy < 6) return;
        axisLocked = dx > dy ? "horizontal" : "vertical";
        if (axisLocked === "vertical") {
          pointerId = null;
          setIsDragging(false);
          return;
        }
        el.setPointerCapture(e.pointerId);
      }

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      state.targetAzimuth += (dx * DRAG_SENSITIVITY * Math.PI) / 180;
      state.baseAzimuth = state.targetAzimuth;
      state.targetElevation = THREE.MathUtils.clamp(
        state.targetElevation + (dy * DRAG_SENSITIVITY * Math.PI) / 180,
        (ELEVATION_MIN * Math.PI) / 180,
        (ELEVATION_MAX * Math.PI) / 180
      );
      if (e.cancelable) e.preventDefault();
    };

    const endPointer = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      axisLocked = "none";
      setIsDragging(false);
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("pointerup", endPointer);
    el.addEventListener("pointercancel", endPointer);

    /* ----------------------------------------------------------- observers */
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: "120px" }
    );
    io.observe(mount);

    const onVisibility = () => {
      visible = !document.hidden && visible;
    };
    document.addEventListener("visibilitychange", onVisibility);

    resize();

    /* ------------------------------------------------- callout DOM writers */
    const setCalloutVisible = (i: number, show: boolean) => {
      const label = labelRefs.current[i];
      const dot = dotRefs.current[i];
      const leader = leaderRefs.current[i];
      const vis = show ? "visible" : "hidden";
      const op = show ? "1" : "0";
      if (label && label.style.visibility !== vis) {
        label.style.visibility = vis;
        label.style.opacity = op;
      }
      if (dot && dot.style.visibility !== vis) {
        dot.style.visibility = vis;
        dot.style.opacity = op;
      }
      if (leader && leader.style.visibility !== vis) leader.style.visibility = vis;
    };

    const hideAllCallouts = () => {
      for (let i = 0; i < BOARD_ANNOTATIONS.length; i++) setCalloutVisible(i, false);
    };

    const applyColumn = (items: Slot[], side: "left" | "right", w: number) => {
      for (const it of items) {
        setCalloutVisible(it.i, true);

        const label = labelRefs.current[it.i];
        const dot = dotRefs.current[it.i];
        const leader = leaderRefs.current[it.i];

        const columnX = side === "left" ? COLUMN_PAD : w - COLUMN_PAD;

        if (label) {
          label.dataset.side = side;
          label.style.transform = `translate3d(${columnX}px, ${it.ly.toFixed(1)}px, 0)`;
        }
        if (dot) {
          dot.style.transform = `translate3d(${it.x.toFixed(1)}px, ${it.y.toFixed(
            1
          )}px, 0)`;
        }
        if (leader) {
          // The leader meets the label on whichever edge faces the board.
          const boxW = (label?.firstElementChild as HTMLElement)?.offsetWidth ?? 0;
          const innerX =
            side === "left" ? COLUMN_PAD + boxW : w - COLUMN_PAD - boxW;
          const stubX =
            side === "left" ? innerX + LEADER_STUB : innerX - LEADER_STUB;
          leader.setAttribute(
            "points",
            `${innerX.toFixed(1)},${it.ly.toFixed(1)} ` +
              `${stubX.toFixed(1)},${it.ly.toFixed(1)} ` +
              `${it.x.toFixed(1)},${it.y.toFixed(1)}`
          );
        }
      }
    };

    /* ---------------------------------------------------------------- loop */
    const projected = new THREE.Vector3();
    const boardUp = new THREE.Vector3();
    const camDir = new THREE.Vector3();
    const clock = new THREE.Clock();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || !loaded) return;

      const t = clock.getElapsedTime();

      // Idle drift, suspended once the user takes over.
      if (!reduceMotion && !state.userEngaged) {
        const drift =
          Math.sin((t / DRIFT_PERIOD) * Math.PI * 2) * (DRIFT_AMPLITUDE * Math.PI) / 180;
        state.targetAzimuth = state.baseAzimuth + drift;
      }

      state.azimuth += (state.targetAzimuth - state.azimuth) * EASE;
      state.elevation += (state.targetElevation - state.elevation) * EASE;

      recomputeDistance();

      const cosEl = Math.cos(state.elevation);
      camera.position.set(
        target.x + state.distance * Math.sin(state.azimuth) * cosEl,
        target.y + state.distance * Math.sin(state.elevation),
        target.z + state.distance * Math.cos(state.azimuth) * cosEl
      );
      camera.lookAt(target);

      renderer.render(scene, camera);

      /* ---- callout positioning (direct DOM writes, no React re-render) --- */
      const w = mount.clientWidth;
      const h = mount.clientHeight;

      // Is the populated face of the board turned toward us?
      boardUp.set(0, 1, 0).applyQuaternion(pivot.quaternion).normalize();
      camera.getWorldDirection(camDir);
      const facing = -boardUp.dot(camDir); // >0 when looking at the top face
      const labelsVisible = labelsOnRef.current;

      if (!labelsVisible) {
        hideAllCallouts();
        return;
      }

      /*
       * Callouts are laid out in two fixed columns down the left and right
       * edges, each joined to its component by a leader line, rather than
       * floating next to the part. With eight labels on a board this small,
       * anchored labels pile on top of each other and become unreadable; a
       * column layout guarantees they never collide and reads like a proper
       * technical drawing.
       */
      const left: Slot[] = [];
      const right: Slot[] = [];

      for (let i = 0; i < markers.length; i++) {
        markers[i].getWorldPosition(projected);
        projected.project(camera);

        const x = (projected.x * 0.5 + 0.5) * w;
        const y = (-projected.y * 0.5 + 0.5) * h;
        const onScreen =
          projected.z < 1 && x > -40 && x < w + 40 && y > -40 && y < h + 40;

        if (!onScreen || facing <= 0.12) {
          setCalloutVisible(i, false);
          continue;
        }
        (x < w * 0.5 ? left : right).push({ i, x, y, ly: y });
      }

      // Label box height drives the minimum vertical gap. Measured from a real
      // node so it adapts when the detail line is hidden on small screens.
      const sample = labelRefs.current.find((n) => n)?.firstElementChild as
        | HTMLElement
        | undefined;
      const labelH = sample?.offsetHeight || 42;

      packColumn(left, h, labelH);
      // The right column starts lower to clear the Labels toggle.
      packColumn(right, h, labelH, TOGGLE_RESERVE);

      applyColumn(left, "left", w);
      applyColumn(right, "right", w);
    };
    raf = requestAnimationFrame(tick);

    /* ------------------------------------------------------------ teardown */
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endPointer);
      el.removeEventListener("pointercancel", endPointer);

      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          const std = m as THREE.MeshStandardMaterial & { map?: THREE.Texture };
          std.map?.dispose();
          std.dispose();
        });
      });

      envRT.texture.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (el.parentNode === mount) mount.removeChild(el);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <div
        ref={mountRef}
        className={`${styles.stage} ${isDragging ? styles.grabbing : ""}`}
        aria-label={VIEWER.ariaLabel}
        role="img"
      >
        {/* Leader lines, drawn in one SVG layer in CSS-pixel coordinates. */}
        <svg
          ref={leaderSvgRef}
          className={styles.leaders}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {BOARD_ANNOTATIONS.map((a, i) => (
            <polyline
              key={`leader-${a.id}`}
              ref={setLeaderRef(i)}
              className={styles.leaderLine}
              style={{ visibility: "hidden" }}
            />
          ))}
        </svg>

        {/* Dots pinned to the actual component positions. */}
        {BOARD_ANNOTATIONS.map((a, i) => (
          <span
            key={`dot-${a.id}`}
            ref={setDotRef(i)}
            className={styles.dot}
            style={{ opacity: 0, visibility: "hidden" }}
            aria-hidden="true"
          />
        ))}

        {/* Label boxes, laid out in columns down the left and right edges. */}
        {BOARD_ANNOTATIONS.map((a, i) => (
          <div
            key={a.id}
            ref={setLabelRef(i)}
            className={styles.callout}
            data-side="right"
            style={{ opacity: 0, visibility: "hidden" }}
            aria-hidden="true"
          >
            <span className={styles.calloutBody}>
              <span className={styles.designator}>{a.designator}</span>
              <span className={styles.calloutLabel}>{a.label}</span>
              <span className={styles.calloutDetail}>{a.detail}</span>
            </span>
          </div>
        ))}
      </div>

      {status === "ready" && (
        <button
          type="button"
          className={styles.labelsToggle}
          onClick={toggleLabels}
          aria-pressed={labelsOn}
        >
          <span
            className={`${styles.switch} ${labelsOn ? styles.switchOn : ""}`}
            aria-hidden="true"
          >
            <span className={styles.knob} />
          </span>
          {VIEWER.labelsToggle}
        </button>
      )}

      {status === "loading" && (
        <div className={styles.overlay}>
          <div className={styles.loaderTrack}>
            <div className={styles.loaderFill} style={{ width: `${progress}%` }} />
          </div>
          <p className={styles.overlayText}>
            {VIEWER.loading}
            {progress > 0 ? ` · ${progress}%` : ""}
          </p>
        </div>
      )}

      {(status === "error" || status === "unsupported") && (
        <div className={styles.overlay}>
          <p className={styles.overlayText}>
            {status === "unsupported"
              ? VIEWER.unsupportedMessage
              : VIEWER.errorMessage}
          </p>
        </div>
      )}

      {status === "ready" && (
        <p className={styles.hint} aria-hidden="true">
          {VIEWER.dragHint}
        </p>
      )}

      {/* Text equivalent of the callouts for assistive tech. */}
      <ul className="srOnly">
        {BOARD_ANNOTATIONS.map((a) => (
          <li key={a.id}>
            {a.designator}: {a.label} — {a.detail}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FlightComputerViewer;
