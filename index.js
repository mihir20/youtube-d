const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const youtubedl = require('youtube-dl');
const fs = require('fs');
const { download } = require('electron-dl');

const Store = require('./helper/localdatastore');
const { url } = require('inspector');

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

let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon:false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('index.html')

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

  //run after page is loaded 
  win.webContents.on('did-finish-load', () => {
    downloadPath = store.get('downloadPath');
    win.webContents.send('download-dir', { location: downloadPath });
  });

  // receive message from index.html 
  ipcMain.on('asynchronous-message', (event, arg) => {
    // console.log(arg);
    getInfoAndDownload(arg, event);
  });
}

function getInfoAndDownload(url, event) {
  // const url = 'http://www.youtube.com/watch?v=WKsjaOqDXgg';
  // const url = 'https://www.youtube.com/playlist?list=PLEFA9E9D96CB7F807'

  //****************************************//

  youtubedl.getInfo(url, (err, info) => {
    if (err) throw err
    event.sender.send('asynchronous-reply', { info });
    if (info.length > 0) {
      downloadList(info, event);
    } else {
      downloadWithFileName(url,info, event, null);
    }
  })
}

function downloadVideo(info, event, index) {
  download(BrowserWindow.getFocusedWindow(),
    info.url,
    {
      directory: `${downloadPath}/${info.filename}`,
      onProgress: (status) => {
        // console.log(status);
        var progress = (status.percent * 100).toFixed(2);
        event.sender.send('asynchronous-reply', { progress, index });
      }
    })
    .then((dl) => {
      console.log(dl);
      console.log('NO ERROR')
    }, (err) => {
      console.log(err)
    });
}

function downloadList(info, event) {
  downloadVideoFromList(info,event,i);
}

const downloadVideoFromList=(info,event,i)=>{
  for(let i=0;i<info.length;i++){
    downloadWithFileName(info[i].webpage_url, info[i], event, i);
  }
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