import { QuestionType } from "@/generated/prisma";
import { prisma } from "./prisma";

// 1) Define a reusable Likert scale (labels + weights)
export const LIKERT5_AvsB_FA = {
  name: "Likert5_A_vs_B_FA",
  labels: [
    "کاملاً به الف نزدیکم",
    "تا حدی به الف نزدیکم",
    "خنثی / بستگی دارد",
    "تا حدی به ب نزدیکم",
    "کاملاً به ب نزدیکم",
  ],
  weights: [2, 1, 0, -1, -2],
};

async function upsertScale() {
  return prisma.scale.upsert({
    where: { name: LIKERT5_AvsB_FA.name },
    update: { labels: LIKERT5_AvsB_FA.labels, weights: LIKERT5_AvsB_FA.weights },
    create: {
      name: LIKERT5_AvsB_FA.name,
      labels: LIKERT5_AvsB_FA.labels,
      weights: LIKERT5_AvsB_FA.weights,
    },
  });
}

// 2) MBTI dimensions (generic: you can replace with any exam’s dims)
const MBTI_DIMS = [
  { code: "E", name: "برون‌گرایی" },
  { code: "I", name: "درون‌گرایی" },
  { code: "S", name: "حسی" },
  { code: "N", name: "شهودی" },
  { code: "T", name: "فکری" },
  { code: "F", name: "احساسی" },
  { code: "J", name: "قضاوت‌گر" },
  { code: "P", name: "ادراک‌گر" },
];

async function upsertDimensions(examId: string) {
  const result: Record<string, string> = {};
  for (const d of MBTI_DIMS) {
    const row = await prisma.dimension.upsert({
      where: { examId_code: { examId, code: d.code } },
      update: { name: d.name },
      create: { examId, code: d.code, name: d.name },
    });
    result[d.code] = row.id;
  }
  return result; // map code -> dimensionId
}

// 3) Generic anchored-likert question def (works for other exams too)
export type AnchoredLikertItem = {
  code: string;
  stem: string;   
  anchorA: string;
  anchorB: string;
  aDim: string;   
  bDim: string;   
  mandatory?: boolean;
};

async function createAnchoredLikertQuestion(
  examId: string,
  scaleId: string,
  dims: Record<string, string>,
  item: AnchoredLikertItem
) {
  const q = await prisma.question.create({
    data: {
      examId: examId,
      code: item.code,
      question: item.stem,
      anchorA: item.anchorA,
      anchorB: item.anchorB,
      options: LIKERT5_AvsB_FA.labels,
      optionWeights: LIKERT5_AvsB_FA.weights,
      type: QuestionType.FiveOption,
      isMandatory: item.mandatory ?? true,
      scaleId:scaleId,
      meta: { anchors: { a: item.anchorA, b: item.anchorB } },
    },
  });

  // دو کلید نمره‌گذاری: یکی برای aDim با +1، دیگری برای bDim با -1
  await prisma.questionKey.createMany({
    data: [
      {
        questionId: q.id,
        dimensionId: dims[item.aDim],
        multiplier: 1,
      },
      {
        questionId: q.id,
        dimensionId: dims[item.bDim],
        multiplier: -1,
      },
    ],
  });
}

