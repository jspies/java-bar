var sinon = require('sinon')

var Library = require('../models/library');

describe("Library", function() {
  describe("this.fetch()", function(done) {
    
  });

  describe("this.addVersion", function(done) {

  });

  describe("this.getLatestVersion", function(done) {
    it("should return the latest version by sorting", function(done) {
      var l = new Library({name: "sortable", versions: [
          {version: "1.2.3", url: "boomhauer"},
          {version: "2.2.3", url: "hauer"},
          {version: "1.1.3", url: "boom"}
        ]});
      l.getLatestVersion().version.should.equal("2.2.3");
      done();
    });
  });

  describe("this.getVersion", function(done) {
    it("should return null if not found", function(done) {
      var l = new Library({name: "backbone"});
      (l.getVersion("1.0.1") == null).should.equal(true);
      done();
    });

    it("should find the version", function(done) {
      var l = new Library({name: "backbone", versions: [{version: "1.0.0", url: "boom"}]});
      l.getVersion("1.0.0").should.equal(l.versions[0]);
      done();
    });
  });

  describe("this.hasVersion", function(done) {
    it("should know if it as a version", function(done) {
      var l = new Library({name: "backbone", versions: [{version: "1.0.0", url: "boom"}]});
      l.hasVersion("1.0.0").should.equal(true);
      done();
    });

    it("should know if it does not have version", function(done) {
      var l = new Library({name: "backbone", versions: [{version: "1.0.0", url: "boom"}]});
      l.hasVersion("1.0.1").should.equal(false);
      done();
    });

    it("should return false if there are no versions", function(done) {
      var l = new Library({name: "backbone"});
      l.hasVersion("1.0.1").should.equal(false);
      done();
    });
  })
});