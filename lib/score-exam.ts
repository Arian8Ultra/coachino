/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/score-exam.ts (patched)

import { GenerateDetailsAndDescription } from "@/function/result/AiResult";
import { QuestionType } from "@/generated/prisma";
import { prisma } from "@/prisma/prisma";

/** -------- Types: minimal shape we need from Prisma -------- */
type Q = {
  id: string;
  examId: string;
  question: string;
  options: string[];
  type: QuestionType;
  scale?: { labels: string[]; weights: number[] } | null;
  optionWeights?: number[] | null; // optional override
  anchorA?: string | null;
  anchorB?: string | null;
  meta?: any | null;
};
type K = {
  id: string;
  questionId: string;
  dimensionId: string;
  multiplier: number; // +1 normal, -1 reverse
  perOptionWeights?: number[] | null; // optional override for this key
  keyedOptionIndexes?: number[] | null; // optional: for MCQ keyed options
};
type D = { id: string; examId: string; code: string; name: string };

export type AnswersByQID = Record<string, string>; // from UserAnswer.answer (string)
/*
  accepted formats per question type:
  - FiveOption / SINGLE_CHOICE:   "2"  (index)
  - MULTIPLE_CHOICE:              "[0,2]" or "0,2" (indices)
  - TEXT:                         any string (ignored in scoring)
  - DATE:                         ISO date string (ignored in scoring)
*/

/** -------- Parse helpers -------- */
function parseSingleIndex(s: string | undefined): number | null {
  if (s == null) return null;
  const n = Number(String(s).trim());
  return Number.isFinite(n) ? Math.trunc(n) : null;
}
function parseMultiIndices(s: string | undefined): number[] {
  if (!s) return [];
  const t = s.trim();
  // try JSON array
  try {
    const arr = JSON.parse(t);
    if (Array.isArray(arr)) {
      return arr
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n))
        .map((n) => Math.trunc(n));
    }
  } catch {}
  // try comma-separated
  return t
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isFinite(n))
    .map((n) => Math.trunc(n));
}

/** -------- Scoring core -------- */
export type DimensionScore = {
  code: string;
  name: string;
  raw: number; // signed sum
  maxAbs: number; // theoretical max absolute sum
  pct: number; // 0..100 (50 neutral)
};

// Dedicated MBTI pair types to avoid optional-indexing issues
export type MBTIPairObj<A extends string, B extends string> = {
  a: A;
  b: B;
  aPct: number;
  bPct: number;
  winner: A | B | "TIE";
};
export type MBTIPairs = {
  EI?: MBTIPairObj<"E", "I">;
  SN?: MBTIPairObj<"S", "N">;
  TF?: MBTIPairObj<"T", "F">;
  JP?: MBTIPairObj<"J", "P">;
};
export type MBTIBlock = { pairs: MBTIPairs; type?: string };

export type ScoreResult = {
  perDimension: Record<string, DimensionScore>; // key by dimension code
  totalAnswered: number;
  perQuestion?: Record<string, number>; // optional debugging: contribution sum across keys
  mbti?: MBTIBlock | null;
};

