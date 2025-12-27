import React from "react";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import AdminTableRow, { type AdminTableColumn } from "./AdminTableRow";
import { cn } from "@/lib/utils";

type Props<T> = {
	columns: Array<AdminTableColumn<T>>;
	data: T[];
	getRowKey: (row: T) => string;
	emptyText?: string;
	tableClassName?: string;
	headerRowClassName?: string;
	rowClassName?: string;
};

export default function AdminTable<T>({
	columns,
	data,
	getRowKey,
	emptyText = "No items.",
	tableClassName ,
	headerRowClassName = "sticky top-0 bg-glass/50 backdrop-blur-md *:text-start",
	rowClassName,
}: Props<T>) {
	return (
		<Table className={cn('bg-glass rounded-lg',tableClassName)}>
			<TableHeader>
				<TableRow className={headerRowClassName}>
					{columns.map((col, idx) => (
						<TableHead key={idx} className={col.headerClassName}>
							{col.header}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody className='overflow-auto'>
				{data.length === 0 ? (
					<TableRow>
						<td
							colSpan={columns.length}
							className='p-4 text-sm text-muted-foreground'
						>
							{emptyText}
						</td>
					</TableRow>
				) : (
					data.map((row) => (
						<AdminTableRow
							key={getRowKey(row)}
							row={row}
							columns={columns}
							rowClassName={rowClassName}
						/>
					))
				)}
			</TableBody>
		</Table>
	);
}

