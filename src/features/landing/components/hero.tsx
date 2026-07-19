import { ArrowRight, Check, ChevronDown, Gamepad2, Sparkles } from 'lucide-react'
import basketImage from '../../../assets/basket.png'
import matchResultImage from '../../../assets/match result.png'
import { DiscordButton } from '../../../components/ui/discord-button'
import { SiteHeader } from './site-header'

export function Hero() {
  return (
    <section id="accueil" className="hero relative isolate min-h-[92svh] overflow-hidden bg-[#11131a] text-white">
      <div className="hero-photo absolute inset-0 -z-30" />
      <div className="hero-shade absolute inset-0 -z-20" />
      <div className="hero-grid absolute inset-0 -z-10 opacity-25" />
      <SiteHeader />

      <div className="mx-auto grid min-h-[92svh] max-w-[1240px] items-center gap-8 px-5 pb-8 pt-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-6 lg:pb-12 lg:pt-28">
        <div className="relative z-10 max-w-[650px] self-center lg:pb-10">
          <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#cbd0ff]">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#5865f2]/25 ring-1 ring-[#7e88ff]/40">
              <Gamepad2 className="size-4" aria-hidden="true" />
            </span>
            Le terrain de jeu de votre communauté
          </div>
          <h1 className="max-w-[680px] text-[clamp(2.2rem,4.35vw,4rem)] font-black leading-[1.02] tracking-[0] text-balance">
            Transformez votre Discord en arène de prédictions.
          </h1>
          <p className="mt-6 max-w-[590px] text-base leading-7 text-[#d9dce6] sm:text-lg sm:leading-8">
            Sport, esport, pièces fictives et classements : Bet Bot donne à chaque match une raison de revenir, de jouer et de chambrer entre amis.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <DiscordButton>
              Ajouter Bet Bot à mon serveur
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
            </DiscordButton>
            <span className="hidden sm:contents">
              <DiscordButton secondary href="#fonctionnalites">
                Voir les fonctionnalités
                <ChevronDown className="size-4" aria-hidden="true" />
              </DiscordButton>
            </span>
          </div>
          <div className="mt-7 hidden flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-white/70 sm:flex">
            <span className="inline-flex items-center gap-2"><Check className="size-4 text-[#66d9a8]" /> Pièces 100 % fictives</span>
            <span className="inline-flex items-center gap-2"><Check className="size-4 text-[#66d9a8]" /> Installation rapide</span>
          </div>
        </div>

        <div className="hero-stage relative h-[300px] self-end sm:h-[390px] lg:h-[610px] lg:self-center" aria-label="Aperçu de Bet Bot dans Discord">
          <div className="hero-ui hero-ui-ticket absolute left-[2%] top-[8%] z-20 w-[43%] max-w-[290px] overflow-hidden rounded-md border border-white/10 bg-[#313338] shadow-[0_30px_80px_rgba(0,0,0,0.58)] sm:left-[8%] sm:top-[14%] lg:left-[4%] lg:top-[18%] lg:w-[44%]">
            <div className="flex h-8 items-center gap-1.5 border-b border-white/8 bg-[#292b31] px-3">
              <span className="size-2 rounded-full bg-[#ed6a5f]" />
              <span className="size-2 rounded-full bg-[#f4bd4f]" />
              <span className="size-2 rounded-full bg-[#61c454]" />
            </div>
            <img src={basketImage} alt="Ticket combiné Bet Bot" className="block w-full" />
          </div>
          <div className="hero-ui hero-ui-result absolute bottom-[1%] right-[1%] z-10 w-[52%] max-w-[385px] overflow-hidden rounded-md border border-white/10 bg-[#313338] shadow-[0_30px_90px_rgba(0,0,0,0.68)] sm:bottom-[3%] sm:right-[2%] lg:bottom-[5%] lg:right-[1%] lg:w-[56%]">
            <div className="flex h-9 items-center justify-between border-b border-white/8 bg-[#292b31] px-3 text-[10px] font-bold text-white/60">
              <span># pronostics</span><span>● ● ●</span>
            </div>
            <img src={matchResultImage} alt="Résultat et gains annoncés par Bet Bot" className="block w-full" />
          </div>
          <div className="absolute bottom-[7%] left-[10%] z-30 hidden rounded-md border border-[#f4c25b]/30 bg-[#1d2028]/90 px-4 py-3 shadow-xl backdrop-blur sm:block lg:bottom-[10%] lg:left-[1%]">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">Cote du combiné</p>
            <p className="mt-1 flex items-center gap-2 text-xl font-black text-white"><Sparkles className="size-4 text-[#f4c25b]" /> 6,35</p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-3 right-5 text-[9px] text-white/35 sm:right-8">Photo : Josemar Duarte / Unsplash</div>
    </section>
  )
}
