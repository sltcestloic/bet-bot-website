import { Injectable } from '@nestjs/common'

import type { DashboardAchievementEntity } from '@/server/dashboard/entities/dashboard-achievement.entity'

interface AchievementStore {
  find(options: { where: { userId: string; guildId: string; seasonKey: string } }): Promise<DashboardAchievementEntity[]>
  save(entity: Partial<DashboardAchievementEntity>): Promise<unknown>
  update(
    criteria: { userId: string; guildId: string; seasonKey: string; key: string },
    changes: { pending: boolean; pendingTitle: null; pendingDetail: null },
  ): Promise<unknown>
}

interface AchievementFacts {
  wins: number
  settled: number
  largestNetWin: number | null
  highestWinningOdds: number | null
  longestWinning: number
  rank?: number | null
}

@Injectable()
export class DashboardAchievementService {
  constructor(private readonly store: AchievementStore) {}

  async evaluate(userId: string, guildId: string, seasonId: number | null, facts: AchievementFacts) {
    const seasonKey = seasonId === null ? 'all' : String(seasonId)
    const existing = await this.store.find({ where: { userId, guildId, seasonKey } })
    const values = achievementValues(facts)

    if (existing.length === 0) {
      await Promise.all(
        values.map(candidate =>
          this.store.save({ userId, guildId, seasonKey, ...candidate, pending: false, pendingTitle: null, pendingDetail: null }),
        ),
      )
      return null
    }

    const currentPending = existing.find(achievement => achievement.pending)
    if (currentPending) return toCelebration(currentPending)

    const missing = values.filter(candidate => !existing.some(achievement => achievement.key === candidate.key))
    if (missing.length)
      await Promise.all(
        missing.map(candidate =>
          this.store.save({ userId, guildId, seasonKey, ...candidate, pending: false, pendingTitle: null, pendingDetail: null }),
        ),
      )

    const improvements = values.filter(candidate => {
      const previous = existing.find(achievement => achievement.key === candidate.key)
      return (
        previous &&
        (candidate.key === 'best-rank'
          ? candidate.bestValue <= 3 && candidate.bestValue < previous.bestValue
          : candidate.bestValue > previous.bestValue)
      )
    })
    if (!improvements.length) return null

    const selected = improvements[0]
    const presentation = presentationFor(selected.key, selected.bestValue)
    const updated = {
      userId,
      guildId,
      seasonKey,
      ...selected,
      pending: true,
      pendingTitle: presentation.title,
      pendingDetail: presentation.detail,
    }
    await this.store.save(updated)
    return { key: selected.key, ...presentation }
  }

  acknowledge(userId: string, guildId: string, seasonId: number | null, key: string) {
    return this.store.update(
      { userId, guildId, seasonKey: seasonId === null ? 'all' : String(seasonId), key },
      { pending: false, pendingTitle: null, pendingDetail: null },
    )
  }
}

function achievementValues(facts: AchievementFacts) {
  const records = [
    { key: 'largest-net-win', bestValue: facts.largestNetWin ?? 0 },
    { key: 'highest-winning-odds', bestValue: facts.highestWinningOdds ?? 0 },
    { key: 'longest-winning-streak', bestValue: facts.longestWinning },
  ]
  if (facts.rank) records.push({ key: 'best-rank', bestValue: facts.rank })
  return records
}

function presentationFor(key: string, value: number) {
  if (key === 'largest-net-win')
    return { title: 'Nouveau record personnel', detail: `Votre meilleur gain net atteint ${value.toLocaleString('fr-FR')} pièces.` }
  if (key === 'highest-winning-odds')
    return {
      title: 'Nouvelle cote record',
      detail: `Ticket gagné avec une cote de ${value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}.`,
    }
  if (key === 'longest-winning-streak') return { title: 'Série record', detail: `${value} victoires consécutives.` }
  if (key === 'best-rank' && value === 1) return { title: 'Vous prenez la tête', detail: 'Vous êtes désormais numéro 1 du serveur.' }
  if (key === 'best-rank') return { title: 'Vous entrez sur le podium', detail: `Vous atteignez la ${value}e place du serveur.` }
  return { title: 'Nouveau record personnel', detail: '' }
}

function toCelebration(achievement: DashboardAchievementEntity) {
  return { key: achievement.key, title: achievement.pendingTitle ?? 'Nouveau record', detail: achievement.pendingDetail ?? '' }
}
