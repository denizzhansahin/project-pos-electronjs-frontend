// src/services/api.ts
import axios from 'axios';


const apiPort: number = 3001; // API'nızın çalıştığı port
const currentHostname: string = window.location.hostname; // örn: "localhost" veya "192.168.0.166"
const currentProtocol: string = window.location.protocol; // örn: "http:"

const apiBaseUrl1: string = `${currentProtocol}//${currentHostname}:${apiPort}`;

console.log(`API111: ${apiBaseUrl1}`);
// Backend adresini merkezi bir yerden al (Vite için .env dosyası kullanabilirsin)
//const API_BASE_URL = apiBaseUrl1|| import.meta.env.VITE_API_URL || 'http://localhost:3001' || 'http://192.168.0.166';


const API_BASE_URL = 'http://localhost:3001';
console.log(`API Adresi (Aynı Host, Farklı Port): ${API_BASE_URL}`);
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ürünler için fonksiyonlar
export const fetchProducts = () => apiClient.get('/products');
export const addProductApi = (productData: any) => apiClient.post('/products', productData);
export const updateProductApi = (id: any, productData: any) => apiClient.patch(`/products/${id}`, productData);
export const deleteProductApi = (id: any) => apiClient.delete(`/products/${id}`);

// Masalar için fonksiyonlar
export const fetchTables = () => apiClient.get('/tables');
export const addTableApi = (tableData: any) => apiClient.post('/tables', tableData);
export const fetchTableDetails = (tableId: any) => apiClient.get(`/tables/${tableId}`);
export const deleteTableApi = (tableId: any) => apiClient.delete(`/tables/${tableId}`);
// Masa silme, güncelleme vb. eklenebilir

// Aktif Siparişler için fonksiyonlar (Masa ID'si gerektirir)
export const addOrderItemApi = (tableId: any, itemData: any) => apiClient.post(`/tables/${tableId}/order`, itemData);
export const updateOrderItemApi = (tableId: any, itemId: any, itemData: any) => apiClient.patch(`/tables/${tableId}/order/items/${itemId}`, itemData);
export const removeOrderItemApi = (tableId: any, itemId: any) => apiClient.delete(`/tables/${tableId}/order/items/${itemId}`);
export const completeOrderApi = (tableId: any) => apiClient.post(`/tables/${tableId}/order/complete`);

// Tamamlanmış Siparişler için fonksiyonlar (YENİ KONTROLÖRÜ KULLANIR)
export const fetchCompletedOrders = () => apiClient.get('/completed-orders');
export const fetchCompletedOrderDetails = (orderId: any) => apiClient.get(`/completed-orders/${orderId}`);


export const fetchCompletedOrdersDate = (dateString?: string) => {
  const params = dateString ? { date: dateString } : {}; // Tarih varsa params objesi oluştur
  return apiClient.get('/completed-orders/date', { params }); // params'ı isteğe ekle
};




export default apiClient; // İstersen direkt axios instance'ını da export edebilirsin