import { Scenario } from "@/generated/prisma";
import { prisma } from "@/prisma/prisma";

export async function Scenario_GetById(id: string) {
  const scenario = await prisma.scenario.findUnique({
    where: { id },
    include: {
      Tasks: true, // Include tasks if needed
      user: true, // Include user if needed
    },
  });

  if (!scenario) {
    return null; // Return null if scenario is not found
  }
  return scenario;
}

export type Scenario_GetById = Awaited<ReturnType<typeof Scenario_GetById>>;

export async function Scenario_Create(data: Partial<Scenario>, userId: string) {
  if (!data.name || !data.description) {
    throw new Error("Name and description are required to create a scenario");
  }

  const resultObject = {
    name: data.name,
    description: data.description,
  };

  // Validate the resultObject
  if (!resultObject.name || !resultObject.description) {
    throw new Error("Invalid scenario data");
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }
  // Save the scenario to the database
  const scenario = await prisma.scenario.create({
    data: {
      name: resultObject.name,
      description: resultObject.description,
      userId: userId,
    },
  });
  if (!scenario) {
    throw new Error("Failed to create scenario");
  }
  return scenario;
}
export type Scenario_Create = Awaited<ReturnType<typeof Scenario_Create>>;

export async function Scenario_GetAll() {
  const scenarios = await prisma.scenario.findMany({
    include: {
      Tasks: true, // Include tasks if needed
      user: true, // Include user if needed
    },
  });

  if (!scenarios) {
    throw new Error("No scenarios found");
  }
  return scenarios;
}

export type Scenario_GetAll = Awaited<ReturnType<typeof Scenario_GetAll>>;

export async function Scenario_GetByExamAndUser(
  examId: string,
  userId: string,
) {
  const scenarios = await prisma.scenario.findFirst({
    where: {
      examId,
      userId,
    },
    include: {
      Tasks: true, // Include tasks if needed
      user: true, // Include user if needed
    },
  });

  if (!scenarios) {
    return null; // Return null if no scenarios found
  }
  return scenarios;
}

export type Scenario_GetByExamAndUser = Awaited<
  ReturnType<typeof Scenario_GetByExamAndUser>
>;



export async function Scenario_GetByUser(userId: string) {
  const scenarios = await prisma.scenario.findMany({
    where: { userId },
    include: {
      Tasks: true, // Include tasks if needed
      user: true, // Include user if needed
    },
  });

  if (!scenarios) {
    throw new Error("No scenarios found for this user");
  }
  return scenarios;
}

export type Scenario_GetByUser = Awaited<ReturnType<typeof Scenario_GetByUser>>;