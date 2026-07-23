import { LoaderCircle } from 'lucide-react'

import logoImage from '@/client/assets/logo.png'

export function AuthLoadingPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#11131a] text-white">
      <div role="status" aria-label="Vérification de la session" className="flex flex-col items-center gap-5">
        <img src={logoImage} alt="" className="size-12 object-contain" />
        <LoaderCircle className="size-5 animate-spin text-[#7e88ff]" aria-hidden="true" />
      </div>
    </main>
  )
}
