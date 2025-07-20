import { MODEL } from "@/generated/prisma";
import { prisma } from "@/prisma/prisma";

export async function Chat_GetById(id: string) {
  const chat = await prisma.chat.findUnique({
    where: { id },
    include: {
      Messages: {
        include: {
          user: true,
          Attachments:true
        },
      },
    },
  });

  if (!chat) {
    return null; // Return null if chat is not found
  }
  return chat;
}

export type Chat_GetById = Awaited<ReturnType<typeof Chat_GetById>>;

export async function Chat_GetByUserId(userId: string) {
  const chats = await prisma.chat.findMany({
    where: {
      userId,
    },
    include: {
      Messages: {
        include: {
          user: true,
          Attachments: true,
        },
      },
    },
  });

  if (!chats) {
    throw new Error("No chats found for this user");
  }
  return chats;
}
export type Chat_GetByUserId = Awaited<ReturnType<typeof Chat_GetByUserId>>;

export async function Chat_GetAll() {
  const chats = await prisma.chat.findMany({
    include: {
      Messages: {
        include: {
          user: true,
          Attachments: true,
        },
      },
    },
  });

  if (!chats) {
    throw new Error("No chats found");
  }
  return chats;
}
export type Chat_GetAll = Awaited<ReturnType<typeof Chat_GetAll>>;

export async function Chat_Create({userId, title,model}: {userId: string; title?: string, model?: MODEL}) {
  const chat = await prisma.chat.create({
    data: {
      userId,
      title,
      model: model || MODEL.GPT_4_O, // Default to GPT_4_O if no model is provided
    },
  });

  if (!chat) {
    throw new Error("Chat creation failed");
  }
  return chat;
}

export type Chat_Create = Awaited<ReturnType<typeof Chat_Create>>;

export async function Chat_Update({
  id,
  title,
  model,
}: {
  id: string;
  title?: string;
  model?: MODEL;
}) {
  const chat = await prisma.chat.update({
    where: { id },
    data: { title, model },
  });

  if (!chat) {
    throw new Error("Chat update failed");
  }
  return chat;
}
export type Chat_Update = Awaited<ReturnType<typeof Chat_Update>>;

// delete chat
export async function Chat_Delete(id: string) {
  const messages = await prisma.message.deleteMany({
    where: { chatId: id },
  });
  if (!messages) {
    throw new Error("Messages deletion failed");
  }
  const chat = await prisma.chat.delete({
    where: { id },
  });
  if (!chat) {
    throw new Error("Chat deletion failed");
  }
  return chat;
}
