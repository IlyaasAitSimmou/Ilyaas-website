"use client";

/**
 * DetailOverlay
 *
 * The larger view that opens when you click a project or an experience. Both
 * feed it the same normalised `DetailItem` shape (see `toDetailItem` helpers in
 * WorkSection), so there is only one overlay to maintain.
 *
 * Gallery paging is bound to ArrowLeft / ArrowRight. Escape closes. Focus is
 * trapped inside the dialog while it is open and returned to the trigger on
 * close, so it is usable without a mouse.
 */

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryImage } from "../data/projects";
import styles from "./DetailOverlay.module.css";

export type DetailItem = {
  id: string;
  title: string;
  subtitle?: string;
  /** Small labelled rows, e.g. Year / Role / Period. */
  meta: { label: string; value: string }[];
  description: string;
  paragraphs: string[];
  highlights?: string[];
  tags?: string[];
  gallery: GalleryImage[];
  links: { label: string; href: string }[];
};

type Props = {
  item: DetailItem | null;
  onClose: () => void;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const DetailOverlay = ({ item, onClose }: Props) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState(0);

  const gallery = item?.gallery ?? [];
  const hasGallery = gallery.length > 0;
  const multiple = gallery.length > 1;

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % Math.max(gallery.length, 1));
  }, [gallery.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + Math.max(gallery.length, 1)) % Math.max(gallery.length, 1));
  }, [gallery.length]);

  // Reset to the first image whenever a different item is opened.
  useEffect(() => {
    setIndex(0);
  }, [item?.id]);

  useEffect(() => {
    if (!item) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowRight" && multiple) {
        e.preventDefault();
        next();
        return;
      }
      if (e.key === "ArrowLeft" && multiple) {
        e.preventDefault();
        prev();
        return;
      }
      // Keep Tab inside the dialog.
      if (e.key === "Tab" && dialogRef.current) {
        const nodes = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
        ).filter((n) => n.offsetParent !== null);
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [item, multiple, next, prev, onClose]);

  if (!item) return null;

  const current = gallery[index];

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`detail-title-${item.id}`}
        className={styles.dialog}
      >
        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        {/* ------------------------------------------------------- gallery */}
        {hasGallery && (
          <div className={styles.gallery}>
            <div
              className={styles.frame}
              style={current?.backdrop ? { background: current.backdrop } : undefined}
            >
              <Image
                key={current.src}
                src={current.src}
                alt={current.caption ?? `${item.title} — image ${index + 1}`}
                fill
                sizes="(max-width: 900px) 100vw, 760px"
                className={styles.image}
                style={{ objectFit: current.fit ?? "cover" }}
                priority
              />

              {multiple && (
                <>
                  <button
                    type="button"
                    className={`${styles.navBtn} ${styles.navPrev}`}
                    onClick={prev}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className={`${styles.navBtn} ${styles.navNext}`}
                    onClick={next}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            <div className={styles.galleryBar}>
              <span className={styles.caption}>{current?.caption ?? ""}</span>
              {multiple && (
                <span className={styles.counter}>
                  <span className={styles.counterNums}>
                    {index + 1} / {gallery.length}
                  </span>
                  <span className={styles.counterHint}>← → to browse</span>
                </span>
              )}
            </div>

            {multiple && (
              <div className={styles.dots} role="tablist" aria-label="Images">
                {gallery.map((g, i) => (
                  <button
                    key={g.src + i}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Image ${i + 1}`}
                    className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                    onClick={() => setIndex(i)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------- body */}
        <div className={styles.body}>
          <header className={styles.header}>
            <h2 id={`detail-title-${item.id}`} className={styles.title}>
              {item.title}
            </h2>
            {item.subtitle && <p className={styles.subtitle}>{item.subtitle}</p>}
          </header>

          {item.meta.length > 0 && (
            <dl className={styles.meta}>
              {item.meta.map((m) => (
                <div key={m.label} className={styles.metaRow}>
                  <dt className={styles.metaLabel}>{m.label}</dt>
                  <dd className={styles.metaValue}>{m.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <p className={styles.description}>{item.description}</p>

          {item.paragraphs.map((p, i) => (
            <p key={i} className={styles.paragraph}>
              {p}
            </p>
          ))}

          {item.highlights && item.highlights.length > 0 && (
            <ul className={styles.highlights}>
              {item.highlights.map((h, i) => (
                <li key={i} className={styles.highlight}>
                  {h}
                </li>
              ))}
            </ul>
          )}

          {item.tags && item.tags.length > 0 && (
            <ul className={styles.tags}>
              {item.tags.map((t) => (
                <li key={t} className={styles.tag}>
                  {t}
                </li>
              ))}
            </ul>
          )}

          {item.links.length > 0 && (
            <div className={styles.links}>
              {item.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {l.label}
                  <span aria-hidden="true"> ↗</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailOverlay;
