"use client"

import React, { useRef, useState, useEffect, useCallback } from 'react'
import styles from './laptopBackground.module.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three-stdlib'

const FALLBACK_SCREEN = { width: 0.3, height: 0.2 }
const BEZEL_SCALE = 0.9
const AUTO_ROTATE_SPEED = 0
const FORCE_CONTAINER_SIZE = false

interface DetectedScreen {
    mesh: THREE.Mesh
    score: number
    size: THREE.Vector3
    center: THREE.Vector3
    thicknessAxis: number
}

const LaptopBackground = () => {
    const mountRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<THREE.Scene>()
    const rendererRef = useRef<THREE.WebGLRenderer>()
    const laptopRef = useRef<THREE.Group>()
    const cameraRef = useRef<THREE.PerspectiveCamera>()
    const isDraggingRef = useRef(false)
    const previousMousePositionRef = useRef({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Screen plane (textured) + anchor
    const screenPlaneRef = useRef<THREE.Mesh | null>(null)
    const screenAnchorRef = useRef<THREE.Object3D | null>(null)

    const initializedRef = useRef(false)

    // Detected screen dimensions (world units local plane size)
    const screenWidthRef = useRef<number>(FALLBACK_SCREEN.width)
    const screenHeightRef = useRef<number>(FALLBACK_SCREEN.height)

    // Math reuse
    const _quat = useRef(new THREE.Quaternion())
    const _normal = useRef(new THREE.Vector3())
    const _planePos = useRef(new THREE.Vector3())
    const _camPos = useRef(new THREE.Vector3())

    // Canvas / texture + UI state
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
    const textureRef = useRef<THREE.CanvasTexture | null>(null)
    const needsRedrawRef = useRef(true)
    const scrollOffsetRef = useRef(0)
    const insideScreenRef = useRef(false)
    const hoveredCardRef = useRef<string | null>(null)

    interface CardDef { id: string; title: string; desc: string; color: string; link: string }
    const cardsRef = useRef<CardDef[]>([
        { id: 'c1', title: 'Portfolio Website', desc: 'My personal portfolio built with Next.js and Three.js', color: '#4fc3f7', link: '/projects' },
        { id: 'c2', title: 'Rocket Simulation', desc: '3D rocket simulation with physics', color: '#ff6b6b', link: '/projects' },
        { id: 'c3', title: 'AI Chat Bot', desc: 'Machine learning chatbot project', color: '#51cf66', link: '/projects' },
        { id: 'c4', title: 'Game Development', desc: 'Unity game development projects', color: '#ffd43b', link: '/projects' },
    ])
    type HitRegion = { id: string; x: number; y: number; w: number; h: number; link: string }
    const hitRegionsRef = useRef<HitRegion[]>([])

    const buildCanvas = () => {
        const c = document.createElement('canvas')
        c.width = 1200
        c.height = 800
        const ctx = c.getContext('2d')!
        canvasRef.current = c
        ctxRef.current = ctx
        const tex = new THREE.CanvasTexture(c)
        if (THREE.SRGBColorSpace && tex.colorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 8
        textureRef.current = tex
        needsRedrawRef.current = true
    }

    const drawUI = () => {
        if (!ctxRef.current || !canvasRef.current) return
        const ctx = ctxRef.current
        const canvas = canvasRef.current
        if (!needsRedrawRef.current) return
        needsRedrawRef.current = false

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        // Background
        const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        grd.addColorStop(0, '#1a1a2e')
        grd.addColorStop(1, '#16213e')
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Header
        ctx.fillStyle = 'rgba(0,0,0,0.65)'
        ctx.fillRect(0, 0, canvas.width, 110)
        ctx.strokeStyle = '#4fc3f7'
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(0, 110); ctx.lineTo(canvas.width, 110); ctx.stroke()
        ctx.fillStyle = '#4fc3f7'
        ctx.font = '600 42px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('My Projects', canvas.width / 2, 60)
        ctx.fillStyle = '#ccc'
        ctx.font = '400 20px Arial'
        ctx.fillText('Click on a project to view details', canvas.width / 2, 95)

        // Cards area
        const paddingX = 60
        const startY = 140
        const gap = 26
        const cardH = 140
        hitRegionsRef.current = []
        const contentTotalHeight = cardsRef.current.length * (cardH + gap) - gap
        const maxScroll = Math.max(0, contentTotalHeight - (canvas.height - startY - 40))
        if (scrollOffsetRef.current > maxScroll) scrollOffsetRef.current = maxScroll
        if (scrollOffsetRef.current < 0) scrollOffsetRef.current = 0

        cardsRef.current.forEach((card, i) => {
            const y = startY + i * (cardH + gap) - scrollOffsetRef.current
            if (y + cardH < startY - 50 || y > canvas.height) return // quickly cull
            ctx.save()
            // Card background
            ctx.fillStyle = 'rgba(255,255,255,0.08)'
            ctx.strokeStyle = 'rgba(255,255,255,0.25)'
            ctx.lineWidth = 2
            const r = 18
            const x = paddingX
            const w = canvas.width - paddingX * 2
            // Rounded rect
            ctx.beginPath()
            ctx.moveTo(x + r, y)
            ctx.lineTo(x + w - r, y)
            ctx.quadraticCurveTo(x + w, y, x + w, y + r)
            ctx.lineTo(x + w, y + cardH - r)
            ctx.quadraticCurveTo(x + w, y + cardH, x + w - r, y + cardH)
            ctx.lineTo(x + r, y + cardH)
            ctx.quadraticCurveTo(x, y + cardH, x, y + cardH - r)
            ctx.lineTo(x, y + r)
            ctx.quadraticCurveTo(x, y, x + r, y)
            ctx.closePath()
            ctx.fill(); ctx.stroke()

            // Indicator dot
            ctx.fillStyle = card.color
            ctx.beginPath(); ctx.arc(x + 30, y + 30, 14, 0, Math.PI * 2); ctx.fill()

            // Text
            ctx.fillStyle = '#4fc3f7'
            ctx.font = '600 28px Arial'
            ctx.textAlign = 'left'
            ctx.fillText(card.title, x + 60, y + 42)
            ctx.fillStyle = '#ccc'
            ctx.font = '400 18px Arial'
            wrapText(ctx, card.desc, x + 60, y + 72, canvas.width - paddingX * 2 - 80, 24)
            ctx.fillStyle = '#4fc3f7'
            ctx.font = '600 16px Arial'
            ctx.fillText('Click to view →', x + 60, y + cardH - 24)
            // Hover highlight
            if (hoveredCardRef.current === card.id) {
                ctx.save()
                ctx.strokeStyle = '#ffffff'
                ctx.lineWidth = 3
                ctx.globalAlpha = 0.6
                ctx.beginPath()
                ctx.moveTo(x + r, y)
                ctx.lineTo(x + w - r, y)
                ctx.quadraticCurveTo(x + w, y, x + w, y + r)
                ctx.lineTo(x + w, y + cardH - r)
                ctx.quadraticCurveTo(x + w, y + cardH, x + w - r, y + cardH)
                ctx.lineTo(x + r, y + cardH)
                ctx.quadraticCurveTo(x, y + cardH, x, y + cardH - r)
                ctx.lineTo(x, y + r)
                ctx.quadraticCurveTo(x, y, x + r, y)
                ctx.closePath()
                ctx.stroke()
                ctx.restore()
            }
            hitRegionsRef.current.push({ id: card.id, x, y, w, h: cardH, link: card.link })
        })

        // Scroll bar (simple)
        if (contentTotalHeight > (canvas.height - startY - 40)) {
            const trackX = canvas.width - 24
            const trackY = startY
            const trackH = canvas.height - startY - 40
            ctx.fillStyle = 'rgba(255,255,255,0.08)'
            ctx.fillRect(trackX, trackY, 8, trackH)
            const ratio = (canvas.height - startY - 40) / contentTotalHeight
            const thumbH = Math.max(40, trackH * ratio)
            const scrollRatio = scrollOffsetRef.current / maxScroll
            const thumbY = trackY + (trackH - thumbH) * scrollRatio
            ctx.fillStyle = '#4fc3f7'
            ctx.fillRect(trackX, thumbY, 8, thumbH)
        }

        textureRef.current!.needsUpdate = true
    }

    const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ')
        let line = ''
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' '
            const metrics = ctx.measureText(testLine)
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line.trim(), x, y)
                line = words[n] + ' '
                y += lineHeight
            } else {
                line = testLine
            }
        }
        ctx.fillText(line.trim(), x, y)
    }

    const updateVisibility = useCallback(() => {
        if (!cameraRef.current || !screenAnchorRef.current || !screenPlaneRef.current) return
        const camera = cameraRef.current
        const anchor = screenAnchorRef.current
        anchor.getWorldQuaternion(_quat.current)
        anchor.getWorldPosition(_planePos.current)
        camera.getWorldPosition(_camPos.current)
        _normal.current.set(0,0,1).applyQuaternion(_quat.current)
        const facing = _normal.current.dot(_camPos.current.clone().sub(_planePos.current).normalize()) > 0
        screenPlaneRef.current.visible = facing
    }, [])

    const getCanvasCoords = (clientX: number, clientY: number) => {
        if (!rendererRef.current || !cameraRef.current || !screenPlaneRef.current || !screenAnchorRef.current || !canvasRef.current) return null
        const rect = rendererRef.current.domElement.getBoundingClientRect()
        const xN = ((clientX - rect.left) / rect.width) * 2 - 1
        const yN = -((clientY - rect.top) / rect.height) * 2 + 1
        const ray = new THREE.Raycaster()
        ray.setFromCamera(new THREE.Vector2(xN, yN), cameraRef.current)
        const ints = ray.intersectObject(screenPlaneRef.current, false)
        if (!ints.length) return null
        const pt = ints[0].point.clone()
        // Transform point into anchor local space (plane centered)
        const anchorWorldMatrix = screenAnchorRef.current.matrixWorld.clone()
        const inv = new THREE.Matrix4().copy(anchorWorldMatrix).invert()
        pt.applyMatrix4(inv)
        // Plane geometry is centered; local x,y correspond directly
        const localX = pt.x
        const localY = pt.y
        const u = (localX / (screenWidthRef.current)) + 0.5
        const v = 0.5 - (localY / (screenHeightRef.current))
        if (u < 0 || u > 1 || v < 0 || v > 1) return null
        return { x: u * canvasRef.current.width, y: v * canvasRef.current.height }
    }

    // Modify handleClick to trigger fullscreen when clicking empty screen area
    const handleClick = (e: MouseEvent) => {
        const coords = getCanvasCoords(e.clientX, e.clientY)
        if (!coords) return
        let clickedCard = false
        for (const r of hitRegionsRef.current) {
            if (coords.x >= r.x && coords.x <= r.x + r.w && coords.y >= r.y && coords.y <= r.y + r.h) {
                window.location.href = r.link
                clickedCard = true
                break
            }
        }
        if (!clickedCard) {
            setIsFullscreen(true)
        }
    }

    const handleWheel = (e: WheelEvent) => {
        const coords = getCanvasCoords(e.clientX, e.clientY)
        if (!coords) return
        e.preventDefault()
        scrollOffsetRef.current += e.deltaY * 0.6
        needsRedrawRef.current = true
    }

    const handlePointerMove = (e: MouseEvent) => {
        const coords = getCanvasCoords(e.clientX, e.clientY)
        insideScreenRef.current = !!coords
        if (mountRef.current) {
            mountRef.current.style.cursor = insideScreenRef.current ? 'pointer' : (isDraggingRef.current ? 'grabbing' : 'grab')
        }
        let newHover: string | null = null
        if (coords) {
            for (const r of hitRegionsRef.current) {
                if (coords.x >= r.x && coords.x <= r.x + r.w && coords.y >= r.y && coords.y <= r.y + r.h) { newHover = r.id; break }
            }
        }
        if (newHover !== hoveredCardRef.current) { hoveredCardRef.current = newHover; needsRedrawRef.current = true }
    }

    const handlePointerLeave = () => {
        insideScreenRef.current = false
        hoveredCardRef.current = null
        needsRedrawRef.current = true
        if (mountRef.current) mountRef.current.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab'
    }

    // Detect screen surface from GLTF (heuristic)
    const detectScreen = (root: THREE.Object3D): DetectedScreen | null => {
        let best: DetectedScreen & { center: THREE.Vector3; score: number } | null = null
        root.traverse(obj => {
            if ((obj as any).isMesh) {
                const mesh = obj as THREE.Mesh
                const geom = mesh.geometry as THREE.BufferGeometry
                if (!geom.attributes.position) return
                if (!geom.boundingBox) geom.computeBoundingBox()
                const bb = geom.boundingBox!
                const size = new THREE.Vector3(); bb.getSize(size)
                const maxDim = Math.max(size.x, size.y, size.z)
                if (maxDim < 0.1) return
                const dims = [size.x, size.y, size.z]
                const thickness = Math.min(...dims)
                if (thickness > maxDim * 0.12) return
                const thicknessAxis = dims.indexOf(thickness)
                const area = dims.reduce((acc,v,i)=> i===thicknessAxis? acc: acc*v,1)
                const nonAxes = [0,1,2].filter(i=>i!==thicknessAxis)
                const aspect = dims[nonAxes[0]] / dims[nonAxes[1]]
                if (aspect < 1.3 || aspect > 1.7) return
                const score = area - thickness * 2
                if (!best || score > best.score) {
                    const center = new THREE.Vector3(); bb.getCenter(center)
                    best = { mesh, score, size, center, thicknessAxis }
                }
            }
        })
        return best
    }

    // Helper to set renderer & camera aspect from container (optional)
    const resizeFromContainer = useCallback(() => {
        if (!mountRef.current || !cameraRef.current || !rendererRef.current) return
        const w = FORCE_CONTAINER_SIZE ? mountRef.current.clientWidth : window.innerWidth
        const h = FORCE_CONTAINER_SIZE ? mountRef.current.clientHeight : window.innerHeight
        cameraRef.current.aspect = w / h
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(w, h)
    }, [])

    useEffect(() => {
        if (initializedRef.current) return
        initializedRef.current = true
        if (!mountRef.current) return

        const scene = new THREE.Scene()
        sceneRef.current = scene

        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.05, 100)
        camera.position.set(0, 0, 6) // moved slightly back to reduce clipping during rotation
        cameraRef.current = camera

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setPixelRatio(window.devicePixelRatio)
        rendererRef.current = renderer
        mountRef.current.innerHTML = ''
        mountRef.current.appendChild(renderer.domElement)
        resizeFromContainer() // initial sizing

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.6))
        const dir1 = new THREE.DirectionalLight(0xffffff, 0.8); dir1.position.set(5,5,5); scene.add(dir1)
        const dir2 = new THREE.DirectionalLight(0xffffff, 0.4); dir2.position.set(-5,-5,-5); scene.add(dir2)

        // Prepare canvas + texture
        buildCanvas()

        const loader = new GLTFLoader()
        loader.load('/models/apple_macbook_air_13_space_gray_2023.glb', (gltf) => {
            const laptop = gltf.scene
            laptop.scale.set(10,10,10)
            laptop.position.set(0,0,0)
            laptop.traverse((child) => { if ((child as any).isMesh) { (child as THREE.Mesh).castShadow = true; (child as THREE.Mesh).receiveShadow = true } })
            scene.add(laptop)
            laptopRef.current = laptop

            const detected = detectScreen(laptop)
            if (detected) {
                const d = detected
                d.mesh.updateWorldMatrix(true, true)
                const geom = d.mesh.geometry as THREE.BufferGeometry
                if (!geom.boundingBox) geom.computeBoundingBox()
                const bb = geom.boundingBox!
                const min = bb.min, max = bb.max
                const thicknessAxis = d.thicknessAxis
                const planeAxes = [0,1,2].filter(i=>i!==thicknessAxis)
                const ax = planeAxes[0], ay = planeAxes[1]
                const frontVal = max.getComponent(thicknessAxis)
                const corner = (ux:number, uy:number) => {
                    const v = new THREE.Vector3()
                    v.setComponent(ax, ux ? max.getComponent(ax) : min.getComponent(ax))
                    v.setComponent(ay, uy ? max.getComponent(ay) : min.getComponent(ay))
                    v.setComponent(thicknessAxis, frontVal)
                    return v
                }
                const c00 = corner(0,0), c10 = corner(1,0), c01 = corner(0,1), c11 = corner(1,1)
                let widthVec = c10.clone().sub(c00)
                let heightVec = c01.clone().sub(c00)
                let normalVec = widthVec.clone().cross(heightVec); if (normalVec.lengthSq()===0) normalVec.set(0,0,1)
                normalVec.normalize()
                const worldNormalTest = normalVec.clone().applyQuaternion(d.mesh.getWorldQuaternion(new THREE.Quaternion()))
                if (worldNormalTest.z < 0) { widthVec.negate(); heightVec.negate(); normalVec.negate() }
                const widthLen = widthVec.length()
                const heightLen = heightVec.length()
                const widthDir = widthVec.clone().normalize()
                const heightDir = heightVec.clone().normalize()
                heightDir.sub(widthDir.clone().multiplyScalar(heightDir.dot(widthDir))).normalize()
                normalVec.copy(widthDir).cross(heightDir).normalize()
                const localBasis = new THREE.Matrix4().makeBasis(widthDir, heightDir, normalVec)
                const planeLocalQuat = new THREE.Quaternion().setFromRotationMatrix(localBasis)
                const centerLocal = c00.clone().add(c10).add(c11).add(c01).multiplyScalar(0.25)
                const innerWidth = widthLen * BEZEL_SCALE*1.06
                const innerHeight = heightLen * BEZEL_SCALE
                screenWidthRef.current = innerWidth
                screenHeightRef.current = innerHeight
                const anchor = new THREE.Group()
                anchor.position.copy(centerLocal)
                anchor.quaternion.copy(planeLocalQuat)
                d.mesh.add(anchor)
                const planeGeo = new THREE.PlaneGeometry(innerWidth, innerHeight)
                const planeMat = new THREE.MeshBasicMaterial({ map: textureRef.current!, toneMapped: false, side: THREE.DoubleSide })
                const plane = new THREE.Mesh(planeGeo, planeMat)
                plane.position.set(0,0.5,-0.552) // slight offset to avoid z-fighting
                anchor.add(plane)
                screenPlaneRef.current = plane
                screenAnchorRef.current = anchor
            } else {
                const anchor = new THREE.Group()
                anchor.position.set(0, 0.05, -0.1)
                anchor.rotation.set(-0.15, 0, 0)
                screenWidthRef.current = FALLBACK_SCREEN.width * BEZEL_SCALE
                screenHeightRef.current = FALLBACK_SCREEN.height * BEZEL_SCALE
                const planeGeo = new THREE.PlaneGeometry(screenWidthRef.current, screenHeightRef.current)
                const planeMat = new THREE.MeshBasicMaterial({ map: textureRef.current!, toneMapped: false, side: THREE.DoubleSide })
                const plane = new THREE.Mesh(planeGeo, planeMat)
                plane.position.set(0,0.5,-0.5)
                anchor.add(plane)
                screenPlaneRef.current = plane
                screenAnchorRef.current = anchor
                laptop.add(anchor)
            }
            needsRedrawRef.current = true
            updateVisibility()
        }, undefined, (e) => console.error('Laptop load error', e))

        const handleMouseDown = (e: MouseEvent) => {
            if (getCanvasCoords(e.clientX, e.clientY)) return // click on screen -> no rotate
            isDraggingRef.current = true; setIsDragging(true); previousMousePositionRef.current = {x:e.clientX,y:e.clientY}
        }
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current || !laptopRef.current) return
            const dx = e.clientX - previousMousePositionRef.current.x
            const dy = e.clientY - previousMousePositionRef.current.y
            laptopRef.current.rotation.y += dx * 0.01
            laptopRef.current.rotation.x += dy * 0.01
            laptopRef.current.rotation.x = Math.max(-Math.PI/4, Math.min(Math.PI/4, laptopRef.current.rotation.x))
            previousMousePositionRef.current = {x:e.clientX,y:e.clientY}
            updateVisibility()
        }
        const handleMouseUp = () => { isDraggingRef.current = false; setIsDragging(false) }
        mountRef.current.addEventListener('mousedown', handleMouseDown)
        renderer.domElement.addEventListener('mousemove', handlePointerMove)
        renderer.domElement.addEventListener('mouseleave', handlePointerLeave)
        renderer.domElement.addEventListener('click', handleClick)
        renderer.domElement.addEventListener('wheel', handleWheel, { passive: false })
        renderer.domElement.addEventListener('contextmenu', e => e.preventDefault())
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        // Removed global document click/wheel

        const handleResize = () => {
            resizeFromContainer()
            updateVisibility()
        }
        window.addEventListener('resize', handleResize)

        const animate = () => {
            requestAnimationFrame(animate)
            if (AUTO_ROTATE_SPEED && !isDraggingRef.current && laptopRef.current) {
                laptopRef.current.rotation.y += AUTO_ROTATE_SPEED
                updateVisibility()
            }
            drawUI()
            renderer.render(scene, camera)
        }
        animate()

        return () => {
            initializedRef.current = false
            mountRef.current?.removeEventListener('mousedown', handleMouseDown)
            renderer.domElement.removeEventListener('mousemove', handlePointerMove)
            renderer.domElement.removeEventListener('mouseleave', handlePointerLeave)
            renderer.domElement.removeEventListener('click', handleClick)
            renderer.domElement.removeEventListener('wheel', handleWheel)
            renderer.domElement.removeEventListener('contextmenu', e => e.preventDefault())
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('resize', handleResize)
            if (rendererRef.current) { rendererRef.current.dispose(); rendererRef.current = undefined }
        }
    }, [resizeFromContainer, updateVisibility])

    return (
        <div className={styles.laptopSection}>
            <div ref={mountRef} className={styles.laptopContainer} style={{ position: 'relative', width: '100vw', height: '100vh', cursor: isDragging ? 'grabbing' : 'grab', overflow: 'visible' }} />
            {isFullscreen && (
                <div className={styles.fullscreenOverlay} onClick={() => setIsFullscreen(false)}>
                    <div className={styles.fullscreenContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={() => setIsFullscreen(false)}>×</button>
                        <div className={styles.webpageContent} style={{ overflowY: 'auto' }}>
                            <header className={styles.webpageHeader} style={{ padding: '30px', borderBottom: '2px solid #4fc3f7' }}>
                                <h1>My Projects</h1>
                                <p>Click a project to view details</p>
                            </header>
                            <div className={styles.webpageProjects} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {cardsRef.current.map(card => (
                                    <div key={card.id} className={styles.projectCard} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', padding: '18px 22px', borderRadius: '16px', cursor: 'pointer' }} onClick={() => { window.location.href = card.link }}>
                                        <div style={{ width: 30, height: 30, background: card.color, borderRadius: '50%', boxShadow: `0 0 10px ${card.color}` }} />
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: '0 0 8px', color: '#4fc3f7', fontFamily: 'Arial', fontWeight: 600 }}>{card.title}</h3>
                                            <p style={{ margin: 0, color: '#ccc', lineHeight: 1.4 }}>{card.desc}</p>
                                            <span style={{ display: 'inline-block', marginTop: 12, color: '#4fc3f7', fontWeight: 600 }}>Open →</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LaptopBackground