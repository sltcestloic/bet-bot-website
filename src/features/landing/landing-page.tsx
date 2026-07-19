import { FeatureSection } from './components/feature-section'
import { FinalCta } from './components/final-cta'
import { Hero } from './components/hero'
import { IntroStrip } from './components/intro-strip'
import { Leaderboard } from './components/leaderboard'
import { SiteFooter } from './components/site-footer'
import { landingFeatures } from './config/landing-features'

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
