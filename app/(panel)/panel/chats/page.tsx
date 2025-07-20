import { GetUserId } from "@/auth/AuthFunctions";
import NotFound from "@/components/layout/NotFound/NotFound";
import ChatCard from "@/components/main/Chat/ChatCard";
import { Chat_GetById } from "@/prisma/functions/Chat/ChatFun";
import { cookies } from "next/headers";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookie = await cookies();
  const token = cookie.get("token")?.value;

  if (!token) {
    return (
      <div className='text-center mt-20'>
        You need to be logged in to view this page.
      </div>
    );
  }

  const userId = GetUserId(token);
  if (!userId) {
    return <div className='text-center mt-20'>Invalid user ID.</div>;
  }

  const chat = await Chat_GetById(id);

  if (!chat) {
    return <NotFound />;
  }

  return (
    <div className=' md:mt-0 p-2 w-full min-h-dvh overflow-clip flex flex-col gap-2'>
      <div className='bg-sidebar h-full w-full p-2 rounded-md border border-sidebar-ring/30 relative flex flex-col justify-evenly items-center gap-3'>
        <ChatCard
          userId={userId}
          chatId={id}
          id={id}
          token={token}
          model={chat?.model}
          chat={chat}
        />
      </div>
    </div>
  );
}
