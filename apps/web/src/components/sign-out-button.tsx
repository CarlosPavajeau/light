import { Button } from "@light/ui/components/button"
import { Spinner } from "@light/ui/components/spinner"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"

import { authClient } from "@/lib/auth-client"

export function SignOutButton() {
  const router = useRouter()
  const { mutate: signOut, isPending } = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      router.invalidate()
    },
  })

  return (
    <Button onClick={() => signOut()} disabled={isPending}>
      {isPending && <Spinner />}
      Cerrar sesión
    </Button>
  )
}
