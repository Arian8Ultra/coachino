import GetAnswerButton from "@/components/exam/GetAnswerButton";
import Bdiv from "@/components/layout/Bdiv";
import {
  Exam_GetById,
  Exam_GetUserResult,
} from "@/prisma/functions/Exam/ExamFun";
import React from "react";
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
        "col-span-full p-4 border rounded-md grid grid-cols-1 gap-4 items-center justify-items-center md:grid-cols-3 lg:grid-cols-4 " +
        (className || "")
      }
    >
      <Bdiv
        className='rounded-md h-full w-full'
        innerClassName='rounded-md p-3 flex flex-col item-center justify-evenly'
      >
        <h4 className='text-lg font-semibold text-center'>
          نتیجه آزمون
        </h4>
        <p className='bg-gradient-to-r from-blue-500/10 to-pink-600/20 text-white p-1 rounded-full w-fit px-5 mx-auto'>
          {userResult.result}
        </p>
      </Bdiv>
      <Bdiv
        className='rounded-md md:col-span-2 w-full'
        innerClassName='rounded-md p-3 flex flex-col gap-3 item-center justify-center'
      >
        <h4 className='text-lg font-semibold'>
          توضیحات نتیجه آزمون شما
        </h4>
        <p className='bg-gradient-to-r from-blue-500/10 to-pink-600/20 text-white p-1 rounded w-fit px-5 mx-auto'>
          {userResult.description}
        </p>
      </Bdiv>
      <Bdiv
        className='rounded-md col-span-full'
        innerClassName='rounded-md p-3 flex flex-col gap-3 item-center justify-center'
      >
        <h4 className='text-lg font-semibold'>
          نتیجه آزمون شما به صورت کلی
        </h4>
        <p className='bg-gradient-to-r from-blue-500/10 to-pink-600/20 text-white p-1 rounded w-fit px-5 mx-auto'>
          {userResult.details}
        </p>
      </Bdiv>
    </div>
  ) : (
    <GetAnswerButton
      examId={exam?.id || ""}
      token={token}
      className='col-span-full rounded-full'
    />
  );
};

export default ResultCard;