export function scoreExamAttempt(args: {
  questions: Q[];
  keys: K[];
  dimensions: D[];
  answers: AnswersByQID; // map questionId -> UserAnswer.answer (string)
}): ScoreResult {
  const { questions, keys, dimensions, answers } = args;

  // Index lookups
  const dimById = new Map(dimensions.map((d) => [d.id, d]));
  const keysByQ = new Map<string, K[]>();
  for (const k of keys) {
    (
      keysByQ.get(k.questionId) ??
      keysByQ.set(k.questionId, []).get(k.questionId)!
    ).push(k);
  }

  const dimAcc: Record<string, { raw: number; maxAbs: number; name: string }> =
    {};
  for (const d of dimensions)
    dimAcc[d.code] = { raw: 0, maxAbs: 0, name: d.name };

  const perQuestion: Record<string, number> = {};
  let totalAnswered = 0;

  for (const q of questions) {
    const ansStr = answers[q.id];
    if (ansStr == null) continue; // unanswered
    const qKeys = keysByQ.get(q.id) ?? [];
    if (qKeys.length === 0) continue; // no scoring for this question

    let qContribSum = 0;
    const qMaxAbsForEachDim: Record<string, number> = {};

    // Fetch base weights from Scale or override on Question
    const baseWeights = q.optionWeights ?? q.scale?.weights ?? null;

    // parse selected indices
    let selected: number[] = [];
    if (
      q.type === QuestionType.FiveOption ||
      q.type === QuestionType.SINGLE_CHOICE
    ) {
      const idx = parseSingleIndex(ansStr);
      selected = idx == null ? [] : [idx];
    } else if (q.type === QuestionType.MULTIPLE_CHOICE) {
      selected = parseMultiIndices(ansStr);
    } else {
      // TEXT / DATE: no scoring
      continue;
    }

    // For each key (dimension mapping)
    for (const k of qKeys) {
      const dim = dimById.get(k.dimensionId);
      if (!dim) continue;

      // Determine weights to use for this key
      const weights =
        k.perOptionWeights && k.perOptionWeights.length > 0
          ? k.perOptionWeights
          : baseWeights;

      let keyRaw = 0;
      let keyMaxAbs = 0;

      if (q.type === QuestionType.MULTIPLE_CHOICE) {
        if (k.keyedOptionIndexes && k.keyedOptionIndexes.length > 0) {
          // Binary keyed MCQ: presence of each keyed option adds +1 * multiplier
          const set = new Set(selected);
          const add = k.keyedOptionIndexes.reduce(
            (acc, i) => acc + (set.has(i) ? 1 : 0),
            0,
          );
          keyRaw += add * (k.multiplier || 1);
          // theoretical max = all keyed options selected
          keyMaxAbs += Math.abs(
            k.keyedOptionIndexes.length * (k.multiplier || 1),
          );
        } else if (weights && weights.length > 0) {
          // Weighted MCQ: sum per selected index
          for (const i of selected) {
            const w = weights[i] ?? 0;
            keyRaw += w * (k.multiplier || 1);
          }
          // theoretical max: sum of absolute best per option (upper bound)
          const maxPerOption = weights.map((w) =>
            Math.abs(w * (k.multiplier || 1)),
          );
          keyMaxAbs += maxPerOption.reduce((a, b) => a + b, 0);
        } else {
          // No weights defined; nothing to add
        }
      } else {
        // SINGLE_CHOICE / FiveOption treated the same with weights
        if (!weights || selected.length === 0) continue;
        const idx = selected[0];
        const w = weights[idx] ?? 0;
        keyRaw += w * (k.multiplier || 1);
        // theoretical max for single pick = max |w|
        const wAbsMax = Math.max(
          ...weights.map((x) => Math.abs(x * (k.multiplier || 1))),
        );
        keyMaxAbs += wAbsMax;
      }

      // Accumulate into dimension
      const entry = dimAcc[dim.code];
      entry.raw += keyRaw;
      entry.maxAbs += keyMaxAbs;

      qContribSum += keyRaw;
      qMaxAbsForEachDim[dim.code] =
        (qMaxAbsForEachDim[dim.code] ?? 0) + keyMaxAbs;
    }

    // if at least one key contributed, mark answered
    if (Object.keys(qMaxAbsForEachDim).length > 0) totalAnswered++;
    perQuestion[q.id] = qContribSum;
  }

  // Build per-dimension percentages
  const perDimension: Record<string, DimensionScore> = {};
  for (const [code, acc] of Object.entries(dimAcc)) {
    const max = Math.max(0, acc.maxAbs);
    const pct = max > 0 ? Math.round(((acc.raw + max) / (2 * max)) * 100) : 50;
    perDimension[code] = {
      code,
      name: acc.name,
      raw: acc.raw,
      maxAbs: max,
      pct,
    };
  }

  const result: ScoreResult = { perDimension, totalAnswered, perQuestion };

  // If MBTI dims exist, compute pairs
  const has = (c: string) => perDimension[c] !== undefined;
  const mkPair = <A extends string, B extends string>(a: A, b: B) => {
    if (!(has(a) && has(b))) return undefined;
    const aPct = perDimension[a].pct;
    const bPct = perDimension[b].pct;
    const winner =
      aPct === bPct ? "TIE" : aPct > bPct ? (a as any) : (b as any);
    return { a: a as any, b: b as any, aPct, bPct, winner } as MBTIPairObj<
      A,
      B
    >;
  };

  const pairs: MBTIPairs = {
    EI: mkPair("E", "I"),
    SN: mkPair("S", "N"),
    TF: mkPair("T", "F"),
    JP: mkPair("J", "P"),
  };

  if (pairs.EI || pairs.SN || pairs.TF || pairs.JP) {
    const letters = [
      pairs.EI ? (pairs.EI.winner === "TIE" ? "X" : pairs.EI.winner) : "",
      pairs.SN ? (pairs.SN.winner === "TIE" ? "X" : pairs.SN.winner) : "",
      pairs.TF ? (pairs.TF.winner === "TIE" ? "X" : pairs.TF.winner) : "",
      pairs.JP ? (pairs.JP.winner === "TIE" ? "X" : pairs.JP.winner) : "",
    ].join("");
    result.mbti = { pairs, type: letters || undefined };
  } else {
    result.mbti = null;
  }

  return result;
}

