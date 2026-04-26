import { zodResolver } from "@hookform/resolvers/zod"
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
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod/v4"

import { useTRPC } from "@/utils/trpc"

const schema = z.object({
  name: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  description: z.string().optional(),
  projectId: z.number(),
})

type Props = {
  projectId: number
}

export function CreateCampaignDialog({ projectId }: Props) {
  const [open, setOpen] = useState(false)
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      projectId,
    },
  })

  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mutateAsync } = useMutation({
    ...trpc.campaigns.create.mutationOptions(),
    onSuccess: async () => {
      toast.success("Campaña creada exitosamente")
      await queryClient.invalidateQueries({
        queryKey: trpc.campaigns.listByProject.queryKey({ projectId }),
      })
      reset()
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
        render={
          <Button className="w-fit" type="button">
            Nueva campaña
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva campaña</DialogTitle>
        </DialogHeader>

        <form id="create-campaign-form" onSubmit={onSubmit}>
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
            form="create-campaign-form"
            disabled={isSubmitting}
          >
            Agregar campaña
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
