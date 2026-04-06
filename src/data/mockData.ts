export type TransactionType = 'income' | 'expense';

export type Category =
  | 'Salary' | 'Freelance' | 'Food' | 'Transport' | 'Shopping'
  | 'Entertainment' | 'Bills' | 'Health' | 'Investment' | 'Other';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: Category;
  type: TransactionType;
}

export interface GroupedTransactions {
  [key: string]: Transaction[];
}
export type Role = 'viewer' | 'admin';


export const groupedTransactions: GroupedTransactions = {
  mar_2026: [
    { id: 'm1', date: '2026-03-28', description: 'Monthly Salary', amount: 5200, category: 'Salary', type: 'income' },
    { id: 'm2', date: '2026-03-27', description: 'Whole Foods Market', amount: 145.50, category: 'Food', type: 'expense' },
    { id: 'm3', date: '2026-03-26', description: 'Uber to Airport', amount: 38.00, category: 'Transport', type: 'expense' },
    { id: 'm4', date: '2026-03-24', description: 'Freelance Phase 1', amount: 2500, category: 'Freelance', type: 'income' },
    { id: 'm5', date: '2026-03-22', description: 'Electric Bill', amount: 112.00, category: 'Bills', type: 'expense' },
    { id: 'm6', date: '2026-03-20', description: 'Vanguard Dividend', amount: 320, category: 'Investment', type: 'income' },
    { id: 'm7', date: '2026-03-18', description: 'Netflix Subscription', amount: 15.99, category: 'Entertainment', type: 'expense' },
    { id: 'm8', date: '2026-03-15', description: 'Equinox Gym', amount: 180.00, category: 'Health', type: 'expense' },
    { id: 'm9', date: '2026-03-10', description: 'Dinner: Sushi Zen', amount: 92.40, category: 'Food', type: 'expense' },
    { id: 'm10', date: '2026-03-05', description: 'Amazon: Desk Lamp', amount: 45.00, category: 'Shopping', type: 'expense' }
  ],
  feb_2026: [
    { id: 'f1', date: '2026-02-28', description: 'Monthly Salary', amount: 5200, category: 'Salary', type: 'income' },
    { id: 'f2', date: '2026-02-25', description: 'Internet Bill', amount: 79.99, category: 'Bills', type: 'expense' },
    { id: 'f3', date: '2026-02-20', description: 'Grocery Store', amount: 122.30, category: 'Food', type: 'expense' },
    { id: 'f4', date: '2026-02-15', description: 'Valentine\'s Dinner', amount: 210.00, category: 'Food', type: 'expense' },
    { id: 'f5', date: '2026-02-12', description: 'Pharmacy', amount: 28.50, category: 'Health', type: 'expense' },
    { id: 'f6', date: '2026-02-10', description: 'Freelance Logo Design', amount: 600, category: 'Freelance', type: 'income' },
    { id: 'f7', date: '2026-02-05', description: 'Apple One Bundle', amount: 32.95, category: 'Entertainment', type: 'expense' },
    { id: 'f8', date: '2026-02-02', description: 'Geico Insurance', amount: 120.00, category: 'Bills', type: 'expense' }
  ],
  jan_2026: [
    { id: 'j1', date: '2026-01-28', description: 'Monthly Salary', amount: 5200, category: 'Salary', type: 'income' },
    { id: 'j2', date: '2026-01-24', description: 'Gas Station', amount: 52.00, category: 'Transport', type: 'expense' },
    { id: 'j3', date: '2026-01-20', description: 'North Face Jacket', amount: 249.99, category: 'Shopping', type: 'expense' },
    { id: 'j4', date: '2026-01-18', description: 'Movie Tickets', amount: 35.00, category: 'Entertainment', type: 'expense' },
    { id: 'j5', date: '2026-01-15', description: 'Equinox Gym', amount: 180.00, category: 'Health', type: 'expense' },
    { id: 'j6', date: '2026-01-10', description: 'Uber Ride', amount: 15.50, category: 'Transport', type: 'expense' },
    { id: 'j7', date: '2026-01-05', description: 'Performance Bonus', amount: 3000, category: 'Salary', type: 'income' },
    { id: 'j8', date: '2026-01-02', description: 'New Year Brunch', amount: 65.00, category: 'Food', type: 'expense' }
  ],
  dec_2025: [
    { id: 'd1', date: '2025-12-28', description: 'Monthly Salary', amount: 5200, category: 'Salary', type: 'income' },
    { id: 'd2', date: '2025-12-24', description: 'Delta Flight', amount: 450.00, category: 'Transport', type: 'expense' },
    { id: 'd3', date: '2025-12-20', description: 'Holiday Dinner', amount: 125.00, category: 'Food', type: 'expense' },
    { id: 'd4', date: '2025-12-18', description: 'Amazon: Gift Shopping', amount: 412.50, category: 'Shopping', type: 'expense' },
    { id: 'd5', date: '2025-12-15', description: 'Equinox Gym', amount: 180.00, category: 'Health', type: 'expense' },
    { id: 'd6', date: '2025-12-10', description: 'Stock Portfolio Gain', amount: 1100, category: 'Investment', type: 'income' },
    { id: 'd7', date: '2025-12-05', description: 'Spotify Annual', amount: 99.00, category: 'Entertainment', type: 'expense' }
  ],
  nov_2025: [
    { id: 'n1', date: '2025-11-29', description: 'Apple Store: iPad', amount: 799.00, category: 'Shopping', type: 'expense' },
    { id: 'n2', date: '2025-11-28', description: 'Monthly Salary', amount: 5200, category: 'Salary', type: 'income' },
    { id: 'n3', date: '2025-11-24', description: 'Thanksgiving Groceries', amount: 195.00, category: 'Food', type: 'expense' },
    { id: 'n4', date: '2025-11-21', description: 'Equinox Gym', amount: 180.00, category: 'Health', type: 'expense' },
    { id: 'n5', date: '2025-11-15', description: 'Comcast Internet', amount: 79.99, category: 'Bills', type: 'expense' },
    { id: 'n6', date: '2025-11-05', description: 'Freelance: App Design', amount: 1800, category: 'Freelance', type: 'income' }
  ],
  oct_2025: [
    { id: 'o1', date: '2025-10-28', description: 'Monthly Salary', amount: 5200, category: 'Salary', type: 'income' },
    { id: 'o2', date: '2025-10-25', description: 'Halloween Costume', amount: 65.00, category: 'Shopping', type: 'expense' },
    { id: 'o3', date: '2025-10-21', description: 'Equinox Gym', amount: 180.00, category: 'Health', type: 'expense' },
    { id: 'o4', date: '2025-10-15', description: 'Whole Foods Market', amount: 118.40, category: 'Food', type: 'expense' },
    { id: 'o5', date: '2025-10-10', description: 'Electric Bill', amount: 88.00, category: 'Bills', type: 'expense' },
    { id: 'o6', date: '2025-10-02', description: 'Uber Ride', amount: 24.50, category: 'Transport', type: 'expense' }
  ]
};

export const historicalBalance = [
  { month: 'Apr', balance: 9400 },
  { month: 'May', balance: 9800 },
  { month: 'Jun', balance: 10500 },
  { month: 'Jul', balance: 11100 },
  { month: 'Aug', balance: 11800 },
  { month: 'Sep', balance: 12400 },
];

export const categories: Category[] = [
  'Salary', 'Freelance', 'Food', 'Transport', 'Shopping',
  'Entertainment', 'Bills', 'Health', 'Investment', 'Other',
];