/** -------- Convenience: score by userId directly from DB -------- */
export async function scoreExamForUser(examId: string, userId: string) {
  const [questions, keys, dimensions, userAnswers] = await Promise.all([
    prisma.question.findMany({ where: { examId }, include: { scale: true } }),
    prisma.questionKey.findMany({
      where: { question: { examId } },
    }),
    prisma.dimension.findMany({ where: { examId } }),
    prisma.userAnswer.findMany({
      where: { userId, question: { examId } },
      select: { questionId: true, answer: true },
    }),
  ]);

  // Build answers map from UserAnswer.answer (string)
  const answers: AnswersByQID = {};
  for (const ua of userAnswers) answers[ua.questionId] = ua.answer;

  return scoreExamAttempt({ questions, keys, dimensions, answers });
}

// -------- Helpers for MBTI-simple and Big Five maps (optional) --------
export type MBTISimpleMap = Partial<
  Record<"E" | "I" | "S" | "N" | "T" | "F" | "J" | "P", number>
>;
export function toMbtiPercentMap(res: ScoreResult): MBTISimpleMap | null {
  const p = res.mbti?.pairs;
  if (!p) return null;
  const out: MBTISimpleMap = {};
  if (p.EI) {
    out.E = p.EI.aPct;
    out.I = p.EI.bPct;
  }
  if (p.SN) {
    out.S = p.SN.aPct;
    out.N = p.SN.bPct;
  }
  if (p.TF) {
    out.T = p.TF.aPct;
    out.F = p.TF.bPct;
  }
  if (p.JP) {
    out.J = p.JP.aPct;
    out.P = p.JP.bPct;
  }
  return out;
}

