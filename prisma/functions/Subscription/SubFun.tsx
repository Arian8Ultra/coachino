import { Subscription } from "@/generated/prisma";
import { prisma } from "@/prisma/prisma";

export async function Subscription_GetAll() {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      UserSubscriptions: true,
    },
  });

  if (!subscriptions) {
    throw new Error("No subscriptions found");
  }
  return subscriptions;
}

export type Subscription_GetAll = Awaited<
  ReturnType<typeof Subscription_GetAll>
>;

export async function Subscription_GetById(id: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: {
      UserSubscriptions: true,
    },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }
  return subscription;
}
export type Subscription_GetById = Awaited<
  ReturnType<typeof Subscription_GetById>
>;

export async function Subscription_Create(data: Partial<Subscription>) {
  const subscription = await prisma.subscription.create({
    data: {
      chatsPerMonth: data.chatsPerMonth!,
      description: data.description || null,
      duration: data.duration!,
      isActive: data.isActive!,
      level: data.level!,
      name: data.name!,
      options: data.options!,
      price: data.price!,
      scenariosPerMonth: data.scenariosPerMonth!,
      tasksPerMonth: data.tasksPerMonth!,
    },
  });

  if (!subscription) {
    throw new Error("Failed to create subscription");
  }
  return subscription;
}
export type Subscription_Create = Awaited<
  ReturnType<typeof Subscription_Create>
>;

export async function Subscription_Update(
  id: string,
  data: Partial<Subscription>,
) {
  const subscription = await prisma.subscription.update({
    where: { id },
    data,
  });

  if (!subscription) {
    throw new Error("Failed to update subscription");
  }
  return subscription;
}
export type Subscription_Update = Awaited<
  ReturnType<typeof Subscription_Update>
>;

export async function Subscription_Delete(id: string) {
  const subscription = await prisma.subscription.delete({
    where: { id },
  });

  if (!subscription) {
    throw new Error("Failed to delete subscription");
  }
  return subscription;
}
export type Subscription_Delete = Awaited<
  ReturnType<typeof Subscription_Delete>
>;
