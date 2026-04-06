import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { GroupedTransactions } from '@/data/mockData';
import { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sortedKeys } from '@/utils/monthKeys';

interface SpendingChartProps {
  transactions: GroupedTransactions;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
];

type RangeOption = '1' | '3' | '6' | 'all';

const RANGE_LABELS: Record<RangeOption, string> = {
  '1': 'This Month',
  '3': 'Last 3 Months',
  '6': 'Last 6 Months',
  'all': 'All Time',
};

const toMonthKey = (date: Date): string => {
  const month = date.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  return `${month}_${date.getFullYear()}`;
};

const SpendingChart = ({ transactions }: SpendingChartProps) => {
  const [range, setRange] = useState<RangeOption>('1');

  const { data, total, rangeLabel } = useMemo(() => {
    const keys = sortedKeys(transactions);

    const currentMonthKey = toMonthKey(new Date());
    const currentIdx = keys.indexOf(currentMonthKey);

    let selectedKeys: string[];
    if (range === 'all') {
      selectedKeys = keys;
    } else {
      const count = parseInt(range);
      const startIdx = currentIdx !== -1 ? currentIdx : 0;
      selectedKeys = keys.slice(startIdx, startIdx + count);
    }

    const expenses = selectedKeys.flatMap(key =>
      (transactions[key] || []).filter(t => t.type === 'expense')
    );

    const byCategory = expenses.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    const data = Object.entries(byCategory)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);

    const total = data.reduce((s, d) => s + d.value, 0);

    const fmt = (key: string) => {
      const [m, y] = key.split('_');
      return `${m.charAt(0).toUpperCase() + m.slice(1)} ${y}`;
    };
    const newestKey = selectedKeys[0];
    const oldestKey = selectedKeys[selectedKeys.length - 1];
    const rangeLabel =
      oldestKey && newestKey && oldestKey !== newestKey
        ? `${fmt(oldestKey)} – ${fmt(newestKey)}`
        : newestKey
        ? fmt(newestKey)
        : '';

    return { data, total, rangeLabel };
  }, [transactions, range]);

  return (
    <div className="rounded-xl bg-card p-4 sm:p-5 shadow-sm border border-border/50">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-base font-semibold text-card-foreground leading-tight">
          Spending by Category
        </h3>
        <Select value={range} onValueChange={(v) => setRange(v as RangeOption)}>
          {/* Wider tap target on mobile, fixed width on sm+ */}
          <SelectTrigger className="h-8 w-[120px] sm:w-[130px] text-xs shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(RANGE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value} className="text-xs">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {rangeLabel && (
        <p className="text-xs text-muted-foreground -mt-2 mb-3">{rangeLabel}</p>
      )}

      {data.length === 0 ? (
        <div className="h-[220px] sm:h-[250px] flex flex-col items-center justify-center text-muted-foreground space-y-3">
          <div className="w-14 h-14 rounded-full border-[3px] border-dashed border-border/80" />
          <p className="text-sm">No expenses to analyze yet.</p>
        </div>
      ) : (
        <>
          {/* ── Pie chart — tighter on mobile ── */}
          <div className="h-[180px] sm:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* ── Legend — 1 col on very small, 2 col otherwise ── */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3">
            {data.slice(0, 6).map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 min-w-0 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-muted-foreground truncate">{item.name}</span>
                <span className="ml-auto pl-1 font-medium text-card-foreground shrink-0">
                  {((item.value / total) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>

          {/* ── Total row ── */}
          <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Total Expenses</span>
            <span className="font-semibold text-card-foreground tabular-nums">
              ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default SpendingChart;