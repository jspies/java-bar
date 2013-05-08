var crypto = require('crypto');
var Package = require('./package');

var Path = function(path) {
  this.original_path = path;
  
  this.explodeLibraries = function() {
    var strings = [];
    for(var i=0; i<this.libraries.length;i++) {
      var details = [this.libraries[i].name];
      if (this.libraries[i].version) details.push(this.libraries[i].version);
      strings.push(details.join("-"));
    }
    return strings.join("|");
  }

  this.hash = this.hashIt();
}

Path.prototype.parse = function() {
  var libs = this.original_path.replace("/", "").split("+").sort();
  for(var i=0; i<libs.length;i++) {
    var splitastic = libs[i].split("-"); // gets version
    libs[i] = {name: splitastic[0]}
    if (splitastic[1]) libs[i].version = splitastic[1];
  }
  return libs;
}

Path.prototype.hashIt = function() {
  if (!this.libraries) {
    this.libraries = this.parse();
  }
  var hash = crypto.createHash('sha1');
  hash.update(this.explodeLibraries());
  return hash.digest('hex');
}

Path.prototype.package = function(callback) {
  var self = this;
  Package.findByHash(this.hash, function(pack) {
    if (!pack) {
      Package.createWithBuild({hash: self.hash, libraries: self.libraries}, callback);
    } else {
      callback(pack);
    }
  });
}

module.exports = Path;