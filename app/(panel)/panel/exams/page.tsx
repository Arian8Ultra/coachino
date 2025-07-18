import { prisma } from "@/prisma/prisma";
import { NotebookText } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  const exams = await prisma.exam.findMany({
    include: {
      Questions: true,
    },
  });
  return (
    <div className='w-full h-full relative flex items-center justify-center'>
      <div className='flex flex-wrap gap-4 p-4 max-w-4xl'>
        {exams.map((exam) => (
          <Link
            href={`exams/${exam.id}`}
            key={exam.id}
            className='bg-white dark:bg-secondary rounded-lg shadow-md p-4 hover:scale-110 hover:shadow-lg transition-transform duration-300 ease-in-out flex flex-col items-center justify-center text-center '
          >
            <div className='flex gap-5 items-center justify-center mb-4'>
              <NotebookText className='h-12 w-12 text-primary mb-2' />
              <h2 className='text-xl font-semibold mb-2'>{exam.name}</h2>
            </div>
            <p className='text-gray-600 dark:text-gray-400 mb-4'>
              {exam.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
