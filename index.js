const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const youtubedl = require('youtube-dl');
const fs = require('fs');

const Store = require('./helper/localdatastore');

// let downloadPath = __dirname + '/downloads';
let downloadPath = app.getPath('downloads');

const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: 'user-preferences',
  defaults: {
    // set default download path
    downloadPath: app.getPath('downloads')
  }
});

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
    downLoadVideo(arg, event);
    // send message to index.html
    // event.sender.send('asynchronous-reply', 'hello');
  });

  ipcMain.on('download-dir', async (event, arg) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })
    console.log('directories selected', result.filePaths)
    if (result && result.filePaths) {
      store.set('downloadPath', result.filePaths);
      event.sender.send('download-dir', { location: result.filePaths });
    }
  });
  win.webContents.on('did-finish-load', () => {
    downloadPath = store.get('downloadPath');
    win.webContents.send('download-dir', { location: downloadPath });
  });
}

function downLoadVideo(url, event) {
  // const url = 'http://www.youtube.com/watch?v=WKsjaOqDXgg';
  // const url = 'https://www.youtube.com/playlist?list=PLEFA9E9D96CB7F807'
  youtubedl.getInfo(url, (err, info) => {
    if (err) throw err
    event.sender.send('asynchronous-reply', { info });
    if (info.length > 0) {
      for (var i = 0; i < info.length; i++) {
        downloadWithFileName(info[i].webpage_url, info[i], event, i);
      }
    } else {
      downloadWithFileName(url, info, event, null);
    }
  })
}

function downloadWithFileName(url, info, event, index) {
  const video = youtubedl(url, ['--format=18']);
  let pos = 0;
  video.on('data', function data(chunk) {
    pos += chunk.length;
    if (info) {
      var progress = info.filesize ? (pos / info.filesize * 100).toFixed(2) : 100;
      event.sender.send('asynchronous-reply', { progress, index });
    }
  })
  video.pipe(fs.createWriteStream(downloadPath + '/' + info._filename));
}

app.whenReady().then(createWindow)