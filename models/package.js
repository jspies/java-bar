var Monglow = require('monglow');
var Library = require('./library');

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
  // libs look like this: [{hash: "Sdgsdf", libraries: [{name: "jquery", version: "2.0.0"}]}]
  var names = [];
  var libraries_by_name = {};
  for(var i=0;i<libs.length;i++) {
    libraries_by_name[libs[i].name] = libs[i];
    names.push(libs[i].name);
  }

  Library.find({name: {$in: names}}, function(err, items) {
    var orig_code = "";
    for(var i=0;i<items.length;i++) {
      // pick the right version

      if (!libs[items[i].name].version) {
        // get latest version
      } else if (items[i].versions[libs[items[i].name].version]) {
        orig_code += items[i].versions[libs[items[i].name].version].constructed_string;  
      } else {
        // we don't have that version
      }
      
    }
    
    var final_code = uglify.minify(orig_code, {fromString: true}).code;
    callback(orig_code, final_code);
  })
};

module.exports = Package;