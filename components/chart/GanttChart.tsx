/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useMemo, useRef, useState } from "react";

// —— Types ——
export type GanttTask = {
  id: string;
  title: string;
  start: string | Date; // inclusive
  end: string | Date; // inclusive
  progress?: number; // 0..1
  color?: string; // any valid CSS color for the bar
  data?: Record<string, any>;
};

export type GanttChartProps = {
  tasks: GanttTask[];
  /** Optional fixed range. If omitted, range is inferred from tasks */
  rangeStart?: Date | string;
  rangeEnd?: Date | string;
  /** Pixels per day */
  dayWidth?: number; // default 28
  /** Height (px) per row */
  rowHeight?: number; // default 40
  /** Header height (px) */
  headerHeight?: number; // default 64
  /** Show vertical line for today */
  showToday?: boolean; // default true
  /** Right‑to‑left layout for labels + header (bars still go time‑wise left→right unless rtlFlip is true) */
  rtl?: boolean; // default false
  /** Also flip time direction (right→left). Useful for full RTL experience. */
  rtlFlip?: boolean; // default false
  /** Left label column width (px) inside the same SVG */
  labelWidth?: number; // default 220
  /** Rounds for bar corners */
  barRadius?: number; // default 6
  /** Called when a bar is clicked */
  onBarClick?: (task: GanttTask) => void;
  className?: string;
  /** Locale for month/day rendering (e.g., "fa-IR" or "en-US") */
  locale?: string; // default 'fa-IR'
};

// —— Utilities ——
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const parseD = (d: string | Date) => (d instanceof Date ? d : new Date(d));
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

function diffDaysInclusive(a: Date, b: Date) {
  const aa = startOfDay(a);
  const bb = startOfDay(b);
  return Math.floor((bb.getTime() - aa.getTime()) / MS_PER_DAY) + 1; // inclusive
}

function addDays(d: Date, days: number) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + days);
  return nd;
}

function eachDay(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}

function monthSpans(start: Date, days: number, locale: string) {
  // Returns array of {xDays, spanDays, label}
  const spans: { xDays: number; spanDays: number; label: string }[] = [];
  let cursor = new Date(start);
  let consumed = 0;
  while (consumed < days) {
    const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0); // last day
    const remaining = days - consumed;
    const span = Math.min(remaining, diffDaysInclusive(cursor, monthEnd));
    const label = monthStart.toLocaleDateString(locale, {
      month: "short",
      year: "numeric",
    });
    spans.push({ xDays: consumed, spanDays: span, label });
    consumed += span;
    cursor = addDays(cursor, span);
  }
  return spans;
}

