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

import type { AdminFormField } from "@/components/admin/General/AdminAddModal";

type Props<T extends Record<string, unknown>> = {
	typeName: string;
	id: string;
	title: string;
	fields: Array<AdminFormField<T>>;

	/** Form initial values (without id by default). */
	initialValue: T;

	/** Defaults to `/api/admin/${typeName}` */
	endpoint?: string;

	/**
	 * Custom trigger. If provided, `triggerText` + `triggerVariant` are ignored.
	 * Use e.g. a small icon button.
	 */
	trigger?: React.ReactNode;
	triggerText?: string;
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

	/** By default, payload is `{ id, ...value }`. Override if needed. */
	buildPayload?: (args: { id: string; value: T }) => unknown;
};

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null;
}

export default function AdminEditModal<T extends Record<string, unknown>>({
	typeName,
	id,
	title,
	fields,
	initialValue,
	endpoint,
	trigger,
	triggerText = "ویرایش",
	triggerVariant = "outline",
	submitText = "ذخیره",
	contentClassName,
	buildPayload,
}: Props<T>) {
	const router = useRouter();
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState<T>(initialValue);
	const [submitting, setSubmitting] = React.useState(false);

	const resolvedEndpoint = endpoint ?? `/api/admin/${typeName}`;

	React.useEffect(() => {
		// Keep form in sync when a different row is edited.
		setValue(initialValue);
	}, [initialValue, id]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitting(true);
		try {
			const payload = buildPayload ? buildPayload({ id, value }) : { id, ...value };
			const res = await fetch(resolvedEndpoint, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				toast.success(`${title} با موفقیت ویرایش شد`);
				router.refresh();
				setOpen(false);
				return;
			}

			const maybeJson: unknown = await res.json().catch(() => null);
			const messageFromServer =
				isRecord(maybeJson) && typeof maybeJson.error === "string"
					? maybeJson.error
					: isRecord(maybeJson) && typeof maybeJson.message === "string"
						? maybeJson.message
						: null;
			toast.error(messageFromServer ?? `خطا در ویرایش ${title}`);
		} catch {
			toast.error(`خطا در ویرایش ${title}`);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger ? (
					trigger
				) : (
					<Button variant={triggerVariant}>{triggerText}</Button>
				)}
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
											setValue(
												(prev) => ({ ...prev, [field.name]: next } as T),
											);
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
											setValue(
												(prev) => ({ ...prev, [field.name]: next } as T),
											);
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
										const next = field.parse
											? field.parse(raw, value)
											: (raw as unknown);
										setValue(
											(prev) => ({ ...prev, [field.name]: next } as T),
										);
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
