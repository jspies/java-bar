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

var mongo = require('mongodb');
var connect = require('connect');
var http = require('http');
var https = require('https');
var async = require('async');
var uglify = require("uglify-js");
 
var connectionUri = process.env.MONGOHQ_URL || "mongodb://localhost:27017/javabar_development";
var db;

mongo.Db.connect(connectionUri, function(err, database) {
  if(!err) {
    db = database;
    console.log("Connected to 'javabar' database");
    db.collection('packages', function(er, collection) {
      collection.insert({'name': 'steve'}, {"safe": true}, function(err, item) {});
    })
  }
});

var Package = function() {}
 
Package.findByHash = function(hash, callback) {
  db.collection('packages', function(err, collection) {
    collection.findOne({'hash': hash}, function(err, item) {
      callback(item);
    });
  });
};

Package.create = function(options, callback) {
  // build the js!
  this.construct(options.libraries, function(constructed_string, minified_string) {
    options.constructed_string = constructed_string;
    options.minified_string = minified_string;
    db.collection('packages', function(err, collection) {
      collection.insert(options, function(err, item) {
        callback(item[0]);
      });
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