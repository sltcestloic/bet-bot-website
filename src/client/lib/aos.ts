import AOS from 'aos'
import 'aos/dist/aos.css'

export function initializeAos() {
  AOS.init({
    duration: 500,
    easing: 'ease-out-cubic',
    offset: 60,
    once: true,
    disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  })
}
