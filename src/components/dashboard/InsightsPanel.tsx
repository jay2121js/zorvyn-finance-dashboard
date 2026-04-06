import { Lightbulb, TrendingUp, TrendingDown } from 'lucide-react';
import { GroupedTransactions } from '@/data/mockData';
import { useMemo } from 'react';
import { sortedKeys } from '@/utils/monthKeys';

interface InsightsPanelProps {
  transactions: GroupedTransactions;
}

const InsightsPanel = ({ transactions }: InsightsPanelProps) => {
  const { currentExpenses, prevExpenses, topCategory, changePercent } = useMemo(() => {
    const keys = sortedKeys(transactions);

    const currentList = transactions[keys[0]] || [];
    const prevList = transactions[keys[1]] || [];

    const currentExpenses = currentList.filter(t => t.type === 'expense');
    const prevExpenses = prevList.filter(t => t.type === 'expense');

    const totalCurrent = currentExpenses.reduce((s, t) => s + t.amount, 0);
    const totalPrev = prevExpenses.reduce((s, t) => s + t.amount, 0);

    const byCategory = currentExpenses.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0] ?? null;

    const changePercent =
      totalPrev === 0 ? 0 : Math.round(((totalCurrent - totalPrev) / totalPrev) * 100);

    return { currentExpenses, prevExpenses, topCategory, changePercent };
  }, [transactions]);

  if (currentExpenses.length === 0) {
    return (
      <div className="rounded-xl bg-card p-4 sm:p-5 shadow-sm border border-border/50">
        <h3 className="text-base font-semibold text-card-foreground">Insights</h3>
        <div className="h-40 sm:h-48 flex flex-col items-center justify-center text-muted-foreground space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Lightbulb size={20} className="text-muted-foreground/50" />
          </div>
          <p className="text-sm text-center">Add transactions to generate insights.</p>
        </div>
      </div>
    );
  }

  const insights = [
    {
      icon: TrendingUp,
      title: 'Highest Spending',
      text: topCategory
        ? `${topCategory[0]} at $${topCategory[1].toFixed(2)}`
        : 'No expenses yet',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: changePercent > 0 ? TrendingDown : TrendingUp,
      title: 'Monthly Change',
      text:
        prevExpenses.length === 0
          ? 'No previous month to compare'
          : `${changePercent > 0 ? '+' : ''}${changePercent}% vs last month`,
      color: changePercent > 0 ? 'text-destructive' : 'text-success',
      bg: changePercent > 0 ? 'bg-destructive/10' : 'bg-success/10',
    },
    {
      icon: Lightbulb,
      title: 'Smart Tip',
      text:
        prevExpenses.length === 0
          ? 'Keep tracking your expenses to unlock month-over-month insights.'
          : changePercent > 0
          ? `You spent ${changePercent}% more this month. Consider reviewing your ${topCategory?.[0] ?? ''} expenses.`
          : `Great job! Spending is down ${Math.abs(changePercent)}% compared to last month.`,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ];

  return (
    <div className="rounded-xl h-fit bg-card p-4 sm:p-5 shadow-sm border border-border/50">
      <h3 className="text-base font-semibold text-card-foreground mb-3 sm:mb-4">Insights</h3>

      {/* Stack vertically on mobile, stay vertical on all sizes but tighter spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-3">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div
              key={insight.title}
              className="flex items-start gap-3 rounded-lg p-2.5 sm:p-0 bg-muted/30 sm:bg-transparent"
            >
              <div className={`p-2 rounded-lg shrink-0 ${insight.bg} ${insight.color}`}>
                <Icon size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-card-foreground leading-tight">
                  {insight.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  {insight.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InsightsPanel;