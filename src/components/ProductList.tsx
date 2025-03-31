import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductListProps {
  products: Product[];
  onAddToOrder: (product: Product) => void;
  disabled?: boolean;
}

export function ProductList({ products, onAddToOrder, disabled }: ProductListProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {products.map((product) => (
        <div
          key={product.id}
          className={`bg-white rounded-lg shadow-md p-4 transform transition-all duration-200 ${
            disabled ? 'opacity-50' : 'hover:scale-105 hover:shadow-lg'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <span className="text-green-600 font-medium">₺{product.price.toFixed(2)}</span>
          </div>
          <div className="text-sm text-gray-500 mb-3">{product.category}</div>
          <button
            onClick={() => onAddToOrder(product)}
            disabled={disabled}
            className="w-full bg-blue-500 text-white rounded-md py-2 flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            <span>Add to Order</span>
          </button>
        </div>
      ))}
    </div>
  );
}