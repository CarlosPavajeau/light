import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@light/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@light/ui/components/dialog"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@light/ui/components/select"
import { Spinner } from "@light/ui/components/spinner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { EyeClosedIcon, EyeIcon } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod/v4"

import { authClient } from "@/lib/auth-client"
import { useTRPC } from "@/utils/trpc"

const roleLabels: Record<string, string> = {
  user: "Usuario",
  admin: "Administrador",
}

const createUserSchema = z
  .object({
    name: z.string().min(1, { message: "El nombre es requerido" }),
    email: z.string().email({ message: "Correo electrónico inválido" }),
    password: z.string().min(8, {
      message: "La contraseña debe tener al menos 8 caracteres",
    }),
    confirmPassword: z.string().min(8, {
      message: "La contraseña debe tener al menos 8 caracteres",
    }),
    role: z.enum(["user", "admin"]).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof createUserSchema>

export function CreateUserDialog() {
  const [open, setOpen] = useState(false)
  const trpc = useTRPC()
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
    },
  })

  const queryClient = useQueryClient()

  const { mutateAsync: createUser } = useMutation({
    mutationFn: (data: FormValues) =>
      authClient.admin.createUser({
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role || undefined,
      }),
    onSuccess: () => {
      toast.success("Usuario creado exitosamente")
      queryClient.invalidateQueries(trpc.users.list.queryFilter())
      reset()
      setOpen(false)
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    await createUser(data)
  })

  const handleOnOpenChange = (update: boolean) => {
    setOpen(update)
    if (!update) {
      reset()
    }
  }

  const [showPassword, setShowPassword] = useState(false)
  const togglePassword = () => setShowPassword(!showPassword)

  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const toggleConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword)

  return (
    <Dialog open={open} onOpenChange={handleOnOpenChange}>
      <DialogTrigger render={<Button className="w-fit" type="button" />}>
        Agregar usuario
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar usuario</DialogTitle>
        </DialogHeader>

        <form id="create-user-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                  <Input
                    id={field.name}
                    type="text"
                    autoComplete="off"
                    autoFocus
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Correo electrónico
                  </FieldLabel>
                  <Input
                    id={field.name}
                    type="email"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    {...field}
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

            <Controller
              control={control}
              name="role"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Rol</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Seleccionar rol">
                        {field.value ? roleLabels[field.value] : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter showCloseButton>
          <Button type="submit" form="create-user-form" disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            Agregar usuario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
