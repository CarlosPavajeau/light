import z from "zod/v4"

export const createCampaignSchema = z.object({
  name: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  description: z.string().optional(),
  projectId: z.number(),
})

export const addApplicationSchema = z.object({
  campaignId: z.number(),
  participantId: z.number(),
  voucher: z
    .string()
    .min(1, { message: "El código de voucher es obligatorio" }),
  accountNumber: z
    .string()
    .min(1, { message: "El número de cuenta es obligatorio" }),
  amount: z.coerce
    .number<string>()
    .min(1, { message: "El monto es obligatorio" })
    .or(z.number()),
  attachedFile: z
    .string()
    .min(1, { message: "El comprobante de pago es obligatorio" }),
})
