// import {
//   Table,

// } from "@/components/ui/table";
// import Badge from "@/components/ui/badge/Badge";

import Badge from "../../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

export interface Column {
  header: string;
  accessor: string;
  isImage?: boolean;
  isBadge?: boolean;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
}

export default function DataTable({ data, columns }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => (
                <TableCell
                  key={i}
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.map((item, i) => (
              <TableRow key={i}>
                {columns.map((col, j) => (
                  <TableCell key={j} className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {col.isImage ? (
                      <img
                        src={item[col.accessor]}
                        alt="img"
                        className="w-10 h-10 rounded-full"
                      />
                    ) : col.isBadge ? (
                      <Badge
                        size="sm"
                        color={
                          item[col.accessor] === "Available"
                            ? "success"
                            : item[col.accessor] === "Special"
                              ? "warning"
                              : "error"
                        }
                      >
                        {item[col.accessor]}
                      </Badge>
                    ) : (
                      item[col.accessor]
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
