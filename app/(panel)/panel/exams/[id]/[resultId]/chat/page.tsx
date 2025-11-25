import ChatUI from "@/components/chat/ChatUI";

interface PageProps {
  params: Promise<{ id: string; resultId: string }>;
}

export default async function ChatPage({ params: params }: PageProps) {
  const { id: examId, resultId } = await params;
  
  return (
    <main className="flex flex-col">
      <ChatUI examId={examId} userExamResultId={resultId} />
    </main>
  );
}