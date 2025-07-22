import { QuestionType } from "@/generated/prisma";
import { prisma } from "@/prisma/prisma";

export async function GET() {
  try {
    const exam = await prisma.exam.create({
      data: {
        name: "MBTI",
        description:
          "یک تست شخصیت مبتنی بر شاخص مایرز‑بریگز",
      },
    });
    console.log("Exam created:", exam);

    const res =   await prisma.question.createMany({
      data: [
        {
          examId: exam.id,
          question: "در یک مهمانی، شما:",
          options: [
            "با افراد زیادی از جمله غریبه‌ها تعامل می‌کنید",
            "با چند دوست صمیمی تعامل می‌کنید",
          ],
          type: QuestionType.SINGLE_CHOICE,
          isMandatory: true,
        },
        {
          examId: exam.id,
          question: "شما بیشتر:",
          options: ["واقع‌گرا و عمل‌گرا", "خیال‌پرداز و انتزاعی"],
          type: QuestionType.SINGLE_CHOICE,
          isMandatory: true,
        },
        {
          examId: exam.id,
          question: "ترجیح می‌دهید تمرکز کنید بر:",
          options: [
            "حقایق عینی و جزئیات",
            "الگوها و احتمالات آینده",
          ],
          type: QuestionType.SINGLE_CHOICE,
          isMandatory: true,
        },
        {
          examId: exam.id,
          question: "هنگام تصمیم‌گیری بیشتر به چه چیزی بها می‌دهید:",
          options: [
            "منطق و تحلیل عینی",
            "ارزش‌ها و احساسات شخصی",
          ],
          type: QuestionType.SINGLE_CHOICE,
          isMandatory: true,
        },
        {
          examId: exam.id,
          question: "در زندگی روزمره بیشتر:",
          options: ["منظم و برنامه‌ریزی‌شده", "خودجوش و انعطاف‌پذیر"],
          type: QuestionType.SINGLE_CHOICE,
          isMandatory: true,
        },
        {
          examId: exam.id,
          question:
            "کدام‌یک از موارد زیر شما را توصیف می‌کند؟ (همه موارد مناسب را انتخاب کنید)",
          options: [
            "عاشق آشنایی با افراد جدید هستید",
            "از برنامه‌ریزی دقیق لذت می‌برید",
            "به غرایز خود اعتماد می‌کنید",
            "کارهای بدون پایان مشخص را ترجیح می‌دهید",
          ],
          type: QuestionType.MULTIPLE_CHOICE,
          isMandatory: false,
        },
        {
          examId: exam.id,
          question: "پس از یک روز طولانی چگونه انرژی خود را بازیابی می‌کنید؟",
          options: ["خروج با دوستان", "تنها کتاب خواندن"],
          type: QuestionType.SINGLE_CHOICE,
          isMandatory: true,
        },
        {
          examId: exam.id,
          question: "آخر هفته ایده‌آل خود را توصیف کنید:",
          options: [],
          type: QuestionType.TEXT,
          isMandatory: false,
        },
        {
          examId: exam.id,
          question: "بیشتر به کدام اعتماد دارید:",
          options: ["تجربه", "غریزه"],
          type: QuestionType.SINGLE_CHOICE,
          isMandatory: false,
        },
        {
          examId: exam.id,
          question: "هنگام یادگیری چیز جدید، تمرکز شما بر:",
          options: ["جزئیات و موارد مشخص", "مفاهیم کلی"],
          type: QuestionType.SINGLE_CHOICE,
          isMandatory: false,
        },
        {
          examId: exam.id,
          question:
            "فعالیت‌هایی که از آن‌ها لذت می‌برید را انتخاب کنید: (چند مورد)",
          options: [
            "طوفان فکری ایده‌ها",
            "سازماندهی رویدادها",
            "تحلیل داده‌ها",
            "ابراز احساسات",
          ],
          type: QuestionType.MULTIPLE_CHOICE,
          isMandatory: false,
        },
        {
          examId: exam.id,
          question:
            "اگر می‌توانستید یک ابرقدرت انتخاب کنید، کدام را برمی‌گزینید؟",
          options: ["تله‌پاتی (ذهن‌خوانی)", "سفر در زمان"],
          type: QuestionType.SINGLE_CHOICE,
          isMandatory: false,
        },
        {
          examId: exam.id,
          question: "تاریخ تولدتان چیست؟",
          options: [],
          type: QuestionType.DATE,
          isMandatory: false,
        },
      ],
    });


    return new Response(
      JSON.stringify({ message: "Seeding completed successfully", data: res }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error during seeding:", error);
    return new Response(
      JSON.stringify({ message: "Seeding failed", error: error }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
