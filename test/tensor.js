var Tensor = require("../src/tensor.js").Tensor;
var chai = require("chai");
var assert = chai.assert;
var expect = chai.expect;
var assertArrays = require('chai-arrays');
var sinonChai = require('chai-sinon');
var sinon = require('sinon');
chai.use(assertArrays);
chai.use(sinonChai);


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
        it('should throw and error (different dims same level)', function()
        {
            function throwError()
            {
                new Tensor([[1, 2], [3], [4]]);
            }

            expect(throwError).to.throw(Error);
        });
        it('should return and object without errors (several args)', function()
        {
            new Tensor(2, 3, 4);
        });
        it('should return and object without errors (from array)', function()
        {
            new Tensor([0, 0, 0]);
        });
        it('should return correct size', function()
        {
            var t = new Tensor(2, 3, 10);
            assert(t.getSize() == 60);
        });
        it('should return correct size (from array)', function()
        {
            var t = new Tensor([[1, 2], [3, 4]]);
            assert(t.getSize() == 4);
        });
        it('should return correct size 0', function()
        {
            var t = new Tensor();
            assert(t.getSize() == 0);
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
        it('should return correct shape (from array)', function()
        {
            var t = new Tensor([[[],[],[]],[[],[],[]]]);
            var s = t.getShape();
            assert.isArray(s);
            expect(s).to.be.equalTo([2, 3, 0]);
        });
    });
    describe('clone', function()
    {
        it('shallow clone', function()
        {
            var t = new Tensor([1, 2]);
            var tClone = t.shallowClone();
            t.set(0, 0);
            assert(tClone.get(0) == 0);
        });
        it('shallow clone constructor', function()
        {
            var t = new Tensor([1, 2]);
            var tClone = new Tensor(t, true);
            t.set(0, 0);
            assert(tClone.get(0) == 0);
        });
        it('depth clone', function()
        {
            var t = new Tensor([1, 2]);
            var tClone = t.clone();
            t.set(0, 0);
            assert(tClone.get(0) == 1);
        });
        it('depth clone constructor', function()
        {
            var t = new Tensor([1, 2]);
            var tClone = new Tensor(t);
            t.set(0, 0);
            assert(tClone.get(0) == 1);
        });
        it('should return correct shape', function()
        {
            var t = new Tensor(7, 3, 5);
            var tClone = t.clone();
            var s = tClone.getShape();
            assert.isArray(s);
            expect(s).to.be.equalTo([7, 3, 5]);
        });
    });
    describe('algebra', function()
    {
        it('should return correct sum', function()
        {
            var t1 = new Tensor([[1, 2], [3, 4]]);
            var t2 = new Tensor([[4, 3], [2, 1]]);
            var t3 = t1.add(t2);
            assert(t3 instanceof Tensor);
            expect(t3._data).to.be.equalTo([5, 5, 5, 5]);
        });
    });
    describe('set-get-index', function()
    {
        it('should return the correct index', function()
        {
            var t = new Tensor(3, 2);
            assert(t.toIndex(2, 1) == 5);
        });
        it('should set the correct position', function()
        {
            var t = new Tensor(3, 2);
            t.set(2, 1, 7);
            for (var i = 0; i < t._size; ++i)
                if (i == 5)
                    assert(t._data[5] == 7);
                else
                    assert(t._data[i] == 0);
        });
        it('should get the correct position', function()
        {
            var t = new Tensor(3, 2);
            t.set(2, 1, 7);
            assert(t.get(2, 1) == 7);
        });
        it('should get the correct coordinates', function()
        {
            var t = new Tensor(3, 2);
            var c = t.toCoordinates(3);
            assert.isArray(c);
            expect(c).to.be.equalTo([1, 1]);
        });
    });
    describe('to string', function()
    {
        it('should return correct string', function()
        {
            var t = new Tensor(2, 2, 2);
            assert(t.toString() == "[[[0, 0],\n  [0, 0]],\n [[0, 0],\n  [0, 0]]]");
        });
        it('should return correct string with values', function()
        {
            var t = new Tensor(1, 1, 2);
            t._data[0] = 2;
            t._data[1] = 3;
            assert(t.toString() == "[[[2, 3]]]");
        });
        it('should call console.log', function()
        {
            // Spy works similar, but does call the method.
            //sinon.spy(console, 'log');
            // Stub does not call the log, so no output is shown in console.
            sinon.stub(console, 'log');
            var t = new Tensor([1, 2]);
            t.print();
            /* jshint expr:true */
            expect(console.log).to.be.called;
            console.log.restore();
        });
    });
});
