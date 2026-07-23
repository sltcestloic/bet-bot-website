import { Award, Crown, Sparkles, X } from 'lucide-react'
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { gameRequest } from '@/client/features/game/api/game-api'

interface Achievement {
  key: string
  title: string
  detail: string
}

type RevealStatus = 'idle' | 'saving' | 'error' | 'complete'

export function RewardReveal({ guildId, achievements }: { guildId: string; achievements: Achievement[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [status, setStatus] = useState<RevealStatus>('idle')
  const dialogRef = useRef<HTMLElement>(null)
  const actionRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const achievement = achievements[currentIndex]
  const hasNext = currentIndex < achievements.length - 1
  const open = Boolean(achievement) && status !== 'complete'

  const dismiss = useCallback(async () => {
    if (!achievement || status === 'saving' || status === 'complete') return
    setStatus('saving')
    try {
      await gameRequest<void>(`/guilds/${guildId}/achievements/${achievement.key}/acknowledge`, { method: 'POST' })
      if (hasNext) {
        setCurrentIndex(index => index + 1)
        setStatus('idle')
      } else {
        setStatus('complete')
      }
    } catch {
      setStatus('error')
    }
  }, [achievement, guildId, hasNext, status])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        void dismiss()
        return
      }
      if (event.key === 'Tab') trapFocus(event, dialogRef.current)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [dismiss])

  useEffect(() => {
    if (!open) return
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      previousFocusRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (open && status !== 'saving') actionRef.current?.focus()
  }, [achievement?.key, open, status])

  if (!achievement || !open) return null
  return createPortal(
    <RewardDialog
      key={achievement.key}
      achievement={achievement}
      status={status}
      hasNext={hasNext}
      dismiss={dismiss}
      dialogRef={dialogRef}
      actionRef={actionRef}
    />,
    document.body,
  )
}

function RewardDialog({
  achievement,
  status,
  hasNext,
  dismiss,
  dialogRef,
  actionRef,
}: {
  achievement: Achievement
  status: RevealStatus
  hasNext: boolean
  dismiss: () => Promise<void>
  dialogRef: RefObject<HTMLElement | null>
  actionRef: RefObject<HTMLButtonElement | null>
}) {
  const podium = achievement.key.includes('rank') || achievement.key.includes('top')
  const saving = status === 'saving'
  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto bg-black/72 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Nouveau record personnel"
    >
      <div className="relative flex min-h-full items-center justify-center px-4 py-4 sm:py-8">
        <div className="reward-particles pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          {Array.from({ length: 36 }, (_, index) => (
            <i key={index} style={{ left: `${(index * 29) % 100}%`, animationDelay: `${(index % 9) * 55}ms` }} />
          ))}
        </div>
        <section
          ref={dialogRef}
          className="reward-reveal relative w-full max-w-md overflow-hidden rounded-xl border border-[#f4c25b]/35 bg-[#151827] p-6 text-center shadow-[0_30px_100px_rgba(0,0,0,.8),0_0_70px_rgba(244,194,91,.12)] sm:p-8"
        >
          <button
            type="button"
            onClick={() => void dismiss()}
            disabled={saving}
            className="absolute top-3 right-3 grid size-9 place-items-center rounded-full text-white/40 hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-40"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
          <div className="reward-emblem mx-auto grid size-24 place-items-center rounded-full border border-[#f4c25b]/40 bg-[#f4c25b]/10 text-[#ffd875]">
            {podium ? <Crown className="size-11" /> : <Award className="size-11" />}
          </div>
          <p className="mt-6 text-[11px] font-black tracking-[.2em] text-[#f4c25b] uppercase">Nouveau record personnel</p>
          <h2 className="mt-2 text-2xl font-black">{achievement.title}</h2>
          <p className="mt-3 text-sm leading-6 text-white/60">{achievement.detail}</p>
          {status === 'error' && (
            <p className="mt-4 text-xs font-bold text-[#f49589]" role="alert">
              Impossible d’enregistrer ce record. Réessayez.
            </p>
          )}
          <button
            ref={actionRef}
            type="button"
            onClick={() => void dismiss()}
            disabled={saving}
            className="mt-7 inline-flex h-11 items-center gap-2 rounded-md bg-gradient-to-r from-[#5865f2] to-[#746ee8] px-6 text-sm font-black shadow-[0_10px_35px_rgba(88,101,242,.3)] hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
          >
            <Sparkles className="size-4" />
            {getActionLabel(status, hasNext)}
          </button>
        </section>
      </div>
    </div>
  )
}

function trapFocus(event: KeyboardEvent, container: HTMLElement | null) {
  if (!container) return
  const controls = Array.from(container.querySelectorAll<HTMLElement>('button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'))
  if (!controls.length) {
    event.preventDefault()
    return
  }
  const first = controls[0]
  const last = controls[controls.length - 1]
  const outside = !container.contains(document.activeElement)
  if (event.shiftKey && (document.activeElement === first || outside)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && (document.activeElement === last || outside)) {
    event.preventDefault()
    first.focus()
  }
}

function getActionLabel(status: RevealStatus, hasNext: boolean) {
  if (status === 'saving') return 'Enregistrement…'
  if (status === 'error') return 'Réessayer'
  return hasNext ? 'Record suivant' : 'Continuer'
}