export async function computeAndSaveUserExamResult(opts: {
  examId: string;
  userId: string;
  durationMs?: number;
  examVersion?: string;
}) {
  const { examId, userId, durationMs, examVersion } = opts;

  // 1) Score using current answers
  const scored = await scoreExamForUser(examId, userId);

  // 2) Build per-dimension map and array
  const dimArr = Object.values(scored.perDimension);
  const perDimension = Object.fromEntries(
    dimArr.map((d) => [
      d.code,
      { raw: d.raw, maxAbs: d.maxAbs, pct: d.pct, name: d.name },
    ]),
  );

  // 3) Optional MBTI extras (if dims exist)
  const mbtiSimple = toMbtiPercentMap(scored);
  const typeLetters = scored.mbti?.type ?? null;

  // 4) Build quick display fields
  const quickResult = typeLetters ?? "نتیجه آزمون";
  // Example score string: top 3 dimensions
  const top3 = [...dimArr]
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3)
    .map((d) => `${d.code} ${d.pct}%`)
    .join("، ");
  const quickScore = top3 || `${dimArr.length} ابعاد`;

  // Optional color mapping
  const color = typeLetters ? colorForType(typeLetters) : undefined;

  const existing = await prisma.userExamResult.findFirst({
    where: { userId, examId },
  });
  if (existing) {
    // Update existing
    const updated = await prisma.userExamResult.update({
      where: { id: existing.id },
      data: {
        result: quickResult,
        score: quickScore,
        color,
        totalAnswered: scored.totalAnswered,
        perDimension,
        resultJson: scored,
        mbtiSimple: mbtiSimple ?? undefined,
        typeLetters: typeLetters ?? undefined,
        examVersion: examVersion ?? undefined,
        durationMs: durationMs ?? undefined,
      },
    });
    return updated;
  }
  // 5) Persist atomically
  const created = await prisma.$transaction(async (tx) => {
    const res = await tx.userExamResult.create({
      data: {
        userId,
        examId,
        result: quickResult,
        score: quickScore,
        description: null,
        details: null,
        color,
        totalAnswered: scored.totalAnswered,
        perDimension,
        resultJson: scored,
        mbtiSimple: mbtiSimple ?? undefined,
        typeLetters: typeLetters ?? undefined,
        examVersion: examVersion ?? undefined,
        durationMs: durationMs ?? undefined,
      },
    });

    // child rows (rank by pct)
    const ranked = [...dimArr].sort((a, b) => b.pct - a.pct);
    await tx.userExamDimensionScore.createMany({
      data: ranked.map((d, idx) => ({
        userExamResultId: res.id,
        code: d.code,
        name: d.name,
        raw: d.raw,
        maxAbs: d.maxAbs,
        pct: d.pct,
        rank: idx + 1,
      })),
    });

    return res;
  });

  const dd = await GenerateDetailsAndDescription(created.id);
  console.log("Generated details and description:", dd);

  const updated_created = await prisma.userExamResult.update({
    where: { id: created.id },
    data: {
      details: dd.details,
      description: dd.description,
    },
  });

  return updated_created;
}

// Example color mapping for MBTI types; customize as you like
function colorForType(type: string): string {
  const group = type[1] ?? "";
  switch (group) {
    case "N":
      return "#6C5CE7"; // Intuition → purple
    case "S":
      return "#00B894"; // Sensing → green
    default:
      return "#0984E3"; // fallback
  }
}

export async function computeExamResultFromAnswers(opts: {
  examId: string;
  answers: { questionId: string; answer: string }[];
  durationMs?: number;
  examVersion?: string;
  attemptId?: string;
}) {
  const { examId, answers, durationMs, examVersion, attemptId } = opts;

  // 1) Load exam structure only (NO user answers, NO writes)
  const [questions, keys, dimensions] = await Promise.all([
    prisma.question.findMany({ where: { examId }, include: { scale: true } }),
    prisma.questionKey.findMany({
      where: { question: { examId } },
    }),
    prisma.dimension.findMany({ where: { examId } }),
  ]);

  // 2) Pure scoring
  const scored = scoreExamAttempt({
    questions,
    keys,
    dimensions,
    answers: answers
      .map((a) => [a.questionId, a.answer])
      .reduce((acc, [k, v]) => {
        acc[k] = v;
        return acc;
      }, {} as AnswersByQID),
  });

  // 3) Build per-dimension map and array
  const dimArr = Object.values(scored.perDimension);
  const perDimension = Object.fromEntries(
    dimArr.map((d) => [
      d.code,
      { raw: d.raw, maxAbs: d.maxAbs, pct: d.pct, name: d.name },
    ]),
  );

  // 4) Optional MBTI extras
  const mbtiSimple = toMbtiPercentMap(scored);
  const typeLetters = scored.mbti?.type ?? null;

  // 5) Display helpers
  const quickResult = typeLetters ?? "نتیجه آزمون";

  const top3 = [...dimArr]
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3)
    .map((d) => `${d.code} ${d.pct}%`)
    .join("، ");

  const quickScore = top3 || `${dimArr.length} ابعاد`;
  const color = typeLetters ? colorForType(typeLetters) : undefined;

  // 6) Return computed payload (NO SAVE)
  return {
    examId,
    result: quickResult,
    score: quickScore,
    color,
    totalAnswered: scored.totalAnswered,
    perDimension,
    resultJson: scored,
    mbtiSimple: mbtiSimple ?? null,
    typeLetters,
    examVersion,
    durationMs,
    attemptId,
  };
}
