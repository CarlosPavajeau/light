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
  isActive: z.boolean(),
})

export const updateApplicationStatusSchema = z.object({
  campaignId: z.number(),
  participantId: z.number(),
  status: z.enum(["pending", "reviewed"]),
})

export const deleteApplicationSchema = z.object({
  campaignId: z.number(),
  participantId: z.number(),
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
