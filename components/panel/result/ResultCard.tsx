"use client";

import * as React from "react";
import GetAnswerButton from "@/components/exam/GetAnswerButton";
import { Button } from "@/components/ui/button";
import GlassDiv from "@/components/ui/glass-div";
import { Progress } from "@/components/ui/progress";
import {
  Exam_GetById,
  Exam_GetUserResult,
} from "@/prisma/functions/Exam/ExamFun";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
interface Props {
  userResult?: Exam_GetUserResult | null;
  exam?: Exam_GetById | null;
  token: string;
  className?: string;
  scenarioId?: string;
}

/* ---------- types & guards (no `any`) ---------- */
type MBTILetter = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";
const LETTER_LABEL_FA: Readonly<Record<MBTILetter, string>> = {
  E: "برون‌گرا",
  I: "درون‌گرا",
  S: "حسی",
  N: "شهودی",
  T: "فکری",
  F: "احساسی",
  J: "قضاوت‌گر",
  P: "ادراک‌گر",
};
type MBTIMap = Partial<Record<MBTILetter, number>>;
type DimView = { code: string; name?: string; pct: number };

const MBTI_PAIRS: ReadonlyArray<readonly [MBTILetter, MBTILetter]> = [
  ["E", "I"],
  ["S", "N"],
  ["T", "F"],
  ["J", "P"],
];

function isObjectRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
function tryParseJson(v: unknown): unknown | null {
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  }
  return isObjectRecord(v) ? v : null;
}

/* ---------- extractors ---------- */
function extractMbtiMapFromUnknown(u: unknown): MBTIMap | null {
  const allowed: ReadonlyArray<MBTILetter> = [
    "E",
    "I",
    "S",
    "N",
    "T",
    "F",
    "J",
    "P",
  ];
  const src = tryParseJson(u);
  if (!isObjectRecord(src)) return null;

  const out: Partial<Record<MBTILetter, number>> = {};
  for (const k of allowed) {
    const val = (src as Record<string, unknown>)[k];
    if (isFiniteNumber(val) && val >= 0 && val <= 100) out[k] = val;
  }
  return Object.keys(out).length ? out : null;
}

function extractMbtiFromPairs(resultJson: unknown): MBTIMap | null {
  const root = tryParseJson(resultJson);
  if (!isObjectRecord(root)) return null;

  const mbti = isObjectRecord(root.mbti) ? root.mbti : null;
  const pairs =
    mbti && isObjectRecord(mbti.pairs)
      ? (mbti.pairs as Record<string, unknown>)
      : null;
  if (!pairs) return null;

  const map: Partial<Record<MBTILetter, number>> = {};
  type PairKey = "EI" | "SN" | "TF" | "JP";
  const pairDefs: Record<PairKey, readonly [MBTILetter, MBTILetter]> = {
    EI: ["E", "I"],
    SN: ["S", "N"],
    TF: ["T", "F"],
    JP: ["J", "P"],
  };

  (Object.keys(pairDefs) as PairKey[]).forEach((pk) => {
    const p = pairs[pk];
    if (isObjectRecord(p)) {
      const aPct = p.aPct;
      const bPct = p.bPct;
      if (isFiniteNumber(aPct) && isFiniteNumber(bPct)) {
        const [a, b] = pairDefs[pk];
        map[a] = aPct;
        map[b] = bPct;
      }
    }
  });

  return Object.keys(map).length ? map : null;
}

function extractMbtiMap(
  userResult: Exam_GetUserResult | null | undefined,
): MBTIMap | null {
  if (!userResult) return null;
  // 1) preferred: mbtiSimple (object or JSON string)
  const fromMbtiSimple = extractMbtiMapFromUnknown(
    (userResult as unknown as Record<string, unknown>)["mbtiSimple"],
  );
  if (fromMbtiSimple) return fromMbtiSimple;

  // 2) legacy: score JSON of letters
  const fromScore = extractMbtiMapFromUnknown(
    (userResult as unknown as Record<string, unknown>)["score"],
  );
  if (fromScore && (fromScore.E !== undefined || fromScore.I !== undefined))
    return fromScore;

  // 3) resultJson.mbti.pairs
  const fromPairs = extractMbtiFromPairs(
    (userResult as unknown as Record<string, unknown>)["resultJson"],
  );
  return fromPairs;
}

