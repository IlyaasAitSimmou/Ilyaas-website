"use client";

/**
 * LineChart: the flight-data plots in the detail overlay.
 *
 * Plain SVG drawn at the container's real pixel width, so labels stay readable
 * on a phone. Hover, drag or use the arrow keys for a crosshair readout; the
 * same numbers are in the "Show data" table underneath.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import styles from "./LineChart.module.css";

export type ChartSeries = {
  name: string;
  color: string;
  dash?: boolean;
  /** [x, y] pairs sorted by x. */
  points: number[][];
};

export type ChartData = {
  title: string;
  xLabel: string;
  yLabel: string;
  xDigits: number;
  yDigits: number;
  series: ChartSeries[];
  /** Horizontal reference lines. */
  refs?: { y: number; label: string }[];
};

const HEIGHT = 250;
const PAD = { top: 16, right: 14, bottom: 34, left: 52 };
const TABLE_ROWS = 12;

function niceTicks(lo: number, hi: number, count: number): number[] {
  const raw = (hi - lo) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 5, 10].find((m) => m * mag >= raw) ?? 10) * mag;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-6; v += step) {
    out.push(Number(v.toFixed(6)));
  }
  return out;
}

/** Nearest sample, or null when x is outside this series' range. */
function nearest(points: number[][], x: number, slack: number): number[] | null {
  let best: number[] | null = null;
  for (const p of points) {
    if (!best || Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p;
  }
  return best && Math.abs(best[0] - x) <= slack ? best : null;
}

const fmt = (v: number, digits: number) =>
  v.toLocaleString("en-CA", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const LineChart = ({ chart }: { chart: ChartData }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [width, setWidth] = useState(700);
  const [cursor, setCursor] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(260, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const xs = chart.series.flatMap((s) => s.points.map((p) => p[0]));
  const ys = [
    ...chart.series.flatMap((s) => s.points.map((p) => p[1])),
    ...(chart.refs ?? []).map((r) => r.y),
  ];
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const ySpan = Math.max(...ys) - Math.min(...ys);
  const yMin = Math.min(...ys) - ySpan * 0.04;
  const yMax = Math.max(...ys) + ySpan * 0.1;

  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const sx = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const sy = (y: number) => PAD.top + (1 - (y - yMin) / (yMax - yMin)) * plotH;
  const slack = (xMax - xMin) / 60;

  const onPointer = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const box = e.currentTarget.getBoundingClientRect();
      const f = (e.clientX - box.left - PAD.left) / plotW;
      setCursor(xMin + Math.min(1, Math.max(0, f)) * (xMax - xMin));
    },
    [plotW, xMin, xMax]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    // Also tells the overlay not to page its gallery with this key press.
    e.preventDefault();
    const step = ((xMax - xMin) / 80) * (e.key === "ArrowRight" ? 1 : -1);
    setCursor((c) => Math.min(xMax, Math.max(xMin, (c ?? xMin) + step)));
  };

  const readout =
    cursor === null
      ? []
      : chart.series.map((s) => ({ s, p: nearest(s.points, cursor, slack) }));

  const tableXs = Array.from(
    { length: TABLE_ROWS },
    (_, i) => xMin + ((xMax - xMin) * i) / (TABLE_ROWS - 1)
  );

  return (
    <figure className={styles.figure}>
      <figcaption id={titleId} className={styles.title}>
        {chart.title}
      </figcaption>

      <div className={styles.readout}>
        {chart.series.map((s, i) => (
          <span key={s.name} className={styles.key}>
            <svg width="18" height="8" aria-hidden="true">
              <line
                x1="0" y1="4" x2="18" y2="4"
                stroke={s.color} strokeWidth="2"
                strokeDasharray={s.dash ? "5 3" : undefined}
              />
            </svg>
            <span>{s.name}</span>
            {cursor !== null && (
              <span className={styles.value}>
                {readout[i].p ? fmt(readout[i].p![1], chart.yDigits) : "no data"}
              </span>
            )}
          </span>
        ))}
        {cursor !== null && (
          <span className={styles.key}>
            x <span className={styles.value}>{fmt(cursor, chart.xDigits)}</span>
          </span>
        )}
      </div>

      <div ref={wrapRef}>
        <svg
          className={styles.svg}
          width={width}
          height={HEIGHT}
          tabIndex={0}
          role="img"
          aria-labelledby={titleId}
          onPointerMove={onPointer}
          onPointerDown={onPointer}
          onPointerLeave={() => setCursor(null)}
          onBlur={() => setCursor(null)}
          onKeyDown={onKeyDown}
        >
          {niceTicks(yMin, yMax, 5).map((v) => (
            <g key={v}>
              <line
                x1={PAD.left} x2={width - PAD.right} y1={sy(v)} y2={sy(v)}
                className={styles.grid}
              />
              <text x={PAD.left - 8} y={sy(v) + 3.5} textAnchor="end" className={styles.tick}>
                {v.toLocaleString("en-CA")}
              </text>
            </g>
          ))}
          {niceTicks(xMin, xMax, width < 420 ? 4 : 7).map((v) => (
            <text key={v} x={sx(v)} y={HEIGHT - 18} textAnchor="middle" className={styles.tick}>
              {v.toLocaleString("en-CA")}
            </text>
          ))}
          <text x={width - PAD.right} y={HEIGHT - 3} textAnchor="end" className={styles.axis}>
            {chart.xLabel}
          </text>
          <text x={PAD.left - 8} y={10} textAnchor="start" className={styles.axis}>
            {chart.yLabel}
          </text>

          {chart.series.map((s) => (
            <polyline
              key={s.name}
              points={s.points.map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(" ")}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeDasharray={s.dash ? "6 5" : undefined}
            />
          ))}

          {chart.refs?.map((r) => (
            <g key={r.label}>
              <line
                x1={PAD.left} x2={width - PAD.right} y1={sy(r.y)} y2={sy(r.y)}
                className={styles.ref}
              />
              <text
                x={width - PAD.right} y={sy(r.y) - 5} textAnchor="end"
                className={styles.refLabel}
              >
                {r.label}
              </text>
            </g>
          ))}

          {cursor !== null && (
            <g pointerEvents="none">
              <line
                x1={sx(cursor)} x2={sx(cursor)} y1={PAD.top} y2={PAD.top + plotH}
                className={styles.crosshair}
              />
              {readout.map(
                ({ s, p }) =>
                  p && (
                    <circle
                      key={s.name} cx={sx(p[0])} cy={sy(p[1])} r="4"
                      fill={s.color} className={styles.marker}
                    />
                  )
              )}
            </g>
          )}
        </svg>
      </div>

      <details className={styles.details}>
        <summary>Show data</summary>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{chart.xLabel}</th>
              {chart.series.map((s) => (
                <th key={s.name} scope="col">{s.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableXs.map((x) => (
              <tr key={x}>
                <th scope="row">{fmt(x, chart.xDigits)}</th>
                {chart.series.map((s) => {
                  const p = nearest(s.points, x, slack);
                  return <td key={s.name}>{p ? fmt(p[1], chart.yDigits) : "–"}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
};

export default LineChart;
