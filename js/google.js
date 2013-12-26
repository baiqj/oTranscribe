console.log('google');

var gd = {
    CLIENT_ID : '219206830455.apps.googleusercontent.com',
    SCOPES : 'https://www.googleapis.com/auth/drive'
}

/**
 * Called when the client library is loaded to start the auth flow.
 */
gd.handleClientLoad = function() {
  window.setTimeout(gd.checkAuth, 1);
}

/**
 * Check if the current user has authorized the application.
 */
gd.checkAuth = function() {
  gapi.auth.authorize(
      {'client_id': gd.CLIENT_ID, 'scope': gd.SCOPES, 'immediate': true},
      gd.handleAuthResult);
}

/**
 * Called when authorization server replies.
 *
 * @param {Object} authResult Authorization result.
 */
gd.handleAuthResult = function(authResult) {
  if (authResult && !authResult.error) {
    // Access token has been successfully retrieved, requests can be sent to the API.
    $('.export-block-gd').addClass('gd-authenticated');
  } else {
    // No access token could be retrieved, show the button to start the authorization flow.
    console.log("g2");
    document.getElementById('x-gd-sign').onclick = function() {
        gapi.auth.authorize(
            {'client_id': gd.CLIENT_ID, 'scope': gd.SCOPES, 'immediate': false},
            gd.handleAuthResult);
    };
  }
}

gd.updateButton = function(status, link){
    $('.export-block-gd').text( status );
    $('.export-block-gd')[0].href = link;
    $('.export-block-gd').off('click');
    
}




function uploadFile(evt) {
  gapi.client.load('drive', 'v2', function() {
    var file = evt.target.files[0];
    insertFile(file);
  });
}

/**
 * Insert new file.
 *
 * @param {File} fileData File object to read data from.
 * @param {Function} callback Function to call when the request is complete.
 */
function insertFile(callback) {
    gd.updateButton("Sending to Drive...");

  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  var reader = exportText.reader();
  console.log(reader);
  reader.onload = function(e) {
    var contentType = 'application/octet-stream';
    var metadata = {
      'title': exportText.name(),
      'mimeType': 'text/html'
    };

    var base64Data = btoa(reader.result);
    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;

    var request = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart','convert':true},
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody});
    if (!callback) {
      callback = function(file) {
        console.log(file);
        console.log("Uploaded to "+file.alternateLink);
        gd.updateButton("Open in Drive -->",file.alternateLink);
      };
    }
    request.execute(callback);
  }
}