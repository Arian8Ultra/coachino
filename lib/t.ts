import { FeedbackType, SubscriptionOptionEnum } from "@/generated/prisma";

export function subscription_features_map(feature: SubscriptionOptionEnum) {
  switch (feature) {
    case "VIDEO_SEARCH":
      return "جستجوی ویدیو";
    case "SOURCE_PROVIDED":
      return "ارائه منبع";
    case "ADVANCED_ANALYSIS":
      return "تحلیل پیشرفته";
    case "AUTOMATIC_RESCHEDULING":
      return "برنامه‌ریزی خودکار";
  }
}

export function feedback_type_map(type: FeedbackType) {
  switch (type) {
    case "BUG_REPORT":
      return "گزارش باگ";
    case "FEATURE_REQUEST":
      return "درخواست ویژگی";
    case "GENERAL_COMMENT":
      return "بازخورد عمومی";
  }
}
