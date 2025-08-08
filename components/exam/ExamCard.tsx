import { Exam } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import RobotHead from "@/assets/SVG/RobotHead.svg";
import Image from "next/image";
import { Button } from "../ui/button";
interface Props {
  className?: string;
  exam: Exam;
}
const ExamCard = ({ className, exam }: Props) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-4 bg-glass backdrop-blur-lg rounded-xl h-full",
        className,
      )}
    >
      <Image
        src={RobotHead}
        alt='Robot Head'
        width={100}
        height={100}
        className='w-24 h-24 mb-4'
      />

      <h2>{exam.name || "No Exam Name"}</h2>
      <p className='text-gray-600 dark:text-gray-400'>
        {exam.description || "No description available"}
      </p>
      <Link href={`/panel/exams/${exam.id}`} className="mt-auto">
        <Button variant={"outline"} className="w-full p-5 text-base">
          شروع آزمون
        </Button>
      </Link>
    </div>
  );
};

export default ExamCard;
