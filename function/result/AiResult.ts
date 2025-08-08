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

export async function GetLLMResultFA(
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
    "E": number, "I": number,
    "S": number, "N": number,
    "T": number, "F": number,
    "J": number, "P": number
  },// each number should be between 0 and 100, representing the user's score in each dimension \n
  "persianScore": {
    "برونگرا": number,
    "درونگرا": number,
    "حسی": number,
    "شهودی": number,
    "تفکری": number,
    "احساسی": number,
    "قضاوتی": number,
    "ادراکی": number
  }, // each number should be between 0 and 100, representing the user's score in each dimension in Persian
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
    score: JSON.stringify(resultObject.persianScore),
    description: resultObject.description,
    details: resultObject.details,
    color: resultObject.color || "#000", // Default to black if no color is provided
  };
}
