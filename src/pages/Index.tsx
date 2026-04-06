import { useState, useEffect } from 'react';
import { type Transaction, type Role, type GroupedTransactions } from '@/data/mockData';
import SummaryCards from '@/components/dashboard/SummaryCards';
import BalanceChart from '@/components/dashboard/BalanceChart';
import SpendingChart from '@/components/dashboard/SpendingChart';
import TransactionsTable from '@/components/dashboard/TransactionsTable';
import InsightsPanel from '@/components/dashboard/InsightsPanel';
import RoleSwitcher from '@/components/dashboard/RoleSwitcher';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import { Button } from '@/components/ui/button';
import {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  resetTransactions,
} from '@/services/transactionService';

// above the Index component
const Header = ({ role, onRoleChange }: { role: Role; onRoleChange: (r: Role) => void }) => (
  <header className="border-b border-border/50 bg-card sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="h-14 flex items-center justify-between gap-2 sm:gap-3">

        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-border/50 bg-muted flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" className="text-muted-foreground">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
              <path d="M6 8h4M6 11h8" />
            </svg>
          </div>
          <div className="min-w-0">
            {/* Short name on mobile, full on sm+ */}
            <p className="text-[13px] sm:text-sm font-medium text-foreground leading-tight truncate">
              <span className="sm:hidden font-bold">Finance</span>
              <span className="hidden font-bold sm:inline">Finance Dashboard</span>
            </p>
            <p className="text-[11px] text-muted-foreground leading-tight hidden sm:block">
              Track your financial health
            </p>
          </div>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {import.meta.env.DEV && (
            <>
              <button
                className="text-[11px] sm:text-xs text-muted-foreground border border-border/50 rounded-md px-2 sm:px-2.5 py-1 sm:py-1.5 hover:bg-muted transition-colors"
                onClick={() => { resetTransactions(); window.location.reload(); }}
              >
                <span className="sm:hidden">Reset</span>
                <span className="hidden sm:inline">Reset data</span>
              </button>
              <div className="hidden sm:block w-px h-5 bg-border/50" />
            </>
          )}
          <RoleSwitcher role={role} onRoleChange={onRoleChange} />
        </div>

      </div>
    </div>
  </header>
);
const Index = () => {
  const [data, setData] = useState<GroupedTransactions>({});
  const [role, setRole] = useState<Role>(() => {
  return (localStorage.getItem('dashboard_role') as Role) ?? 'admin';
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetchTransactions()
      .then(setData)
      .catch(() => setError('Failed to load transactions.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
  localStorage.setItem('dashboard_role', role);
}, [role]);




  const handleAdd = async (t: Omit<Transaction, 'id'>) => {
    try {
      const updated = await addTransaction(data, t);
      setData(updated);
    } catch {
      console.error('Failed to add transaction.'); // or a toast
    }
  };

  const handleUpdate = async (updated: Transaction) => {
    try {
      const newData = await updateTransaction(data, updated);
      setData(newData);
    } catch {
      console.error('Failed to update transaction.'); // or a toast
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const newData = await deleteTransaction(data, id);
      setData(newData);
    } catch {
      console.error('Failed to delete transaction.'); // or a toast
    }
  };

  // ── Header extracted to avoid redeclaring on every render ──────────────────


  if (error) return (
    <div className="min-h-screen bg-background">
      <Header role={role} onRoleChange={setRole} />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] gap-3 text-muted-foreground">
        <p className="text-destructive font-medium">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header role={role} onRoleChange={setRole} />
      <main className="min-h-[calc(100vh-65px)]">
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-500">
            <SummaryCards transactions={data} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2"><BalanceChart transactions={data} /></div>
              <div><SpendingChart transactions={data} /></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TransactionsTable
                  transactions={data}
                  role={role}
                  onAdd={handleAdd}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              </div>
              <InsightsPanel transactions={data} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;