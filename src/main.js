var cps = require('cps-api');
var express = require('express');
var app = express();

var router404 = express.Router();
var apiRouter = express.Router();

var parameters = require('./parameters.json');

//var cpsConn = new cps.Connection(

// Le 'database' utility functions

function writeJSON(filePath, data) {
  var dataString;

  fs.open(filePath, 'w', function(error, fd) {
    while (dataString === undefined); // wait for JSON.stringify to return
    fs.writeSync(fd, dataString);
  });
  
  dataString = JSON.stringify(data);
}

function readJSON(filePath) {
  var dataString;

  dataString = fs.readFileSync(filePath);

  return JSON.parse(dataString);
}

// Le request methods

// TODO: split this up into different source files
// actually this is just going to be a big mess here

app.post('/api/user/:username', function(request, response) {
  console.log('POST /api/user');

  var username = req.params.username;

});

app.get('/api/user/:username', function(request, response) {
  console.log('looks like you made a GET request for /api/user');

  var username = req.params.username;

});

app.post('/api/course/:courseID', function(request, response) {
  console.log('POST /api/course')

  var courseID = req.params.courseID;
   
  // Just overwrite any valid parameters specified

// instructor is auto-filled
//  if (request.query.instructor ===

 
});

app.get('/api/course/:courseID', function(request, response) {
  console.log('GET /api/course');

  var courseID = req.params.courseID;

});


router404.use(function(request, response, pass) {
  response.sendStatus(404);
});

// Any api endpoint that hasn't been found yet is a 404
app.use('/api', router404);

// For now, everything else can be handled by the static file middleware thingy.
app.use(express.static(parameters.staticBase));

var server = app.listen(parameters.port, function() {

  stopBeingRoot();

  var host = server.address().address;
  var port = server.address().port;

  console.log('hackingedutube running on port ' + port);
 
});

// If you're running Windows you should circumvent this function.
function stopBeingRoot() {
  var startingUID = process.getuid();

  var uid = parseInt(process.env.SUDO_UID);
  if (uid) {
    process.setuid(uid);
  }

  var endingUID = process.getuid();

  if (startingUID === endingUID) {
    console.error('Unable to change the UID. Let\'s assume that\'s bad.');
    process.exit(1); // Generic error code
  }
}
