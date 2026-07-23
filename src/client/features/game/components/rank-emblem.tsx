import { Crown } from 'lucide-react'

export function RankEmblem({ rank, movement }: { rank: number | null; movement?: number | null }) {
  const tone = getRankTone(rank)
  return (
    <div className={`rank-emblem ${tone}`}>
      <span className="rank-emblem-ring" />
      <Crown className="size-5 opacity-75" />
      <strong>{rank ? `#${rank}` : '—'}</strong>
      <span className="text-[9px] font-black uppercase">{rank ? 'Classement' : 'Non classé'}</span>
      {rank && movement !== null && movement !== undefined && movement !== 0 && (
        <span className={`rank-movement ${movement > 0 ? 'text-[#65dca7]' : 'text-[#f49589]'}`}>
          {movement > 0 ? `+${movement}` : movement}
        </span>
      )}
    </div>
  )
}

function getRankTone(rank: number | null) {
  if (rank === 1) return 'rank-gold'
  if (rank === 2) return 'rank-silver'
  if (rank === 3) return 'rank-bronze'
  if (rank) return 'rank-indigo'
  return 'rank-neutral'
}
