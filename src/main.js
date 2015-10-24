var express = require('express');
var app = express();

app.get('/index.txt', function(req, res) {
  res.send("BLAAAARGggggghh");
});

var server = app.lister(80, function() {

  stopBeingRoot();

  var host = server.address().address;
  var port = server.address().port;



  console.log('Thing running verily.', host, port);
});

function stopBeingRoot() {
  console.log('UID is currently ' + process.getuid());
  var uid = parseInt(process.env.SUDO_UID);
  if (uid) {
    process.setuid(uid);
  }
  console.log('UID changed to ' + process.getuid());
}
