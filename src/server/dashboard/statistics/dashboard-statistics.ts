export type TicketOutcome = 'PENDING' | 'WON' | 'LOST' | 'CANCELLED'

export interface TicketFact {
  id: number
  seasonId: number
  outcome: TicketOutcome
  stake: number
  odds: number
  payout: number
  settledAt: Date | null
}

export interface TicketMetrics {
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

export function calculateTicketMetrics(tickets: TicketFact[]): TicketMetrics {
  const settled = tickets.filter(ticket => ticket.outcome === 'WON' || ticket.outcome === 'LOST')
  const wins = settled.filter(ticket => ticket.outcome === 'WON')
  const totalStaked = sum(settled.map(ticket => ticket.stake))
  const grossPayout = sum(settled.map(ticket => ticket.payout))

  return {
    placed: tickets.length,
    pending: tickets.filter(ticket => ticket.outcome === 'PENDING').length,
    cancelled: tickets.filter(ticket => ticket.outcome === 'CANCELLED').length,
    settled: settled.length,
    wins: wins.length,
    losses: settled.length - wins.length,
    totalStaked,
    grossPayout,
    realizedProfit: grossPayout - totalStaked,
    winRate: settled.length ? wins.length / settled.length : null,
    roi: totalStaked ? (grossPayout - totalStaked) / totalStaked : null,
    averageOdds: average(settled.map(ticket => ticket.odds)),
    averageStake: average(settled.map(ticket => ticket.stake)),
    highestWinningOdds: maximum(wins.map(ticket => ticket.odds)),
    largestStake: maximum(settled.map(ticket => ticket.stake)),
    largestPayout: maximum(settled.map(ticket => ticket.payout)),
    largestNetWin: maximum(wins.map(ticket => ticket.payout - ticket.stake)),
  }
}

export function calculateStreaks(tickets: TicketFact[]) {
  const settled = tickets
    .filter(ticket => ticket.outcome === 'WON' || ticket.outcome === 'LOST')
    .sort((left, right) => {
      const dateDifference = Number(left.settledAt) - Number(right.settledAt)
      return dateDifference || left.id - right.id
    })

  let longestWinning = 0
  let run = 0
  let previous: TicketFact | undefined

  for (const ticket of settled) {
    const continues = previous?.seasonId === ticket.seasonId && previous.outcome === ticket.outcome
    run = continues ? run + 1 : 1
    if (ticket.outcome === 'WON') longestWinning = Math.max(longestWinning, run)
    previous = ticket
  }

  if (!previous) return { current: null, longestWinning: 0 }
  return { current: { outcome: previous.outcome as 'WON' | 'LOST', length: run }, longestWinning }
}

export function calculateStakeQuartiles(stakes: number[]) {
  if (stakes.length < 20) return null
  const sorted = [...stakes].sort((left, right) => left - right)
  const percentile = (value: number) => sorted[Math.ceil(sorted.length * value) - 1]
  return { low: percentile(0.25), median: percentile(0.5), high: percentile(0.75) }
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

function average(values: number[]) {
  return values.length ? sum(values) / values.length : null
}

function maximum(values: number[]) {
  return values.length ? Math.max(...values) : null
}
