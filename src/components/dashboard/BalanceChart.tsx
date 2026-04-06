import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { GroupedTransactions } from '@/data/mockData';

interface BalanceChartProps {
  transactions: GroupedTransactions;
}

const toMonthKey = (date: Date): string => {
  const month = date.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  return `${month}_${date.getFullYear()}`;
};

const SinglePointDisplay = ({ balance, label }: { balance: number; label: string }) => (
  <div className="h-[220px] sm:h-[325px] flex flex-col items-center justify-center gap-3 text-center">
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
      <div className="w-4 h-4 rounded-full bg-primary" />
    </div>
    <div>
      <p className="text-2xl font-bold text-card-foreground">
        ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label} — only 1 entry so far</p>
    </div>
  </div>
);

const BalanceChart = ({ transactions }: BalanceChartProps) => {
  const [view, setView] = useState<'daily' | 'monthly'>('daily');
  const [balanceMode, setBalanceMode] = useState<'running' | 'net'>('running');

  const { dailyData, monthlyData, currentMonthNet, isFallbackMonth, activeMonthlabel } = useMemo(() => {
    const keys = Object.keys(transactions);
    if (keys.length === 0) return { dailyData: [], monthlyData: [], currentMonthNet: 0, isFallbackMonth: false, activeMonthlabel: '' };

    const allTransactions = Object.values(transactions).flat();
    const sorted = [...allTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    if (sorted.length === 0) return { dailyData: [], monthlyData: [], currentMonthNet: 0, isFallbackMonth: false, activeMonthlabel: '' };

    const byMonthKey: Record<string, typeof sorted> = {};
    sorted.forEach((t) => {
      const k = toMonthKey(new Date(t.date));
      if (!byMonthKey[k]) byMonthKey[k] = [];
      byMonthKey[k].push(t);
    });

    const sortedMonthKeys = Object.keys(byMonthKey).sort((a, b) => {
      const parse = (k: string) => new Date(`${k.split('_')[0]} 1, ${k.split('_')[1]}`).getTime();
      return parse(a) - parse(b);
    });

    let runningBalance = 0;
    const monthlyRunningMap: Record<string, number> = {};
    const monthlyNetMap: Record<string, number> = {};

    sortedMonthKeys.forEach((mk) => {
      const txns = byMonthKey[mk];
      const monthNet = txns.reduce(
        (s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0
      );
      txns.forEach((t) => {
        runningBalance += t.type === 'income' ? t.amount : -t.amount;
      });
      const label = new Date(`${mk.split('_')[0]} 1, ${mk.split('_')[1]}`).toLocaleDateString('en-US', {
        month: 'short', year: '2-digit',
      });
      monthlyRunningMap[label] = Math.round(runningBalance * 100) / 100;
      monthlyNetMap[label] = Math.round(monthNet * 100) / 100;
    });

    const monthlyData = Object.entries(monthlyRunningMap).map(([month, runningBal]) => ({
      month,
      balance: runningBal,
      net: monthlyNetMap[month],
    }));

    const currentMonthKey = toMonthKey(new Date());
    const hasCurrentMonth = (transactions[currentMonthKey] || []).length > 0;
    const latestMonthKey = sortedMonthKeys[sortedMonthKeys.length - 1] ?? currentMonthKey;
    const activeMonthKey = hasCurrentMonth ? currentMonthKey : latestMonthKey;

    const activeMonthlabel = (() => {
      const [m, y] = activeMonthKey.split('_');
      return new Date(`${m} 1, ${y}`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    })();

    const activeMonthTransactions = [...(transactions[activeMonthKey] || [])].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const balanceBeforeActiveMonth = sorted
      .filter((t) => toMonthKey(new Date(t.date)) !== activeMonthKey)
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

    let dailyRunning = balanceBeforeActiveMonth;
    let dailyNet = 0;
    const dailyData = activeMonthTransactions.map((t) => {
      const delta = t.type === 'income' ? t.amount : -t.amount;
      dailyRunning += delta;
      dailyNet += delta;
      return {
        date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: Math.round(dailyRunning * 100) / 100,
        net: Math.round(dailyNet * 100) / 100,
      };
    });

    return { dailyData, monthlyData, currentMonthNet: dailyNet, isFallbackMonth: !hasCurrentMonth, activeMonthlabel };
  }, [transactions]);

  const isEmpty = dailyData.length === 0 && monthlyData.length === 0;

  if (isEmpty) {
    return (
      <div className="rounded-xl bg-card p-4 sm:p-5 shadow-sm border border-border/50">
        <h3 className="text-base font-semibold text-card-foreground mb-4">Balance Over Time</h3>
        <div className="h-[220px] sm:h-[260px] flex flex-col items-center justify-center text-muted-foreground space-y-3">
          <div className="w-14 h-14 rounded-full border-[3px] border-dashed border-border/60" />
          <p className="text-sm">No transactions to track yet.</p>
        </div>
      </div>
    );
  }

  const activeData = view === 'daily' ? dailyData : monthlyData;
  const xAxisKey = view === 'daily' ? 'date' : 'month';
  const dataKey = balanceMode === 'running' ? 'balance' : 'net';

  const isSinglePoint = activeData.length === 1;
  const singleValue = isSinglePoint ? (activeData[0] as any)[dataKey] : 0;
  const singleLabel = isSinglePoint
    ? view === 'daily' ? (activeData[0] as any).date : (activeData[0] as any).month
    : '';

  const subtitle =
    view === 'daily'
      ? balanceMode === 'running'
        ? 'Running balance (all time)'
        : `Net ${isFallbackMonth ? `in ${activeMonthlabel}` : 'this month'}: ${currentMonthNet >= 0 ? '+' : '-'}$${Math.abs(currentMonthNet).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      : balanceMode === 'running'
      ? 'Running balance across all months'
      : 'Net change per month';

  return (
    <div className="rounded-xl bg-card p-4 sm:p-5 shadow-sm border border-border/50">

      {/* ── Top bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between mb-1">
        {/* Title row */}
        <div>
          <h3 className="text-base font-semibold text-card-foreground">Balance Over Time</h3>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{subtitle}</p>
        </div>

        {/* Controls — full width on mobile, scrollable if needed */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {/* Balance mode toggle */}
          <div className="flex shrink-0 items-center bg-muted/50 p-1 rounded-lg border border-border/50">
            <button
              onClick={() => setBalanceMode('running')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-md transition-all ${
                balanceMode === 'running'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Running
            </button>
            <button
              onClick={() => setBalanceMode('net')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-md transition-all ${
                balanceMode === 'net'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Net
            </button>
          </div>

          {/* View toggle */}
          <div className="flex shrink-0 items-center bg-muted/50 p-1 rounded-lg border border-border/50">
            <button
              onClick={() => setView('daily')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-md transition-all ${
                view === 'daily'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setView('monthly')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-md transition-all ${
                view === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Months
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      {isSinglePoint ? (
        <SinglePointDisplay balance={singleValue} label={singleLabel} />
      ) : (
        <>
          {view === 'daily' && isFallbackMonth && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-muted/50 border border-border/40">
              <span className="text-xs text-muted-foreground">
                No transactions this month — showing{' '}
                <span className="font-medium text-foreground">{activeMonthlabel}</span>
              </span>
            </div>
          )}

          {/* Chart — shorter on mobile */}
          <div className="h-[220px] sm:h-[325px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeData} margin={{ top: 5, right: 5, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                {balanceMode === 'net' && (
                  <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1.5} strokeDasharray="4 4" />
                )}
                <XAxis
                  dataKey={xAxisKey}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  minTickGap={30}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickFormatter={(v) =>
                    Math.abs(v) >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
                  }
                  tickMargin={4}
                  width={48}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [
                    `${value < 0 ? '-' : ''}$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                    balanceMode === 'running' ? 'Balance' : 'Net',
                  ]}
                />
                <Line
                  key={`${view}-${balanceMode}`}
                  type="monotone"
                  dataKey={dataKey}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default BalanceChart;