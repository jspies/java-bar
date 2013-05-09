var express = require("express");
var app = express();

var Package = require('./models/package')
  , Path = require('./models/path')
  , Library = require('./models/library')
  , Submission = require('./models/submission');

var port = process.env.PORT || 3000;

app.get("/submit", function(request, response) {
  var submission = new Submission({
    name: request.query.name,
    version: request.query.version,
    url: request.query.url
  });

  submission.store(function(err, finished) {
    if (err) { response.send(err); } else {
      response.send({
        message: "Fin",
        all_url: "/all"
      });
    }
  });
});

app.get("/all", function(request, response) {
  Library.find({}, {"versions.constructed_string": 0}, function(err, libs) {
    if (err) { response.send(err);} else {
      response.send(libs);
    }
  });
});

app.use(function(request, response) {
  var path = new Path(request.path);

  response.setHeader('Content-Type', 'text/plain');

  path.package(function(pack) {
    response.send(pack.minified_string);
  });
});

app.listen(port);

console.log("Listening on port ", port);