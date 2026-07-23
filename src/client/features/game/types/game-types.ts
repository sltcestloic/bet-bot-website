import type { PublicUser } from '@/client/lib/public-user'

export interface GameGuild {
  id: string
  name: string
  iconHash: string | null
  memberCount: number
  lastSyncedAt: string | null
}
export interface GameSeason {
  id: number
  number: number
  title: string | null
  status: string
  startsAt: string
  bettingClosesAt: string | null
  closedAt: string | null
}
export interface GameBootstrap {
  guilds: GameGuild[]
  isAdmin: boolean
}
export interface GameRootData {
  user: PublicUser
  bootstrap: GameBootstrap
}
export interface CachedResponse<T> {
  data: T
  generatedAt: string
  stale: boolean
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
export interface GameTicket {
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
    placementPhase: string
    outcome: string
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
export interface LeaderboardRow {
  discordId: string
  username: string | null
  globalName: string | null
  avatarHash?: string | null
  avatarUrl?: string
  value: number | null
  rank: number | null
  settled: number
  isViewer: boolean
}
export interface OverviewData {
  season: GameSeason | null
  seasons: GameSeason[]
  account: { balance: number | null; activeStake: number; participatedAt: string | null; isBanned: boolean } | null
  metrics: MetricSummary
  trend: { date: string; profit: number; stake: number; payout: number; tickets: number; cumulativeProfit: number }[]
  recentTickets: GameTicket[]
  streaks: { current: { outcome: 'WON' | 'LOST'; length: number } | null; longestWinning: number }
  recentForm: ('WON' | 'LOST')[]
  rank: { rank: number | null; value: number | null; settled: number } | null
  previousRank: number | null
  activity: { activeDays: number; betsPlaced: number; dailyClaims: number }
  celebration: { key: string; title: string; detail: string } | null
  activeTickets?: GameTicket[]
  recentResults?: GameTicket[]
  leaderboards: Record<string, LeaderboardRow[]>
}
