import { ArrowRight } from 'lucide-react'

import logoImage from '@/client/assets/logo.png'

export function FinalCta() {
  return (
    <section id="add-to-server" className="relative overflow-hidden bg-[#15171e] px-5 py-20 sm:px-8 sm:py-28">
      <div
        data-aos="fade-up"
        className="cta-panel relative mx-auto max-w-[1180px] overflow-hidden rounded-md px-6 py-14 text-center text-white shadow-[0_30px_80px_rgba(68,76,170,0.2)] sm:px-12 sm:py-20"
      >
        <div className="cta-lines absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-[760px]">
          <img src={logoImage} alt="" className="mx-auto mb-6 size-14 object-contain" />
          <p className="text-xs font-black tracking-[0.16em] text-[#aeb5ef] uppercase">Votre prochain rituel de match</p>
          <h2 className="mt-4 text-3xl leading-[1.08] font-black tracking-[0] text-balance sm:text-5xl">
            Faites revenir votre communauté à chaque rencontre.
          </h2>
          <p className="mx-auto mt-6 max-w-[640px] text-base leading-7 text-[#bdc1ce] sm:text-lg">
            Ajoutez Bet Bot, lancez vos premières prédictions et laissez les classements faire vivre la compétition.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href="/under-development"
              className="cta-primary group inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-black text-[#424ecc] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f7f7ff]"
            >
              Ajouter Bet Bot à mon serveur <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
