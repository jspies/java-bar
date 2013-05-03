require('should');
var crypto = require('crypto');

var Path = require('../models/path');

describe("Path", function() {
  describe("this.parse()", function() {

    it("should return an array", function(done) {
      var path = new Path("/jquery-2.0.0");
      path.parse().should.be.an.instanceof(Array);
      done();
    });

    it("each entry should have a name", function(done) {
      var path = new Path("/jquery");
      var libs = path.parse();
      libs[0].name.should.equal("jquery");
      done();
    });

    it("each entry should have a version if there is a dash", function(done) {
      var path = new Path("/jquery-2.0.0");
      var libs = path.parse();
      libs[0].version.should.equal("2.0.0");
      done();
    });
  });

  describe("this.hashIt()", function() {
    it("should return a hash from the name string", function(done) {
      var path = new Path("/jquery-2.0.0+moment");
      console.log(path.explodeLibraries())
      var hash = crypto.createHash('sha1');
      hash.update("jquery-2.0.0|moment");
      path.hashIt().should.equal(hash.digest('hex'));
      done();
    });
  })
});