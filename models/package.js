// Package model
AVAILABLE_LIBS = {
  "jquery": {
    "host": "code.jquery.com",
    "port": 80,
    "path": "/jquery-2.0.0.js"
  },
  "moment": {
    "host": "raw.github.com",
    "port": 443,
    "path": "/timrwood/moment/2.0.0/moment.js"
  }
}

var Monglow = require('monglow');
console.log("Monglow: ", Monglow);
var http = require('http');
var https = require('https');
var async = require('async');
var uglify = require("uglify-js");
 
var connectionUri = process.env.MONGOHQ_URL || "mongodb://localhost:27017/javabar_development";

Monglow.connect(connectionUri);

var Package = Monglow.model('packages');
 
Package.findByHash = function(hash, callback) {
  this.find({'hash': hash}, function(err, packages) {
    callback(packages[0] || null);
  });
};

Package.createWithBuild = function(options, callback) {
  // build the js!
  var self = this;
  this.construct(options.libraries, function(constructed_string, minified_string) {
    options.constructed_string = constructed_string;
    options.minified_string = minified_string;
    this.create(options, function(err, item) {
      callback(item[0]);
    });
  });
};

Package.construct = function(libs, callback) {
  var i = 0;
  var methods = [];
  while( i < libs.length) {
    if (AVAILABLE_LIBS[libs[i]]) {
      methods.push(AVAILABLE_LIBS[libs[i]]);
    } else {
      methods.push({"error": "We do not know about " + libs[i]})
    }
    i++;
  }

  async.mapSeries(methods, this.fetch, function(err, results) {

    var orig_code = results.join("");
    var final_code = uglify.minify(orig_code, {fromString: true}).code;

    callback(orig_code, final_code);
  })
};

Package.fetch = function(options, callback) {
  var constructed_string = "";
  if (options.error) {
    callback(null, "alert('"+ options.error +"');\n")
  } else {
    var serv = https;
    if (options.port == 80) {
      serv = http;
    }
    serv.get(options, function(response) {
      response.setEncoding('utf8');
      response.on('data', function(data) {
        constructed_string += data;
      }).on('end', function() {
        callback(null, constructed_string);
      });
    });
  }
  
}


module.exports = Package;