// —— Component ——
export default function GanttChart({
  tasks,
  rangeStart,
  rangeEnd,
  dayWidth = 28,
  rowHeight = 40,
  headerHeight = 64,
  showToday = true,
  rtl = false,
  rtlFlip = false,
  labelWidth = 220,
  barRadius = 6,
  onBarClick,
  className,
  locale = "fa-IR",
}: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    task?: GanttTask;
  }>({ show: false, x: 0, y: 0 });

  const { start, end, dayCount } = useMemo(() => {
    let minS = Infinity;
    let maxE = -Infinity;

    for (const t of tasks) {
      const s = startOfDay(parseD(t.start)).getTime();
      const e = startOfDay(parseD(t.end)).getTime();
      if (s < minS) minS = s;
      if (e > maxE) maxE = e;
    }

    const rs = rangeStart ? startOfDay(parseD(rangeStart)) : new Date(minS);
    const re = rangeEnd ? startOfDay(parseD(rangeEnd)) : new Date(maxE);

    // Ensure at least one day
    const days = Math.max(1, diffDaysInclusive(rs, re));
    return { start: rs, end: re, dayCount: days };
  }, [tasks, rangeStart, rangeEnd]);

  const contentWidth = dayCount * dayWidth;
  const totalWidth = labelWidth + contentWidth;
  const totalHeight = headerHeight + rowHeight * tasks.length + 16;

  // X helpers (support flipping time direction when rtlFlip is true)
  const xOfDayIndex = (i: number) =>
    rtlFlip ? contentWidth - (i + 1) * dayWidth : i * dayWidth;
  const bandBetween = (startIdx: number, endIdxInclusive: number) => {
    const spanDays = endIdxInclusive - startIdx + 1;
    const x = rtlFlip
      ? contentWidth - (startIdx + spanDays) * dayWidth
      : startIdx * dayWidth;
    return { x, w: spanDays * dayWidth };
  };

  const dayIndexOf = (d: Date) =>
    Math.floor((startOfDay(d).getTime() - start.getTime()) / MS_PER_DAY);

  const today = startOfDay(new Date());
  const todayIdx = clamp(dayIndexOf(today), 0, dayCount - 1);
  const showTodayLine = showToday && today >= start && today <= end;

  const months = useMemo(
    () => monthSpans(start, dayCount, locale),
    [start, dayCount, locale],
  );

  // Tooltip handlers
  const onEnter = (e: React.MouseEvent, task: GanttTask) => {
    const parent = containerRef.current?.getBoundingClientRect();
    if (!parent) return;
    setTooltip({
      show: true,
      x: e.clientX - parent.left + 10,
      y: e.clientY - parent.top + 10,
      task,
    });
  };
  const onMove = (e: React.MouseEvent) => {
    if (!tooltip.show) return;
    const parent = containerRef.current?.getBoundingClientRect();
    if (!parent) return;
    setTooltip((t) => ({
      ...t,
      x: e.clientX - parent.left + 10,
      y: e.clientY - parent.top + 10,
    }));
  };
  const onLeave = () => setTooltip({ show: false, x: 0, y: 0 });

  // Row Y position helper
  const yOfRow = (row: number) => headerHeight + row * rowHeight;

  return (
    <div
      ref={containerRef}
      className={
        "relative overflow-auto rounded-xl border bg-glass backdrop-blur " +
        (className || "")
      }
      dir={rtl ? "rtl" : "ltr"}
      onMouseMove={onMove}
    >
      <svg width={totalWidth} height={totalHeight} style={{ display: "block" }}>
        {/* Left column background */}
        {/* <rect x={0} y={0} width={labelWidth} height={totalHeight} fill="#fafafa" /> */}
        {/* Header backgrounds */}
        {/* <rect x={0} y={0} width={labelWidth} height={headerHeight} fill="#ffffff" /> */}
        {/* <rect x={labelWidth} y={0} width={contentWidth} height={headerHeight} fill="#ffffff" /> */}

        {/* Header text: Left label */}
        <text
          x={rtl ? labelWidth - 12 : 12}
          y={headerHeight / 2 + 6}
          textAnchor={rtl ? "end" : "start"}
          fontSize={14}
          fontWeight={600}
          className='text-foreground fill-foreground'
        >
          {rtl ? "کارها" : "Tasks"}
        </text>

        {/* Month header (top row) */}
        {months.map((m, idx) => {
          const { x, w } = bandBetween(m.xDays, m.xDays + m.spanDays - 1);
          return (
            <g key={idx} transform={`translate(${labelWidth + x},0)`}>
              <text
                x={w / 2}
                y={22}
                textAnchor='middle'
                fontSize={12}
                fontWeight={600}
                className='text-foreground fill-foreground'
              >
                {m.label}
              </text>
            </g>
          );
        })}

        {/* Day header (bottom row) */}
        {eachDay(dayCount).map((i) => {
          const x = xOfDayIndex(i);
          const d = addDays(start, i);
          const dayLabel = d.toLocaleDateString(locale, { day: "numeric" });
          const weekday = d.toLocaleDateString(locale, { weekday: "narrow" });
          const isWeekend = d.getDay() === 4 || d.getDay() === 5; // Fri/Sat visible in many locales
          return (
            <g key={i} transform={`translate(${labelWidth + x},0)`}>
              {/* Weekend shading in header */}
              {isWeekend && (
                <rect
                  x={0}
                  y={headerHeight - 24}
                  width={dayWidth}
                  height={24}
                  className='fill-accent/10 dark:fill-accent/20'
                />
              )}
              <text
                x={dayWidth / 2}
                y={headerHeight - 30}
                textAnchor='middle'
                fontSize={11}
                className='text-foreground fill-foreground'
              >
                {weekday}
              </text>
              <text
                x={dayWidth / 2}
                y={headerHeight - 12}
                textAnchor='middle'
                fontSize={12}
                className='text-foreground fill-foreground'
              >
                {dayLabel}
              </text>
            </g>
          );
        })}

        {/* Grid: vertical day lines + weekend shading */}
        {eachDay(dayCount).map((i) => {
          const x = xOfDayIndex(i);
          const d = addDays(start, i);
          const isWeekend = d.getDay() === 4 || d.getDay() === 5; // Fri/Sat visible in many locales
          return (
            <g
              key={`grid-${i}`}
              transform={`translate(${labelWidth + x},${headerHeight})`}
            >
              {isWeekend && (
                <rect
                  x={0}
                  y={0}
                  width={dayWidth}
                  height={rowHeight * tasks.length + 16}
                  className='fill-accent/10 dark:fill-accent/20'
                />
              )}
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={rowHeight * tasks.length + 16}
                className="stroke-gray-200 dark:stroke-gray-700"
              />
            </g>
          );
        })}
        {/* Right border line */}
        <line
          x1={labelWidth + contentWidth}
          y1={headerHeight}
          x2={labelWidth + contentWidth}
          y2={totalHeight}
          stroke='#e5e7eb'
        />

        {/* Row separators + labels */}
        {tasks.map((t, idx) => {
          const y = yOfRow(idx);
          return (
            <g key={t.id}>
              <line x1={0} y1={y} x2={totalWidth} y2={y} stroke='#f3f4f6' />
              <text
                x={rtl ? labelWidth - 12 : 12}
                y={y + rowHeight / 2 + 5}
                textAnchor={rtl ? "end" : "start"}
                fontSize={13}
                className='text-foreground fill-foreground'
                style={{ pointerEvents: "none" }}
              >
                {t.title}
              </text>
            </g>
          );
        })}

        {/* Today line */}
        {showTodayLine && (
          <g
            transform={`translate(${
              labelWidth + xOfDayIndex(todayIdx)
            },${headerHeight})`}
          >
            <rect
              x={0}
              y={0}
              width={dayWidth}
              height={rowHeight * tasks.length + 16}
              fill='#fef3c7'
              opacity={0.35}
            />
            <line
              x1={dayWidth / 2}
              y1={0}
              x2={dayWidth / 2}
              y2={rowHeight * tasks.length + 16}
              stroke='#f59e0b'
              strokeDasharray='4 3'
            />
          </g>
        )}

        {/* Bars */}
        {tasks.map((t, idx) => {
          const s = startOfDay(parseD(t.start));
          const e = startOfDay(parseD(t.end));
          const i0 = clamp(dayIndexOf(s), 0, dayCount - 1);
          const i1 = clamp(dayIndexOf(e), 0, dayCount - 1);
          const { x, w } = bandBetween(Math.min(i0, i1), Math.max(i0, i1));
          const y = yOfRow(idx) + (rowHeight - 18) / 2;
          const fill = t.color || "#4f46e5"; // indigo‑600
          const progress = clamp(t.progress ?? 0, 0, 1);

          return (
            <g
              key={`bar-${t.id}`}
              transform={`translate(${labelWidth + x},${y})`}
              onMouseEnter={(e) => onEnter(e, t)}
              onMouseLeave={onLeave}
              onClick={() => onBarClick?.(t)}
              style={{ cursor: onBarClick ? "pointer" : "default" }}
            >
              {/* Shadow */}
              <rect
                x={0}
                y={2}
                width={w}
                height={18}
                rx={barRadius}
                ry={barRadius}
                fill='#000'
                opacity={0.05}
              />
              {/* Base bar */}
              <rect
                x={0}
                y={0}
                width={w}
                height={18}
                rx={barRadius}
                ry={barRadius}
                fill={fill}
              />
              {/* write the task name on it */}
              <text
                x={w / 2}
                y={12}
                textAnchor='middle'
                fontSize={12}
                className='text-foreground/70 fill-foreground/70'
              >
                {t.title}
              </text>
              {/* Progress overlay */}
              {progress > 0 && (
                <rect
                  x={0}
                  y={0}
                  width={w * progress}
                  height={18}
                  rx={barRadius}
                  ry={barRadius}
                  fill='#fff'
                  opacity={0.25}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip.show && tooltip.task && (
        <div
          style={{ left: tooltip.x, top: tooltip.y }}
          className='pointer-events-none absolute z-20 max-w-xs rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-xl'
        >
          <div className='font-semibold mb-1'>{tooltip.task.title}</div>
          <div className='text-gray-600'>
            {new Date(tooltip.task.start).toLocaleDateString(locale)}
            {" → "}
            {new Date(tooltip.task.end).toLocaleDateString(locale)}
          </div>
          {typeof tooltip.task.progress === "number" && (
            <div className='mt-1 text-gray-600'>
              {Math.round(clamp(tooltip.task.progress, 0, 1) * 100)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// —— Minimal demo (optional) ——
// Usage example in a Next.js page or component:
//
// import GanttChart, { GanttTask } from "./GanttChart";
//
// const demoTasks: GanttTask[] = [
//   { id: "t1", title: "تحلیل نیازمندی‌ها", start: "2025-08-01", end: "2025-08-05", progress: 1 },
//   { id: "t2", title: "طراحی", start: "2025-08-04", end: "2025-08-10", progress: 0.6, color: "#10b981" },
//   { id: "t3", title: "توسعه بک‌اند", start: "2025-08-08", end: "2025-08-18", progress: 0.35, color: "#3b82f6" },
//   { id: "t4", title: "توسعه فرانت‌اند", start: "2025-08-12", end: "2025-08-22", progress: 0.2, color: "#f59e0b" },
//   { id: "t5", title: "آزمایش و رفع باگ", start: "2025-08-20", end: "2025-08-27", progress: 0.05, color: "#ef4444" },
// ];
//
// export default function Page() {
//   return (
//     <div className="p-4">
//       <GanttChart
//         tasks={demoTasks}
//         dayWidth={32}
//         rowHeight={44}
//         headerHeight={72}
//         showToday
//         rtl
//         rtlFlip={false}
//         locale="fa-IR"
//         onBarClick={(t) => alert(t.title)}
//       />
//     </div>
//   );
// }
