import { TableCell, TableRow } from "@/components/ui/table";
import React from "react";

export type AdminTableColumn<T> = {
	header: React.ReactNode;
	cell: (row: T) => React.ReactNode;
	headerClassName?: string;
	cellClassName?: string;
};

type Props<T> = {
	row: T;
	columns: Array<AdminTableColumn<T>>;
	rowClassName?: string;
};

export default function AdminTableRow<T>({
	row,
	columns,
	rowClassName = "*:p-4",
}: Props<T>) {
	return (
		<TableRow className={rowClassName}>
			{columns.map((col, idx) => (
				<TableCell key={idx} className={col.cellClassName}>
					{col.cell(row)}
				</TableCell>
			))}
		</TableRow>
	);
}

