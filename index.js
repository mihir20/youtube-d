const { app, BrowserWindow, ipcMain } = require('electron')
const youtubedl = require('youtube-dl');

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
    downLoadVideo(arg);
    // send message to index.html
    event.sender.send('asynchronous-reply', 'hello');
  });
}

function downLoadVideo(vidUrl) {
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
  })
}

app.whenReady().then(createWindow)