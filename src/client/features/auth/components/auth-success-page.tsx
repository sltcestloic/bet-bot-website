import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'

import logoImage from '@/client/assets/logo.png'
import { logout } from '@/client/lib/auth-api'
import type { PublicUser } from '@/client/lib/public-user'

export function AuthSuccessPage() {
  const user = useLoaderData<PublicUser>()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutFailed, setLogoutFailed] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setLogoutFailed(false)

    try {
      await logout()
      void navigate('/login', { replace: true })
    } catch {
      setLogoutFailed(true)
      setIsLoggingOut(false)
    }
  }

  return (
    <main className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-[#11131a] px-5 py-16 text-white">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(145deg,rgba(58,186,133,0.12),transparent_42%)]" />
      <section className="w-full max-w-[440px] text-center" aria-labelledby="success-title">
        <img src={logoImage} alt="" className="mx-auto size-11 object-contain" />
        <img
          src={user.avatarUrl}
          alt=""
          className="mx-auto mt-10 size-24 rounded-full border-4 border-[#5865f2] bg-[#20232c] object-cover shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
        />
        <h1 id="success-title" className="mt-6 text-2xl font-black sm:text-3xl">
          Connecté en tant que {user.displayName}
        </h1>
        <p className="mt-2 text-sm font-semibold text-white/50">@{user.username}</p>

        {logoutFailed && (
          <p role="alert" className="mt-6 text-sm font-semibold text-[#ffc6c0]">
            La déconnexion a échoué. Réessayez dans un instant.
          </p>
        )}

        <button
          type="button"
          disabled={isLoggingOut}
          onClick={() => {
            void handleLogout()
          }}
          className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
        >
          <LogOut className="size-4" aria-hidden="true" />
          {isLoggingOut ? 'Déconnexion…' : 'Se déconnecter'}
        </button>
      </section>
    </main>
  )
}
