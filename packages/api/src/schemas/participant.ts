import { z } from "zod/v4"

const today = () => new Date().toISOString().slice(0, 10)

const participantBaseSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .transform((value) => value.trim().toUpperCase()),
  lastName: z
    .string()
    .min(1, "El apellido es requerido")
    .transform((value) => value.trim().toUpperCase()),
  documentType: z.enum(["CC", "CE", "PT"]),
  documentNumber: z
    .string()
    .regex(/^\d+$/, "El número de documento solo puede contener dígitos"),
  documentIssueDate: z.iso
    .date("Fecha de expedición inválida")
    .refine(
      (val) => val < today(),
      "La fecha de expedición debe ser anterior a hoy"
    ),
  documentExpirationDate: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.iso.date("Fecha de vencimiento inválida").optional())
    .optional(),
  documentIssuePlace: z.string().min(1, "El lugar de expedición es requerido"),
  passportNumber: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(
      z
        .string()
        .regex(
          /^[a-zA-Z0-9]+$/,
          "El número de pasaporte solo puede contener letras y números"
        )
        .optional()
    )
    .optional(),
  passportIssueDate: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.iso.date("Fecha de expedición inválida").optional())
    .optional(),
  passportExpirationDate: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.iso.date("Fecha de vencimiento inválida").optional())
    .optional(),
  passportIssuePlace: z.string().optional(),
  birthDate: z.iso
    .date("Fecha de nacimiento inválida")
    .refine(
      (val) => val < today(),
      "La fecha de nacimiento debe ser anterior a hoy"
    ),
  birthPlace: z.string().min(1, "El lugar de nacimiento es requerido"),
  email: z.email("Correo electrónico inválido"),
  telegramUsername: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(
      z
        .string()
        .regex(
          /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/,
          "El usuario de Telegram debe iniciar con una letra y tener entre 5 y 32 caracteres"
        )
        .optional()
    )
    .optional(),
  phone: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.e164().optional())
    .optional(),
  residenceCountry: z.string().min(1, "El país de residencia es requerido"),
  residenceState: z.string().min(1, "El departamento/estado es requerido"),
  residenceCity: z.string().min(1, "La ciudad es requerida"),
  address: z.string().min(1, "La dirección es requerida"),
  postalCode: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(
      z
        .string()
        .regex(/^\d+$/, "El código postal solo puede contener dígitos")
        .optional()
    )
    .optional(),
  leader: z.string().optional(),
  accountNumber: z
    .string()
    .min(1, { error: "El número de cuenta es obligatorio" })
    .regex(/^[a-zA-Z0-9]+$/, {
      error: "El número de cuenta solo puede contener letras y números",
    }),
  accountType: z.string().min(1, { error: "El tipo de cuenta es obligatorio" }),
  bankName: z.string().min(1, { error: "El nombre del banco es obligatorio" }),
  swiftCode: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(
      z
        .string()
        .regex(/^[a-zA-Z0-9]+$/, {
          error: "El código SWIFT solo puede contener letras y números",
        })
        .optional()
    )
    .optional(),
})

function withParticipantRefinements<T extends typeof participantBaseSchema>(
  schema: T
) {
  return schema.superRefine((data, ctx) => {
    if (data.passportNumber) {
      if (!data.passportIssueDate) {
        ctx.addIssue({
          code: "custom",
          message: "La fecha de expedición del pasaporte es requerida",
          path: ["passportIssueDate"],
        })
      }
      if (!data.passportExpirationDate) {
        ctx.addIssue({
          code: "custom",
          message: "La fecha de vencimiento del pasaporte es requerida",
          path: ["passportExpirationDate"],
        })
      }
      if (!data.passportIssuePlace) {
        ctx.addIssue({
          code: "custom",
          message: "El lugar de expedición del pasaporte es requerido",
          path: ["passportIssuePlace"],
        })
      }
    }
    if (
      data.documentExpirationDate &&
      data.documentExpirationDate <= data.documentIssueDate
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "La fecha de vencimiento debe ser posterior a la fecha de expedición",
        path: ["documentExpirationDate"],
      })
    }
    if (
      data.passportExpirationDate &&
      data.passportIssueDate &&
      data.passportExpirationDate <= data.passportIssueDate
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "La fecha de vencimiento debe ser posterior a la fecha de expedición",
        path: ["passportExpirationDate"],
      })
    }
  })
}

export type ParticipantFormInput = z.input<typeof participantBaseSchema>

export const createParticipantSchema = withParticipantRefinements(
  participantBaseSchema.extend({ userId: z.string() })
)

export const updateParticipantSchema = withParticipantRefinements(
  participantBaseSchema.extend({ id: z.number() })
)
