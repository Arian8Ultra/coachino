import { SubscriptionOptionEnum } from "@/generated/prisma";

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
