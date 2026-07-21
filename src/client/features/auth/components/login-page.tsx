import { ArrowLeft } from 'lucide-react'
import { FaDiscord } from 'react-icons/fa'
import { useSearchParams } from 'react-router-dom'
import logoImage from '@/client/assets/logo.png'
import { normalizeReturnTo } from '@/client/features/auth/routing/return-to'

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const returnTo = normalizeReturnTo(searchParams.get('returnTo'))
  const loginUrl = `/api/auth/discord?returnTo=${encodeURIComponent(returnTo)}`
  const hasOAuthError = searchParams.get('error') === 'oauth_failed'

  return (
    <main className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-[#11131a] px-5 py-16 text-white">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(88,101,242,0.14),transparent_45%)]" />
      <section className="w-full max-w-[420px] text-center" aria-labelledby="login-title">
        <a href="/" className="inline-flex items-center gap-3" aria-label="Bet Bot, accueil">
          <img src={logoImage} alt="" className="size-14 object-contain" />
          <span className="text-xl font-black">Bet Bot</span>
        </a>
        <h1 id="login-title" className="mt-10 text-3xl font-black sm:text-4xl">Connexion</h1>
        <p className="mt-4 text-sm leading-6 text-[#b9bdc9] sm:text-base">
          Utilisez votre compte Discord pour accéder au tableau de bord Bet Bot.
        </p>

        {hasOAuthError && (
          <p role="alert" className="mt-6 rounded-md border border-[#f07468]/35 bg-[#f07468]/10 px-4 py-3 text-sm font-semibold text-[#ffc6c0]">
            La connexion avec Discord a échoué. Vous pouvez réessayer.
          </p>
        )}

        <a
          href={loginUrl}
          className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-md bg-[#5865f2] px-5 text-sm font-black text-white shadow-[0_12px_38px_rgba(88,101,242,0.3)] transition hover:bg-[#6875f5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9b1ff]"
        >
          <FaDiscord className="size-5" aria-hidden="true" />
          Continuer avec Discord
        </a>

        <a href="/" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-white/60 transition hover:text-white">
          <ArrowLeft className="size-4" aria-hidden="true" /> Retour au site
        </a>
      </section>
    </main>
  )
}
