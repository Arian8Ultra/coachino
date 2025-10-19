import { prisma } from "@/prisma/prisma";
import OpenAI from "openai";
// OpenAI Setup (v4 SDK)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function GetLLMResultMBTI(
  userAnswers: { question: string; answer: string }[],
) {
  const formattedAnswers = userAnswers
    .map((ua, i) => {
      return `Q${i + 1}: ${ua.question} → Answer: ${ua.answer}`;
    })
    .join("\n");

  const systemPrompt = `
You are an expert MBTI psychologist AI.
You will receive a list of questions and answers from a user who took an MBTI-style exam.


Return the result in this JSON structure:
{
  "result": "MBTI_TYPE", // e.g., "INTJ", "ESFP" make sure to return a valid MBTI type and according to the user's answers
  "score": {
    "E": number, "I": number,
    "S": number, "N": number,
    "T": number, "F": number,
    "J": number, "P": number
  }, // each number should be between 0 and 100, representing the user's score in each dimension
  "description": "Short paragraph summarizing the personality type.",
  "details": "Detailed breakdown of each trait, behavioral patterns, strengths, weaknesses, and suitable careers."
}
  ,answer in the same language as the questions and answers.

Respond only with valid JSON.
    `.trim();

  const userPrompt = `
User's MBTI Test Answers:
${formattedAnswers}
    `.trim();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0].message.content;

  // Parse JSON response safely
  const jsonMatch = content?.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No valid JSON in response");

  const resultObject = JSON.parse(jsonMatch[0]);

  return {
    result: resultObject.result,
    score: JSON.stringify(resultObject.score),
    description: resultObject.description,
    details: resultObject.details,
  };
}

export async function GetLLMResultMBTIFA(
  userAnswers: { question: string; answer: string }[],
) {
  const formattedAnswers = userAnswers
    .map((ua, i) => `Q${i + 1}: ${ua.question} → Answer: ${ua.answer}`)
    .join("\n");

  const systemPrompt = `
شما یک هوش مصنوعی روان‌شناس متخصص MBTI هستید.
شما فهرستی از پرسش‌ها و پاسخ‌های کاربری را دریافت می‌کنید که در یک آزمون به سبک MBTI شرکت کرده است.

نتیجه را با این ساختار JSON برگردانید:
{
  "result": "MBTI_TYPE", // e.g., "INTJ", "ESFP" make sure to return a valid MBTI type and according to the user's answers
  "score": {
    "برونگرا": number,
    "درونگرا": number,
    "حسی": number,
    "شهودی": number,
    "تفکری": number,
    "احساسی": number,
    "قضاوتی": number,
    "ادراکی": number
  },// each number should be between 0 and 100, representing the user's score in each dimension \n
  in each dimension in Persian
  "description": "یک پاراگراف کوتاه که نوع شخصیت را خلاصه می‌کند.",
  "details": "توضیحِ جزئیِ هر بُعد، الگوهای رفتاری، نقاط قوت، نقاط ضعف و مشاغلِ مناسب.",
  "color": "color_code" // e.g., "#FF5733" or "blue"
}
و به همان زبانی که پرسش‌ها و پاسخ‌ها هستند پاسخ دهید.

فقط یک JSON معتبر برگردانید.
  `.trim();

  const userPrompt = `
پاسخ‌های کاربر به آزمون MBTI:
${formattedAnswers}
  `.trim();

  const response = await openai.chat.completions.create({
    model: "o3-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0].message.content;

  console.log("LLM Response:", content);

  // Parse JSON response safely
  const jsonMatch = content?.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No valid JSON in response");

  const resultObject = JSON.parse(jsonMatch[0]);
  console.log("Parsed Result Object:", resultObject);

  return {
    result: resultObject.result,
    score: JSON.stringify(resultObject.score),
    description: resultObject.description,
    details: resultObject.details,
    color: resultObject.color || "#000", // Default to black if no color is provided
  };
}

export async function GetLLMGeneralResult(
  userAnswers: { question: string; answer: string }[],
  examId: string,
) {
  const formattedAnswers = userAnswers
    .map((ua, i) => `Q${i + 1}: ${ua.question} → Answer: ${ua.answer}`)
    .join("\n");

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
  });
  if (!exam) throw new Error("Exam not found");
  if (!exam.systemPrompt)
    throw new Error("System prompt is missing for the exam");

  const systemPrompt = exam.systemPrompt;
  const userPrompt =
    exam.userPrompt?.replace("${answers}", formattedAnswers) ||
    `
پاسخ‌های کاربر به آزمون:
${formattedAnswers}
  `.trim();

  if (!userPrompt) throw new Error("User prompt is missing for the exam");

  const response = await openai.chat.completions.create({
    model: "o3-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    seed: 2,
    response_format: {
      type: "json_object",
    },
  });

  console.log("LLM Response:", response.choices[0].message.content);

  const content = response.choices[0].message.content;

  // Parse JSON response safely
  const jsonMatch = content?.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No valid JSON in response");

  const resultObject = JSON.parse(jsonMatch[0]);

  return {
    result: resultObject.result,
    score: JSON.stringify(resultObject.score),
    description: resultObject.description,
    details: resultObject.details,
    color: resultObject.color || "#000",
  };
}

export async function GenerateDetailsAndDescription(resultId: string) {
  const result = await prisma.userExamResult.findUnique({
    where: { id: resultId },
    include:{
      UserExamDimensionScore: true,
    }
  });
  if (!result) throw new Error("Result not found");

  const systemPrompt = `
You are an AI assistant specialized in generating detailed descriptions and insights based on exam results.
You will receive a user's exam result and you need to generate a detailed description and insights based on the result.
make sure to use the result's score and other details to generate a comprehensive description.
Respond only with valid JSON.
with this structure:\n
{
  "description": "A short paragraph summarizing the personality type.",
  "details": "A detailed breakdown of each trait, behavioral patterns, strengths, weaknesses, and suitable careers."
}\n
make sure to write each of them in marked down format. with bullets and everything that is needed\n
make sure to wirte it in **persian** language.`.trim();
  const userPrompt = `
User's Exam Result:
${JSON.stringify(result)}
  `.trim();

  const response = await openai.chat.completions.create({
    model: "o3-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0].message.content;

  // Parse JSON response safely
  const jsonMatch = content?.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No valid JSON in response");

  const resultObject = JSON.parse(jsonMatch[0]);

  return {
    description: resultObject.description,
    details: resultObject.details,
  };
}
