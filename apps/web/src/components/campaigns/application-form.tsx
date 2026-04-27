import { zodResolver } from "@hookform/resolvers/zod"
import { addParticipantSchema } from "@light/api/schemas/campaigns"
import { Button } from "@light/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@light/ui/components/field"
import { Input } from "@light/ui/components/input"
import { Spinner } from "@light/ui/components/spinner"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { useTRPC } from "@/utils/trpc"

type Props = {
  campaignId: number
  participantId: number
}

export function CampaignApplicationForm({ campaignId, participantId }: Props) {
  const trpc = useTRPC()
  const { data: participant, isLoading } = useQuery(
    trpc.campaigns.getParticipant.queryOptions({ campaignId, participantId })
  )

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(addParticipantSchema),
    defaultValues: {
      campaignId,
      participantId,
      voucher: "",
      accountNumber: "",
      attachedFile: "",
    },
  })

  const queryClient = useQueryClient()
  const { mutateAsync: apply } = useMutation({
    ...trpc.campaigns.addParticipant.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trpc.campaigns.getParticipant.queryOptions({
          campaignId,
          participantId,
        }).queryKey,
      })

      toast.success("Aplicación enviada")
    },
  })

  const onSubmit = handleSubmit(async (data) => await apply(data))

  if (isLoading) {
    return <span>Cargando...</span>
  }

  if (!participant) {
    return (
      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Controller
            control={control}
            name="voucher"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>N° Voucher</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="text"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="accountNumber"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>N° de cuenta</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="text"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </FieldGroup>

        <Button
          type="submit"
          className="mt-6 w-full"
          disabled={isSubmitting}
          size="lg"
        >
          {isSubmitting && <Spinner />}
          Enviar aplicación
        </Button>
      </form>
    )
  }

  return <span>Ya tiene una aplicación en esta campaña</span>
}
