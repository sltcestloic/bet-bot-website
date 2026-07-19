import { Reveal } from '../../components/ui/reveal'
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
      <Reveal><IntroStrip /></Reveal>
      <div id="fonctionnalites">
        {landingFeatures.map((feature, index) => (
          <Reveal key={feature.id}>
            <FeatureSection feature={feature} index={index} />
          </Reveal>
        ))}
      </div>
      <Reveal><Leaderboard /></Reveal>
      <Reveal><FinalCta /></Reveal>
      <SiteFooter />
    </main>
  )
}
