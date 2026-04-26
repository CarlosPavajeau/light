import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@light/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@light/ui/components/field"
import { Input } from "@light/ui/components/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@light/ui/components/input-group"
import { Spinner } from "@light/ui/components/spinner"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { EyeClosedIcon, EyeIcon } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod/v4"

import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/sign-in")({
  component: RouteComponent,
})

const signInSchema = z.object({
  email: z.email({
    message: "Por favor, ingresa un correo electrónico válido.",
  }),
  password: z.string().min(8, {
    message: "La contraseña debe tener al menos 8 caracteres.",
  }),
})

type FormValues = z.infer<typeof signInSchema>

function RouteComponent() {
  const [showPassword, setShowPassword] = useState(false)
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })
  const navigate = useNavigate({
    from: "/",
  })

  const { mutateAsync: signIn } = useMutation({
    mutationFn: (data: FormValues) => authClient.signIn.email(data),
    onError: () => {
      const message = "Credenciales inválidas. Por favor, inténtalo de nuevo."
      toast.error(message)
    },
    onSuccess: (result) => {
      if (result.data) {
        navigate({
          to: "/dashboard",
        })
      } else if (result.error) {
        const message =
          result.error.message ??
          "Algo salió mal. Por favor, inténtalo de nuevo."
        toast.error(message)
      } else {
        toast.error("Algo salió mal. Por favor, inténtalo de nuevo.")
      }
    },
  })

  const onSubmit = handleSubmit(async (data) => await signIn(data))

  const togglePassword = () => setShowPassword((prev) => !prev)

  return (
    <div className="mx-auto mt-10 w-full max-w-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Bienvenido de nuevo
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Inicia sesión en tu cuenta para continuar
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FieldGroup>
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Correo electrónico</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  placeholder="tu@ejemplo.com"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>

                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id={field.name}
                    placeholder="••••••••"
                    autoComplete="current-password"
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

          <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            Iniciar sesión
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}
