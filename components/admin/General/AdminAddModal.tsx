"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type AdminFormFieldType = "text" | "textarea" | "color" | "checkbox";

export type AdminFormField<
	T extends Record<string, unknown>,
	K extends keyof T = keyof T,
> = {
	name: K;
	label: string;
	type: AdminFormFieldType;
	placeholder?: string;
	required?: boolean;
	parse?: (raw: unknown, current: T) => T[K];
};

type Props<T extends Record<string, unknown>> = {
	typeName: string;
	title: string;
	triggerText: string;
	fields: Array<AdminFormField<T>>;
	initialValue: T;
	endpoint?: string;
	triggerVariant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link"
		| "accent";
	submitText?: string;
	contentClassName?: string;
};

export default function AdminAddModal<T extends Record<string, unknown>>({
	typeName,
	title,
	triggerText,
	fields,
	initialValue,
	endpoint,
	triggerVariant = "outline",
	submitText = "اضافه کردن",
	contentClassName,
}: Props<T>) {
	const router = useRouter();
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState<T>(initialValue);
	const [submitting, setSubmitting] = React.useState(false);

	const resolvedEndpoint = endpoint ?? `/api/admin/${typeName}`;

	function isRecord(v: unknown): v is Record<string, unknown> {
		return typeof v === "object" && v !== null;
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitting(true);
		try {
			const res = await fetch(resolvedEndpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(value),
			});

			if (res.ok) {
				toast.success(`${title} با موفقیت اضافه شد`);
				router.refresh();
				setOpen(false);
				setValue(initialValue);
				return;
			}

			const maybeJson: unknown = await res.json().catch(() => null);
			const messageFromServer =
				isRecord(maybeJson) && typeof maybeJson.message === "string"
					? maybeJson.message
					: null;
			const message = messageFromServer ?? `خطا در اضافه کردن ${title}`;
			toast.error(message);
		} catch {
			toast.error(`خطا در اضافه کردن ${title}`);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant={triggerVariant}>{triggerText}</Button>
			</DialogTrigger>
			<DialogContent className={contentClassName}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='flex flex-col gap-4 mt-4'>
					{fields.map((field) => {
						const name = String(field.name);
						const current = value[field.name];

						if (field.type === "textarea") {
							return (
								<div key={name} className='flex flex-col gap-2'>
									<Label htmlFor={name}>{field.label}</Label>
									<Textarea
										id={name}
										placeholder={field.placeholder}
										value={typeof current === "string" ? current : ""}
										required={field.required}
										onChange={(e) => {
											const next = field.parse
												? field.parse(e.target.value, value)
												: (e.target.value as unknown);
											setValue((prev) => ({ ...prev, [field.name]: next } as T));
										}}
									/>
								</div>
							);
						}

						if (field.type === "checkbox") {
							return (
								<div key={name} className='flex flex-col gap-2'>
									<Label htmlFor={name}>{field.label}</Label>
									<input
										id={name}
										type='checkbox'
										checked={Boolean(current)}
										onChange={(e) => {
											const next = field.parse
												? field.parse(e.target.checked, value)
												: (e.target.checked as unknown);
											setValue((prev) => ({ ...prev, [field.name]: next } as T));
										}}
									/>
								</div>
							);
						}

						return (
							<div key={name} className='flex flex-col gap-2'>
								<Label htmlFor={name}>{field.label}</Label>
								<Input
									id={name}
									type={field.type === "color" ? "color" : "text"}
									placeholder={field.placeholder}
									value={
										typeof current === "string" || typeof current === "number"
											? String(current)
											: ""
									}
									required={field.required}
									onChange={(e) => {
										const raw = e.target.value;
										const next = field.parse ? field.parse(raw, value) : (raw as unknown);
										setValue((prev) => ({ ...prev, [field.name]: next } as T));
									}}
								/>
							</div>
						);
					})}

					<Button type='submit' className='self-end' disabled={submitting}>
						{submitting ? "..." : submitText}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}

