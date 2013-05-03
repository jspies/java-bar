var Monglow = require("monglow")
  , http = require("http")
  , https = require("https")
  , Url = require("url");

var connectionUri = process.env.MONGOHQ_URL || "mongodb://localhost:27017/javabar_development";
Monglow.connect(connectionUri);

var Library = Monglow.model("libraries");

Library.prototype.fetch = function(callback) {
  for (version in this.versions) {
    var set = this.versions[version]
    if (!set.url) {
      callback("No URL provided", null);
    }

    var $url = Url.parse(set.url);

    var protocol = $url.protocol === "https:" ? https : http;

    protocol.get(set.url, function(response) {
      var constructed_string = "";
      response.setEncoding('utf8');
      response.on('data', function(data) {
        constructed_string += data;
      }).on('end', function() {
        callback(null, constructed_string);
      });
    });
  }
};

Library.prototype.addVersion = function(version, url, callback) {
  if (this.versions && this.versions[version]) {
    callback("This version already exists");
  } else {
    this.versions = this.versions || {};
    this.versions[version] = {url: url};

    var self = this;
    this.fetch(function(err, jsstring) {
      self.versions[version]["constructed_string"] = jsstring;
      callback(null, true);
    });
  }
};

module.exports = Library;