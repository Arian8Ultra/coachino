import { prisma } from "@/prisma/prisma";

export async function Message_GetById(id: string) {
  const message = await prisma.message.findUnique({
    where: { id },
    include: {
      user: true,
      Attachments: true, // Include attachments if needed
    },
  });

  if (!message) {
    throw new Error("Message not found");
  }
  return message;
}
export type Message_GetById = Awaited<ReturnType<typeof Message_GetById>>;

export async function Message_GetByChatId(chatId: string) {
  const messages = await prisma.message.findMany({
    where: { chatId },
    include: {
      user: true,

      Attachments: true, // Include attachments if needed
    },
  });

  if (!messages) {
    throw new Error("No messages found for this chat");
  }
  return messages;
}
export type Message_GetByChatId = Awaited<
  ReturnType<typeof Message_GetByChatId>
>;

export async function Message_GetAll() {
  const messages = await prisma.message.findMany({
    include: {
      user: true,
      Attachments: true, // Include attachments if needed
    },
  });

  if (!messages) {
    throw new Error("No messages found");
  }
  return messages;
}

export type Message_GetAll = Awaited<ReturnType<typeof Message_GetAll>>;

export async function Message_Create(data: {
  content: string;
  role: "user" | "assistant";
  chatId: string;
  userId: string;
}) {
  const message = await prisma.message.create({
    data,
    include: {
      user: true,
      Attachments: true, // Include attachments if needed
    },
  });

  if (!message) {
    throw new Error("Failed to create message");
  }
  return message;
}
export type Message_Create = Awaited<ReturnType<typeof Message_Create>>;

export async function Message_CreateWithAttachment(data: {
  content: string;
  role: "user" | "assistant";
  chatId: string;
  userId: string;
  attachments?: FileList;
}) {
  const { content, role, chatId, userId, attachments } = data;

  // Create the message first
  const message = await prisma.message.create({
    data: {
      content,
      role,
      chatId,
      userId,
    },
    include: {
      user: true,
      Attachments: true, // Include attachments if needed
    },
  });

  // If there are attachments, handle them
  if (attachments && attachments.length > 0) {
    const attachmentPromises = Array.from(attachments).map((file) =>
      prisma.attachment.create({
        data: {
          messageId: message.id,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
        },
      }),
    );
    await Promise.all(attachmentPromises);
  }

  return message;
}

export async function Message_Update(
  id: string,
  data: Partial<{
    content: string;
    role: "user" | "assistant";
  }>,
) {
  const message = await prisma.message.update({
    where: { id },
    data,
    include: {
      user: true,
      Attachments: true, // Include attachments if needed
    },
  });

  if (!message) {
    throw new Error("Failed to update message");
  }
  return message;
}

export type Message_Update = Awaited<ReturnType<typeof Message_Update>>;
