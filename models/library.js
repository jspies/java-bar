var Monglow = require("monglow")
  , http = require("http")
  , https = require("https")
  , Url = require("url");

var connectionUri = process.env.MONGOHQ_URL || "mongodb://localhost:27017/javabar_development";
Monglow.connect(connectionUri);

var Library = Monglow.model("libraries");

Library.prototype.fetch = function(url, callback) {
  if (!url) {
    callback("No URL provided");
    return false;
  }

  var $url = Url.parse(url);
  var protocol = $url.protocol === "https:" ? https : http;

  protocol.get(url, function(response) {
    var constructed_string = "";
    response.setEncoding('utf8');
    response.on('data', function(data) {
      constructed_string += data;
    }).on('end', function() {
      callback(null, constructed_string);
    });
  });
};

Library.prototype.getVersion = function(version) {
  if (!this.versions) return null;
  for(var i=0;i<this.versions.length;i++) {
    if (this.versions[i].version == version) return this.versions[i];
  }
  return null;
};

Library.prototype.hasVersion = function(version) {
  if (this.getVersion(version)) return true;
  return false;
}

Library.prototype.addVersion = function(options, callback) {
  if (this.hasVersion(options.version)) {
    callback("This version already exists");
  } else {
    this.versions = this.versions || [];

    var self = this;
    this.fetch(options.url, function(err, jsstring) {
      if (err) { callback(err); } else {
        options.constructed_string = jsstring;
        console.log(options);

        self.versions.push(options);

        self.save(function(err) {
          if (err) {
            callback(err);
          } else {
            callback(null, self);
          }
        });
      }
    });
  }
};

module.exports = Library;