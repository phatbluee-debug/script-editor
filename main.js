const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    autoHideMenuBar: false,
    title: 'Trình Soạn Kịch Bản',
    backgroundColor: '#1a1a2e'
  });

  mainWindow.loadFile('index.html');

  // Tạo menu tiếng Việt
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Tạo mới',
          accelerator: 'Ctrl+N',
          click: () => {
            mainWindow.webContents.executeJavaScript('window.createNewScript && window.createNewScript()');
          }
        },
        {
          label: 'Lưu',
          accelerator: 'Ctrl+S',
          click: () => {
            mainWindow.webContents.executeJavaScript('window.saveScript && window.saveScript()');
          }
        },
        { type: 'separator' },
        {
          label: 'Xuất file',
          accelerator: 'Ctrl+E',
          click: () => {
            mainWindow.webContents.executeJavaScript('window.exportScript && window.exportScript()');
          }
        },
        { type: 'separator' },
        {
          label: 'Thoát',
          accelerator: 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Chỉnh sửa',
      submenu: [
        { role: 'undo', label: 'Hoàn tác' },
        { role: 'redo', label: 'Làm lại' },
        { type: 'separator' },
        { role: 'cut', label: 'Cắt' },
        { role: 'copy', label: 'Sao chép' },
        { role: 'paste', label: 'Dán' },
        { type: 'separator' },
        { role: 'selectAll', label: 'Chọn tất cả' }
      ]
    },
    {
      label: 'Xem',
      submenu: [
        { role: 'reload', label: 'Tải lại' },
        { role: 'forceReload', label: 'Tải lại (Force)' },
        { role: 'toggleDevTools', label: 'Công cụ Developer' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom mặc định' },
        { role: 'zoomIn', label: 'Phóng to' },
        { role: 'zoomOut', label: 'Thu nhỏ' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Toàn màn hình' }
      ]
    },
    {
      label: 'Cửa sổ',
      submenu: [
        { role: 'minimize', label: 'Thu nhỏ' },
        { role: 'close', label: 'Đóng' }
      ]
    },
    {
      label: 'Trợ giúp',
      submenu: [
        {
          label: 'Hướng dẫn sử dụng',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              alert('HƯỚNG DẪN SỬ DỤNG:\\n\\n1. Nhấn "Mới" để tạo kịch bản mới\\n2. Nhấn "Lưu" (Ctrl+S) để lưu kịch bản\\n3. Nhấn "Xuất" (Ctrl+E) để xuất file\\n4. Sử dụng microphone để ghi âm lời thoại\\n5. Tải file audio lên cho mỗi đoạn hội thoại');
            `);
          }
        },
        { type: 'separator' },
        {
          label: 'Về ứng dụng',
          click: () => {
            const aboutWindow = new BrowserWindow({
              width: 500,
              height: 400,
              resizable: false,
              parent: mainWindow,
              modal: true,
              autoHideMenuBar: true,
              title: 'Về ứng dụng'
            });
            
            aboutWindow.loadURL(`data:text/html;charset=utf-8,
              <html>
                <head>
                  <style>
                    body {
                      font-family: 'Segoe UI', Arial, sans-serif;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                      height: 100vh;
                      margin: 0;
                      text-align: center;
                    }
                    h1 {
                      font-size: 32px;
                      margin-bottom: 10px;
                    }
                    p {
                      font-size: 16px;
                      margin: 5px 0;
                    }
                    .version {
                      font-size: 14px;
                      opacity: 0.8;
                      margin-top: 20px;
                    }
                    .icon {
                      font-size: 64px;
                      margin-bottom: 20px;
                    }
                  </style>
                </head>
                <body>
                  <div class="icon">🎬</div>
                  <h1>Trình Soạn Kịch Bản</h1>
                  <p>Ứng dụng chuyên nghiệp cho nhà biên kịch</p>
                  <p class="version">Version 1.0.0</p>
                  <p class="version">© 2025 - All rights reserved</p>
                </body>
              </html>
            `);
          }
        },
        {
          label: 'Kiểm tra cập nhật',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              alert('Bạn đang sử dụng phiên bản mới nhất!');
            `);
          }
        }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);

  // Mở DevTools khi dev (bỏ comment để debug)
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Khởi động app
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Thoát khi tất cả cửa sổ đóng
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Xử lý lỗi
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

app.on('ready', () => {
  console.log('App is ready!');
  console.log('App path:', app.getAppPath());
  console.log('User data path:', app.getPath('userData'));
});
