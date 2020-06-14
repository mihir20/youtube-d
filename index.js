const { app, BrowserWindow, ipcMain } = require('electron')
const youtubedl = require('youtube-dl');
const fs = require('fs');

let downloadPath = __dirname+'/downloads';

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
    downLoadVideo(arg,event);
    // send message to index.html
    // event.sender.send('asynchronous-reply', 'hello');
  });
}

function downLoadVideo(vidUrl,event) {
  const url = 'http://www.youtube.com/watch?v=WKsjaOqDXgg';
  youtubedl.getInfo(url, (err,info) => {
    if (err) throw err
    console.log('id:', info.id)
    console.log('title:', info.title)
    console.log('url:', info.url)
    console.log('thumbnail:', info.thumbnail)
    console.log('description:', info.description)
    console.log('filename:', info._filename)
    console.log('format id:', info.format_id)
    event.sender.send('asynchronous-reply', {info});
    downloadWithFileName(url,info,event);
  })
}

function downloadWithFileName(url,info,event){
  const video = youtubedl(url,['--format=18']);
  let pos = 0;
  video.on('data',function data(chunk){
    pos+=chunk.length;
    var progress =info.filesize?(pos / info.filesize * 100).toFixed(2):100;
    event.sender.send('asynchronous-reply', {progress});
  })
  video.pipe(fs.createWriteStream(downloadPath+'/'+info._filename));
}

app.whenReady().then(createWindow)