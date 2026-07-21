import { FeatureSection } from '@/client/features/landing/components/feature-section'
import { FinalCta } from '@/client/features/landing/components/final-cta'
import { Hero } from '@/client/features/landing/components/hero'
import { IntroStrip } from '@/client/features/landing/components/intro-strip'
import { Leaderboard } from '@/client/features/landing/components/leaderboard'
import { SiteFooter } from '@/client/features/landing/components/site-footer'
import { landingFeatures } from '@/client/features/landing/config/landing-features'

export function LandingPage() {
  return (
    <main>
      <Hero />
      <IntroStrip />
      <div id="features">
        {landingFeatures.map((feature, index) => (
          <FeatureSection key={feature.id} feature={feature} index={index} />
        ))}
      </div>
      <Leaderboard />
      <FinalCta />
      <SiteFooter />
    </main>
  )
}
