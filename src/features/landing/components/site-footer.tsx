import logoImage from '../../../assets/logo.png'

export function SiteFooter() {
  return (
    <footer id="connexion" className="bg-[#11131a] text-white">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-5 px-5 py-8 sm:flex-row sm:px-8">
        <a href="#accueil" className="flex items-center gap-3 font-extrabold"><img src={logoImage} alt="" className="size-8" /> Bet Bot</a>
        <p className="text-center text-xs text-white/45">Le jeu de prédictions en pièces fictives pensé pour Discord.</p>
        <p className="text-xs text-white/35">© 2026 Bet Bot</p>
      </div>
    </footer>
  )
}
