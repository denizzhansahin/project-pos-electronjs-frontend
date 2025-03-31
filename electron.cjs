// electron.cjs
const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

// NODE_ENV yerine app.isPackaged kullanalım (daha güvenilir)
// const isDev = process.env.NODE_ENV !== 'production'; // Bu satırı kaldırın veya yorumlayın

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Uygulamanın paketlenmiş olup olmadığını kontrol et
  if (!app.isPackaged) {
    // Geliştirme modu (paketlenmemiş): Vite dev sunucusunu yükle
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools(); // Geliştirme araçlarını aç
  } else {
    // Production modu (paketlenmiş): Build edilmiş HTML dosyasını yükle
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, 'dist', 'index.html'), // Doğru yolu kontrol edin
        protocol: 'file:',
        slashes: true,
      })
    );
    // Production build'ında hata ayıklamak için geçici olarak DevTools'u açabilirsiniz:
    // mainWindow.webContents.openDevTools();
  }
}

// Electron hazır olduğunda pencereyi oluştur.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Tüm pencereler kapatıldığında uygulamadan çık (macOS hariç)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});