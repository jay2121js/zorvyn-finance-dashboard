import { GroupedTransactions } from '@/data/mockData';

/**
 * Returns transaction keys sorted newest → oldest (e.g. ['apr_2026', 'mar_2026', ...])
 * Always use this instead of Object.keys(transactions) to guarantee correct order
 * regardless of insertion order or data source.
 */
export const sortedKeys = (transactions: GroupedTransactions): string[] =>
  Object.keys(transactions).sort((a, b) => {
    const parse = (k: string) =>
      new Date(`${k.split('_')[0]} 1, ${k.split('_')[1]}`).getTime();
    return parse(b) - parse(a); // newest first
  });