function extractPerDimension(
  userResult: Exam_GetUserResult | null | undefined,
): DimView[] {
  if (!userResult) return [];
  const perDimUnknown =
    (userResult as unknown as Record<string, unknown>)["perDimension"] ??
    ((): unknown => {
      const rj = (userResult as unknown as Record<string, unknown>)[
        "resultJson"
      ];
      const parsed = tryParseJson(rj);
      if (isObjectRecord(parsed) && isObjectRecord(parsed.perDimension)) {
        return parsed.perDimension;
      }
      return null;
    })();

  const pdParsed = tryParseJson(perDimUnknown);
  if (!isObjectRecord(pdParsed)) return [];

  const out: DimView[] = [];
  for (const [code, val] of Object.entries(pdParsed)) {
    if (isObjectRecord(val)) {
      const pctRaw = val.pct;
      const nameRaw = val.name;
      const pct = isFiniteNumber(pctRaw)
        ? Math.max(0, Math.min(100, pctRaw))
        : 0;
      const name = typeof nameRaw === "string" ? nameRaw : undefined;
      out.push({ code, name, pct });
    }
  }
  return out;
}

const ResultCard: React.FC<Props> = ({
  userResult,
  exam,
  token,
  className,
  scenarioId,
}) => {
  const [detailsShowMore, setDetailsShowMore] = React.useState(false);

  if (!userResult)
    return <GetAnswerButton examId={exam?.id || ""} token={token} />;

  const mbtiMap = extractMbtiMap(userResult);
  const dims = extractPerDimension(userResult);
  const hasMbti = !!mbtiMap && Object.keys(mbtiMap).length > 0;
  const hasDims = dims.length > 0;

  const headerColor =
    typeof (userResult as unknown as Record<string, unknown>)["color"] ===
    "string"
      ? String((userResult as unknown as Record<string, unknown>)["color"])
      : "#000";

  const resultTitle =
    typeof (userResult as unknown as Record<string, unknown>)["result"] ===
    "string"
      ? String((userResult as unknown as Record<string, unknown>)["result"])
      : "";

  const totalAnswered =
    typeof (userResult as unknown as Record<string, unknown>)[
      "totalAnswered"
    ] === "number"
      ? Number(
          (userResult as unknown as Record<string, unknown>)["totalAnswered"],
        )
      : undefined;

  const description =
    typeof (userResult as unknown as Record<string, unknown>)["description"] ===
    "string"
      ? String(
          (userResult as unknown as Record<string, unknown>)["description"],
        )
      : "—";

  const details =
    typeof (userResult as unknown as Record<string, unknown>)["details"] ===
    "string"
      ? String((userResult as unknown as Record<string, unknown>)["details"])
      : "—";

  const resultId =
    typeof (userResult as unknown as Record<string, unknown>)["id"] === "string"
      ? String((userResult as unknown as Record<string, unknown>)["id"])
      : "";

  return (
    <div
      className={
        "col-span-full rounded-md grid grid-cols-1 gap-4 items-center justify-items-center md:grid-cols-3 lg:grid-cols-4 " +
        (className || "")
      }
    >
      {/* Header / Type Badge */}
      <GlassDiv className='bg-glass w-full h-full flex items-center justify-center flex-col gap-5'>
        <h4 className='text-lg font-bold'>نتیجه آزمون شما</h4>
        <span
          className='text-blue-500 px-3 py-2 rounded-full text-5xl'
          style={{ color: headerColor, fontWeight: "bold" }}
          title={resultTitle}
        >
          {resultTitle}
        </span>
        {typeof totalAnswered === "number" ? (
          <span className='text-xs text-gray-500'>
            تعداد سؤالات پاسخ‌داده‌شده: {totalAnswered}
          </span>
        ) : null}
      </GlassDiv>

      {/* Description */}
      <GlassDiv className='bg-glass w-full h-full flex flex-col gap-5 md:col-span-3 *:text-justify text-lg leading-8'>
        <h4 className='text-lg font-bold text-start'>توضیحات نتیجه</h4>
        <Markdown remarkPlugins={[remarkGfm, remarkMath]}>
          {description}
        </Markdown>
      </GlassDiv>

      {/* Details */}
      <GlassDiv
        className={
          "bg-glass w-full h-full flex flex-col gap-5 col-span-full leading-8 relative pb-10 duration-300 " +
          (detailsShowMore
            ? " max-h-full"
            : " max-h-40 text-ellipsis line-clamp-3 overflow-hidden")
        }
      >
        <h4 className='text-lg font-bold text-start'>جزئیات</h4>
        <Markdown remarkPlugins={[remarkGfm, remarkMath]}>
          {detailsShowMore
            ? details
            : details.slice(0, 100) + (details.length > 100 ? "..." : "")}
        </Markdown>
        <Button
          className=' hover:underline absolute bottom-3 left-3 w-auto'
          onClick={() => setDetailsShowMore((prev) => !prev)}
        >
          {detailsShowMore ? "بستن جزئیات" : "نمایش جزئیات بیشتر"}
        </Button>
      </GlassDiv>

      {/* Scores */}
      {hasMbti ? (
        <div className='grid md:grid-cols-2 gap-4 col-span-full w-full'>
          {MBTI_PAIRS.map(([a, b]) => {
            const aPct = Number(mbtiMap?.[a] ?? 0);
            const bPct = Number(mbtiMap?.[b] ?? 0);
            const aLabel = LETTER_LABEL_FA[a];
            const bLabel = LETTER_LABEL_FA[b];

            return (
              <GlassDiv
                key={`${a}${b}`}
                className='flex flex-col items-center justify-center gap-3 w-full'
              >
                <span className='text-sm '>
                  {bLabel} / {aLabel}
                </span>
                <div className='w-full flex flex-col gap-2'>
                  <div className='flex items-center gap-2'>
                    <span className='min-w-16 text-xs font-bold text-right'>
                      {aLabel}
                    </span>
                    <Progress
                      value={aPct}
                      backgroundColor='bg-gray-200'
                      barColor='bg-blue-500'
                      className='w-full'
                    />
                    <span className='w-10 text-xs font-bold text-left'>
                      {aPct}%
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='min-w-16 text-xs font-bold text-right'>
                      {bLabel}
                    </span>
                    <Progress
                      value={bPct}
                      backgroundColor='bg-gray-200'
                      barColor='bg-blue-500'
                      className='w-full'
                    />
                    <span className='w-10 text-xs font-bold text-left'>
                      {bPct}%
                    </span>
                  </div>
                </div>
              </GlassDiv>
            );
          })}
        </div>
      ) : hasDims ? (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 col-span-full w-full'>
          {dims.map((d) => (
            <GlassDiv
              key={d.code}
              className='flex flex-col items-center justify-center gap-2 w-full'
            >
              <span className='text-sm text-gray-500'>{d.name ?? d.code}</span>
              <Progress
                value={d.pct}
                backgroundColor='bg-gray-200'
                barColor='bg-blue-500'
                className='w-full'
              />
              <span className='text-sm font-bold'>{d.pct}%</span>
            </GlassDiv>
          ))}
        </div>
      ) : (
        <GlassDiv className='bg-glass w-full h-full flex items-center justify-center flex-col gap-5 col-span-full'>
          <h4 className='text-lg font-bold'>امتیازها</h4>
          <span className='text-gray-500'>امتیازی ثبت نشده است</span>
        </GlassDiv>
      )}

      {/* Start chat */}
      {!scenarioId && (
        <div className='flex justify-end w-full col-span-full'>
          <Link href={`/panel/exams/${exam?.id}/${resultId}/chat`}>
            <Button variant={"accent"} className='w-full p-6'>
              <Sparkles className='me-2' />
              شروع گفتگو
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ResultCard;
