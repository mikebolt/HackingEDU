var fs = require('fs');
var crypto = require('crypto');
var express = require('express');
var app = express();

var router404 = express.Router();
var apiRouter = express.Router();

var parameters = require('./parameters.json');

// doing the hashing so that users can't exploit relative filenames
var idHasher = crypto.createHash('sha512');

// Le 'database' utility functions

function getHashPath(id, endpoint) {
  idHasher.update(id, 'utf8');
  var hash = idHasher.digest('base64');
  return parameters.databasePath + '/' + endpoint + '/' + hash;
}

function writeJSON(filePath, data) {
  var dataString;

  fs.open(filePath, 'w', function(error, fd) {
    if (error === undefined) {
      while (dataString === undefined); // wait for JSON.stringify to return
      fs.writeSync(fd, dataString);
    }
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

var userOptionalProperties =
[
  'email',
  'enrolledCourses',
  'biography',
  'interests'
];

app.post('/api/user/:username', function(request, response) {
  console.log('POST /api/user');

  var username = request.params.username;

  var filePath = getHashPath(username, 'users');

  var data;

  // see if it exists
  fs.stat(filePath, function(error, stats) {
    if (error !== undefined) {
      data = {};
    }
    else if (stats.isFile()) {
      data = readJSON(filePath);
      //
    }
    else {
      data = {};
    }

    for (var i = 0; i < userOptionalProperties.length; ++i) {
      var value = request.params[userOptionalProperties[i]];
      if (value !== undefined) {
        if (userOptionalProperties[i] === 'enrolledCourses') {
          data['enrolledCourses'] = value.split(',');
	}
	else {
	  data[userOptionalProperties[i]] = value;
	}
      }
    }

    writeJSON(filePath, data);
  });
});

app.get('/api/user/:username', function(request, response) {
  console.log('looks like you made a GET request for /api/user');

  var username = request.params.username;

  var filePath = getHashPath(username, 'users');

  // assume nothing could possibly go wrong
  var data = fs.readFileSync(filePath);

  response.send(data);
});

var courseOptionalProperties =
[
  'duration',
  'instructor',
  'videos'
];

app.post('/api/course/:courseID', function(request, response) {
  console.log('POST /api/course')

  var courseID = request.params.courseID;

  var filePath = getHashPath(courseID, 'courses');
   
  // Just overwrite any valid parameters specified

// instructor is auto-filled
//  if (request.query.instructor ===

 
});

app.get('/api/course/:courseID', function(request, response) {
  console.log('GET /api/course');

  var courseID = request.params.courseID;

  var filePath = getHashPath(courseID, 'courses');

  var data = fs.readFileSync(filePath);

  response.send(data);
});

app.post('/api/video/:videoID', function(request, response) {

  var videoID = request.params.videoID;

  var filePath = getHashPath(videoID, 'videos');
});

// Note: the videoID is the same as the YouTube video ID
app.get('/api/video/:videoID', function(request, response) {

  var videoID = request.params.videoID;

  var filePath = getHashPath(videoID, 'videos');

  var data = fs.readFileSync(filePath);

  response.send(data);
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
