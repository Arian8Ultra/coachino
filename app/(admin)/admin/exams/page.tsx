import ExamModal from "@/components/admin/exams/ExamModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Exam_GetAll } from "@/prisma/functions/Exam/ExamFun";

export default async function Page() {
  const exams = await Exam_GetAll();
  return (
    <div className='p-5 flex flex-col gap-5'>
      <h1 className='text-2xl font-bold'>آزمون‌ها</h1>
      <Table className="bg-glass rounded-lg">
        <TableHeader>
          <TableRow className='*:text-start *:font-semibold'>
            <TableHead>شناسه</TableHead>
            <TableHead>نام</TableHead>
            <TableHead>توضیحات</TableHead>
            <TableHead>تعداد سوالات</TableHead>
            <TableHead>...</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell>{exam.id}</TableCell>
              <TableCell>{exam.name}</TableCell>
              <TableCell>{exam.description}</TableCell>
              <TableCell>{exam.Questions?.length}</TableCell>
              <TableCell>
                <ExamModal exam={exam} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
