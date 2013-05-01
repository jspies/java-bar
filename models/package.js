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
var http = require('http');
var https = require('https');
var async = require('async');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('javabar_development', server);
 
db.open(function(err, db) {
  if(!err) {
    console.log("Connected to 'javabar' database");

    db.collection('packages', {strict:true}, function(err, collection) {
      if (err) {
        console.log("The 'packages' collection doesn't exist. Creating it.");
      } else {
        collection.remove();
      }
    });
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
  this.construct(options.libraries, function(constructed_string) {
    options.constructed_string = constructed_string;
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
    }
    i++;
  }

  async.mapSeries(methods, this.fetch, function(err, results) {
    callback(results.join(""));
  })
};

Package.fetch = function(options, callback) {
  var constructed_string = "";
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


module.exports = Package;