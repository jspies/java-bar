var crypto = require('crypto');
var Package = require('./package');

var Path = function(path) {
  this.original_path = path;
  this.libraries = this.parse();
  this.hash = this.hashIt();
}

Path.prototype.parse = function() {
  return this.original_path.replace("/", "").split("+").sort();
}

Path.prototype.hashIt = function() {
  if (!this.libraries) {
    this.parse();
  }
  var hash = crypto.createHash('sha1');
  hash.update(this.libraries.join("|"));
  return hash.digest('hex');
}

Path.prototype.package = function(callback) {
  var self = this;
  Package.findByHash(this.hash, function(pack) {
    if (!pack) {
      Package.create({hash: self.hash, libraries: self.libraries}, callback);
    } else {
      callback(pack);
    }
  });
}

module.exports = Path;