import { GetCurrentUser } from "@/auth/AuthFunctions";
import {
  Exam_GetById,
  Exam_GetUserResult,
} from "@/prisma/functions/Exam/ExamFun";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exam = await Exam_GetById(id);
  const user = await GetCurrentUser();
  const results = await Exam_GetUserResult(id, user?.id || "");
  return (
    <div className='flex flex-col gap-10 p-10'>
      <div className='flex flex-col gap-2'>
        <h2>{exam ? exam.name : "Exam not found"}</h2>
        <p>{exam ? exam.description : "No description available"}</p>
      </div>

      {user && (
        <div className='flex flex-col gap-4'>
          <h3>Your Results</h3>
          {results ? (
            <div>
              <p>Score: {results.score}</p>
              <p>Description: {results.description}</p>
              <p>Details: {results.details}</p>
            </div>
          ) : (
            <p>No results found for this exam.</p>
          )}
        </div>
      )}
    </div>
  );
}
