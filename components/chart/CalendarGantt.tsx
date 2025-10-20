/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useMemo, useRef, useState } from "react";

export type GanttTask = {
  id: string;
  title: string;
  start: string | Date; // inclusive
  end: string | Date; // inclusive
  progress?: number; // 0..1
  color?: string; // css color for bar
  data?: Record<string, any>;
};

export type CalendarGanttProps = {
  tasks: GanttTask[];
  rangeStart?: Date | string;
  rangeEnd?: Date | string;
  dayWidth?: number; // default 120
  headerHeight?: number; // default 64
  laneHeight?: number; // default 72 (taller to avoid clipping)
  showToday?: boolean; // default true
  rtl?: boolean; // default true (UI)
  rtlFlip?: boolean; // default true (time direction)
  onTaskClick?: (task: GanttTask) => void;
  locale?: string; // default "fa-IR"
  className?: string;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const parseD = (d: string | Date) => (d instanceof Date ? d : new Date(d));
const diffDaysInclusive = (a: Date, b: Date) =>
  Math.floor((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_PER_DAY) +
  1;
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

function monthSpans(start: Date, days: number, locale: string) {
  const out: { x: number; span: number; label: string }[] = [];
  let consumed = 0;
  let cursor = new Date(start);
  while (consumed < days) {
    const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const remaining = days - consumed;
    const span = Math.min(remaining, diffDaysInclusive(cursor, monthEnd));
    const label = monthStart.toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    });
    out.push({ x: consumed, span, label });
    consumed += span;
    cursor = addDays(cursor, span);
  }
  return out;
}

/** Robust lane assignment using a min-heap of (laneEndIdx, laneIndex).
 *  Policy: two intervals share a lane iff current.startIdx > laneEndIdx (no same-day overlap).
 */
