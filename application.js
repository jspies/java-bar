var express = require("express");
var app = express();

var Package = require('./models/package')
  , Path = require('./models/path')
  , Library = require('./models/library');

var port = process.env.PORT || 3000;

app.get("/submit", function(request, response) {
  var errors = [];
  if (!request.query.name) { errors.push("Name required"); }
  if (!request.query.version) { errors.push("Version required"); }
  if (!request.query.url) { errors.push("URL required"); }
    
  if (errors.length > 0) {
    response.send(errors.join("\n"));
  } else {
    Library.find(function(err, libs) {
      var lib;
      if (libs.length > 0) {
        lib = libs[0];
      } else {

        lib = new Library({name: request.query.name});
        lib.addVersion(request.query.version, request.query.url, function(err, success) {
          if (success) {
            lib.save(function() {});
          }
        });
      }

      if (lib.versions[request.query.version]) {
        response.send("This already exists! Thanks anyway.");
      } else {

      }
    });
  }
});

app.get("/all", function(request, response) {
  response.send("View All Known Libs");
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