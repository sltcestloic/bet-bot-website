import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { formatCoins } from '@/client/features/game/utils/game-formatters'

export function GameTrend({ data, dataKey = 'cumulativeProfit' }: { data: Record<string, string | number>[]; dataKey?: string }) {
  return (
    <div className="mt-4 h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="gameTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7d88ff" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#7d88ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#747b91', fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={28} />
          <YAxis tick={{ fill: '#747b91', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#151824', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, fontSize: 12 }}
            formatter={value => [formatCoins(Number(value)), 'Profit cumulé']}
          />
          <Area type="monotone" dataKey={dataKey} stroke="#8d96ff" strokeWidth={3} fill="url(#gameTrend)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
