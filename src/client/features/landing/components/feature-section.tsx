import { Check } from 'lucide-react'

import type { LandingFeature } from '@/client/features/landing/config/landing-features'

interface FeatureSectionProps {
  feature: LandingFeature
  index: number
}

export function FeatureSection({ feature, index }: FeatureSectionProps) {
  const Icon = feature.icon
  const reversed = index % 2 === 1

  return (
    <section id={feature.id} className={`feature-band text-white ${index % 2 === 0 ? 'bg-[#1b1e26]' : 'bg-[#20232c]'}`}>
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-20">
        <div data-aos="fade-up" className={`max-w-[520px] ${reversed ? '' : 'lg:order-2'}`}>
          <div className="mb-5 flex items-center gap-3">
            <span className={`feature-icon feature-icon-${feature.tone}`}>
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="text-xs font-black tracking-[0.15em] text-[#aeb3c2] uppercase">{feature.eyebrow}</span>
          </div>
          <h2 className="text-3xl leading-[1.08] font-black tracking-[0] text-balance text-white sm:text-5xl">{feature.title}</h2>
          <p className="mt-6 text-base leading-7 text-[#b7bbc8] sm:text-lg sm:leading-8">{feature.description}</p>
          <ul className="mt-7 grid gap-3 text-sm font-bold text-[#eceef5]">
            {feature.bullets.map(bullet => (
              <li key={bullet} className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#5865f2]/20 text-[#9ca5ff]">
                  <Check className="size-3.5" />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div data-aos="fade-up" data-aos-delay="50" className="relative flex min-h-[410px] items-center justify-center sm:min-h-[560px]">
          <div className={`feature-accent feature-accent-${feature.tone}`} />
          <div className="discord-window relative z-10 w-full max-w-[520px] overflow-hidden rounded-md border border-[#474a55] bg-[#313338] shadow-[0_28px_70px_rgba(25,27,34,0.22)]">
            <div className="flex h-11 items-center justify-between border-b border-white/8 bg-[#292b31] px-4 text-[11px] font-bold text-white/55">
              <span className="flex items-center gap-2">
                <span className="text-white/35">#</span> pronostics
              </span>
              <span className="flex gap-1">
                <i className="size-1.5 rounded-full bg-white/30" />
                <i className="size-1.5 rounded-full bg-white/30" />
                <i className="size-1.5 rounded-full bg-white/30" />
              </span>
            </div>
            <div className="flex justify-center p-3 sm:p-5">
              <img src={feature.image} alt={feature.alt} className="max-h-[500px] w-auto max-w-full object-contain" />
            </div>
          </div>
          <div className="absolute right-[2%] bottom-[4%] z-20 hidden items-center gap-2 rounded-md border border-white/10 bg-[#11131a] px-3 py-2 text-xs font-extrabold text-white shadow-lg sm:flex">
            <span className={`status-dot status-dot-${feature.tone}`} /> En direct sur Discord
          </div>
        </div>
      </div>
    </section>
  )
}
