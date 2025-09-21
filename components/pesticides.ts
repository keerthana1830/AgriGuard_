import type { Pesticide } from '../types';

export const pesticides: readonly Pesticide[] = [
  { name: 'Neem Oil Extract', price: 15.99, trend: 'up', unit: 'per liter' },
  { name: 'Spinosad', price: 25.50, trend: 'stable', unit: 'per kg' },
  { name: 'Bacillus Thuringiensis', price: 32.75, trend: 'down', unit: 'per kg' },
  { name: 'Copper Fungicide', price: 19.20, trend: 'up', unit: 'per kg' },
  { name: 'Horticultural Oil', price: 12.00, trend: 'down', unit: 'per liter' },
] as const;
