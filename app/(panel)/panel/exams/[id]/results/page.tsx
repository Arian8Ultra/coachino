import { GetCurrentUser } from "@/auth/AuthFunctions";
import ResultCard from "@/components/panel/result/ResultCard";
import ScenarioCard from "@/components/panel/scenario/ScenarioCard";
import {
  Exam_GetById,
  Exam_GetUserResult,
} from "@/prisma/functions/Exam/ExamFun";
import { Scenario_GetByExamAndUser } from "@/prisma/functions/Scenario/ScenarioFun";
import { cookies } from "next/headers";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exam = await Exam_GetById(id);
  const user = await GetCurrentUser();
  const cookie = await cookies();
  const token = cookie.get("token")?.value || "";
  const results = await Exam_GetUserResult(id, user?.id || "");
  const scenario = await Scenario_GetByExamAndUser(id, user?.id || "");
  return (
    <div className='flex flex-col gap-10 p-10'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-3xl'>{exam ? exam.name : "Exam not found"}</h2>
        <p>{exam ? exam.description : "No description available"}</p>
      </div>

      <ResultCard
        userResult={results}
        exam={exam}
        token={token}
        className='col-span-full'
      />
      {scenario ? (
        <div className='p-4 border rounded-md bg-gradient-to-r from-blue-500/10 to-pink-600/20'>
          <h3 className='text-lg font-semibold'>{scenario.name}</h3>

          <p className='text-gray-700'>
            {scenario.description || "No description available"}
          </p>
        </div>
      ) : (
        <ScenarioCard
          examId={id}
          scenario={scenario}
          userId={user?.id || ""}
          className='col-span-full'
          viewButton
        />
      )}
    </div>
  );
}
