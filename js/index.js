$(document).ready(() => {
  const { ipcRenderer } = require('electron')
  $('#footer').hide();
  $('#submitUrlBtn').click(() => {
    var url = $('#urlInput').val();
    $('#videoList').empty();

    // send url to index.js 
    ipcRenderer.send('asynchronous-message', url)
  })

  // receive message from index.js
  ipcRenderer.on('asynchronous-reply', (event, arg) => {
    // console.log(arg);
    if (arg.info) {
      setInfo(arg.info);
    } else if (arg.progress) {
      setProgress(arg.progress, arg.index);
    }

  })
})

const setInfo = (info) => {
  $('#footer').show();
  if (info.length > 0) {
    for (var i = 0; i < info.length; i++) {
      var detailsCard =
        `<div class="card m-3">
          <div class="media border p-3">
            <img id="videoImg${i}" alt="John Doe" class="mr-3 mt-3 " src="${info[i].thumbnail}" style="width:100px;">
            <div class="media-body">
              <h4 id="videoTitle${i}">${info[i].title}</h4>
              <p class="truncate" id="videoDetails${i}">${info[i].description}</p>
              <div class="progress">
                <div id="progressBar${i}" class="progress-bar bg-success progress-bar-striped progress-bar-animated" style="width:0%"></div>
              </div>
            </div>
          </div>
        </div>`;
      $('#videoList').append(detailsCard);
    }
  } else {
    var detailsCard =
      `<div class="card m-3">
      <div class="media border p-3">
        <img id="videoImg" alt="John Doe" class="mr-3 mt-3 " src="${info.thumbnail}" style="width:100px;">
        <div class="media-body">
          <h4 id="videoTitle">${info.title}</h4>
          <p class="truncate" id="videoDetails">${info.description}</p>
          <div class="progress">
            <div id="progressBar" class="progress-bar bg-success progress-bar-striped progress-bar-animated" style="width:0%"></div>
          </div>
        </div>
      </div>
    </div>`
    $('#videoList').append(detailsCard);
  }
}

const setProgress = (progress, i) => {
  if (i != null) {
    $(`#progressBar${i}`).css("width", `${progress}%`)
    $(`#progressBar${i}`).text(`${progress}%`)
  } else {
    $(`#progressBar`).css("width", `${progress}%`)
    $(`#progressBar`).text(`${progress}%`)
  }
}