// App.tsx (Backend Entegrasyonu ile Güncellenmiş - Mevcut Yapı Korunarak)

import React, { useState, useEffect, useCallback, useRef } from 'react'; // useEffect eklendi
import { LayoutGrid, ListOrdered, BarChart3 } from 'lucide-react';
import { Product, OrderItem, Table, CompletedOrder } from '../types';
// initialProducts'ı artık başlangıçta kullanmayacağız, API'den çekeceğiz.
// import { initialProducts } from './data';

import { Calendar, Undo2 } from 'lucide-react'; // İkonlar

// Prop tiplerini tanımla (App.tsx'ten gelecek)
interface AppNavProps {
  activeTab: 'pos' | 'management' | 'financial';
  setActiveTab: (tab: 'pos' | 'management' | 'financial') => void;
}

// Yardımcı fonksiyon: Date nesnesini YYYY-MM-DD formatına çevirir
const formatDateForApi = (date: Date | null): string | undefined => {
  if (!date) return undefined;
  return date.toISOString().split('T')[0];
};
// API fonksiyonlarını import et (varsayılan dosya yolu)
import {
  fetchProducts, addProductApi, updateProductApi, deleteProductApi,
  fetchTables, addTableApi, fetchTableDetails, // fetchTableDetails eklendi
  addOrderItemApi, updateOrderItemApi, removeOrderItemApi, completeOrderApi,
  fetchCompletedOrders, deleteTableApi, fetchCompletedOrdersDate
} from '../services/api';
import { FinancialDashboardDate } from '../components/FinancialDashboardDate';
import { TableGrid } from '../components/TableGrid';
import { ProductList } from '../components/ProductList';
import { OrderPanel } from '../components/OrderPanel';
import { ProductManagement } from '../components/ProductManagement';



///////////////////////////
import io, { Socket } from 'socket.io-client';
const apiPort: number = 3001; // API'nızın çalıştığı port
const currentHostname: string = window.location.hostname; // örn: "localhost" veya "192.168.0.166"
const currentProtocol: string = window.location.protocol; // örn: "http:"

const apiBaseUrl1: string = `${currentProtocol}//${currentHostname}:${apiPort}`;

// Backend adresini merkezi bir yerden al (Vite için .env dosyası kullanabilirsin)
//const API_BASE_URL = apiBaseUrl1|| import.meta.env.VITE_API_URL || 'http://localhost:3001' || 'http://192.168.0.166';


const API_BASE_URL = 'http://localhost:3001';

//const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001' || 'http://192.168.0.166';
// NestJS backend adresiniz (portu kontrol edin!)
const SOCKET_URL = API_BASE_URL

