import { z } from "zod/v4"

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  description: z.string().optional(),
})

export const updateProjectSchema = z.object({
  id: z.number().min(0, { error: "El id del proyecto es requerido" }),
  name: z
    .string()
    .min(3, { error: "El nombre debe tener al menos 3 caracteres" }),
  description: z.string().optional(),
})
