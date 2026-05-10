import z from "zod/v4"

export const createCampaignSchema = z.object({
  name: z
    .string()
    .min(3, { error: "El nombre debe tener al menos 3 caracteres" }),
  description: z.string().optional(),
  projectId: z.number(),
})

export const updateCampaignSchema = z.object({
  id: z.number(),
  name: z
    .string()
    .min(3, { error: "El nombre debe tener al menos 3 caracteres" }),
  description: z.string().optional(),
})

export const addApplicationSchema = z.object({
  campaignId: z.number(),
  participantId: z.number(),
  voucher: z
    .string()
    .min(1, { error: "El código de voucher es obligatorio" })
    .regex(/^[a-zA-Z0-9]+$/, {
      error: "El código de voucher solo puede contener letras y números",
    }),
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
  wallet: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.string().optional())
    .optional(),
  walletType: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.string().optional())
    .optional(),
  amount: z.coerce
    .number<string>()
    .min(1, { error: "El monto es obligatorio" })
    .or(z.number()),
  attachedFile: z
    .string()
    .min(1, { error: "El comprobante de pago es obligatorio" }),
})
