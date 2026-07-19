import { BarChart3, Coins, Trophy, Users } from 'lucide-react'
import ladderImage from '../../../assets/ladder.png'

const leaderboardModes = [
  [Coins, 'Solde'],
  [BarChart3, 'Profit'],
  [Trophy, 'Victoires'],
] as const

export function Leaderboard() {
  return (
    <section id="leaderboards" className="overflow-hidden bg-[#171920] text-white">
      <div className="mx-auto grid max-w-[1180px] items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div data-aos="fade-up" className="max-w-[520px]">
          <div className="mb-5 flex items-center gap-3 text-[#f4c25b]">
            <span className="flex size-10 items-center justify-center rounded-md bg-[#f4c25b]/12"><Trophy className="size-5" /></span>
            <span className="text-xs font-black uppercase tracking-[0.15em]">Classements</span>
          </div>
          <h2 className="text-3xl font-black leading-[1.08] tracking-[0] text-balance sm:text-5xl">Une rivalité saine qui anime le serveur.</h2>
          <p className="mt-6 text-base leading-7 text-[#b9bdc9] sm:text-lg sm:leading-8">
            Solde, profit ou nombre de prédictions gagnées : chacun peut viser la première place. Les classements donnent un fil rouge à la saison et de nouvelles histoires à raconter après chaque match.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {leaderboardModes.map(([ItemIcon, label]) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/85">
                <ItemIcon className="size-4 text-[#f4c25b]" /> {label}
              </span>
            ))}
          </div>
        </div>

        <div data-aos="fade-up" data-aos-delay="50" className="leader-stage relative min-h-[470px] sm:min-h-[600px]">
          <div className="absolute inset-[8%_0_0_8%] rounded-md border border-white/8 bg-[#22252e]" />
          <div className="absolute left-0 top-[2%] z-10 w-[82%] max-w-[520px] overflow-hidden rounded-md border border-white/10 bg-[#313338] shadow-[0_35px_90px_rgba(0,0,0,0.45)]">
            <div className="flex h-11 items-center gap-2 border-b border-white/8 bg-[#292b31] px-4 text-xs font-bold text-white/50"><Users className="size-4" /> # classement</div>
            <img src={ladderImage} alt="Classement Discord des membres par solde de pièces" className="w-full" />
          </div>
          <div className="absolute bottom-[3%] right-0 z-20 w-[55%] rounded-md border border-white/12 bg-[#101218]/95 p-5 shadow-2xl backdrop-blur sm:p-7">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">Saison en cours</p><p className="mt-2 text-xl font-black sm:text-2xl">Le podium bouge</p></div><Trophy className="size-6 text-[#f4c25b]" /></div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[72%] rounded-full bg-[#f4c25b]" /></div>
            <p className="mt-3 text-xs text-white/55">Le classement est remis à zéro à la fin de chaque saison.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
