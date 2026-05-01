import { Badge } from "@light/ui/components/badge"
import { Button } from "@light/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@light/ui/components/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@light/ui/components/table"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { UserWithRole } from "better-auth/plugins"
import { MoreHorizontalIcon } from "lucide-react"
import { useState } from "react"

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
  const table = useReactTable({
    columns,
    data: users,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
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
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
