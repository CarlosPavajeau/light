import { z } from "zod/v4"

const today = () => new Date().toISOString().slice(0, 10)

export const createParticipantSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    lastName: z.string().min(1, "El apellido es requerido"),
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
    documentIssuePlace: z
      .string()
      .min(1, "El lugar de expedición es requerido"),
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
    userId: z.string(),
  })
  .superRefine((data, ctx) => {
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
  })
