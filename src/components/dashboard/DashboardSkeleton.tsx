

const Shimmer = ({ className }: { className?: string }) => (
  <div
    className={`relative overflow-hidden bg-muted rounded-md before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent ${className}`}
  />
);

// ─── Summary Cards (4 cards across) ───────────────────────────────────────────
const SummaryCardsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="rounded-xl bg-card border border-border/50 p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-8 w-8 rounded-lg" />
        </div>
        <Shimmer className="h-7 w-32" />
        <Shimmer className="h-3 w-20" />
      </div>
    ))}
  </div>
);

// ─── Balance Chart (wide) ──────────────────────────────────────────────────────
const BalanceChartSkeleton = () => (
  <div className="rounded-xl bg-card border border-border/50 p-5 shadow-sm space-y-4">
    <div className="flex items-center justify-between">
      <Shimmer className="h-5 w-32" />
      <Shimmer className="h-8 w-28 rounded-md" />
    </div>
    {/* Fake bar chart */}
    <div className="flex items-end gap-2 h-40 pt-4">
      {[65, 45, 80, 55, 70, 40, 90, 60, 75, 50, 85, 45].map((h, i) => (
        <Shimmer key={i} className="flex-1 rounded-t-sm" />
      ))}
    </div>
    {/* X-axis labels */}
    <div className="flex gap-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <Shimmer key={i} className="flex-1 h-3" />
      ))}
    </div>
  </div>
);

// ─── Spending Chart (narrow) ───────────────────────────────────────────────────
const SpendingChartSkeleton = () => (
  <div className="rounded-xl bg-card border border-border/50 p-5 shadow-sm space-y-4">
    <Shimmer className="h-5 w-36" />
    {/* Fake donut */}
    <div className="flex justify-center py-2">
      <div className="relative h-36 w-36">
        <div className="absolute inset-0 rounded-full border-[20px] border-muted animate-pulse" />
        <div className="absolute inset-[20px] rounded-full bg-card" />
      </div>
    </div>
    {/* Legend items */}
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Shimmer className="h-3 w-3 rounded-full shrink-0" />
          <Shimmer className="h-3 flex-1" />
          <Shimmer className="h-3 w-10" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Transactions Table ────────────────────────────────────────────────────────
const TransactionsTableSkeleton = () => (
  <div className="rounded-xl bg-card border border-border/50 shadow-sm">
    {/* Header controls */}
    <div className="p-5 border-b border-border/50 space-y-3">
      <div className="flex items-center justify-between">
        <Shimmer className="h-5 w-28" />
        <Shimmer className="h-8 w-16 rounded-md" />
      </div>
      <div className="flex gap-2">
        <Shimmer className="h-9 flex-1 rounded-md" />
        <Shimmer className="h-9 w-32 rounded-md" />
        <Shimmer className="h-9 w-28 rounded-md" />
      </div>
    </div>
    {/* Table header */}
    <div className="px-5 py-3 border-b border-border/50 grid grid-cols-4 gap-4">
      {['w-12', 'w-24', 'w-20', 'w-16'].map((w, i) => (
        <Shimmer key={i} className={`h-3 ${w}`} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: 7 }).map((_, i) => (
      <div key={i} className="px-5 py-4 border-b border-border/30 grid grid-cols-4 gap-4 items-center">
        <Shimmer className="h-3 w-20" />
        <Shimmer className={`h-3 ${i % 3 === 0 ? 'w-36' : i % 2 === 0 ? 'w-28' : 'w-44'}`} />
        <Shimmer className="h-5 w-16 rounded-md" />
        <Shimmer className="h-4 w-16 ml-auto" />
      </div>
    ))}
  </div>
);

// ─── Insights Panel ────────────────────────────────────────────────────────────
const InsightsPanelSkeleton = () => (
  <div className="rounded-xl bg-card border border-border/50 p-5 shadow-sm space-y-4">
    <Shimmer className="h-5 w-24" />
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-2 p-3 rounded-lg bg-muted/40">
        <Shimmer className="h-3 w-32" />
        <Shimmer className={`h-3 ${i % 2 === 0 ? 'w-full' : 'w-4/5'}`} />
        <Shimmer className="h-3 w-3/4" />
      </div>
    ))}
  </div>
);

// ─── Composed full-page skeleton ───────────────────────────────────────────────
const DashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-300">
    <SummaryCardsSkeleton />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <BalanceChartSkeleton />
      </div>
      <div>
        <SpendingChartSkeleton />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <TransactionsTableSkeleton />
      </div>
      <div>
        <InsightsPanelSkeleton />
      </div>
    </div>
  </div>
);

export default DashboardSkeleton;