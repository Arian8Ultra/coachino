import { Exam } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { Book, BookCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";
interface Props {
  className?: string;
  exam: Exam;
  isAnswered?: boolean; // Optional prop to indicate if the exam has been answered
}
const ExamCard = ({ className, exam, isAnswered }: Props) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-4 bg-glass backdrop-blur-lg rounded-xl h-full",
        className,
      )}
    >
      {isAnswered ? (
        <Image
          src={"/Patterns/lineShape-green.svg"}
          alt='Green Banner'
          width={400}
          height={225}
          className='w-full aspect-[3/1] object-cover rounded-2xl'
        />
      ) : (
        <Image
          src={"/Patterns/lineShape-blue.svg"}
          alt='Green Banner'
          width={400}
          height={225}
          className='w-full aspect-[3/1] object-cover rounded-2xl'
        />
      )}

      <h2>{exam.name || "No Exam Name"}</h2>
      <p className='text-gray-600 dark:text-gray-400'>
        {exam.description || "No description available"}
      </p>
      <Link href={`/panel/exams/${exam.id}`} className='mt-auto'>
        <Button variant={isAnswered ? "outline" : "default"} className='w-full p-5 text-base'>
          {isAnswered ? (
            <>
              <BookCheck className='mr-2' />
              مشاهده نتایج
            </>
          ) : (
            <>
              <Book className='mr-2' />
              شروع آزمون
            </>
          )}
        </Button>
      </Link>
    </div>
  );
};

export default ExamCard;
