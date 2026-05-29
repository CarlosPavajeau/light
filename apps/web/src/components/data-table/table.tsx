import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@light/ui/components/table"
import { flexRender } from "@tanstack/react-table"
import type { Table as TanstackTable } from "@tanstack/react-table"
import type { ReactNode } from "react"

type Props<T = unknown> = {
  isLoading?: boolean
  loadingLabel?: string
  table: TanstackTable<T>
}

export function DataTable<T = unknown>({
  isLoading = false,
  loadingLabel = "Cargando...",
  table,
}: Props<T>) {
  const { rows } = table.getRowModel()
  let tableBody: ReactNode = (
    <TableRow>
      <TableCell
        className="h-24 text-center"
        colSpan={table.getAllColumns().length}
      >
        Sin resultados.
      </TableCell>
    </TableRow>
  )

  if (isLoading) {
    tableBody = (
      <TableRow>
        <TableCell
          className="h-24 text-center"
          colSpan={table.getAllColumns().length}
        >
          {loadingLabel}
        </TableCell>
      </TableRow>
    )
  } else if (rows.length > 0) {
    tableBody = rows.map((row) => (
      <TableRow data-state={row.getIsSelected() && "selected"} key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))
  }

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody>{tableBody}</TableBody>
    </Table>
  )
}
