export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface Table {
  id: string;
  name: string;
  order: OrderItem[];
  status: 'empty' | 'occupied';
}

export interface CompletedOrder {
  id: string;
  tableId: string;
  tableName: string;
  items: OrderItem[];
  total: number;
  timestamp: Date;
}

export interface DailySummary {
  date: string;
  totalSales: number;
  orderCount: number;
  topProducts: {
    productId: string;
    name: string;
    quantity: number;
    total: number;
  }[];
}