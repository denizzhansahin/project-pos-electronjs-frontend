import React from 'react';
import { Table } from '../types';
import { Users, Trash2 } from 'lucide-react';

interface TableGridProps {
  tables: Table[];
  selectedTableId: string | null;
  onSelectTable: (tableId: string) => void;
  onDeleteTable: (tableId: string) => void; // Yeni prop eklendi
}

export function TableGrid({ tables, selectedTableId, onSelectTable, onDeleteTable }: TableGridProps) {
  if (tables.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Users size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">No tables yet. Add a table to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
      {tables.map((table) => (
        <div
          key={table.id}
          className={`relative h-32 rounded-lg shadow-md p-4 flex flex-col items-center justify-center transition-all duration-200 ${
            selectedTableId === table.id
              ? 'bg-blue-500 text-white ring-2 ring-blue-600 ring-offset-2'
              : table.status === 'occupied'
              ? 'bg-green-50 hover:bg-green-100'
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          <button
            onClick={() => onSelectTable(table.id)}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center focus:outline-none"
          >
            <Users size={24} className={selectedTableId === table.id ? 'text-white' : 'text-gray-600'} />
            <span className="mt-2 font-medium">{table.name}</span>
            <span
              className={`text-sm mt-1 ${
                selectedTableId === table.id
                  ? 'text-blue-100'
                  : table.status === 'occupied'
                  ? 'text-green-600'
                  : 'text-gray-500'
              }`}
            >
              {table.status === 'occupied' ? 'Occupied' : 'Empty'}
            </span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Masa seçimini engellemek için
              if (confirm(`Are you sure you want to delete table "${table.id}"?`)) {
                onDeleteTable(table.id);
              }
            }}
            className="absolute top-2 right-2 text-red-500 hover:text-red-600"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ))}
    </div>
  );
}