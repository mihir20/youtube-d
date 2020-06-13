const { app, BrowserWindow, ipcMain } = require('electron')

function createWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('index.html')

  // receive message from index.html 
  ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg);

    // send message to index.html
    event.sender.send('asynchronous-reply', 'hello');
  });
  
}

app.whenReady().then(createWindow)