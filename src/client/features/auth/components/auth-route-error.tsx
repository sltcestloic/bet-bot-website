import { RotateCcw } from 'lucide-react'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import logoImage from '@/client/assets/logo.png'

export function AuthRouteError() {
  const error = useRouteError()
  const unavailable = isRouteErrorResponse(error) && error.status === 503

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#11131a] px-5 text-center text-white">
      <section className="max-w-[430px]">
        <img src={logoImage} alt="" className="mx-auto size-12 object-contain" />
        <h1 className="mt-7 text-2xl font-black">
          {unavailable ? 'Service temporairement indisponible' : 'Une erreur est survenue'}
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#b9bdc9]">
          Impossible de vérifier votre session pour le moment.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#5865f2] px-5 text-sm font-black transition hover:bg-[#6875f5]"
        >
          <RotateCcw className="size-4" aria-hidden="true" /> Réessayer
        </button>
      </section>
    </main>
  )
}
