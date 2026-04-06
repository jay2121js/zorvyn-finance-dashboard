// src/services/transactionService.ts
import { groupedTransactions } from '@/data/mockData';
import type { GroupedTransactions, Transaction } from '@/data/mockData';

const STORAGE_KEY = 'finance_transactions';

// ── Helpers ────────────────────────────────────────────────────────────────────

const getMonthKey = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  return `${month}_${date.getFullYear()}`;
};

const loadFromStorage = (): GroupedTransactions | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveToStorage = (data: GroupedTransactions): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.error('Failed to save to localStorage');
  }
};

// ── Public API ─────────────────────────────────────────────────────────────────

// Fetch: returns localStorage data if it exists, otherwise seeds from mockData
export async function fetchTransactions(): Promise<GroupedTransactions> {
  await new Promise((res) => setTimeout(res, 500)); // simulated latency
  return loadFromStorage() ?? groupedTransactions;
}

// Add: inserts into correct month key and persists
export async function addTransaction(
  data: GroupedTransactions,
  transaction: Omit<Transaction, 'id'>
): Promise<GroupedTransactions> {
  const key = getMonthKey(transaction.date);
  const newTransaction: Transaction = { ...transaction, id: String(Date.now()) };

  const updated: GroupedTransactions = {
    ...data,
    [key]: [newTransaction, ...(data[key] || [])],
  };

  saveToStorage(updated);
  return updated;
};

// Update: finds and replaces transaction across all month keys
export async function updateTransaction(
  data: GroupedTransactions,
  updated: Transaction
): Promise<GroupedTransactions> {
  const newData = { ...data };
  Object.keys(newData).forEach((key) => {
    newData[key] = newData[key].map((t) => (t.id === updated.id ? updated : t));
  });
  saveToStorage(newData);
  return newData;
}

// Delete: removes transaction across all month keys
export async function deleteTransaction(
  data: GroupedTransactions,
  id: string
): Promise<GroupedTransactions> {
  const newData = { ...data };
  Object.keys(newData).forEach((key) => {
    newData[key] = newData[key].filter((t) => t.id !== id);
    // clean up empty month keys
    if (newData[key].length === 0) delete newData[key];
  });
  saveToStorage(newData);
  return newData;
}

// Reset: wipes localStorage and reseeds from mockData (useful for dev/testing)
export function resetTransactions(): void {
  localStorage.removeItem(STORAGE_KEY);
}