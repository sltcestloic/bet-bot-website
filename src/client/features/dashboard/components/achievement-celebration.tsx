import { Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { dashboardRequest } from '@/client/features/dashboard/api/dashboard-api'

export function AchievementCelebration({
  guildId,
  achievement,
}: {
  guildId: string
  achievement: { key: string; title: string; detail: string }
}) {
  const [visible, setVisible] = useState(true)
  const [params] = useSearchParams()

  useEffect(() => {
    const season = params.get('season')
    const query = season ? `?season=${encodeURIComponent(season)}` : ''
    void dashboardRequest<void>(`/guilds/${guildId}/achievements/${achievement.key}/acknowledge${query}`, { method: 'POST' })
    const timeout = window.setTimeout(() => {
      setVisible(false)
    }, 6500)
    return () => {
      window.clearTimeout(timeout)
    }
  }, [achievement.key, guildId, params])

  if (!visible) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex justify-center px-4" role="status">
      <div className="achievement-confetti absolute inset-x-0 top-0 mx-auto h-40 max-w-xl overflow-hidden" aria-hidden="true">
        {Array.from({ length: 28 }, (_, index) => (
          <i
            key={index}
            style={{
              left: `${4 + index * 3.35}%`,
              animationDelay: `${(index % 8) * 35}ms`,
              transform: `rotate(${index * 21}deg)`,
            }}
          />
        ))}
      </div>
      <div className="pointer-events-auto relative flex w-full max-w-md items-start gap-3 rounded-md border border-[#f4c25b]/35 bg-[#20232d] p-4 shadow-[0_18px_60px_rgba(0,0,0,.5)]">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#f4c25b]/14 text-[#f4c25b]">
          <Sparkles className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <strong className="block text-sm">{achievement.title}</strong>
          <p className="mt-1 text-xs leading-5 text-[#b4bac8]">{achievement.detail}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setVisible(false)
          }}
          className="flex size-8 items-center justify-center text-white/45 hover:text-white"
          aria-label="Fermer"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
