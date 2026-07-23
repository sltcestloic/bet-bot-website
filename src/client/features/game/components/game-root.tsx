import { Outlet } from 'react-router-dom'

import { GameBackdrop } from '@/client/features/game/components/game-backdrop'

export function GameRoot() {
  return (
    <div className="min-h-svh bg-[#090b12] text-[#f7f8ff]">
      <GameBackdrop />
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  )
}
