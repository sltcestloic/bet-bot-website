import { useEffect, useState } from 'react'

import { LandingPage } from '@/client/features/landing/landing-page'
import { getCurrentUser } from '@/client/lib/auth-api'
import type { PublicUser } from '@/client/lib/public-user'

export function LandingRoute() {
  const [viewer, setViewer] = useState<PublicUser | null>(null)
  useEffect(() => {
    void getCurrentUser()
      .then(setViewer)
      .catch(() => undefined)
  }, [])
  return <LandingPage viewer={viewer} />
}
