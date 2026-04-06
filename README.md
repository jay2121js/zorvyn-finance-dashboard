# Zorvyn Finance Dashboard <sub><a href="https://zorvyn-finance-dashboard-olive.vercel.app/">Live Demo →</a></sub>

Zorvyn is a financial dashboard that lets users track income, expenses, and spending trends across categories. Built as a frontend assessment, it prioritises clarity and usability — not just aesthetics.

Key goals:
- Surface financial position at a glance via summary cards and charts
- Make transaction data easy to explore through search, filters, and sorting
- Demonstrate role-based UI patterns (viewer vs. admin)

---

## Features

**Dashboard**
- Summary cards for balance, income, and expenses
- Balance trend chart (monthly)
- Category breakdown (donut chart)

**Transactions**
- Filterable, sortable table with search
- Fields: date, description, category, type, amount
- Skeleton loading states

**Role-based UI**
- Viewer — read-only access
- Admin — add, edit, and delete transactions

**Insights**
- Highest spending category highlight
- Month-over-month comparisons

---

## Getting Started

```bash
git clone https://github.com/jay2121js/zorvyn-finance-dashboard.git
cd zorvyn-finance-dashboard
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
src/
├── components/
│   ├── charts/         # BalanceChart, SpendingChart
│   ├── dashboard/      # SummaryCards, InsightsPanel
│   └── transactions/   # TransactionsTable, TransactionForm
├── data/
│   └── mockData.ts     # Types, categories, mock transactions
└── utils/
    └── monthKeys.ts    # Month key helpers
```

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Vite | Build tool & dev server |
| shadcn/ui | Base component primitives |
| Recharts | Data visualisation |
| Lucide React | Icons |
