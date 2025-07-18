import OpenAI from "openai";
// OpenAI Setup (v4 SDK)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function GetLLMResult(
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
  "result": "MBTI_TYPE",
  "score": {
    "E": number, "I": number,
    "S": number, "N": number,
    "T": number, "F": number,
    "J": number, "P": number
  },
  "description": "Short paragraph summarizing the personality type.",
  "details": "Detailed breakdown of each trait, behavioral patterns, strengths, weaknesses, and suitable careers."
}

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
