import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@light/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@light/ui/components/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@light/ui/components/field"
import { Input } from "@light/ui/components/input"
import { Spinner } from "@light/ui/components/spinner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod/v4"

import type { UsersTableUser } from "@/components/users-table"
import { authClient } from "@/lib/auth-client"
import { useTRPC } from "@/utils/trpc"

const updateUserSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido" }),
  email: z.string().email({ message: "Correo electrónico inválido" }),
})

type FormValues = z.infer<typeof updateUserSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: Pick<UsersTableUser, "email" | "id" | "name">
}

export function UpdateUserDialog({ open, onOpenChange, user }: Props) {
  const trpc = useTRPC()
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  })

  const queryClient = useQueryClient()

  const { mutateAsync: updateUser } = useMutation({
    mutationFn: (data: FormValues) =>
      authClient.admin.updateUser({
        userId: user.id,
        data: { name: data.name, email: data.email },
      }),
    onSuccess: () => {
      toast.success("Usuario actualizado correctamente")
      queryClient.invalidateQueries(trpc.users.list.queryFilter())
      reset()
      onOpenChange(false)
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    await updateUser(data)
  })

  const handleOnOpenChange = (update: boolean) => {
    onOpenChange(update)
    if (!update) {
      reset({ name: user.name, email: user.email })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOnOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar usuario</DialogTitle>
        </DialogHeader>

        <form id="update-user-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    autoComplete="off"
                    autoFocus
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Correo electrónico
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter showCloseButton>
          <Button type="submit" form="update-user-form" disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
