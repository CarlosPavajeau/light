import { zodResolver } from "@hookform/resolvers/zod"
import type { AppRouter } from "@light/api/routers/index"
import { updateProjectSchema } from "@light/api/schemas/projects"
import { Button } from "@light/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@light/ui/components/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@light/ui/components/field"
import { Input } from "@light/ui/components/input"
import { Textarea } from "@light/ui/components/textarea"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { inferRouterOutputs } from "@trpc/server"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { useTRPC } from "@/utils/trpc"

type Props = {
  project: inferRouterOutputs<AppRouter>["projects"]["list"][number]
}

export function UpdateProjectDialog({ project }: Props) {
  const [open, setOpen] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      id: project.id,
      name: project.name,
      description: project.description ?? undefined,
    },
  })

  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mutateAsync } = useMutation({
    ...trpc.projects.update.mutationOptions(),
    onSuccess: async () => {
      toast.success("Proyecto actualizado exitosamente")
      await queryClient.invalidateQueries({
        queryKey: trpc.projects.list.queryKey(),
      })
      setOpen(false)
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    await mutateAsync(data)
  })

  const handleOnOpenChange = (update: boolean) => {
    setOpen(update)
  }

  return (
    <Dialog open={open} onOpenChange={handleOnOpenChange}>
      <DialogTrigger
        render={<Button className="w-fit" type="button" variant="outline" />}
      >
        Editar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar proyecto</DialogTitle>
        </DialogHeader>

        <form id="update-project-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                  <Input
                    id={field.name}
                    type="text"
                    autoComplete="off"
                    autoFocus
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Descripción (opcional)
                  </FieldLabel>
                  <Textarea
                    id={field.name}
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter showCloseButton>
          <Button
            type="submit"
            form="update-project-form"
            disabled={isSubmitting}
          >
            Actualizar proyecto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
