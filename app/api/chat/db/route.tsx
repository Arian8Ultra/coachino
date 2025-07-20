import { GetUser } from "@/auth/AuthFunctions";
import { MODEL } from "@/generated/prisma";
import {
  Chat_Create,
  Chat_Delete,
  Chat_GetById,
  Chat_Update,
} from "@/prisma/functions/Chat/ChatFun";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // get id from request
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  if (!id) {
    return new Response("ID is required", { status: 400 });
  }
  const cookie = await cookies();
  const token = cookie.get("token")?.value;
  if (!token) {
    return new Response("You need to be logged in to view this page.", {
      status: 401,
    });
  }

  const user = GetUser(token);
  if (!user) {
    return new Response("Invalid user token.", { status: 401 });
  }
  // fetch the chat from the database
  const res = await Chat_GetById(id);

  if (res.userId !== user.id) {
    return new Response("You are not authorized to view this chat.", {
      status: 403,
    });
  }
  if (!res) {
    return new Response("Chat not found", { status: 404 });
  }
  // return the chat
  return new Response(JSON.stringify(res), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, model } = body;
  const cookie = await cookies();
  const token = cookie.get("token")?.value;
  if (!token) {
    return new Response("You need to be logged in to create a chat.", {
      status: 401,
    });
  }
  const user = GetUser(token);
  if (!user) {
    return new Response("Invalid user token.", { status: 401 });
  }

  const ChatTitle = title || (user.name + "'s Chat" + new Date().toLocaleDateString())

  const chat = await Chat_Create({
    userId: user.id,
    model: model || MODEL.GPT_4_O,
    title: ChatTitle,
  });

  if (!chat) {
    return new Response("Failed to create chat", { status: 500 });
  }
  // return the chat
  return new Response(JSON.stringify(chat), {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, title, model } = body;
  if (!id || !title || !model) {
    return new Response("ID, title, and model are required", { status: 400 });
  }

  // check if the model is the MODEL enum
  if (!Object.values(MODEL).includes(model)) {
    return new Response("Invalid model", { status: 400 });
  }
  const cookie = await cookies();
  const token = cookie.get("token")?.value;
  if (!token) {
    return new Response("You need to be logged in to update a chat.", {
      status: 401,
    });
  }
  const user = GetUser(token);
  if (!user) {
    return new Response("Invalid user token.", { status: 401 });
  }

  const chat = await Chat_GetById(id);
  if (!chat) {
    return new Response("Chat not found", { status: 404 });
  }
  if (chat.userId !== user.id) {
    return new Response("You are not authorized to update this chat.", {
      status: 403,
    });
  }
  // update the chat
  const updatedChat = await Chat_Update({
    id,
    title,
    model,
  });
  if (!updatedChat) {
    return new Response("Failed to update chat", { status: 500 });
  }
  // return the updated chat
  return new Response(JSON.stringify(updatedChat), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  if (!id) {
    return new Response("ID is required", { status: 400 });
  }
  const cookie = await cookies();
  const token = cookie.get("token")?.value;
  if (!token) {
    return new Response("You need to be logged in to delete a chat.", {
      status: 401,
    });
  }

  const user = GetUser(token);
  if (!user) {
    return new Response("Invalid user token.", { status: 401 });
  }

  const chat = await Chat_GetById(id);
  if (!chat) {
    return new Response("Chat not found", { status: 404 });
  }

  if (chat.userId !== user.id) {
    return new Response("You are not authorized to delete this chat.", {
      status: 403,
    });
  }

  // delete the chat
  const res = await Chat_Delete(id);

  return new Response(
    JSON.stringify({ message: "Chat deleted successfully", res }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