function YoneticiApp() {
  const [activeTab, setActiveTab] = useState<'pos' | 'management' | 'financial'>('pos');
  // Başlangıç state'lerini boş veya null yapalım, API'den dolacaklar
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]); // Backend'den gelen Table tipini kullanacak
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  // Seçili masa detayları için ayrı state (siparişleri içerecek)
  const [selectedTableDetails, setSelectedTableDetails] = useState<Table | null>(null);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [completedOrders1, setCompletedOrders1] = useState<CompletedOrder[]>([]);
  const [nextTableNumber, setNextTableNumber] = useState(1); // Başlangıç değeri, API'den sonra güncellenecek

  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Başlangıçta null

  const [masaAdi, setMasaAdi] = useState<string>('Masa Adı Yaz'); // Masa adı için state eklendi

  // Yüklenme ve Hata Durumları (Basit haliyle)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  /////////
  const [message, setMessage] = useState(''); // Gönderilecek mesaj
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]); // Alınan mesajlar
  const [isConnected, setIsConnected] = useState(false); // Bağlantı durumu
  const socketRef = useRef<Socket | null>(null); // Soket referansı


  // Bağlantıyı kurma ve olay dinleyicilerini ayarlama
  useEffect(() => {
    // Eğer zaten bağlıysa tekrar bağlanma
    if (socketRef.current) return;

    console.log('Socket.IO sunucusuna bağlanılıyor...');
    // Soket bağlantısını başlat
    socketRef.current = io(SOCKET_URL, {
      // transports: ['websocket'] // İsteğe bağlı: Sadece websocket kullanmaya zorla
    });

    const socket = socketRef.current;

    // Bağlantı başarılı olduğunda
    socket.on('connect', () => {
      console.log('Socket.IO sunucusuna başarıyla bağlandı! ID:', socket.id);
      setIsConnected(true);
      setReceivedMessages(prev => [...prev, `Sunucuya bağlandı (${socket.id})`]);
    });

    // Bağlantı hatası olduğunda
    socket.on('connect_error', (error) => {
      console.error('Socket.IO bağlantı hatası:', error);
      setIsConnected(false);
      setReceivedMessages(prev => [...prev, `Bağlantı hatası: ${error.message}`]);
    });

    // Bağlantı kesildiğinde
    socket.on('disconnect', (reason) => {
      console.log('Socket.IO bağlantısı kesildi:', reason);
      setIsConnected(false);
      setReceivedMessages(prev => [...prev, `Bağlantı kesildi: ${reason}`]);
      // İsteğe bağlı: Otomatik tekrar bağlanmayı deneyebilir veya kullanıcıya bildirebilirsiniz
      // if (reason === 'io server disconnect') {
      //   // Sunucu tarafından manuel olarak kesildi, tekrar bağlanmayı deneyebilir.
      //   socket.connect();
      // }
    });

    // Sunucudan 'mesajAl' olayını dinle
    socket.on('mesajAl', async (data: string) => {
      console.log('Sunucudan mesaj alındı:', data);
      setReceivedMessages(prev => [...prev, data]); // Gelen mesajı listeye ekle
      try {
        const [productsRes, tablesRes] = await Promise.all([
          fetchProducts(),
          fetchTables()
        ]);
        setProducts(productsRes.data);
        setTables(tablesRes.data);

        // Masa numarasını ayarla
        if (tablesRes.data.length > 0) {
          const maxNum = tablesRes.data.reduce((max: number, t: Table) => {
            const num = parseInt(t.name.split(' ')[1] || '0');
            return isNaN(num) ? max : Math.max(max, num); // NaN kontrolü eklendi
          }, 0);
          setNextTableNumber(maxNum + 1);
        } else {
          setNextTableNumber(1); // Hiç masa yoksa 1'den başla
        }

      } catch (err) {
        console.error("Error loading initial data:", err);
        //setError("Failed to load initial data.");
      } finally {
        setIsLoading(false);
      }


      try {
        // ÖNEMLİ: Backend'den dönen Table objesi 'order' ilişkisini içermeli
        // (TablesService findOne metodunda { relations: ['order', 'order.product'] } eklenmişti)
        const response = await fetchTableDetails(selectedTableId);
        setSelectedTableDetails(response.data);
      } catch (err) {
        console.error(`Error fetching details for table ${selectedTableId}:`, err);
        //setError(`Failed to load details for selected table.`);
        setSelectedTableId(null); // Hata durumunda seçimi kaldır
        setSelectedTableDetails(null);
      } finally {
        // setIsLoading(false);
      }


      try {
        const response = await fetchCompletedOrders();
        setCompletedOrders(response.data);
      } catch (err) {
        console.error("Error loading completed orders:", err);
        //setError("Failed to load financial data.");
      } finally {
        setIsLoading(false);
      }




    });

    // Sunucudan 'ozelYanit' olayını dinle (ekstra örnek)
    socket.on('ozelYanit', (data: any) => {
      console.log('Özel yanıt alındı:', data);
      setReceivedMessages(prev => [...prev, `ÖZEL: ${data.message} (Zaman: ${data.timestamp})`]);
    });

    if (socketRef.current && isConnected) {
      console.log('"' + message + '" mesajı gönderiliyor...');
      setMessage('mesaj')
      // Sunucuya 'mesajGonder' olayını emit et
      socketRef.current.emit('mesajGonder', message);
      setMessage(''); // Input alanını temizle
    } else {
      console.warn('Mesaj gönderilemedi. Bağlı değil veya mesaj boş.');
    }

    // Component unmount olduğunda bağlantıyı temizle
    return () => {
      console.log('Socket.IO bağlantısı kesiliyor...');
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('mesajAl');
      socket.off('ozelYanit');
      socket.disconnect();
      socketRef.current = null; // Referansı temizle
      setIsConnected(false);
    };
  }, [tables, products, selectedTableDetails, completedOrders, selectedTableId]); // Sadece bileşen ilk yüklendiğinde çalışır

  // Mesaj gönderme fonksiyonu
  const sendMessage = useCallback(() => {
    if (message.trim() && socketRef.current && isConnected) {

      console.log('"' + message + '" mesajı gönderiliyor...');
      // Sunucuya 'mesajGonder' olayını emit et
      socketRef.current.emit('mesajGonder', 'd');
      setMessage(''); // Input alanını temizle
    } else {
      console.warn('Mesaj gönderilemedi. Bağlı değil veya mesaj boş.');
    }
  }, [message, isConnected]);




  // --- VERİ ÇEKME ---
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [productsRes, tablesRes] = await Promise.all([
          fetchProducts(),
          fetchTables()
        ]);
        setProducts(productsRes.data);
        setTables(tablesRes.data);

        // Masa numarasını ayarla
        if (tablesRes.data.length > 0) {
          const maxNum = tablesRes.data.reduce((max: number, t: Table) => {
            const num = parseInt(t.name.split(' ')[1] || '0');
            return isNaN(num) ? max : Math.max(max, num); // NaN kontrolü eklendi
          }, 0);
          setNextTableNumber(maxNum + 1);
        } else {
          setNextTableNumber(1); // Hiç masa yoksa 1'den başla
        }

      } catch (err) {
        console.error("Error loading initial data:", err);
        setError("Failed to load initial data.");
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []); // Sadece başlangıçta çalışır

  // Seçili masa değiştiğinde detayları çek
  useEffect(() => {
    const loadSelectedTableDetails = async () => {
      if (!selectedTableId) {
        setSelectedTableDetails(null);
        return;
      }
      // setIsLoading(true); // Daha granüler loading eklenebilir
      try {
        // ÖNEMLİ: Backend'den dönen Table objesi 'order' ilişkisini içermeli
        // (TablesService findOne metodunda { relations: ['order', 'order.product'] } eklenmişti)
        const response = await fetchTableDetails(selectedTableId);
        setSelectedTableDetails(response.data);
      } catch (err) {
        console.error(`Error fetching details for table ${selectedTableId}:`, err);
        setError(`Failed to load details for selected table.`);
        setSelectedTableId(null); // Hata durumunda seçimi kaldır
        setSelectedTableDetails(null);
      } finally {
        // setIsLoading(false);
      }
    };
    loadSelectedTableDetails();
  }, [selectedTableId]); // selectedTableId değiştiğinde çalışır

  // Finansal sekme aktif olduğunda tamamlanmış siparişleri çek
  useEffect(() => {
    const loadCompletedOrders = async () => {
      if (activeTab === 'financial') {
        setIsLoading(true); // Finansal veri yükleniyor
        setError(null);
        try {
          const response = await fetchCompletedOrders();
          setCompletedOrders(response.data);
        } catch (err) {
          console.error("Error loading completed orders:", err);
          setError("Failed to load financial data.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadCompletedOrders();
  }, [activeTab]); // activeTab değiştiğinde çalışır


  // --- HANDLER FONKSİYONLARI (API Entegrasyonu ile) ---

  const handleAddTable = async () => { // async eklendi
    setIsLoading(true);
    setError(null);
    try {
      const newTableName = `Table ${masaAdi}`;
      const response = await addTableApi({ name: newTableName }); // API çağrısı
      // Başarılı olursa state'i güncelle
      setTables(prev => [...prev, response.data]);
      setNextTableNumber(prev => prev + 1);
    } catch (err) {
      console.error("Error adding table:", err);
      setError("Failed to add table.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTable = (tableId: string) => {
    // Bu fonksiyon aynı kalır, seçimi yapar, useEffect detayı çeker
    setSelectedTableId(tableId);
  };

  const handleAddToOrder = async (product: Product) => { // async eklendi
    if (!selectedTableId) return;
    setIsLoading(true); // Belirli bir işlem için loading
    setError(null);
    try {
      // API çağrısı (backend ekleme/güncellemeyi halleder)
      const response = await addOrderItemApi(selectedTableId, { productId: product.id, quantity: 1 });
      // Başarılı olursa, dönen güncel masa detayıyla state'i güncelle
      setSelectedTableDetails(response.data);
      // Ana masa listesindeki durumu da güncelle (hızlı görsel geri bildirim için)
      setTables(prevTables => prevTables.map(t => t.id === selectedTableId ? { ...t, status: 'occupied' } : t));

    } catch (err) {
      console.error("Error adding item to order:", err);
      setError("Failed to add item to order.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: string, change: number) => { // async eklendi
    if (!selectedTableId || !selectedTableDetails) return;

    // Güncellenecek item'ın backend ID'sini bulmamız lazım
    const itemToUpdate = selectedTableDetails.order.find(item => item.product.id === productId);
    if (!itemToUpdate) {
      console.warn("Item to update not found in selectedTableDetails");
      return;
    }
    const orderItemId = itemToUpdate.id; // Backend ID'si
    const currentQuantity = itemToUpdate.quantity;
    const newQuantity = Math.max(0, currentQuantity + change); // 0'ın altına düşmemeli

    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (newQuantity === 0) {
        // Miktar 0 ise silme API'sini çağır
        response = await removeOrderItemApi(selectedTableId, orderItemId);
      } else {
        // Miktarı güncelleme API'sini çağır
        response = await updateOrderItemApi(selectedTableId, orderItemId, { quantity: newQuantity });
      }
      // Başarılı olursa, dönen güncel masa detayıyla state'i güncelle
      setSelectedTableDetails(response.data);
      // Ana masa listesindeki durumu da güncelle
      setTables(prevTables => prevTables.map(t => t.id === selectedTableId ? { ...t, status: response.data.status } : t));

    } catch (err) {
      console.error("Error updating item quantity:", err);
      setError("Failed to update item quantity.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    setIsLoading(true);
    setError(null);
    try {
      await deleteTableApi(tableId); // API çağrısı
      setTables((prev) => prev.filter((table) => table.id !== tableId)); // State'ten sil
      alert('Table deleted successfully!');
    } catch (err) {
      console.error('Error deleting table:', err);
      setError('Failed to delete table.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (productId: string) => { // async eklendi
    if (!selectedTableId || !selectedTableDetails) return;

    // Silinecek item'ın backend ID'sini bul
    const itemToRemove = selectedTableDetails.order.find(item => item.product.id === productId);
    if (!itemToRemove) {
      console.warn("Item to remove not found in selectedTableDetails");
      return;
    }
    const orderItemId = itemToRemove.id;

    setIsLoading(true);
    setError(null);
    try {
      // Silme API'sini çağır
      const response = await removeOrderItemApi(selectedTableId, orderItemId);
      // Başarılı olursa, dönen güncel masa detayıyla state'i güncelle
      setSelectedTableDetails(response.data);
      // Ana masa listesindeki durumu da güncelle
      setTables(prevTables => prevTables.map(t => t.id === selectedTableId ? { ...t, status: response.data.status } : t));
    } catch (err) {
      console.error("Error removing item:", err);
      setError("Failed to remove item.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteOrder = async () => { // async eklendi
    if (!selectedTableId || !selectedTableDetails || selectedTableDetails.order.length === 0) return;

    setIsLoading(true);
    setError(null);
    try {
      // Siparişi tamamlama API'sini çağır
      const response = await completeOrderApi(selectedTableId);
      // Başarılı olunca:
      const completedOrderData = response.data; // Tamamlanmış sipariş verisi

      // 1. Tamamlanan siparişler listesini güncelle (isteğe bağlı, finansalda zaten çekiliyor)
      // setCompletedOrders(prev => [completedOrderData, ...prev]); // Başa ekle

      // 2. Masayı temizle ve seçimden çıkar
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.id === selectedTableId
            ? { ...table, order: [], status: 'empty' } // Masayı boşalt
            : table
        )
      );
      setSelectedTableId(null);
      setSelectedTableDetails(null); // Seçili detayları da temizle

      alert(`Order for ${selectedTableDetails.name} completed successfully!`); // Bildirim

    } catch (err) {
      console.error("Error completing order:", err);
      setError("Failed to complete order.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Product Management Handlers ---
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const response = await addProductApi(productData); // API çağrısı
      setProducts((prev) => [...prev, response.data]); // Yeni ürünü state'e ekle
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleUpdateProduct = async (product: Product) => { // async
    setIsLoading(true);
    setError(null);
    try {
      const { id, ...updateData } = product; // ID'yi ayır
      // İlişkili alanları DTO'dan temizlemek gerekebilir (backend DTO'suna bağlı)
      delete (updateData as any).orderItems;
      delete (updateData as any).completedOrderItems;

      const response = await updateProductApi(id, updateData); // API çağrısı
      setProducts(prev => prev.map(p => p.id === id ? response.data : p)); // Başarılıysa state'i güncelle
      alert('Product updated successfully!');
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to update product.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => { // async
    if (!confirm('Are you sure you want to delete this product?')) return; // Onay iste
    setIsLoading(true);
    setError(null);
    try {
      await deleteProductApi(productId); // API çağrısı
      setProducts(prev => prev.filter(p => p.id !== productId)); // Başarılıysa state'ten çıkar
      alert('Product deleted successfully!');
    } catch (err) {
      console.error("Error deleting product:", err);
      // Backend'de ilişkili siparişler varsa silinemeyebilir, ona göre hata mesajı
      if ((err as any).response?.status === 409) { // Örnek: Conflict hatası
        setError("Cannot delete product. It might be used in existing orders.");
      } else {
        setError("Failed to delete product.");
      }
    } finally {
      setIsLoading(false);
    }
  };













  // Tamamlanmış siparişleri çekme işlemini useCallback ile sarmala
  const loadCompletedOrders = useCallback(async (date: Date | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const dateParam = formatDateForApi(date); // Tarihi API formatına çevir
      console.log("Fetching completed orders for date:", dateParam ?? 'all'); // Konsola log ekle
      const response = await fetchCompletedOrdersDate(dateParam);
      setCompletedOrders1(response.data);
    } catch (err: any) { // Hata tipini belirt
      console.error("Error loading completed orders:", err);
      setError(err.response?.data?.message || "Failed to load financial data."); // Backend hatasını göster
    } finally {
      setIsLoading(false);
    }
  }, []); // Bağımlılığı yok

  // Finansal sekme aktif olduğunda VEYA seçili tarih değiştiğinde veriyi yükle
  useEffect(() => {
    if (activeTab === 'financial') {
      loadCompletedOrders(selectedDate); // Seçili tarihle yükle
    }
  }, [activeTab, selectedDate, loadCompletedOrders]); // Bağımlılıklara ekle

  // --- Handler Fonksiyonları ---
  // ... (diğer handler fonksiyonları aynı kalabilir) ...

  // Tarih seçildiğinde state'i güncelle (inputtan gelen value string'dir)
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value;
    setSelectedDate(dateValue ? new Date(dateValue) : null); // String'i Date'e çevir veya null yap
  };

  // Bugün butonuna basıldığında tarihi ayarla
  const handleSetToday = () => {
    setSelectedDate(new Date()); // Şu anki tarihi ayarla
  };

  // Tarih filtresini temizle
  const handleClearDate = () => {
    setSelectedDate(null);
  };

  const handleSetYenile = () => {
    loadCompletedOrders(selectedDate);
  };


  // --- JSX (Görünüm Kısmı) ---
  // Arayüzde büyük değişiklik yok, sadece prop'lar güncellendi
  return (
    
    <div className="min-h-screen bg-gray-100">
     
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Daha iyi padding için sm ve lg eklenebilir */}
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Başlığı küçük ekranda gizleyip büyükte göstermek isteyebilirsin */}
              <h1 className="text-xl font-bold text-gray-800">
                <span className="hidden sm:inline">POS System - Admin</span> {/* Küçükte gizle */}
                <span className="sm:hidden">POS</span> {/* Küçükte sadece POS göster */}
              </h1>
            </div>
            <div className="flex">
              {/* POS Butonu */}
              <button
                onClick={() => setActiveTab('pos')}
                className={`px-3 sm:px-4 h-full flex items-center gap-1 sm:gap-2 border-b-2 transition-colors ${ // Mobil için padding ve gap ayarı
                  activeTab === 'pos'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' // Aktif olmayan stil
                  }`}
                title="POS" // İkonun ne işe yaradığını belirtmek için title
              >
                <LayoutGrid size={20} />
                {/* Metni md (medium) ve üzeri ekranlarda göster */}
                <span className="hidden md:inline">POS</span>
              </button>

              {/* Management Butonu */}
              <button
                onClick={() => setActiveTab('management')}
                className={`px-3 sm:px-4 h-full flex items-center gap-1 sm:gap-2 border-b-2 transition-colors ${ // Mobil için padding ve gap ayarı
                  activeTab === 'management'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                title="Management"
              >
                <ListOrdered size={20} />
                {/* Metni md (medium) ve üzeri ekranlarda göster */}
                <span className="hidden md:inline">Management</span>
              </button>

              {/* Financial Butonu */}
              <button
                onClick={() => setActiveTab('financial')}
                className={`px-3 sm:px-4 h-full flex items-center gap-1 sm:gap-2 border-b-2 transition-colors ${ // Mobil için padding ve gap ayarı
                  activeTab === 'financial'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                title="Financial"
              >
                <BarChart3 size={20} />
                {/* Metni md (medium) ve üzeri ekranlarda göster */}
                <span className="hidden md:inline">Financial</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hata Mesajı Gösterimi */}
      {error && (
        <div className="max-w-7xl mx-auto py-2 px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
            <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
            </button>
          </div>
        </div>
      )}
      {/* Basit Yükleniyor Göstergesi */}
      {isLoading && (
        <div className="max-w-7xl mx-auto py-2 px-4 text-center text-blue-600">
          Loading...
        </div>
      )}

      <main className="max-w-7xl mx-auto py-6 px-4">
        {activeTab === 'pos' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            

            <div className="lg:col-span-1">
              <div className="mb-4">
                <label htmlFor="masaAdi" className="block text-sm font-medium text-gray-700">
                  Masa Adı
                </label>
                <input
                  id="masaAdi"
                  type="text"
                  value={masaAdi}
                  onChange={(e) => setMasaAdi(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Masa adı girin"
                />
                <button
                  onClick={handleAddTable}
                  disabled={isLoading || !masaAdi.trim()} // Boş masa adıyla eklemeyi engelle
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                >
                  Add New Table
                </button>
              </div>
              <TableGrid
                tables={tables}
                selectedTableId={selectedTableId}
                onSelectTable={handleSelectTable}
                onDeleteTable={handleDeleteTable} // Yeni prop
              />
            </div>
            <div className="lg:col-span-2">
              <ProductList
                products={products} // API'den gelen güncel liste
                onAddToOrder={handleAddToOrder}
                disabled={!selectedTableId || isLoading} // Seçili masa yoksa veya işlem varsa disable
              />
            </div>
            <div>
              <OrderPanel
                // Seçili masanın API'den çekilen detaylarını kullan
                items={selectedTableDetails?.order || []}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onCompleteOrder={handleCompleteOrder}
                tableName={selectedTableDetails?.name} // Seçili masanın adını kullan
              //isLoading={isLoading} // Panelin içindeki butonları da etkileyebilir
              />
            </div>
          </div>
        ) : activeTab === 'management' ? (
          <ProductManagement
            products={products} // API'den gelen liste
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          // isLoading={isLoading} // Bileşene isLoading prop'u eklenebilir
          />
        ) : (
          // Finansal Sekme
          <div>
            {/* Tarih Filtresi */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow-md flex flex-wrap items-center gap-4">
              <label htmlFor="date-filter" className="flex items-center gap-2 font-medium"> <Calendar size={20} className="text-gray-600" /> Filter by Date: </label>
              <input type="date" id="date-filter" value={selectedDate ? formatDateForApi(selectedDate) : ''} onChange={handleDateChange} className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={handleSetToday} className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition-colors"> Today </button>
              <button onClick={handleSetYenile} className="bg-gray-200 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-300 transition-colors flex items-center gap-1" title="Clear date filter"> <Undo2 size={16} /> Yenile </button>

              {selectedDate && (<button onClick={handleClearDate} className="bg-gray-200 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-300 transition-colors flex items-center gap-1" title="Clear date filter"> <Undo2 size={16} /> Clear </button>)}
            </div>
            <a>{selectedDate ? selectedDate.toLocaleDateString() : "Tarih Bilgisi Seçiniz"}</a>
            {/* Dashboard Bileşeni */}
            <FinancialDashboardDate
              completedOrders={selectedDate ? completedOrders1 : completedOrders}
              products={products}
              selectedDate={selectedDate} // << Doğru state geçirildi
              isLoading={isLoading}     // << Doğru state geçirildi
            />
          </div>
        )
        }

      </main>
      <label htmlFor="network" className="block text-sm font-medium text-gray-700 mb-1">{API_BASE_URL}</label>
    </div>
  );
}

export default YoneticiApp;