import { RecommendedScenario } from "@/generated/prisma";
import { prisma } from "@/prisma/prisma";

export async function RecommendedScenario_GetById(id: string) {
  if (!id) {
    throw new Error("Scenario ID is required");
  }

  // Fetch the scenario by ID
  const scenario = await prisma.recommendedScenario.findUnique({
    where: { id },
    include: {
      user: true, // Include user if needed
      examResult: true, // Include exam results if needed
    },
  });

  if (!scenario) {
    throw new Error("Scenario not found");
  }

  return scenario;
}

export type RecommendedScenario_GetById = Awaited<
  ReturnType<typeof RecommendedScenario_GetById>
>;

export async function RecommendedScenario_GetAll() {
  // Fetch all scenarios
  const scenarios = await prisma.recommendedScenario.findMany({
    include: {
      user: true, // Include user if needed
      examResult: true, // Include exam results if needed
    },
  });

  if (!scenarios || scenarios.length === 0) {
    throw new Error("No scenarios found");
  }

  return scenarios;
}

export type RecommendedScenario_GetAll = Awaited<
  ReturnType<typeof RecommendedScenario_GetAll>
>;

export async function RecommendedScenario_Create(
  data: Partial<RecommendedScenario>,
  userId: string,
) {
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
  const scenario = await prisma.recommendedScenario.create({
    data: {
      name: resultObject.name,
      description: resultObject.description,
      details: data.details || "", // Optional details field
      approximateTime: data.approximateTime || 0, // Optional approximate time field
      chosenByCoachino: data.chosenByCoachino || false, // Optional flag for coachino choice
      examResultId: data.examResultId || null, // Optional exam result ID
      chosenByUser: data.chosenByUser || false, // Optional flag for user choice
      userId: userId,
    },
  });

  if (!scenario) {
    throw new Error("Failed to create scenario");
  }

  return scenario;
}
export type RecommendedScenario_Create = Awaited<
  ReturnType<typeof RecommendedScenario_Create>
>;

export async function RecommendedScenario_ToScenario(
  recommendedScenarioId: string,
  userId: string,
) {
  if (!recommendedScenarioId || !userId) {
    throw new Error("Recommended scenario ID and user ID are required");
  }

  // Fetch the recommended scenario
  const recommendedScenario = await prisma.recommendedScenario.findUnique({
    where: { id: recommendedScenarioId },
  });

  if (!recommendedScenario) {
    throw new Error("Recommended scenario not found");
  }

  // Create a new scenario based on the recommended scenario
  const scenario = await prisma.scenario.create({
    data: {
      name: recommendedScenario.name,
      description: recommendedScenario.description,
      details: recommendedScenario.details,
      approximateTime: recommendedScenario.approximateTime,
      examResultId: recommendedScenario.examResultId,
      userId: userId,
    },
  });

  if (!scenario) {
    throw new Error("Failed to create scenario from recommended scenario");
  }
  // Optionally, you can also copy tasks or other related data if needed
  return scenario;
}
export type RecommendedScenario_ToScenario = Awaited<
  ReturnType<typeof RecommendedScenario_ToScenario>
>;

export async function RecommendedScenario_Delete(id: string) {
  if (!id) {
    throw new Error("Scenario ID is required for deletion");
  }

  // Delete the scenario by ID
  const deletedScenario = await prisma.recommendedScenario.delete({
    where: { id },
  });

  if (!deletedScenario) {
    throw new Error("Failed to delete scenario");
  }

  return deletedScenario;
}
export type RecommendedScenario_Delete = Awaited<
  ReturnType<typeof RecommendedScenario_Delete>
>;
