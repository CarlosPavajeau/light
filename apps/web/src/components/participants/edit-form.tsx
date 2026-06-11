import { zodResolver } from "@hookform/resolvers/zod"
import type { AppRouter } from "@light/api/routers/index"
import { updateParticipantSchema } from "@light/api/schemas/participant"
import { Button } from "@light/ui/components/button"
import { FieldGroup, FieldSeparator } from "@light/ui/components/field"
import { Spinner } from "@light/ui/components/spinner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { inferRouterOutputs } from "@trpc/server"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "sonner"

import { useTRPC } from "@/utils/trpc"

import {
  BankInfoSection,
  ContactInfoSection,
  PassportSection,
  PersonalInfoSection,
  ResidenceSection,
} from "./form-sections"

type Participant = NonNullable<
  inferRouterOutputs<AppRouter>["participants"]["getById"]
>

type Props = {
  participant: Participant
  onSuccess?: () => void
}

const toTextValue = (value: string | null | undefined) => value ?? ""

function toDefaultValues(participant: Participant) {
  return {
    id: participant.id,
    name: toTextValue(participant.name),
    lastName: toTextValue(participant.lastName),
    documentType: (participant.documentType as "CC" | "CE" | "PT") ?? "CC",
    documentNumber: toTextValue(participant.documentNumber),
    documentIssueDate: toTextValue(participant.documentIssueDate),
    documentExpirationDate: toTextValue(participant.documentExpirationDate),
    documentIssuePlace: toTextValue(participant.documentIssuePlace),
    passportNumber: toTextValue(participant.passportNumber),
    passportIssueDate: toTextValue(participant.passportIssueDate),
    passportExpirationDate: toTextValue(participant.passportExpirationDate),
    passportIssuePlace: toTextValue(participant.passportIssuePlace),
    birthDate: toTextValue(participant.birthDate),
    birthPlace: toTextValue(participant.birthPlace),
    email: toTextValue(participant.email),
    telegramUsername: toTextValue(participant.telegramUsername),
    phone: toTextValue(participant.phone),
    residenceCountry: toTextValue(participant.residenceCountry),
    residenceState: toTextValue(participant.residenceState),
    residenceCity: toTextValue(participant.residenceCity),
    address: toTextValue(participant.address),
    postalCode: toTextValue(participant.postalCode),
    leader: toTextValue(participant.leader),
    accountNumber: toTextValue(participant.accountNumber),
    accountType: toTextValue(participant.accountType),
    bankName: toTextValue(participant.bankName),
    swiftCode: toTextValue(participant.swiftCode),
  }
}

export function ParticipantEditForm({ participant, onSuccess }: Props) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const form = useForm({
    resolver: zodResolver(updateParticipantSchema),
    defaultValues: toDefaultValues(participant),
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const { mutateAsync } = useMutation({
    ...trpc.participants.update.mutationOptions(),
    onSuccess: async () => {
      toast.success("Participante actualizado exitosamente.")
      await queryClient.invalidateQueries({
        queryKey: trpc.participants.getById.queryKey(participant.id),
      })
      onSuccess?.()
    },
    onError: () => {
      toast.error(
        "Ocurrió un error al actualizar el participante. Por favor, inténtalo de nuevo."
      )
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    await mutateAsync(data)
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <FieldGroup>
          <PersonalInfoSection />
          <FieldSeparator />
          <PassportSection />
          <FieldSeparator />
          <BankInfoSection />
          <FieldSeparator />
          <ContactInfoSection />
          <FieldSeparator />
          <ResidenceSection />
        </FieldGroup>

        <Button type="submit" className="mt-6 w-full" disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          Guardar cambios
        </Button>
      </form>
    </FormProvider>
  )
}
