var sinon = require('sinon')

var Submission = require('../models/submission');
var Library = require('../models/library');

describe("Submission", function() {
  describe("initialize", function(done) {
    it("should have an error with no inputs", function(done) {
      var s = new Submission();
      s.errors.should.equal("name, version, url required.");
      done();
    });

    it("should have an error with no name", function(done) {
      var s = new Submission({version: "1.0.0", url: "here"});
      s.errors.should.equal("name required.");
      done();
    });

    it("should have an error with no version", function(done) {
      var s = new Submission({name: "name", url: "here"});
      s.errors.should.equal("version required.");
      done();
    });
  });

  describe("this.store", function(done) {
    it("should return errors if there are errors", function(done) {
      var s = new Submission();
      s.store(function(err, finished) {
        err.should.not.equal("");
        done();
      });
    });

    it("should tell us if the version already exists", function(done) {
      sinon.stub(Library, "findOne").callsArgWith(1, null, new Library({
        name: "backbone",
        versions: [{version: "1.0.0", url: "boo"}]
      }));
      var s = new Submission({name: "backbone", version: "1.0.0", url: "skip"});

      s.store(function(err, finished) {
        err.should.equal("This already exists! Thanks anyway.");
        done();
      })
    });
  });
});