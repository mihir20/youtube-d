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
let streams = [];

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
    if (result && result.filePaths && result.filePaths.length==1) {
      store.set('downloadPath', result.filePaths);
      event.sender.send('download-dir', { location: result.filePaths });
    }else{
      event.sender.send('error',"invalid path selected");
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

  ipcMain.on('pause-download',(event,arg)=>{
    console.log("pasue event: ",streams.length);
    if(streams.length>0){
      try{
        console.log(streams[0].unresolve());
      }
      catch(err){
        console.log(err);
      }
    }
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


function downloadList(info, event) {
  downloadVideoFromList(info,event);
}

const downloadVideoFromList=(info,event)=>{
  for(let i=0;i<info.length;i++){
    downloadWithFileName(info[i].webpage_url, info[i], event, i);
  }
}
function downloadWithFileName(url, info, event, index) {
  const video = youtubedl(url, ['--format=best']);
  let pos = 0;
  video.on('data', function data(chunk) {
    pos += chunk.length;
    if (info) {
      var progress = info.filesize ? (pos / info.filesize * 100).toFixed(2) : 100;
      event.sender.send('asynchronous-reply', { progress, index });
    }
  })
  downloadPath = getDownloadPath();
  output = downloadPath + '/' + info._filename;
  var stream;
  stream=video.pipe(fs.createWriteStream(output))
  streams.push(video);
  
}
const getDownloadPath=()=>{
  return store.get('downloadPath');
}
app.whenReady().then(createWindow)