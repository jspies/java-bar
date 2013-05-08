var Monglow = require('monglow');
var Library = require('./library');

AVAILABLE_LIBS = {
  "jquery": {
    "name": "jquery",
    "url" : "http://code.jquery.com/jquery-2.0.0.js",
    "host": "code.jquery.com",
    "port": 80,
    "path": "/jquery-2.0.0.js",
    "version": "2.0.0"
  },
  "moment": {
    "host": "raw.github.com",
    "port": 443,
    "path": "/timrwood/moment/2.0.0/moment.js"
  }
}

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
    var pack = new Package(options)
    pack.save(options, function(err, pack) {
      callback(pack);
    });
  });
};

// construct should find persisted Libraries and use them
Package.construct = function(libs, callback) {

  var names = [];
  for(var i=0;i<libs.length;i++) {
    names.push(libs[i].name);
  }

  Library.find({name: {$in: names}}, function(err, items) {
    var orig_code = "";
    for(var i=0;i<items.length;i++) {
      // pick the right version
      orig_code += items[i].versions["2.0.0"].constructed_string;
    }
    
    var final_code = uglify.minify(orig_code, {fromString: true}).code;
    callback(orig_code, final_code);
  })
};

module.exports = Package;