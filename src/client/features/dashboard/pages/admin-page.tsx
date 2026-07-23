import { ArrowLeft, Gauge, Server, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

import { DashboardBrand } from '@/client/features/dashboard/components/dashboard-navigation'
import {
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  PageFrame,
  PageHeader,
} from '@/client/features/dashboard/components/dashboard-ui'
import { useDashboardData } from '@/client/features/dashboard/hooks/use-dashboard-data'
import { formatCoins, formatDateTime, formatInteger, formatPercent } from '@/client/features/dashboard/utils/dashboard-formatters'

interface AdminData {
  guilds: { active: number; installed: number; removed: number; memberReach: number }
  operations: { apiRequests: number; apiFailures: number; rateLimits: number; taskRuns: number; taskFailures: number }
  activity: {
    dau: number
    wau: number
    mau: number
    interactions: number
    commands: number
    buttons: number
    modals: number
    selectMenus: number
    betsPlaced: number
    amountStaked: number
    dailyClaims: number
  }
  corrections: {
    id: number
    team1: string
    team2: string
    previousScoreTeam1: number
    previousScoreTeam2: number
    correctedScoreTeam1: number
    correctedScoreTeam2: number
    createdAt: string
  }[]
  features: { category: string; action: string; uses: number; failures: number; failureRate: number | null }[]
  subscriptions: { sport: string; type: string; name: string; subscriptions: number }[]
  tasks: { taskName: string; runs: number; failures: number; averageDurationMs: number | null; maxDurationMs: number }[]
  providers: {
    provider: string
    operation: string
    requests: number
    failures: number
    rateLimits: number
    averageDurationMs: number | null
    maxDurationMs: number
  }[]
  messages: { status: string; count: number }[]
  anomalyCount: number
  guildRows: { id: string; name: string; isActive: boolean; memberCount: number; participants: number; lastSyncedAt: string | null }[]
  lifecycle: { date: string; installed: number; removed: number }[]
  anomalies: {
    id: number
    userId: number
    seasonId: number
    occurredAt: string
    amount: number
    previousBalance: number
    balanceAfter: number
  }[]
  ledgerFlows: { type: string; net: number; volume: number; entries: number }[]
}

export function AdminPage() {
  const state = useDashboardData<AdminData>('/admin/summary')
  return (
    <main className="min-h-svh bg-[#101218] text-white">
      <header className="flex h-16 items-center justify-between border-b border-white/[0.07] bg-[#151820] px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <DashboardBrand compact to="/dashboard/admin" />
          <span className="hidden text-sm font-bold text-white/45 sm:inline">Administration</span>
        </div>
        <Link to="/app" className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white">
          <ArrowLeft className="size-4" />
          Retour à l’application
        </Link>
      </header>
      <PageFrame>
        <PageHeader title="Administration" description="Produit, opérations et audits en lecture seule." />
        <AdminPageBody state={state} />
      </PageFrame>
    </main>
  )
}

function AdminPageBody({ state }: { state: ReturnType<typeof useDashboardData<AdminData>> }) {
  if (state.loading) return <LoadingState />
  if (state.error || !state.data) return <ErrorState retry={state.refresh} />
  return <AdminContent data={state.data} />
}

function AdminContent({ data }: { data: AdminData }) {
  return (
    <>
      <GuildSection data={data} />
      <ActivitySection data={data} />
      <OperationsSection data={data} />
      <AuditSection data={data} />
    </>
  )
}

function GuildSection({ data }: { data: AdminData }) {
  return (
    <>
      <SectionTitle icon={Server} title="Guildes" />
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Guildes actives" value={data.guilds.active} />
        <MetricCard label="Installations" value={data.guilds.installed} />
        <MetricCard label="Retirées" value={data.guilds.removed} />
        <MetricCard label="Portée approximative" value={formatInteger(data.guilds.memberReach)} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <AdminTable
          title="Croissance · 90 jours"
          headers={['Jour', 'Installations', 'Retraits', 'Net']}
          rows={data.lifecycle.map(row => [row.date, row.installed, row.removed, row.installed - row.removed])}
        />
        <AdminTable
          title="Guildes synchronisées"
          headers={['Guilde', 'Membres', 'Participants', 'Synchronisation']}
          rows={data.guildRows.map(row => [
            row.name,
            formatInteger(row.memberCount),
            row.participants,
            row.lastSyncedAt ? formatDateTime(row.lastSyncedAt) : 'Indisponible',
          ])}
        />
      </div>
    </>
  )
}

function ActivitySection({ data }: { data: AdminData }) {
  const interactionTotal = data.activity.commands + data.activity.buttons + data.activity.modals + data.activity.selectMenus
  return (
    <>
      <SectionTitle icon={Gauge} title="Activité · 30 jours" />
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <MetricCard label="DAU" value={data.activity.dau} />
        <MetricCard label="WAU" value={data.activity.wau} />
        <MetricCard label="MAU" value={data.activity.mau} />
        <MetricCard label="Interactions" value={formatInteger(data.activity.interactions)} />
        <MetricCard label="Tickets" value={formatInteger(data.activity.betsPlaced)} />
        <MetricCard label="Volume misé" value={formatCoins(data.activity.amountStaked)} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <AdminTable
          title="Mix d’interactions"
          headers={['Type', 'Volume', 'Part']}
          rows={[
            ['Commandes', data.activity.commands],
            ['Boutons', data.activity.buttons],
            ['Modales', data.activity.modals],
            ['Menus de sélection', data.activity.selectMenus],
          ].map(([label, value]) => [
            String(label),
            Number(value),
            interactionTotal ? formatPercent(Number(value) / interactionTotal) : 'Indisponible',
          ])}
        />
        <AdminTable
          title="Fonctionnalités populaires"
          headers={['Action', 'Utilisations', 'Taux d’échec']}
          rows={data.features.map(row => [`${row.category} · ${row.action}`, row.uses, formatPercent(row.failureRate)])}
        />
        <AdminTable
          title="Abonnements populaires"
          headers={['Équipe ou compétition', 'Sport', 'Abonnements']}
          rows={data.subscriptions.map(row => [row.name, row.sport, row.subscriptions])}
        />
        <AdminTable title="Messages de match" headers={['État', 'Volume']} rows={data.messages.map(row => [row.status, row.count])} />
      </div>
    </>
  )
}

function OperationsSection({ data }: { data: AdminData }) {
  return (
    <>
      <SectionTitle icon={Gauge} title="Santé opérationnelle · 30 jours" />
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <MetricCard label="Requêtes API" value={formatInteger(data.operations.apiRequests)} />
        <MetricCard
          label="Échecs API"
          value={formatInteger(data.operations.apiFailures)}
          tone={data.operations.apiFailures ? 'negative' : 'neutral'}
        />
        <MetricCard
          label="Limites Kalshi"
          value={formatInteger(data.operations.rateLimits)}
          tone={data.operations.rateLimits ? 'negative' : 'neutral'}
        />
        <MetricCard label="Exécutions planifiées" value={formatInteger(data.operations.taskRuns)} />
        <MetricCard
          label="Échecs de tâches"
          value={formatInteger(data.operations.taskFailures)}
          tone={data.operations.taskFailures ? 'negative' : 'neutral'}
        />
        <MetricCard label="Anomalies ledger" value={data.anomalyCount} tone={data.anomalyCount ? 'negative' : 'neutral'} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <AdminTable
          title="Tâches planifiées"
          headers={['Tâche', 'Exécutions / échecs', 'Moyenne / maximum']}
          rows={data.tasks.map(row => [
            row.taskName,
            `${row.runs} / ${row.failures}`,
            `${formatDuration(row.averageDurationMs)} / ${formatDuration(row.maxDurationMs)}`,
          ])}
        />
        <AdminTable
          title="Fournisseurs externes"
          headers={['Opération', 'Requêtes / échecs', 'Moyenne / maximum']}
          rows={data.providers.map(row => [
            `${row.provider} · ${row.operation}`,
            `${row.requests} / ${row.failures}`,
            `${formatDuration(row.averageDurationMs)} / ${formatDuration(row.maxDurationMs)}`,
          ])}
        />
      </div>
    </>
  )
}

function AuditSection({ data }: { data: AdminData }) {
  return (
    <>
      <SectionTitle icon={ShieldAlert} title="Audits" />
      <div className="mt-3 grid gap-5 xl:grid-cols-2">
        <AdminTable
          title="Flux du ledger · 30 jours"
          description="Volume brut des écritures, transferts compris des deux côtés."
          headers={['Type', 'Volume', 'Net']}
          rows={data.ledgerFlows.map(row => [row.type, formatCoins(row.volume), formatCoins(row.net)])}
        />
        <AdminTable
          title={`Anomalies de continuité · ${data.anomalyCount}`}
          headers={['Compte / saison', 'Mouvement', 'Écart']}
          rows={data.anomalies.map(row => [
            `#${row.userId} · S${row.seasonId}`,
            formatCoins(row.amount),
            `${formatCoins(row.previousBalance)} → ${formatCoins(row.balanceAfter)}`,
          ])}
        />
      </div>
      <section className="mt-5 rounded-md border border-white/[0.08] bg-[#181b23]">
        <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-4">
          <ShieldAlert className="size-5 text-[#f4c25b]" />
          <h2 className="font-black">Corrections récentes</h2>
        </div>
        {data.corrections.length ? (
          <div className="divide-y divide-white/[0.06]">
            {data.corrections.map(entry => (
              <div key={entry.id} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[1fr_auto_auto]">
                <strong>
                  {entry.team1} – {entry.team2}
                </strong>
                <span className="text-[#a0a6b5]">
                  {entry.previousScoreTeam1}–{entry.previousScoreTeam2} → {entry.correctedScoreTeam1}–{entry.correctedScoreTeam2}
                </span>
                <span className="text-xs text-[#777f91]">{formatDateTime(entry.createdAt)}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
    </>
  )
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Server; title: string }) {
  return (
    <section className="mt-7 flex items-center gap-2 first:mt-6">
      <Icon className="size-5 text-[#7e88ff]" />
      <h2 className="font-black">{title}</h2>
    </section>
  )
}

function AdminTable({
  title,
  description,
  headers,
  rows,
}: {
  title: string
  description?: string
  headers: string[]
  rows: (string | number)[][]
}) {
  return (
    <section className="overflow-hidden rounded-md border border-white/[0.08] bg-[#181b23]">
      <div className="border-b border-white/[0.07] px-4 py-4">
        <h2 className="font-black">{title}</h2>
        {description && <p className="mt-1 text-xs text-[#777f91]">{description}</p>}
      </div>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] text-left text-sm">
            <thead className="text-xs text-[#777f91]">
              <tr>
                {headers.map(header => (
                  <th key={header} className="px-4 py-3 font-bold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((row, index) => (
                <tr key={index}>
                  {row.map((value, cell) => (
                    <td key={cell} className="px-4 py-3">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState />
      )}
    </section>
  )
}

function formatDuration(value: number | null) {
  return value === null ? 'Indisponible' : `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value)} ms`
}
