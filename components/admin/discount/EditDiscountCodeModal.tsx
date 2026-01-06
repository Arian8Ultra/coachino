"use client";

import { DiscountCode } from "@/generated/prisma";
import AdminEditModal from "../General/AdminEditModal";

export function parseIntOrZero(raw: unknown) {
  const n = typeof raw === "string" ? parseInt(raw) : Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export function parseOptionalInt(raw: unknown): number | null {
  if (raw == null) return null;
  if (typeof raw === "string" && raw.trim() === "") return null;
  const n = typeof raw === "string" ? parseInt(raw) : Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function parseDateToIso(raw: unknown): string {
  if (typeof raw !== "string" || raw.trim() === "") return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

export default function EditDiscountCodeModal({
  discountCode,
}: {
  discountCode: DiscountCode;
}) {
  return (
    <AdminEditModal
      id={discountCode.id}
      typeName='discountcode'
      title='ویرایش کد تخفیف'
      contentClassName='max-w-lg max-h-[80vh] overflow-y-auto rtl'
      initialValue={{
        code: discountCode.code,
        description: discountCode.description || "",
        discountPct: discountCode.discountPct,
        validFrom: discountCode.validFrom.toISOString(),
        validTo: discountCode.validTo.toISOString(),
        limitUses: discountCode.limitUses,
        isActive: discountCode.isActive,
      }}
      fields={[
        {
          name: "code",
          label: "کد",
          type: "text",
          placeholder: "مثال: NEWYEAR2026",
          required: true,
        },
        {
          name: "description",
          label: "توضیحات",
          type: "textarea",
          placeholder: "اختیاری",
        },
        {
          name: "discountPct",
          label: "درصد تخفیف",
          type: "text",
          placeholder: "مثال: 10",
          required: true,
          parse: (raw) => parseIntOrZero(raw),
        },
        {
          name: "validFrom",
          label: "اعتبار از (datetime-local)",
          type: "date",
          placeholder: "مثال: 2026-01-06T00:00",
          required: true,
          parse: (raw) => parseDateToIso(raw),
        },
        {
          name: "validTo",
          label: "اعتبار تا (datetime-local)",
          type: "date",
          placeholder: "مثال: 2026-02-06T23:59",
          required: true,
          parse: (raw) => parseDateToIso(raw),
        },
        {
          name: "limitUses",
          label: "سقف تعداد استفاده (خالی = نامحدود)",
          type: "text",
          placeholder: "مثال: 100",
          parse: (raw) => parseOptionalInt(raw),
        },
        {
          name: "isActive",
          label: "فعال باشد",
          type: "checkbox",
          parse: (raw) => Boolean(raw),
        },
      ]}
    />
  );
}