function assignLanes(intervals: Array<{ startIdx: number; endIdx: number }>) {
  // Sort intervals by startIdx asc, then endIdx asc, keep original index
  const ordered = intervals
    .map((v, i) => ({ ...v, i }))
    .sort((a, b) => a.startIdx - b.startIdx || a.endIdx - b.endIdx);

  type HeapNode = { end: number; lane: number };
  const heap: HeapNode[] = []; // small end first

  const laneOf: number[] = new Array(intervals.length).fill(0);
  let laneCount = 0;

  const heapPush = (node: HeapNode) => {
    heap.push(node);
    let i = heap.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (heap[p].end <= heap[i].end) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const heapPop = (): HeapNode | undefined => {
    if (heap.length === 0) return undefined;
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = last;
      // heapify down
      let i = 0;
      while (true) {
        const l = i * 2 + 1,
          r = i * 2 + 2;
        let smallest = i;
        if (l < heap.length && heap[l].end < heap[smallest].end) smallest = l;
        if (r < heap.length && heap[r].end < heap[smallest].end) smallest = r;
        if (smallest === i) break;
        [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
        i = smallest;
      }
    }
    return top;
  };

  for (const it of ordered) {
    // Free any lanes that ended strictly before this starts (no shared day)
    // We need end < start to allow adjacency on the same day? NO. We want *no* same-day overlap,
    // so we require previous end < current start - 1 to share lane.
    // But we defined indices as inclusive, so allow share when it.startIdx > end.
    let reused: HeapNode | undefined;
    if (heap.length > 0 && heap[0].end < it.startIdx) {
      // pop the earliest ending lane until suitable
      reused = heapPop();
      // If multiple lanes ended before, still only reuse one (best-fit earliest).
    }
    if (reused) {
      // place into reused.lane
      laneOf[it.i] = reused.lane;
      // push updated end
      heapPush({ end: it.endIdx, lane: reused.lane });
    } else {
      // new lane
      const lane = laneCount++;
      laneOf[it.i] = lane;
      heapPush({ end: it.endIdx, lane });
    }
  }
  return { laneOf, laneCount };
}
const localKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`; // e.g., 2025-10-20
};
export default function CalendarGantt({
  tasks,
  rangeStart,
  rangeEnd,
  dayWidth = 120,
  headerHeight = 64,
  showToday = true,
  rtl = true,
  rtlFlip = true,
  onTaskClick,
  locale = "fa-IR",
  className,
}: CalendarGanttProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [flashKey, setFlashKey] = useState<string | null>(null);
  const scrollToToday = () => {
    // only if today is inside the chosen range (your full-year already ensures this)
    const key = localKey(today);
    setFlashKey(key); // trigger ring effect for ~1.5s

    const root = scrollRef.current;
    if (!root) return;

    // find the header cell for today inside the sticky header
    const el = root.querySelector<HTMLElement>(`[data-day-key="${key}"]`);
    if (el && "scrollIntoView" in el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }

    // remove flash after 1.5s
    window.setTimeout(() => setFlashKey(null), 1500);
  };
  // ---- compute date range + day list ----
  const { start, end, dayCount, days } = useMemo(() => {
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
    const count = Math.max(1, diffDaysInclusive(rs, re));
    const ds = Array.from({ length: count }, (_, i) => addDays(rs, i));
    return { start: rs, end: re, dayCount: count, days: ds };
  }, [tasks, rangeStart, rangeEnd]);

  const orderedDays = rtlFlip ? [...days].reverse() : days;
  const months = useMemo(
    () => monthSpans(start, dayCount, locale),
    [start, dayCount, locale],
  );

  // Map tasks to day index intervals (inclusive)
  const intervals = useMemo(() => {
    const idxOf = (d: Date) =>
      Math.max(
        0,
        Math.min(
          dayCount - 1,
          Math.floor((startOfDay(d).getTime() - start.getTime()) / MS_PER_DAY),
        ),
      );
    return tasks.map((t) => {
      const s = idxOf(parseD(t.start));
      const e = idxOf(parseD(t.end));
      return { startIdx: Math.min(s, e), endIdx: Math.max(s, e) };
    });
  }, [tasks, start, dayCount]);

  // Assign lanes (prevents vertical overlap)
  const { laneOf, laneCount } = useMemo(
    () => assignLanes(intervals),
    [intervals],
  );

  const today = startOfDay(new Date());
  const showTodayCol = showToday && today >= start && today <= end;
  const todayKey = today.toDateString();

  const gridTemplateColumns = `repeat(${dayCount}, ${dayWidth}px)`;
  const gridTemplateRows = `repeat(${laneCount || 1}, auto)`;

  // Map (startIdx,endIdx) to CSS grid columns with rtlFlip
  const gridCol = (a: number, b: number) => {
    if (!rtlFlip) {
      return `${a + 1} / ${b + 2}`; // inclusive end
    } else {
      const startCol = dayCount - b;
      const endColExclusive = dayCount - a + 1;
      return `${startCol + 1} / ${endColExclusive}`;
    }
  };

  // Derive pill metrics from lane height to avoid collisions
  const pillVPad = 6; // px

  return (
    <div
      className={
        "relative overflow-auto rounded-xl border bg-white/60 dark:bg-neutral-900/40 backdrop-blur " +
        (className || "")
      }
      ref={scrollRef}
      dir={rtl ? "rtl" : "ltr"}
    >
      <div className='sticky right-3 top-3 z-30 bg-white/90 dark:bg-neutral-900/90 backdrop-blur'>
        {/* Controls row */}
        <button
          type='button'
          onClick={scrollToToday}
          className='px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow'
          title='پرش به امروز'
        >
          امروز
        </button>
      </div>
      {/* Month header */}
      <div
        className='sticky top-0 z-20 grid border-b bg-white/80 dark:bg-neutral-900/80 backdrop-blur'
        style={{ height: headerHeight / 2, gridTemplateColumns }}
      >
        {months.map((m, i) => {
          const style: React.CSSProperties = {
            gridColumn: rtlFlip
              ? `${dayCount - (m.x + m.span) + 1} / ${dayCount - m.x + 1}`
              : `${m.x + 1} / ${m.x + m.span + 1}`,
          };
          return (
            <div
              key={`mh-${i}`}
              className='flex items-center justify-center text-sm font-semibold text-foreground border-e last:border-e-0 border-neutral-200/70 dark:border-neutral-800'
              style={style}
            >
              {m.label}
            </div>
          );
        })}
      </div>

      {/* Day header */}
      <div
        className='sticky z-10 grid border-b bg-white/80 dark:bg-neutral-900/80 backdrop-blur'
        style={{
          top: headerHeight / 2,
          height: headerHeight / 2,
          gridTemplateColumns,
        }}
      >
        {orderedDays.map((d, i) => {
          const key = localKey(d);
          const weekday = d.toLocaleDateString(locale, { weekday: "short" });
          const dayNum = d.toLocaleDateString(locale, { day: "numeric" });
          const isWeekend = d.getDay() === 5 || d.getDay() === 6;
          const isToday = showTodayCol && key === localKey(today);

          return (
            <div
              key={`dh-${i}-${key}`}
              data-day-key={key} // <<—— enable query + scroll target
              className={[
                "flex flex-col items-center justify-center border-e last:border-e-0 border-neutral-200/70 dark:border-neutral-800 rounded-md",
                isWeekend ? "bg-accent/10 dark:bg-accent/20" : "",
                isToday
                  ? "outline-2 outline-amber-400/70 -outline-offset-2"
                  : "",
                flashKey === key ? "ring-2 ring-amber-500" : "", // <<—— brief flash
              ].join(" ")}
              style={{ width: dayWidth }}
              title={d.toLocaleDateString(locale, { dateStyle: "full" })}
            >
              <div className='text-[11px] opacity-70'>{weekday}</div>
              <div className='text-sm font-medium'>{dayNum}</div>
            </div>
          );
        })}
      </div>

      {/* Body */}
      <div className='relative'>
        {/* Background columns */}
        <div
          className='absolute inset-0 grid pointer-events-none'
          style={{ gridTemplateColumns, gridTemplateRows }}
        >
          {orderedDays.map((d, i) => {
            const isWeekend = d.getDay() === 5 || d.getDay() === 6;
            const isToday = showTodayCol && d.toDateString() === todayKey;
            return (
              <div
                key={`bg-${i}`}
                className={[
                  "border-e last:border-e-0 border-neutral-200/70 dark:border-neutral-800",
                  isWeekend ? "bg-accent/5 dark:bg-accent/10" : "",
                  isToday ? "bg-amber-50/60 dark:bg-amber-900/10" : "",
                ].join(" ")}
                style={{
                  width: dayWidth,
                  // 👇 make this column span ALL lane rows so it reaches the bottom
                  gridRow: `1 / ${(laneCount || 1) + 1}`,
                }}
              />
            );
          })}
        </div>

        {/* Spanning bars */}
        <div
          className='relative grid'
          style={{ gridTemplateColumns, gridTemplateRows }}
        >
          {tasks.map((t, idx) => {
            const { startIdx, endIdx } = intervals[idx];
            const lane = laneOf[idx] ?? 0;
            const progress = Math.max(0, Math.min(1, t.progress ?? 0));
            const barColor = t.color || "#4f46e5";

            return (
              <button
                key={`task-${t.id}`}
                type='button'
                onClick={() => onTaskClick?.(t)}
                className='group relative isolate'
                style={{
                  gridColumn: gridCol(startIdx, endIdx),
                  gridRow: `${lane + 1} / ${lane + 2}`,
                  // ensure the button itself never exceeds the lane box
                  paddingTop: pillVPad,
                  paddingBottom: pillVPad,
                }}
              >
                {/* Main pill (fits within lane) */}
                <div
                  className='relative mx-1 shadow-sm ring-1 ring-black/5 dark:ring-white/5 rounded-sm bg-white dark:bg-neutral-900'
                  style={{
                    height: "auto",
                    borderInlineStart: `3px solid ${barColor}`,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "8px 10px",
                  }}
                >
                  <div className='text-[13px] font-medium line-clamp-1'>
                    {t.title}
                  </div>
                  <div className='mt-1 flex items-center justify-between text-[11px] opacity-70'>
                    <span>
                      {new Date(t.start).toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                      })}
                      {" – "}
                      {new Date(t.end).toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {typeof t.progress === "number" && (
                      <span>{Math.round(progress * 100)}%</span>
                    )}
                  </div>
                  {/* {typeof t.progress === "number" && (
                    <div className='mt-2 h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800'>
                      <div
                        className='h-1.5 rounded-full bg-neutral-900 dark:bg-neutral-100'
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  )} */}
                  {t.data?.priority && (
                    <div className='mt-1 text-[10px]'>
                      {t.data.priority === "HIGH"
                        ? "اولویت: بالا"
                        : t.data.priority === "NORMAL"
                        ? "اولویت: متوسط"
                        : "اولویت: پایین"}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
