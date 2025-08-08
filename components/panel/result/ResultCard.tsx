import GetAnswerButton from "@/components/exam/GetAnswerButton";
import GlassDiv from "@/components/ui/glass-div";
import { Progress } from "@/components/ui/progress";
import {
  Exam_GetById,
  Exam_GetUserResult,
} from "@/prisma/functions/Exam/ExamFun";
interface Props {
  userResult?: Exam_GetUserResult;
  exam?: Exam_GetById;
  token: string;
  className?: string;
}
const ResultCard = ({ userResult, exam, token, className }: Props) => {
  return userResult ? (
    <div
      className={
        "col-span-full rounded-md grid grid-cols-1 gap-4 items-center justify-items-center md:grid-cols-3 lg:grid-cols-4 " +
        (className || "")
      }
    >
      <GlassDiv className='bg-glass w-full h-full flex items-center justify-center flex-col gap-5'>
        <h4 className='text-lg font-bold'>نتیحه آزمون شما</h4>
        <span
          className='text-blue-500 bg-glass px-3 py-2 rounded-full'
          style={{
            color: userResult.color || "#000",
            fontWeight: "bold",
          }}
        >
          {userResult.result}
        </span>
      </GlassDiv>
      <GlassDiv className='bg-glass w-full h-full flex flex-col gap-5 md:col-span-3'>
        <h4 className='text-lg font-bold text-start'>توضیحات نتیجه</h4>
        <span className='text-justify leading-8'>{userResult.description}</span>
      </GlassDiv>
      <GlassDiv className='bg-glass w-full h-full flex flex-col gap-5 col-span-full'>
        <h4 className='text-lg font-bold text-start'>جزئیات</h4>
        <span className='text-justify leading-8'>{userResult.details}</span>
      </GlassDiv>
      {userResult.score &&
      // {"E":80,"I":20,"S":80,"N":20,"T":70,"F":30,"J":40,"P":60} two by two they are related and they add up to 100
      Object.keys(JSON.parse(userResult.score)).length > 0 ? (
        <div className='grid grid-cols-2 md:grid-cols-4  gap-4 col-span-full w-full'>
          {Object.entries(JSON.parse(userResult.score)).map(
            ([key, value], i) => (
              <GlassDiv
                key={i}
                className='flex flex-col items-center justify-center gap-2 w-full'
              >
                <span className='text-sm text-gray-500'>{key}</span>
                <Progress
                  value={Number(value)}
                  backgroundColor='bg-gray-200'
                  barColor='bg-blue-500'
                  className='w-full'
                />
                <span className='text-sm font-bold'>{Number(value)}%</span>
              </GlassDiv>
            ),
          )}
        </div>
      ) : (
        <GlassDiv className='bg-glass w-full h-full flex items-center justify-center flex-col gap-5 col-span-full'>
          <h4 className='text-lg font-bold'>امتیازها</h4>
          <span className='text-gray-500'>امتیازی ثبت نشده است</span>
        </GlassDiv>
      )}
    </div>
  ) : (
    <GetAnswerButton examId={exam?.id || ""} token={token} />
  );
};

export default ResultCard;
