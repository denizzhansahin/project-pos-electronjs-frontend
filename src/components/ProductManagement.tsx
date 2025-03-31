import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductManagementProps {
  products: Product[];
  onAddProduct: (productData: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export function ProductManagement({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}: ProductManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Omit<Product, 'id'>>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.name && newProduct.price && newProduct.category) {
      onAddProduct({
        name: newProduct.name,
        price: Number(newProduct.price),
        category: newProduct.category,
      });
      setNewProduct({});
      setIsAdding(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Product Management</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-500 text-white rounded-md px-4 py-2 flex items-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <PlusCircle size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 mb-4 animate-slideDown">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.name || ''}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="border rounded-md px-3 py-2"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={newProduct.price || ''}
              onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
              className="border rounded-md px-3 py-2"
            />
            <input
              type="text"
              placeholder="Category"
              value={newProduct.category || ''}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="border rounded-md px-3 py-2"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white rounded-md px-4 py-2 hover:bg-green-600"
            >
              Add Product
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-right">Actions</th>
              
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="px-4 py-2">{product.name}</td>
                <td className="px-4 py-2">₺{product.price.toFixed(2)}</td>
                <td className="px-4 py-2">{product.category}</td>
                
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => onDeleteProduct(product.id)}
                    className="text-red-500 hover:text-red-600 px-2"
                  >
                    Delete
                  </button>
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}