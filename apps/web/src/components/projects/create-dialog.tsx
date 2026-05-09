import { zodResolver } from "@hookform/resolvers/zod"
import { createProjectSchema } from "@light/api/schemas/projects"
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
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { useTRPC } from "@/utils/trpc"

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const trpc = useTRPC()
  const navigate = useNavigate()
  const { mutateAsync } = useMutation({
    ...trpc.projects.create.mutationOptions(),
    onSuccess: (data) => {
      toast.success("Proyecto creado exitosamente")
      navigate({
        to: "/dashboard/projects/$code",
        params: { code: data.code },
      })
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
      <DialogTrigger render={<Button className="w-fit" type="button" />}>
        Agregar proyecto
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar proyecto</DialogTitle>
        </DialogHeader>

        <form id="create-project-form" onSubmit={onSubmit}>
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
            form="create-project-form"
            disabled={isSubmitting}
          >
            Agregar proyecto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