// 4) MBTI FA item bank (از بانک قبلی، اما با ساختار عمومی)
const MBTI_ITEMS_FA: AnchoredLikertItem[] = [
  { code: "E01", stem: "در رویدادهای شبکه‌سازی، شما…", anchorA: "با غریبه‌ها سرِ صحبت را باز می‌کنید.", anchorB: "صبر می‌کنید دیگران شروع کنند.", aDim: "E", bDim: "I" },
  { code: "E02", stem: "یک عصرِ آزاد را ترجیح می‌دهید…", anchorA: "با جمع یا تماس با دیگران بگذرانید.", anchorB: "تنها و آرام برای شارژ مجدد.", aDim: "E", bDim: "I" },
  { code: "E03", stem: "در جلسات معمولاً…", anchorA: "زود صحبت می‌کنید و ایده می‌دهید.", anchorB: "اول گوش می‌دهید و بعد صحبت می‌کنید.", aDim: "E", bDim: "I" },
  { code: "E04", stem: "آدم‌های جدید شما را معمولاً…", anchorA: "برون‌گرا و معاشرتی می‌بینند.", anchorB: "کم‌حرف تا وقتی گرم بگیرید.", aDim: "E", bDim: "I" },
  { code: "E05", stem: "برای تصمیم‌گیری ترجیح می‌دهید…", anchorA: "با صدای بلند فکر کنید/حرف بزنید.", anchorB: "در خلوت فکر کنید.", aDim: "E", bDim: "I" },
  { code: "E06", stem: "در پروژه‌های گروهی احساس می‌کنید…", anchorA: "از همکاری انرژی می‌گیرید.", anchorB: "به‌تنهایی مؤثرتر هستید.", aDim: "E", bDim: "I" },
  { code: "E07", stem: "محیط کارِ ایده‌آل شما…", anchorA: "پررفت‌وآمد و زنده است.", anchorB: "ساکت و کم‌مزاحمت است.", aDim: "E", bDim: "I" },
  { code: "E08", stem: "بعد از یک مهمانی بزرگ…", anchorA: "انرژی می‌گیرید.", anchorB: "خسته می‌شوید و استراحت می‌خواهید.", aDim: "E", bDim: "I" },
  { code: "E09", stem: "بهترین یادگیری شما با…", anchorA: "بحث با دیگران.", anchorB: "مطالعه و تأمل فردی.", aDim: "E", bDim: "I" },
  { code: "E10", stem: "تقویم شما معمولاً…", anchorA: "پر از قرار با دیگران است.", anchorB: "زمانِ آزادِ بدون برنامه دارد.", aDim: "E", bDim: "I" },
  { code: "S01", stem: "وقتی ابزار جدیدی یاد می‌گیرید، ترجیح می‌دهید…", anchorA: "گام‌به‌گام طبق دستور پیش بروید.", anchorB: "خودتان امکانات را کشف کنید.", aDim: "S", bDim: "N" },
  { code: "S02", stem: "بیشتر اعتماد می‌کنید به…", anchorA: "تجربه و واقعیت‌های گذشته.", anchorB: "حدس درباره الگوها و ارتباطات.", aDim: "S", bDim: "N" },
  { code: "S03", stem: "در گفتگو تمرکز شما روی…", anchorA: "جزئیات ملموس.", anchorB: "الگوها و پیامدها.", aDim: "S", bDim: "N" },
  { code: "S04", stem: "روبروی مشکل که می‌ایستید…", anchorA: "به مراحل عملی خردش می‌کنید.", anchorB: "زاویه‌های نو را طوفان‌فکری می‌کنید.", aDim: "S", bDim: "N" },
  { code: "S05", stem: "از کاری لذت می‌برید که…", anchorA: "عملی و واقع‌گرایانه باشد.", anchorB: "مفهومی و کلان‌نگر باشد.", aDim: "S", bDim: "N" },
  { code: "S06", stem: "در خواندن ترجیح می‌دهید…", anchorA: "دستور/اطلاعات روشن.", anchorB: "نظریه‌ها و اگر-آنگاه‌ها.", aDim: "S", bDim: "N" },
  { code: "S07", stem: "معمولاً متوجه می‌شوید…", anchorA: "جزئیات دقیقِ اطراف.", anchorB: "ارتباطاتی که دیگران نمی‌بینند.", aDim: "S", bDim: "N" },
  { code: "S08", stem: "حافظه‌تان قوی‌تر است برای…", anchorA: "جزئیات و مراحل دقیق.", anchorB: "لبّ مطلب و معنا.", aDim: "S", bDim: "N" },
  { code: "S09", stem: "ایده‌هایی شما را هیجان‌زده می‌کند که…", anchorA: "اکنون عملی شدنی باشد.", anchorB: "دگرگون‌کننده و آینده‌نگر باشد.", aDim: "S", bDim: "N" },
  { code: "S10", stem: "در بازخورد دادن شما…", anchorA: "نمونه‌های عینی می‌آورید.", anchorB: "دربارهٔ تم‌ها و امکان‌ها حرف می‌زنید.", aDim: "S", bDim: "N" },
  { code: "T01", stem: "در یک اختلاف، اولویت شما…", anchorA: "انصاف و منطق.", anchorB: "هماهنگی و همدلی.", aDim: "T", bDim: "F" },
  { code: "T02", stem: "سبکِ بازخوردِ شما…", anchorA: "مستقیم و عینی است.", anchorB: "مؤدبانه و ملاحظه‌کار است.", aDim: "T", bDim: "F" },
  { code: "T03", stem: "در تصمیم‌گیری بیشتر تکیه می‌کنید بر…", anchorA: "معیارها و تحلیل.", anchorB: "ارزش‌ها و اثر بر افراد.", aDim: "T", bDim: "F" },
  { code: "T04", stem: "بیشتر تحسین می‌کنید…", anchorA: "سامانه‌های کارآمد.", anchorB: "اجتماع‌های حمایتگر.", aDim: "T", bDim: "F" },
  { code: "T05", stem: "وقتی کسی ناراحت است، اول…", anchorA: "راه‌حل پیشنهاد می‌دهید.", anchorB: "همدلی نشان می‌دهید.", aDim: "T", bDim: "F" },
  { code: "T06", stem: "«تصمیم درست» آنی است که…", anchorA: "موازنه را بهینه کند.", anchorB: "برای درگیران درست حس شود.", aDim: "T", bDim: "F" },
  { code: "T07", stem: "در مذاکره بیشتر تمرکز می‌کنید بر…", anchorA: "اعداد و شروط.", anchorB: "روابط و حفظ آن‌ها.", aDim: "T", bDim: "F" },
  { code: "T08", stem: "جلسات وقتی بهتر پیش می‌رود که…", anchorA: "دستورجلسه و شاخص‌ها روشن باشد.", anchorB: "همه احساس شنیده‌شدن کنند.", aDim: "T", bDim: "F" },
  { code: "T09", stem: "ستایشی که برایتان ارزشمندتر است…", anchorA: "برای شایستگی و نتیجه.", anchorB: "برای حمایتگری و مراقبت.", aDim: "T", bDim: "F" },
  { code: "T10", stem: "زیر فشار زمان…", anchorA: "به منطق و برنامه می‌چسبید.", anchorB: "نیازهای آدم‌ها را در نظر می‌گیرید.", aDim: "T", bDim: "F" },
  { code: "J01", stem: "لیست کارهای شما معمولاً…", anchorA: "برنامه‌ریزی و اولویت‌بندی شده.", anchorB: "منعطف و در حال تغییر.", aDim: "J", bDim: "P" },
  { code: "J02", stem: "ضرب‌الاجل‌ها برای شما…", anchorA: "تعهد قطعی‌اند.", anchorB: "اهدافی قابل‌تغییرند.", aDim: "J", bDim: "P" },
  { code: "J03", stem: "برای سفر…", anchorA: "از قبل رزرو و برنامه می‌چینید.", anchorB: "جا برای خودانگیختگی می‌گذارید.", aDim: "J", bDim: "P" },
  { code: "J04", stem: "محیط کار شما…", anchorA: "مرتب و منظم است.", anchorB: "قابل‌تطبیق؛ کمی شلوغی OK است.", aDim: "J", bDim: "P" },
  { code: "J05", stem: "وقتی برنامه عوض می‌شود…", anchorA: "ناقرار می‌شوید.", anchorB: "از گزینه‌های جدید هیجان‌زده می‌شوید.", aDim: "J", bDim: "P" },
  { code: "J06", stem: "ترجیح می‌دهید…", anchorA: "زود تصمیم بگیرید.", anchorB: "گزینه‌ها را باز نگه دارید.", aDim: "J", bDim: "P" },
  { code: "J07", stem: "پروژه‌ها غالباً تمام می‌شوند…", anchorA: "خیلی قبل از ددلاین.", anchorB: "با جهش لحظه آخری.", aDim: "J", bDim: "P" },
  { code: "J08", stem: "تقویمتان…", anchorA: "هفته‌ها جلوتر تنظیم می‌شود.", anchorB: "نزدیک زمان پر می‌شود.", aDim: "J", bDim: "P" },
  { code: "J09", stem: "قوانین عمدتاً…", anchorA: "شفافیت و نظم می‌آورند.", anchorB: "راهنمای قابل‌انعطاف‌اند.", aDim: "J", bDim: "P" },
  { code: "J10", stem: "آخرِ هفته‌ها…", anchorA: "برنامه می‌چینید.", anchorB: "جریان را دنبال می‌کنید.", aDim: "J", bDim: "P" },
];

export async function seedMbtiGenericFa(examId: string) {
  const scale = await upsertScale();
  const dims = await upsertDimensions(examId);

  for (const it of MBTI_ITEMS_FA) {
    await createAnchoredLikertQuestion(examId, scale.id, dims, it);
  }
}

// CLI usage: ts-node prisma/seed-mbti-generic-fa.ts <EXAM_ID>
if (require.main === module) {
  const examId = process.argv[2];
  if (!examId) {
    console.error("Usage: ts-node prisma/seed-mbti-generic-fa.ts <EXAM_ID>");
    process.exit(1);
  }
  seedMbtiGenericFa(examId)
    .then(() => console.log("✅ MBTI (FA) seeded using generic schema."))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
