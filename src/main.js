var fs = require('fs');
var crypto = require('crypto');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

var router404 = express.Router();
var apiRouter = express.Router();

var parameters = require('./parameters.json');

// Le 'database' utility functions

function getHashPath(id, endpoint) {
  idHasher = crypto.createHash('sha512');
  idHasher.update(id, 'utf8');
  var hash = idHasher.digest('base64');
  hash = hash.replace(/\//g, '_').replace(/\+/g, '-');// make it filesystem/url safe
  console.log('hash for id ' + id + ' is ' + hash);
  return parameters.databasePath + '/' + endpoint + '/' + hash;
}

function resourceExists(filePath) {
  return fs.statSync(filePath).isFile();
}

function writeJSON(filePath, data) {
  var dataString;

  console.log('opening file ' + filePath);
  fs.open(filePath, 'w', function(error, fd) {
    console.log('opened file, error is ' + error + ', fd is ' + fd);
    if (error && error.code === 'ENOENT') {
      console.error('could not open file ' + filePath);
      return;
    }

    dataString = JSON.stringify(data);
    console.log('JSON data is ' + dataString);
    fs.writeSync(fd, dataString);
    console.log('wrote data to fd ' + fd);
  });
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
  'teachingCourses',
  'biography',
  'interests'
];

app.post('/api/user/:username', function(request, response) {
  console.log('POST /api/user');

  // wow, neat, thanks
  response.sendStatus(200); // TODO 201 could be better

  var username = request.params.username;
  var filePath = getHashPath(username, 'users');
  var data;

  // see if it exists
  fs.stat(filePath, function(error, stats) {
    if (error) {
      data = {};
    }
    else if (stats && stats.isFile()) {
      data = readJSON(filePath);
    }
    else {
      data = {};
    }

    for (var i = 0; i < userOptionalProperties.length; ++i) {
      var value = request.body[userOptionalProperties[i]];
      if (value !== undefined) {
        if (userOptionalProperties[i] === 'enrolledCourses') {
          data.enrolledCourse = value.split(',');
	}
	else if (userOptionalProperties[i] === 'teachingCourses') {
	  data.teachingCourses = value.split(',');
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

  // neatooo
  response.sendStatus(200);

  var courseID = request.params.courseID;
  var filePath = getHashPath(courseID, 'courses');
  var data;

  // see if it exists
  fs.stat(filePath, function(error, stats) {
    if (error) {
      data = {};
    }
    else if (stats && stats.isFile()) {
      data = readJSON(filePath);
    }
    else {
      data = {};
    }

    for (var i = 0; i < courseOptionalProperties.length; ++i) {
      var value = request.body[courseOptionalProperties[i]];
      if (value !== undefined) {
        if (courseOptionalProperties[i] === 'videos') {
          data.videos = value.split(',');
	}
	else {
	  data[courseOptionalProperties[i]] = value;
	}
      }
    }

    writeJSON(filePath, data);
  });  
});

app.get('/api/course/:courseID', function(request, response) {
  console.log('GET /api/course');

  var courseID = request.params.courseID;

  var filePath = getHashPath(courseID, 'courses');

  if (!resourceExists(filePath)) {
    response.sendStatus(404);
    return;
  }

  var data = fs.readFileSync(filePath);
  response.send(data);
});

var videoOptionalProperties =
[
  'sectionTitle',
  'duration',
  'notes'
];

app.post('/api/video/:videoID', function(request, response) {

  // whoopeee
  response.sendStatus(200);

  var videoID = request.params.videoID;
  var filePath = getHashPath(videoID, 'videos');
  var data;

  // see if it exists
  fs.stat(filePath, function(error, stats) {
    if (error) {
      data = {};
    }
    else if (stats && stats.isFile()) {
      data = readJSON(filePath);
    }
    else {
      data = {};
    }

    for (var i = 0; i < courseOptionalProperties.length; ++i) {
      var value = request.body[videoOptionalProperties[i]];
      if (value !== undefined) {
        data[videoOptionalProperties[i]] = value;
      }
    }

    writeJSON(filePath, data);
  });  
});

// Note: the videoID is the same as the YouTube video ID
app.get('/api/video/:videoID', function(request, response) {

  var videoID = request.params.videoID;

  var filePath = getHashPath(videoID, 'videos');

  if (!resourceExists(filePath)) {
    response.sendStatus(404);
    return;
  }

  var data = fs.readFileSync(filePath);
  response.send(data);
});

app.post('/api/progress', function(request, response) {
  if (request.query.username === undefined) {
    response.sendStatus(400);
    return;
  }

  if (request.query.courseID === undefined) {
    response.sendStatus(400);
    return;
  }

  // yepppp
  response.sendStatus(200);

  var username = request.query.username;
  var courseID = request.query.courseID;
  
  var id = username + 'lololl' + courseID;

  var filePath = getHashPath(id, 'progress');

  fs.stat(filePath, function(error, stats) {
    if (error) {
      data = {};
    }
    else if (stats && stats.isFile()) {
      data = readJSON(filePath);
    }
    else {
      data = {};
    }

    data.username = username;
    data.courseID = courseID;

    if (request.query.duration !== undefined) {
      data.duration = request.query.duration;
    }

    writeJSON(filePath, data);
  });  
});

app.get('/api/progress', function(request, response) {
  if (request.query.username === undefined) {
    response.sendStatus(400);
    return;
  }
  
  if (request.query.courseID === undefined) {
    reponse.sendStatus(400);
    return;
  }

  var username = request.query.username;
  var courseID = request.query.courseID;

  // TODO attackers could easily engineer collisions but oh well for now
  var id = username + "lololl" + courseID;

  var filePath = getHashPath(id, 'progress');

  if (!resourceExists(filePath)) {
    response.sendStatus(404);
    return;
  }

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

  stopBeingRoot(); // It's just rude.

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
