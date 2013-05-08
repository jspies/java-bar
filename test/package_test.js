var sinon = require('sinon')

var Package = require('../models/package');

describe("Package", function() {
  describe("this.findByHash()", function() {
    it("should call find with the hash", function(done) {
      var spy = sinon.spy(Package, 'find')
      Package.findByHash("HASH", function(err, pack) {
        spy.calledWith({hash: "HASH"}).should.equal(true);
        done();
      })
    })
  });
});