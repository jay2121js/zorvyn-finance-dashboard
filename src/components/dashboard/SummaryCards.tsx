import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { GroupedTransactions } from '@/data/mockData';
import { useMemo } from 'react';

interface SummaryCardsProps {
  transactions: GroupedTransactions;
}

const SummaryCards = ({ transactions }: SummaryCardsProps) => {
  const { totalBalance, currentIncome, currentExpenses, prevIncome, prevExpenses } = useMemo(() => {
    const keys = Object.keys(transactions);
    const allTransactions = Object.values(transactions).flat();

    const totalBalance =
      allTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) -
      allTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const currentList = transactions[keys[0]] || [];
    const prevList = transactions[keys[1]] || [];

    const currentIncome = currentList.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const currentExpenses = currentList.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const prevIncome = prevList.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const prevExpenses = prevList.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    return { totalBalance, currentIncome, currentExpenses, prevIncome, prevExpenses };
  }, [transactions]);

  const calculateTrend = (current: number, previous: number) =>
    previous === 0 ? 0 : Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;

  const cards = [
    {
      label: 'Total Balance',
      value: totalBalance,
      trend: null,
      sublabel: 'All time',
      icon: Wallet,
      variant: 'primary' as const,
    },
    {
      label: 'Income',
      value: currentIncome,
      trend: calculateTrend(currentIncome, prevIncome),
      sublabel: 'vs last month',
      icon: TrendingUp,
      variant: 'success' as const,
    },
    {
      label: 'Expenses',
      value: currentExpenses,
      trend: calculateTrend(currentExpenses, prevExpenses),
      sublabel: 'vs last month',
      icon: TrendingDown,
      variant: 'destructive' as const,
    },
  ];

  const variantStyles = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    destructive: 'bg-destructive/10 text-destructive',
  };

  const getTrendStyle = (trend: number, variant: 'primary' | 'success' | 'destructive') => {
    if (trend === 0) return 'text-muted-foreground';
    if (variant === 'destructive') return trend > 0 ? 'text-destructive' : 'text-success';
    return trend > 0 ? 'text-success' : 'text-destructive';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isHero = index === 0;

        return (
          <div
            key={card.label}
            className={`min-w-0 rounded-xl bg-card border border-border/50 hover:shadow-md transition-shadow flex flex-col justify-between ${
              // ✅ Hero card is p-6 on mobile, resets to standard p-5 on sm screens
              isHero ? 'col-span-2 sm:col-span-1 p-6 sm:p-5' : 'col-span-1 p-4 sm:p-5'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`${
                // ✅ Larger text on mobile hero, resets to text-sm on sm screens
                isHero ? 'text-base sm:text-sm' : 'text-sm'
              } font-medium text-muted-foreground truncate pr-2`}>
                {card.label}
              </span>
              <div className={`shrink-0 p-2 rounded-lg ${variantStyles[card.variant]}`}>
                {/* ✅ Replaced strict size prop with Tailwind classes for responsive resizing */}
                <Icon className={isHero ? "w-6 h-6 sm:w-4 sm:h-4" : "w-4 h-4"} />
              </div>
            </div>

            {/* ✅ Reset extra margin on desktop */}
            <div className={isHero ? 'mt-2 sm:mt-0' : ''}>
              <p className={`${
                // ✅ Hero is 4xl on mobile, resets to 2xl on desktop. Others start at xl, go to 2xl.
                isHero ? 'text-4xl sm:text-2xl' : 'text-xl sm:text-2xl'
              } font-bold text-card-foreground tabular-nums truncate`}>
                ${card.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>

              <div className="flex flex-wrap items-center gap-1 mt-2">
                {card.trend !== null ? (
                  <>
                    <span className={`font-medium ${isHero ? 'text-sm sm:text-xs' : 'text-xs'} ${getTrendStyle(card.trend, card.variant)}`}>
                      {card.trend > 0 ? '+' : ''}{card.trend}%
                    </span>
                    <span className={`${isHero ? 'text-sm sm:text-xs' : 'text-xs'} text-muted-foreground truncate`}>
                      {card.sublabel}
                    </span>
                  </>
                ) : (
                  <span className={`${isHero ? 'text-sm sm:text-xs' : 'text-xs'} text-muted-foreground`}>
                    {card.sublabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;