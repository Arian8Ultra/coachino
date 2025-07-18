import { QuestionType } from "@/generated/prisma";
import { prisma } from "@/prisma/prisma";

export async function GET() {
  try {
    const exam = await prisma.exam.create({
      data: {
        name: "MBTI",
        description:
          "A personality test based on the Myers-Briggs Type Indicator",
      },
    });
    console.log("Exam created:", exam);

    const res = await prisma.question.createMany({
      data: [
        {
          examId: exam.id,
          question: "At a party, do you:",
          options: [
            "Interact with many people, including strangers",
            "Interact with a few close friends",
          ],
          type: QuestionType.SINGLE_CHOICE,
          isMandatory: true,
        },
        {
          examId: exam.id,
          question: "Are you more:",
          options: ["Realistic and practical", "Imaginative and abstract"],
          type: QuestionType.SINGLE_CHOICE,
          isMandatory: true,
        },
        {
          examId: exam.id,
          question: "Do you prefer to focus on:",
          options: [
            "Concrete facts and details",
            "Patterns and future possibilities",
          ],
          type: QuestionType.SINGLE_CHOICE,
          isMandatory: true,
        },
        {
          examId: exam.id,
          question: "When making decisions, do you value:",
          options: [
            "Logic and objective analysis",
            "Personal values and feelings",
          ],
          type: QuestionType.SINGLE_CHOICE,
          isMandatory: true,
        },
        {
          examId: exam.id,
          question: "In your daily life, are you more:",
          options: ["Organized and planned", "Spontaneous and flexible"],
          type: QuestionType.SINGLE_CHOICE,
          isMandatory: true,
        },
        {
          examId: exam.id,
          question: "Which of these describe you? (Select all that apply)",
          options: [
            "Love meeting new people",
            "Enjoy detailed planning",
            "Follow your gut instincts",
            "Prefer open‑ended tasks",
          ],
          type: QuestionType.MULTIPLE_CHOICE,
          isMandatory: false,
        },
        {
          examId: exam.id,
          question: "How do you recharge after a long day?",
          options: ["Going out with friends", "Reading a book alone"],
          type: QuestionType.SINGLE_CHOICE,
          isMandatory: true,
        },
        {
          examId: exam.id,
          question: "Describe your ideal weekend:",
          options: [],
          type: QuestionType.TEXT,
          isMandatory: false,
        },
        {
          examId: exam.id,
          question: "Do you trust more:",
          options: ["Experience", "Instinct"],
          type: QuestionType.SINGLE_CHOICE,
          isMandatory: false,
        },
        {
          examId: exam.id,
          question: "When learning something new, do you focus on:",
          options: ["Details and specifics", "Overall concepts"],
          type: QuestionType.SINGLE_CHOICE,
          isMandatory: false,
        },
        {
          examId: exam.id,
          question: "Select the activities you enjoy: (multiple)",
          options: [
            "Brainstorming ideas",
            "Organizing events",
            "Analyzing data",
            "Expressing feelings",
          ],
          type: QuestionType.MULTIPLE_CHOICE,
          isMandatory: false,
        },
        {
          examId: exam.id,
          question: "If you could pick one superpower, which would it be?",
          options: ["Telepathy", "Time‑travel"],
          type: QuestionType.SINGLE_CHOICE,
          isMandatory: false,
        },
        {
          examId: exam.id,
          question: "What’s your birthday?",
          options: [],
          type: QuestionType.DATE,
          isMandatory: false,
        },
      ],
    });

    return new Response(
      JSON.stringify({ message: "Seeding completed successfully", data: res }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error during seeding:", error);
    return new Response(
      JSON.stringify({ message: "Seeding failed", error: error }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
