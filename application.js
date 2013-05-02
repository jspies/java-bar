var express = require("express");
var app = express();

var Package = require('./models/package');
var Path = require('./models/path');

var port = process.env.PORT || 3000;

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