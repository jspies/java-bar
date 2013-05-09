var Library = require("./library");

var Submission = function(options) {
  var required = [];
  this.errors = "";
  options = options || {};
  if (!options.name) { required.push("name"); }
  if (!options.version) { required.push("version"); }
  if (!options.url) { required.push("url"); }

  if (required.length > 0) this.errors = required.join(", ") + " required.";
  
  this.name = options.name;
  this.version = options.version;
  this.url = options.url;
};

Submission.prototype.store = function(callback) {
  var self = this;
  if (this.errors.length > 0) {
    callback(this.errors);
  } else {
    Library.findOne({name: this.name}, function(err, library) {
      if(!library) { library = new Library({name: self.name, versions: []}); }

      if (library.hasVersion(self.version)) {
        callback("This already exists! Thanks anyway.");
      } else {
        library.addVersion({version: self.version, url: self.url}, function(err, library) {
          console.log("i am lost")
          if (err) {
            callback(err);
          } else {
            callback(null, true);
          }
        });
      }
    });
  }
};

module.exports = Submission;