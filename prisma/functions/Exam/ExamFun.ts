import { prisma } from "@/prisma/prisma";

export async function Exam_GetAll() {
  const exams = await prisma.exam.findMany({
    include: {
      Questions: true,
    },
  });
  return exams;
}

export type Exam_GetAll = Awaited<ReturnType<typeof Exam_GetAll>>;

export async function Exam_GetById(id: string) {
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      Questions: true,
    },
  });

  if (!exam) {
    return null;
  }
  return exam;
}

export type Exam_GetById = Awaited<ReturnType<typeof Exam_GetById>>;

export async function Exam_Create(data: { name: string; description: string }) {
  const exam = await prisma.exam.create({
    data,
  });

  if (!exam) {
    return null;
  }
  return exam;
}

export type Exam_Create = Awaited<ReturnType<typeof Exam_Create>>;

export async function Exam_Update(data: {
  id: string;
  name?: string;
  description?: string;
  userPrompt?: string;
  systemPrompt?: string;
}) {
  const { id, ...updateData } = data;
  const exam = await prisma.exam.update({
    where: { id },
    data: updateData,
  });
  if (!exam) {
    return null;
  }
  return exam;
}
export type Exam_Update = Awaited<ReturnType<typeof Exam_Update>>;

export async function Exam_GetUserAnswers(examId: string, userId: string) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      Questions: true,
    },
  });
  if (!exam) {
    throw new Error("Exam not found");
  }
  const userAnswers = await prisma.userAnswer.findMany({
    where: {
      questionId: {
        in: exam.Questions.map((q) => q.id),
      },
      userId: userId,
    },
    include: {
      question: true,
    },
  });

  if (!userAnswers) {
    return null;
  }
  return userAnswers;
}

export type Exam_GetUserAnswers = Awaited<
  ReturnType<typeof Exam_GetUserAnswers>
>;

export async function Exam_GetUserResult(examId: string, userId: string) {
  const result = await prisma.userExamResult.findFirst({
    where: {
      examId,
      userId,
    },
    include: {
      exam: true,
    },
  });

  if (!result) {
    return null;
  }
  return result;
}

export type Exam_GetUserResult = Awaited<ReturnType<typeof Exam_GetUserResult>>;

export async function Exam_Delete(id: string) {
  const exam = await prisma.exam.delete({
    where: { id },
  });
  if (!exam) {
    return null;
  }
  return exam;
}
export type Exam_Delete = Awaited<ReturnType<typeof Exam_Delete>>;
