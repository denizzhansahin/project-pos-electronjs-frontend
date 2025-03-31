import React from 'react';
import { Trash2, Receipt } from 'lucide-react';
import { OrderItem } from '../types';
import io, { Socket } from 'socket.io-client';

interface OrderPanelProps {
  items: OrderItem[];
  onUpdateQuantity: (productId: string, change: number) => void;
  onRemoveItem: (productId: string) => void;
  onCompleteOrder: () => void;
  tableName?: string;
}

export function OrderPanel({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCompleteOrder,
  tableName,
}: OrderPanelProps) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (!tableName) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 h-full flex flex-col items-center justify-center text-gray-500">
        <Receipt size={48} className="mb-4 opacity-50" />
        <p className="text-lg">Select a table to start an order</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-1">{tableName}</h2>
      <p className="text-sm text-gray-500 mb-4">Current Order</p>
      <div className="flex-1 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center justify-between py-2 border-b animate-fadeIn"
          >
            <div className="flex-1">
              <h3 className="font-medium">{item.product.name}</h3>
              <p className="text-sm text-gray-500">₺{item.product.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQuantity(item.product.id, -1)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.product.id, 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => onRemoveItem(item.product.id)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-2xl font-bold">₺{total.toFixed(2)}</span>
        </div>
        <button
          onClick={onCompleteOrder}
          disabled={items.length === 0}
          className="w-full bg-green-500 text-white rounded-md py-3 flex items-center justify-center gap-2 hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Receipt size={20} />
          <span>Complete Order</span>
        </button>
      </div>
    </div>
  );
}