var express = require('express');
var app = express();
var apiRouter = express.Router();

var parameters = require('./parameters.json');

// Le code

// TODO: split this up into different source files
apiRouter.use(function(request, response, pass) {
  // For now just return 404 because there's no api endpoints yet.
  response.sendStatus(404);
});

// If the path starts with /api, give the apiRouter complete control.
app.use('/api', apiRouter);

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
