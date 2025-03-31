import { Product, Table } from './types';

export const initialProducts: Product[] = [
  { id: '1', name: 'Espresso', price: 3.50, category: 'Coffee' },
  { id: '2', name: 'Latte', price: 4.50, category: 'Coffee' },
  { id: '3', name: 'Cappuccino', price: 4.00, category: 'Coffee' },
  { id: '4', name: 'Green Tea', price: 3.00, category: 'Tea' },
  { id: '5', name: 'Cheesecake', price: 6.00, category: 'Dessert' },
  { id: '6', name: 'Croissant', price: 3.50, category: 'Bakery' },
];

export const initialTables: Table[] = [
  { id: '1', name: 'Table 1', order: [], status: 'empty' },
  { id: '2', name: 'Table 2', order: [], status: 'empty' },
  { id: '3', name: 'Table 3', order: [], status: 'empty' },
  { id: '4', name: 'Table 4', order: [], status: 'empty' },
  { id: '5', name: 'Table 5', order: [], status: 'empty' },
  { id: '6', name: 'Table 6', order: [], status: 'empty' },
];