import ScenarioSelection from "@/components/panel/scenario/ScenarioSelection";

interface PageProps {
  params: Promise<{ id: string; resultId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id: examId, resultId } = await params;


  return (
    <main className='flex flex-col'>
      <ScenarioSelection
        examId={examId}
        resultId={resultId}
      />
    </main>
  );
}
