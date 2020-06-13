$(document).ready(()=>{
    $('#submitUrlBtn').click(()=>{
        var url = $('#urlInput').val();
        
    const {ipcRenderer} = require('electron')

    // send username to main.js 
    ipcRenderer.send('asynchronous-message', url )

    // receive message from main.js
    ipcRenderer.on('asynchronous-reply', (event, arg) => {
      console.log(arg) 

    })

    })
})