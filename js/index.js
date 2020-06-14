$(document).ready(()=>{
  $('#footer').hide();
    $('#submitUrlBtn').click(()=>{
        var url = $('#urlInput').val();
        
    const {ipcRenderer} = require('electron')

    // send url to index.js 
    ipcRenderer.send('asynchronous-message', url )

    // receive message from index.js
    ipcRenderer.on('asynchronous-reply', (event, arg) => {
      if(arg.info){
        setInfo(arg.info);
      }else if(arg.progress){
        setProgress(arg.progress);
      }

    })

    })
})

const setInfo = (info)=>{
  $('#footer').show();
  $('#videoImg').attr("src", info.thumbnail);
  $('#videoTitle').text(info.title);
  $('#videoDetails').text(info.description);
}

const setProgress = (progress)=>{
  $('#progressBar').css("width",`${progress}%`)
  $('#progressBar').text(`${progress}%`)
}