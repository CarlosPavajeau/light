import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@light/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@light/ui/components/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@light/ui/components/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@light/ui/components/input-group"
import { Spinner } from "@light/ui/components/spinner"
import { useMutation } from "@tanstack/react-query"
import type { UserWithRole } from "better-auth/plugins"
import { EyeClosedIcon, EyeIcon } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod/v4"

import { authClient } from "@/lib/auth-client"

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, {
      error: "La contraseña debe tener al menos 8 caracteres",
    }),
    confirmPassword: z.string().min(8, {
      error: "La contraseña debe tener al menos 8 caracteres",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof resetPasswordSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserWithRole
}

export function ResetPasswordDialog({ open, onOpenChange, user }: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const { mutateAsync: resetPassword } = useMutation({
    mutationFn: (data: FormValues) =>
      authClient.admin.setUserPassword({
        userId: user.id,
        newPassword: data.password,
      }),
    onSuccess: () => {
      toast.success("Contraseña reestablecida correctamente")
      reset()
      onOpenChange(false)
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    await resetPassword(data)
  })

  const [showPassword, setShowPassword] = useState(false)
  const togglePassword = () => setShowPassword(!showPassword)

  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const toggleConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reestablecer contraseña</DialogTitle>
          <DialogDescription>
            Estás a punto de reestablecer la contraseña para el usuario{" "}
            <strong>{user.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <form id="reset-password-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nueva contraseña</FieldLabel>

                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                        size="icon-xs"
                        onClick={togglePassword}
                      >
                        {showPassword ? <EyeIcon /> : <EyeClosedIcon />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Confirmar contraseña
                  </FieldLabel>

                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      placeholder="••••••••"
                      type={showConfirmPassword ? "text" : "password"}
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={
                          showConfirmPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                        size="icon-xs"
                        onClick={toggleConfirmPassword}
                      >
                        {showConfirmPassword ? <EyeIcon /> : <EyeClosedIcon />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter showCloseButton>
          <Button
            type="submit"
            form="reset-password-form"
            disabled={isSubmitting}
          >
            {isSubmitting && <Spinner />}
            Cambiar contraseña
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
