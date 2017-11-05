var Tensor = require("../src/tensor.js").Tensor;
var chai = require("chai");
var assert = chai.assert;
var expect = chai.expect;
var assertArrays = require('chai-arrays');
chai.use(assertArrays);


describe('tensor.js', function()
{
    describe('constructor', function()
    {
        it('should return and object without errors', function()
        {
            new Tensor();
        });
        it('should throw and error (negative params)', function()
        {
            function throwError()
            {
                new Tensor(-1);
            }

            expect(throwError).to.throw(Error);
        });
        it('should return and object without errors (several args)', function()
        {
            new Tensor(2, 3, 4);
        });
        it('should return correct size', function()
        {
            var t = new Tensor(2, 3, 10);
            assert(t.getSize() == 60);
        });
        it('should return correct length', function()
        {
            var t = new Tensor(12, 2);
            assert(t._data.length == 24);
        });
        it('should return correct number of dimensions', function()
        {
            var t = new Tensor(1, 2, 3, 4, 5);
            assert(t.getNumDim() == 5);
        });
        it('should return correct shape', function()
        {
            var t = new Tensor(7, 3, 5);
            var s = t.getShape();
            assert.isArray(s);
            expect(s).to.be.equalTo([7, 3, 5]);
        });
    });
    describe('algebra', function()
    {
        it('should return correct length', function()
        {
            var t1 = new Tensor(3, 2);
            var t2 = new Tensor(3, 2);
        });
    });
});
