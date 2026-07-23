import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { formatCoins, formatInteger } from '@/client/features/dashboard/utils/dashboard-formatters'

const axis = { fill: '#777f91', fontSize: 11 }

export function ProfitChart({ data }: { data: { date: string; cumulativeProfit: number }[] }) {
  return (
    <div className="h-[260px] w-full" role="img" aria-label="Évolution du profit réalisé cumulé">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="profit-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5865f2" stopOpacity={0.38} />
              <stop offset="100%" stopColor="#5865f2" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
          <XAxis dataKey="date" tick={axis} tickLine={false} axisLine={false} minTickGap={34} />
          <YAxis tick={axis} tickLine={false} axisLine={false} width={46} tickFormatter={formatInteger} />
          <Tooltip
            contentStyle={{ background: '#20232d', border: '1px solid rgba(255,255,255,.12)', borderRadius: 6 }}
            formatter={value => [formatCoins(Number(value)), 'Profit cumulé']}
          />
          <Area type="monotone" dataKey="cumulativeProfit" stroke="#7f89ff" strokeWidth={2.5} fill="url(#profit-fill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function VolumeChart({ data }: { data: { date: string; stake: number; payout: number }[] }) {
  return (
    <div className="h-[280px] w-full" role="img" aria-label="Mises et paiements au fil du temps">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
          <XAxis dataKey="date" tick={axis} tickLine={false} axisLine={false} minTickGap={34} />
          <YAxis tick={axis} tickLine={false} axisLine={false} width={46} tickFormatter={formatInteger} />
          <Tooltip
            contentStyle={{ background: '#20232d', border: '1px solid rgba(255,255,255,.12)', borderRadius: 6 }}
            formatter={(value, name) => [formatCoins(Number(value)), name === 'stake' ? 'Mises' : 'Paiements']}
          />
          <Bar dataKey="stake" fill="#6974f4" radius={[3, 3, 0, 0]} />
          <Bar dataKey="payout" fill="#3aba85" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BalanceChart({ data }: { data: { date: string; balance: number }[] }) {
  return (
    <div className="h-[250px] w-full" role="img" aria-label="Évolution du solde">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
          <XAxis dataKey="date" tick={axis} tickLine={false} axisLine={false} minTickGap={34} />
          <YAxis tick={axis} tickLine={false} axisLine={false} width={46} tickFormatter={formatInteger} />
          <Tooltip
            contentStyle={{ background: '#20232d', border: '1px solid rgba(255,255,255,.12)', borderRadius: 6 }}
            formatter={value => [formatCoins(Number(value)), 'Solde']}
          />
          <Area type="monotone" dataKey="balance" stroke="#f4c25b" strokeWidth={2.5} fill="#f4c25b" fillOpacity={0.08} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
