"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export type AdminDeleteMode = "path" | "query" | "body";

type Props = {
  typeName: string;
  id: string;

  /** Defaults to `/api/admin/${typeName}` */
  endpoint?: string;

  /**
   * - `path`:    DELETE `${endpoint}/${id}`
   * - `query`:   DELETE `${endpoint}?id=${id}` (param name configurable)
   * - `body`:    DELETE `${endpoint}` with JSON body (key configurable)
   */
  mode?: AdminDeleteMode;
  idKey?: string;

  confirm?: boolean;
  confirmText?: string;

  successToast?: string;
  errorToast?: string;

  size?: "default" | "sm" | "lg" | "icon";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "accent";
};

function buildDeleteRequest({
  endpoint,
  id,
  mode,
  idKey,
}: {
  endpoint: string;
  id: string;
  mode: AdminDeleteMode;
  idKey: string;
}): { url: string; init: RequestInit } {
  if (mode === "path") {
    return { url: `${endpoint}/${id}`, init: { method: "DELETE" } };
  }

  if (mode === "query") {
    const joiner = endpoint.includes("?") ? "&" : "?";
    return {
      url: `${endpoint}${joiner}${encodeURIComponent(idKey)}=${encodeURIComponent(id)}`,
      init: { method: "DELETE" },
    };
  }

  // body
  return {
    url: endpoint,
    init: {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [idKey]: id }),
    },
  };
}

export default function AdminDeleteButton({
  typeName,
  id,
  endpoint,
  mode = "body",
  idKey = "id",
  confirm = true,
  confirmText = "آیا مطمئن هستید؟",
  successToast,
  errorToast,
  size = "icon",
  variant = "destructive",
}: Props) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const resolvedEndpoint = endpoint ?? `/api/admin/${typeName}`;

  async function handleDelete() {
    if (pending) return;
    if (confirm && !window.confirm(confirmText)) return;

    setPending(true);
    try {
      const { url, init } = buildDeleteRequest({
        endpoint: resolvedEndpoint,
        id,
        mode,
        idKey,
      });

      const res = await fetch(url, init);
      if (res.ok) {
        toast.success(successToast ?? "با موفقیت حذف شد");
        router.refresh();
      } else {
        toast.error(errorToast ?? "خطا در حذف");
      }
    } catch {
      toast.error(errorToast ?? "خطا در حذف");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDelete}
      disabled={pending}
      aria-label='delete'
    >
      <Trash2 size={16} />
    </Button>
  );
}
