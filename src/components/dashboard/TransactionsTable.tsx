import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Search, ArrowUpDown, Plus, Pencil, Trash2,
  MoreHorizontal, TrendingUp, TrendingDown, SlidersHorizontal, X,
} from 'lucide-react';
import {
  Transaction, Category, categories, TransactionType, GroupedTransactions,
} from '@/data/mockData';
import { Input }  from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label }      from '@/components/ui/label';
import type { Role }  from '@/data/mockData';
import { sortedKeys } from '@/utils/monthKeys';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TransactionsTableProps {
  transactions: GroupedTransactions;
  role: Role;
  onAdd:    (t: Omit<Transaction, 'id'>) => Promise<void>;
  onUpdate: (t: Transaction)             => Promise<void>;
  onDelete: (id: string)                 => Promise<void>;
}

type SortKey = 'date' | 'amount';

interface FormState {
  desc:     string;
  amount:   string;
  date:     string;
  category: Category;
  type:     TransactionType;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SORT_KEYS: SortKey[] = ['date', 'amount'];

const EMPTY_FORM: FormState = {
  desc:     '',
  amount:   '',
  date:     new Date().toISOString().split('T')[0],
  category: 'Other',
  type:     'expense',
};

// ─────────────────────────────────────────────────────────────────────────────
// Formatting helpers
// ─────────────────────────────────────────────────────────────────────────────

const fmt = {
  amount:    (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  dateLong:  (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  dateShort: (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Class name helpers
// ─────────────────────────────────────────────────────────────────────────────

const amountClass = (isIncome: boolean) =>
  isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500';

const netClass = (net: number) =>
  net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500';

// ─────────────────────────────────────────────────────────────────────────────
// Hook — click-outside (capture phase so inner stopPropagation is safe)
// ─────────────────────────────────────────────────────────────────────────────

function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    const onEvent = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    };
    document.addEventListener('mousedown', onEvent, true);
    document.addEventListener('touchstart', onEvent, true);
    return () => {
      document.removeEventListener('mousedown', onEvent, true);
      document.removeEventListener('touchstart', onEvent, true);
    };
  }, [ref, handler, enabled]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook — filters, sort, and derived totals
// ─────────────────────────────────────────────────────────────────────────────

function useFilters(transactions: GroupedTransactions) {
  const [search,         setSearch]         = useState('');
  const [typeFilter,     setTypeFilter]     = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all');
  const [monthFilter,    setMonthFilter]    = useState<string>('all');
  const [sortKey,        setSortKey]        = useState<SortKey>('date');
  const [sortDir,        setSortDir]        = useState<'asc' | 'desc'>('desc');

  // Default to most recent month on mount / data change
  useEffect(() => {
    const keys = sortedKeys(transactions);
    if (keys.length > 0 && monthFilter === 'all') setMonthFilter(keys[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);

  const availableMonths = useMemo(() =>
    sortedKeys(transactions).map(key => {
      const [month, year] = key.split('_');
      const label = `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
      return { value: key, label };
    }),
  [transactions]);

  const filtered = useMemo(() => {
    let list: Transaction[] =
      monthFilter === 'all'
        ? Object.values(transactions).flat()
        : [...(transactions[monthFilter] ?? [])];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
      );
    }
    if (typeFilter     !== 'all') list = list.filter(t => t.type     === typeFilter);
    if (categoryFilter !== 'all') list = list.filter(t => t.category === categoryFilter);

    return list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      return sortKey === 'date'
        ? dir * (new Date(a.date).getTime() - new Date(b.date).getTime())
        : dir * (a.amount - b.amount);
    });
  }, [transactions, monthFilter, search, typeFilter, categoryFilter, sortKey, sortDir]);

  const totals = useMemo(() => {
    const income   = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expenses, net: income - expenses };
  }, [filtered]);

  const toggleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }, [sortKey]);

  const activeFilterCount =
    (typeFilter !== 'all' ? 1 : 0) +
    (categoryFilter !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('all');
  };

  return {
    search, setSearch,
    typeFilter, setTypeFilter,
    categoryFilter, setCategoryFilter,
    monthFilter, setMonthFilter,
    sortKey, sortDir, toggleSort,
    availableMonths, filtered, totals,
    activeFilterCount, clearFilters,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RowActionMenu
// ─────────────────────────────────────────────────────────────────────────────

const menuItemBase = 'flex items-center gap-2.5 w-full px-3 py-2.5 text-sm transition-colors text-left';

function RowActionMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div ref={ref} className="relative flex items-center justify-center">
      <button
        aria-label="Row actions"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen(v => !v)}
        className="
          flex items-center justify-center w-8 h-8 rounded-lg
          text-muted-foreground hover:text-foreground hover:bg-muted
          transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        "
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <div
          role="menu"
          className="
            absolute right-0 top-[calc(100%+4px)] z-30
            bg-popover border border-border rounded-xl shadow-xl
            min-w-[128px] py-1 overflow-hidden
            animate-in fade-in-0 zoom-in-95 duration-100
          "
        >
          <button
            role="menuitem"
            onClick={() => { onEdit(); setOpen(false); }}
            className={`${menuItemBase} hover:bg-muted`}
          >
            <Pencil size={13} className="shrink-0 text-muted-foreground" />
            Edit
          </button>

          <div className="h-px bg-border/60 mx-2" />

          <button
            role="menuitem"
            onClick={() => { onDelete(); setOpen(false); }}
            className={`${menuItemBase} text-destructive hover:bg-destructive/10`}
          >
            <Trash2 size={13} className="shrink-0" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SortButton
// ─────────────────────────────────────────────────────────────────────────────

function SortButton({
  label, sortKey, activeKey, dir, onToggle, align = 'left',
}: {
  label:     string;
  sortKey:   SortKey;
  activeKey: SortKey;
  dir:       'asc' | 'desc';
  onToggle:  (k: SortKey) => void;
  align?:    'left' | 'right';
}) {
  const isActive = sortKey === activeKey;

  return (
    <button
      onClick={() => onToggle(sortKey)}
      className={`
        flex items-center gap-1 text-xs font-medium uppercase tracking-wide
        hover:text-foreground transition-colors
        ${align === 'right' ? 'ml-auto' : ''}
        ${isActive ? 'text-foreground' : 'text-muted-foreground'}
      `}
    >
      {label}
      <ArrowUpDown
        size={11}
        className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}
      />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TransactionRow
// ─────────────────────────────────────────────────────────────────────────────

function TransactionRow({
  t, role, onEdit, onDelete,
}: {
  t:        Transaction;
  role:     Role;
  onEdit:   (t: Transaction) => void;
  onDelete: (id: string)     => void;
}) {
  const isIncome = t.type === 'income';
  const sign     = isIncome ? '+' : '−';
  const color    = amountClass(isIncome);

  return (
    <li className="group border-b border-border/30 last:border-b-0 hover:bg-muted/40 transition-colors">

      {/* Mobile layout */}
      <div className="md:hidden flex gap-3 px-4 py-3.5">
        <span
          aria-hidden
          className={`mt-0.5 w-1 self-stretch rounded-full shrink-0 ${isIncome ? 'bg-emerald-500' : 'bg-red-400'}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-medium text-foreground truncate leading-tight">
              {t.description}
            </span>
            <span className={`text-sm font-bold tabular-nums shrink-0 ${color}`}>
              {sign}${fmt.amount(t.amount)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[11px] text-muted-foreground shrink-0">
              {fmt.dateShort(t.date)}
            </span>
            <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/40 shrink-0" />
            <span className="text-[11px] bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground leading-none truncate">
              {t.category}
            </span>
            {role === 'admin' && (
              <span className="ml-auto shrink-0">
                <RowActionMenu onEdit={() => onEdit(t)} onDelete={() => onDelete(t.id)} />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex items-center text-sm">
        <span className="w-[150px] shrink-0 px-5 py-3.5 text-muted-foreground whitespace-nowrap">
          {fmt.dateLong(t.date)}
        </span>
        <span className="flex-1 min-w-0 pl-10 py-3.5 font-medium text-foreground truncate">
          {t.description}
        </span>
        <span className="w-[160px] shrink-0 pr-4 py-3.5">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-muted text-muted-foreground font-medium">
            {t.category}
          </span>
        </span>
        <span className={`w-[130px] shrink-0 px-5 py-3.5 text-right font-semibold tabular-nums ${color}`}>
          {sign}${fmt.amount(t.amount)}
        </span>
        {role === 'admin' && (
          <span className="w-14 shrink-0 pr-2 py-2 flex items-center justify-center">
            <RowActionMenu onEdit={() => onEdit(t)} onDelete={() => onDelete(t.id)} />
          </span>
        )}
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TransactionForm
// ─────────────────────────────────────────────────────────────────────────────

function TransactionForm({
  open, editId, initial, onSave, onClose,
}: {
  open:    boolean;
  editId:  string | null;
  initial: FormState;
  onSave:  (state: FormState) => void;
  onClose: () => void;
}) {
  const [state, setState] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) { setState(initial); setError(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setError(null);
    if (!state.desc.trim())                             { setError('Please enter a description.'); return; }
    if (!state.amount || parseFloat(state.amount) <= 0) { setError('Please enter a valid amount.'); return; }
    if (!state.date)                                    { setError('Please select a date.'); return; }
    onSave(state);
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl p-5 sm:p-6 gap-0">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-base font-semibold">
            {editId ? 'Edit Transaction' : 'New Transaction'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Description
            </Label>
            <Input
              value={state.desc}
              onChange={e => set('desc', e.target.value)}
              placeholder="e.g. Monthly rent"
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  $
                </span>
                <Input
                  type="number" min="0" step="0.01"
                  value={state.amount}
                  onChange={e => set('amount', e.target.value)}
                  placeholder="0.00"
                  className="h-10 pl-7"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Date
              </Label>
              <Input
                type="date"
                value={state.date}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => set('date', e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Type
              </Label>
              <Select value={state.type} onValueChange={v => set('type', v as TransactionType)}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Category
              </Label>
              <Select value={state.category} onValueChange={v => set('category', v as Category)}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2.5 rounded-lg font-medium">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1 h-10" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1 h-10" onClick={handleSave}>
              {editId ? 'Save Changes' : 'Add Transaction'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TransactionsTable
// ─────────────────────────────────────────────────────────────────────────────

const TransactionsTable = ({ transactions, role, onAdd, onUpdate, onDelete }: TransactionsTableProps) => {
  const filters = useFilters(transactions);

  const [dialogOpen,  setDialogOpen]  = useState(false);
  const [deleteId,    setDeleteId]    = useState<string | null>(null);
  const [editId,      setEditId]      = useState<string | null>(null);
  const [formInitial, setFormInitial] = useState<FormState>(EMPTY_FORM);
  const [filterOpen,  setFilterOpen]  = useState(false);

  const openAdd = () => {
    setEditId(null);
    setFormInitial({ ...EMPTY_FORM, date: new Date().toISOString().split('T')[0] });
    setDialogOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditId(t.id);
    setFormInitial({
      desc:     t.description,
      amount:   t.amount.toString(),
      date:     t.date,
      category: t.category,
      type:     t.type,
    });
    setDialogOpen(true);
  };

  const handleSave = (state: FormState) => {
    const payload = {
      date:        state.date,
      description: state.desc.trim(),
      amount:      parseFloat(state.amount),
      category:    state.category,
      type:        state.type,
    };

    if (editId) {
      onUpdate({ id: editId, ...payload });
    } else {
      const month = new Date(state.date)
        .toLocaleString('en-US', { month: 'short' })
        .toLowerCase();
      filters.setMonthFilter(`${month}_${new Date(state.date).getFullYear()}`);
      onAdd(payload);
    }

    setDialogOpen(false);
  };

  const { filtered, totals } = filters;

  const summaryItems = [
    { label: 'Income',   value: totals.income,          color: amountClass(true),       icon: TrendingUp,   sign: '+' },
    { label: 'Expenses', value: totals.expenses,        color: amountClass(false),      icon: TrendingDown, sign: '−' },
    { label: 'Net',      value: Math.abs(totals.net),   color: netClass(totals.net),    icon: null,         sign: totals.net >= 0 ? '+' : '−' },
  ] as const;

  return (
    <div className="flex flex-col rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-border/50 space-y-3">

        {/* Title + controls */}
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            Transactions
            {filtered.length > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({filtered.length})
              </span>
            )}
          </h3>

          <div className="flex items-center gap-2">
            {/* Filter toggle (mobile only) */}
            <button
              onClick={() => setFilterOpen(v => !v)}
              className={`
                md:hidden relative flex items-center justify-center w-8 h-8 rounded-lg border transition-colors
                ${filterOpen || filters.activeFilterCount > 0
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'}
              `}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal size={14} />
              {filters.activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {filters.activeFilterCount}
                </span>
              )}
            </button>

            {role === 'admin' && (
              <Button size="sm" className="h-8 gap-1.5 shrink-0 text-xs" onClick={openAdd}>
                <Plus size={13} />
                <span>Add</span>
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9 h-9 text-sm pr-9"
            placeholder="Search transactions…"
            value={filters.search}
            onChange={e => filters.setSearch(e.target.value)}
          />
          {filters.search && (
            <button
              onClick={() => filters.setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters — always visible on md+, collapsible on mobile */}
        <div className={`flex-col gap-2 md:flex ${filterOpen ? 'flex' : 'hidden'} md:flex-row md:flex-wrap md:items-center`}>
          <Select value={filters.monthFilter} onValueChange={filters.setMonthFilter}>
            <SelectTrigger className="h-8 md:w-[150px] text-xs">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              {filters.availableMonths.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.typeFilter} onValueChange={v => filters.setTypeFilter(v as 'all' | TransactionType)}>
            <SelectTrigger className="h-8 md:w-[130px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.categoryFilter} onValueChange={v => filters.setCategoryFilter(v as 'all' | Category)}>
            <SelectTrigger className="h-8 md:w-[160px] text-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          {filters.activeFilterCount > 0 && (
            <button
              onClick={filters.clearFilters}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors h-8 px-2"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Column headers — desktop only */}
      <div className="hidden md:flex items-center bg-muted/20 border-b border-border/40">
        <span className="w-[150px] shrink-0 px-5 py-2.5">
          <SortButton label="Date" sortKey="date" activeKey={filters.sortKey} dir={filters.sortDir} onToggle={filters.toggleSort} />
        </span>
        <span className="flex-1 pl-10 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Description
        </span>
        <span className="w-[160px] shrink-0 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Category
        </span>
        <span className="w-[130px] shrink-0 px-5 py-2.5 flex justify-end">
          <SortButton label="Amount" sortKey="amount" activeKey={filters.sortKey} dir={filters.sortDir} onToggle={filters.toggleSort} align="right" />
        </span>
        {role === 'admin' && <span className="w-14 shrink-0" />}
      </div>

      {/* Sort bar — mobile only */}
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/10 border-b border-border/30 md:hidden">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">Sort</span>
        {SORT_KEYS.map(key => (
          <button
            key={key}
            onClick={() => filters.toggleSort(key)}
            className={`
              flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors
              ${filters.sortKey === key
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'}
            `}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
            <ArrowUpDown size={10} />
          </button>
        ))}
        <span className="ml-auto text-[11px] text-muted-foreground">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Transaction list */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Search size={20} className="opacity-40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">No transactions found</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Try adjusting your filters</p>
            </div>
            {(filters.search || filters.activeFilterCount > 0) && (
              <button onClick={filters.clearFilters} className="text-xs text-primary hover:underline mt-1">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <ul>
            {filtered.map(t => (
              <TransactionRow
                key={t.id}
                t={t}
                role={role}
                onEdit={openEdit}
                onDelete={id => setDeleteId(id)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Totals footer */}
      {filtered.length > 0 && (
        <div className="border-t border-border/50 bg-muted/20 px-4 sm:px-5 py-3.5">

          {/* Mobile — stacked cards */}
          <div className="md:hidden space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
              Period Summary
            </p>
            <div className="grid grid-cols-3 gap-2">
              {summaryItems.map(({ label, value, color, icon: Icon, sign }) => (
                <div key={label} className="flex flex-col gap-0.5 bg-card rounded-xl px-3 py-2.5 border border-border/40">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    {Icon && <Icon size={10} />}
                    {label}
                  </span>
                  <span className={`text-sm font-bold tabular-nums ${color}`}>
                    {sign}${fmt.amount(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop — inline row */}
          <div className="hidden md:flex items-center justify-end gap-6">
            <span className="text-xs font-medium text-muted-foreground mr-auto">
              Showing {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
            </span>

            {totals.income > 0 && (
              <div className="flex items-center gap-2">
                <TrendingUp size={13} className="text-emerald-500" />
                <span className="text-xs text-muted-foreground">Income</span>
                <span className={`text-sm font-semibold tabular-nums ${amountClass(true)}`}>
                  +${fmt.amount(totals.income)}
                </span>
              </div>
            )}

            {totals.expenses > 0 && (
              <>
                <div className="h-4 w-px bg-border/50" />
                <div className="flex items-center gap-2">
                  <TrendingDown size={13} className="text-red-400" />
                  <span className="text-xs text-muted-foreground">Expenses</span>
                  <span className={`text-sm font-semibold tabular-nums ${amountClass(false)}`}>
                    −${fmt.amount(totals.expenses)}
                  </span>
                </div>
              </>
            )}

            <div className="h-4 w-px bg-border/50" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Net</span>
              <span className={`text-base font-bold tabular-nums ${netClass(totals.net)}`}>
                {totals.net < 0 ? '−' : '+'}${fmt.amount(Math.abs(totals.net))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit dialog */}
      <TransactionForm
        open={dialogOpen}
        editId={editId}
        initial={formInitial}
        onSave={handleSave}
        onClose={() => setDialogOpen(false)}
      />

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Delete Transaction</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-relaxed pt-1 pb-2">
            This action is permanent and cannot be undone. Are you sure?
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-10" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 h-10"
              onClick={() => { if (deleteId) { onDelete(deleteId); setDeleteId(null); } }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionsTable;