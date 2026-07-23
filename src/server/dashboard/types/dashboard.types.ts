export interface DashboardGuild {
  id: string
  name: string
  iconHash: string | null
  memberCount: number
  lastSyncedAt: string | null
}

export interface DashboardSeason {
  id: number
  number: number
  title: string | null
  status: 'PENDING' | 'ACTIVE' | 'CLOSING' | 'CLOSED'
  startsAt: string
  bettingClosesAt: string | null
  closedAt: string | null
}

export interface DashboardTicket {
  id: number
  kind: 'SINGLE' | 'PARLAY'
  outcome: 'PENDING' | 'WON' | 'LOST' | 'CANCELLED'
  stake: number
  odds: number
  payout: number
  placedAt: string
  settledAt: string | null
  hasCorrection: boolean
  legs: {
    id: number
    position: number
    optionName: string
    odds: number
    placementPhase: 'PREMATCH' | 'LIVE'
    outcome: 'PENDING' | 'WON' | 'LOST' | 'CANCELLED'
    sport: string
    competition: string
    team1: string
    team2: string
    startsAt: string
    scoreTeam1: number | null
    scoreTeam2: number | null
    hasCorrection: boolean
  }[]
}

export interface MetricSummary {
  placed: number
  pending: number
  cancelled: number
  settled: number
  wins: number
  losses: number
  totalStaked: number
  grossPayout: number
  realizedProfit: number
  winRate: number | null
  roi: number | null
  averageOdds: number | null
  averageStake: number | null
  highestWinningOdds: number | null
  largestStake: number | null
  largestPayout: number | null
  largestNetWin: number | null
}
