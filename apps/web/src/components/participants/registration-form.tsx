import { zodResolver } from "@hookform/resolvers/zod"
import { createParticipantSchema } from "@light/api/schemas/participant"
import { Button } from "@light/ui/components/button"
import { FieldGroup, FieldSeparator } from "@light/ui/components/field"
import { Spinner } from "@light/ui/components/spinner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouteContext } from "@tanstack/react-router"
import { useEffect } from "react"
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

export function ParticipantRegistrationForm() {
  const { session } = useRouteContext({
    from: "/_authed",
  })
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const form = useForm({
    resolver: zodResolver(createParticipantSchema),
    defaultValues: {
      name: "",
      lastName: "",
      documentType: "CC",
      documentNumber: "",
      documentIssueDate: "",
      documentExpirationDate: "",
      documentIssuePlace: "",
      passportNumber: "",
      passportIssueDate: "",
      passportExpirationDate: "",
      passportIssuePlace: "",
      birthDate: "",
      birthPlace: "",
      email: "",
      telegramUsername: "",
      phone: "",
      residenceCountry: "",
      residenceState: "",
      residenceCity: "",
      address: "",
      postalCode: "",
      leader: "",
      accountNumber: "",
      accountType: "",
      bankName: "",
      swiftCode: "",
    },
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = form

  useEffect(() => {
    setValue("userId", session.user.id)
    setValue("email", session.user.email)
  }, [setValue, session])

  const { mutateAsync } = useMutation({
    ...trpc.participants.create.mutationOptions(),
    onSuccess: async () => {
      toast.success("Registro completado exitosamente.")
      await queryClient.invalidateQueries({
        queryKey: trpc.participants.get.queryKey(),
      })
    },
    onError: () => {
      toast.error(
        "Ocurrió un error al registrar el participante. Por favor, inténtalo de nuevo."
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
          Registrarse
        </Button>
      </form>
    </FormProvider>
  )
}
