import { Injectable } from '@nestjs/common'

interface CacheEntry {
  value: unknown
  generatedAt: string
  expiresAt: number
  staleUntil: number
}

@Injectable()
export class DashboardCacheService {
  private readonly entries = new Map<string, CacheEntry>()

  async getOrLoad<T>(key: string, loader: () => Promise<T>, bypass = false) {
    const now = Date.now()
    const cached = this.entries.get(key)
    if (!bypass && cached && cached.expiresAt > now) {
      return { data: cached.value as T, generatedAt: cached.generatedAt, stale: false }
    }

    try {
      const value = await loader()
      const generatedAt = new Date().toISOString()
      this.entries.set(key, { value, generatedAt, expiresAt: now + 30_000, staleUntil: now + 300_000 })
      return { data: value, generatedAt, stale: false }
    } catch (error) {
      if (cached && cached.staleUntil > now) {
        return { data: cached.value as T, generatedAt: cached.generatedAt, stale: true }
      }
      throw error
    }
  }
}
