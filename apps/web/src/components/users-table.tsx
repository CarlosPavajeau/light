import { Badge } from "@light/ui/components/badge"
import { Button } from "@light/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@light/ui/components/dropdown-menu"
import { Input } from "@light/ui/components/input"
import type { ColumnFiltersState, PaginationState } from "@tanstack/react-table"
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { UserWithRole } from "better-auth/plugins"
import { MoreHorizontalIcon } from "lucide-react"
import { useState } from "react"

import { TablePagination } from "./data-table/pagination"
import { DataTable } from "./data-table/table"
import { ResetPasswordDialog } from "./users/reset-password-dialog"

const columnHelper = createColumnHelper<UserWithRole>()

const columns = [
  columnHelper.display({
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <p className="truncate leading-none font-medium">
            {row.original.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {row.original.email}
          </p>
        </div>
      </div>
    ),
    header: "Usuario",
    id: "user",
    filterFn: (row, _, value) =>
      row.original.name.toLowerCase().includes(value.toLowerCase()) ||
      row.original.email.toLowerCase().includes(value.toLowerCase()),
  }),
  columnHelper.accessor("role", {
    cell: ({ getValue }) => {
      const role = getValue() ?? "user"
      return (
        <Badge variant={role === "admin" ? "default" : "secondary"}>
          {role === "admin" ? "Administrador" : "Usuario"}
        </Badge>
      )
    },
    header: "Rol",
  }),
  columnHelper.accessor("banned", {
    cell: ({ getValue }) =>
      getValue() === true ? (
        <Badge variant="destructive">Baneado</Badge>
      ) : (
        <Badge variant="outline">Activo</Badge>
      ),
    header: "Estado",
  }),
  columnHelper.display({
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <RowActions user={row.original} />,
  }),
]

type Props = {
  users: UserWithRole[]
}

export function UsersTable({ users }: Props) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    columns,
    data: users,
    pageCount: Math.ceil(users.length / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    state: {
      pagination,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      <div className="max-w-md">
        <Input
          id="search-users"
          placeholder="Buscar usuarios..."
          onChange={(e) =>
            table.setColumnFilters([{ id: "user", value: e.target.value }])
          }
        />
      </div>
      <DataTable table={table} />
      <TablePagination table={table} />
    </div>
  )
}

function RowActions({ user }: { user: UserWithRole }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label="Abrir acciones"
              size="sm"
              variant="ghost"
              className="size-8 p-0"
            >
              <MoreHorizontalIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Reestablecer contraseña
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ResetPasswordDialog user={user} open={open} onOpenChange={setOpen} />
    </>
  )
}
