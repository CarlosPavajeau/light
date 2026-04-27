import { zodResolver } from "@hookform/resolvers/zod"
import type { AppRouter } from "@light/api/routers/index"
import { Button } from "@light/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@light/ui/components/field"
import { Input } from "@light/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@light/ui/components/select"
import { Spinner } from "@light/ui/components/spinner"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import type { inferRouterOutputs } from "@trpc/server"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod/v4"

import Header from "@/components/header"
import { authClient } from "@/lib/auth-client"
import { useTRPC } from "@/utils/trpc"

export const Route = createFileRoute("/_authed/campaigns/$code/apply")({
  component: RouteComponent,
})

const registrationSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
  lastName: z.string().min(1, { message: "El apellido es requerido." }),
  documentType: z.enum(["CC", "CE", "PT"]),
  documentNumber: z
    .string()
    .min(1, { message: "El número de documento es requerido." }),
  documentIssueDate: z
    .string()
    .min(1, { message: "La fecha de expedición es requerida." }),
  documentExpirationDate: z.string().optional(),
  documentIssuePlace: z
    .string()
    .min(1, { message: "El lugar de expedición es requerido." }),
  birthDate: z
    .string()
    .min(1, { message: "La fecha de nacimiento es requerida." }),
  birthPlace: z
    .string()
    .min(1, { message: "El lugar de nacimiento es requerido." }),
  email: z.string().min(1, { message: "El correo electrónico es requerido." }),
  telegramUsername: z.string().optional(),
  phone: z.string().optional(),
  residenceCountry: z
    .string()
    .min(1, { message: "El país de residencia es requerido." }),
  residenceState: z
    .string()
    .min(1, { message: "El departamento es requerido." }),
  residenceCity: z.string().min(1, { message: "La ciudad es requerida." }),
  address: z.string().min(1, { message: "La dirección es requerida." }),
  postalCode: z.string().optional(),
})

type RegistrationFormValues = z.infer<typeof registrationSchema>

function ParticipantRegistrationForm() {
  const { data: session } = authClient.useSession()
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      lastName: "",
      documentType: "CC",
      documentNumber: "",
      documentIssueDate: "",
      documentExpirationDate: "",
      documentIssuePlace: "",
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
    },
  })

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
    const userId = session?.user?.id
    if (!userId) {
      toast.error("No se pudo obtener la sesión del usuario.")
      return
    }
    await mutateAsync({ ...data, userId })
  })

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Información personal</FieldLegend>

          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nombres</FieldLabel>
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
                name="lastName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Apellidos</FieldLabel>
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
            </div>

            <Controller
              control={control}
              name="birthDate"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Fecha de nacimiento
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="date"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="birthPlace"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Lugar de nacimiento
                  </FieldLabel>
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

            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="documentType"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Tipo de documento</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                        <SelectItem value="CE">
                          Cédula de Extranjería
                        </SelectItem>
                        <SelectItem value="PT">Pasaporte</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="documentNumber"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Número de documento
                    </FieldLabel>
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
                name="documentIssueDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Fecha de expedición
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="date"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="documentIssuePlace"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Lugar de expedición
                    </FieldLabel>
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
                name="documentExpirationDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Fecha de vencimiento (opcional)
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="date"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
          <FieldLegend>Información de contacto</FieldLegend>
          <FieldGroup>
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
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Teléfono (opcional)
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="tel"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="telegramUsername"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Usuario de Telegram (opcional)
                  </FieldLabel>
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
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
          <FieldLegend>Residencia</FieldLegend>
          <FieldGroup>
            <Controller
              control={control}
              name="residenceCountry"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    País de residencia
                  </FieldLabel>
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
              name="residenceState"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Departamento / Estado
                  </FieldLabel>
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
              name="residenceCity"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Ciudad</FieldLabel>
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
              name="address"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Dirección</FieldLabel>
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
              name="postalCode"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Código postal (opcional)
                  </FieldLabel>
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
        </FieldSet>
      </FieldGroup>

      <Button type="submit" className="mt-6 w-full" disabled={isSubmitting}>
        {isSubmitting && <Spinner />}
        Registrarse
      </Button>
    </form>
  )
}

function RouteComponent() {
  const { code } = Route.useParams()
  const trpc = useTRPC()
  const { data: campaign, isLoading } = useQuery(
    trpc.campaigns.get.queryOptions({ code })
  )
  const { data: participant, isLoading: isParticipantLoading } = useQuery(
    trpc.participants.get.queryOptions()
  )

  if (isLoading || isParticipantLoading) {
    return <div>Cargando...</div>
  }

  if (!campaign) {
    return <div>Campaña no encontrada</div>
  }

  if (!campaign.isActive) {
    return <div>Campaña no activa</div>
  }

  return (
    <>
      <Header />

      <div className="px-4 pt-8 pb-16 sm:px-6">
        <div className="space-y-10 sm:space-y-12">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {campaign.name}
            </h1>
            {participant && (
              <h2 className="text-lg tracking-tight">
                Bienvenido, {participant.name} {participant.lastName}
              </h2>
            )}
          </div>

          <div>
            {participant ? (
              <Button>En construcción</Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold tracking-tight">
                    Registro de participante
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Completa tu información para aplicar a esta campaña.
                  </p>
                </div>
                <ParticipantRegistrationForm />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
