import ScenarioCard from "@/components/panel/scenario/ScenarioCard";
import { Scenario_GetById } from "@/prisma/functions/Scenario/ScenarioFun";

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scenario = await Scenario_GetById(id);
  return (
    <div className='flex flex-col gap-3'>
      <ScenarioCard
        examId={scenario?.examId || ""}
        scenario={scenario}
        userId={""} // Provide user ID if needed
        className='col-span-full'
        getTasksButton={true} // Enable the get tasks button
        viewButton={false} // Enable the view button
      />
    </div>
  );
}
