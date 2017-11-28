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
        it('should return correct size (from object)', function()
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
            assert(t.getNumDims() == 5);
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
        it('should return correct shape (from object)', function()
        {
            var t = new Tensor({shape: [7, 3, 5]});
            var s = t.getShape();
            assert.isArray(s);
            expect(s).to.be.equalTo([7, 3, 5]);
        });
        it('should return correct shape and data', function()
        {
            var t = new Tensor({data: [[1, 2, 3, 4]], shape: [2, 2]});
            expect(t.getShape()).to.be.equalTo([2, 2]);
            expect(t._data).to.be.equalTo([1, 2, 3, 4]);
        });
    });
    describe('helper constructors', function()
    {
        it('should return correct range without start', function()
        {
            var t = Tensor.range(5);
            expect(t.getShape()).to.be.equalTo([5]);
            expect(t._data).to.be.equalTo([0, 1, 2, 3, 4]);
        });
        it('should return correct range with start and end', function()
        {
            var t = Tensor.range(5, 10);
            expect(t.getShape()).to.be.equalTo([5]);
            expect(t._data).to.be.equalTo([5, 6, 7, 8, 9]);
        });
        it('should return correct range with negative increments', function()
        {
            var t = Tensor.range(5, 0, -1);
            expect(t.getShape()).to.be.equalTo([5]);
            expect(t._data).to.be.equalTo([5, 4, 3, 2, 1]);
        });
    });
    describe('copy', function()
    {
        it('shallow copy', function()
        {
            var t = new Tensor([1, 2]);
            var tClone = t.copy();
            t.set(0, 0);
            assert(tClone.get(0) == 0);
        });
        it('shallow copy constructor', function()
        {
            var t = new Tensor([1, 2]);
            var tClone = new Tensor(t);
            t.set(0, 0);
            assert(tClone.get(0) == 0);
        });
        it('deep copy', function()
        {
            var t = new Tensor([1, 2]);
            var tClone = t.deepcopy();
            t.set(0, 0);
            assert(tClone.get(0) == 1);
        });
        it('deep copy constructor', function()
        {
            var t = new Tensor([1, 2]);
            var tClone = new Tensor(t, true);
            t.set(0, 0);
            assert(tClone.get(0) == 1);
        });
        it('copies should return correct shape', function()
        {
            var t = new Tensor(7, 3, 5);
            var tClone = t.copy();
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
            // t1 and t2 must be intact.
            expect(t1._data).to.be.equalTo([1, 2, 3, 4]);
            expect(t2._data).to.be.equalTo([4, 3, 2, 1]);
        });
        it('should return correct subtraction', function()
        {
            var t1 = new Tensor([[1, 2], [3, 4]]);
            var t2 = new Tensor([[4, 3], [2, 1]]);
            var t3 = t1.subtract(t2);
            assert(t3 instanceof Tensor);
            expect(t3._data).to.be.equalTo([-3, -1, 1, 3]);
            // t1 and t2 must be intact.
            expect(t1._data).to.be.equalTo([1, 2, 3, 4]);
            expect(t2._data).to.be.equalTo([4, 3, 2, 1]);
        });
        it('should return correct apply', function()
        {
            var t1 = new Tensor([[1, 2], [3, 4]]);
            var t2 = t1.apply(function (x) { return x*x; });
            assert(t2 instanceof Tensor);
            expect(t2._data).to.be.equalTo([1, 4, 9, 16]);
            // t1 must be intact.
            expect(t1._data).to.be.equalTo([1, 2, 3, 4]);
        });
        it('should return correct dot product between vectors', function()
        {
            var t1 = new Tensor([1, 2, 3]);
            var t2 = new Tensor([3, 2, 1]);
            var t3 = t1.dot(t2);
            assert(t3 instanceof Tensor);
            expect(t3.getShape()).to.be.equalTo([1]);
            expect(t3._data).to.be.equalTo([10]);
            // t1 and t2 must be intact.
            expect(t1._data).to.be.equalTo([1, 2, 3]);
            expect(t1.getShape()).to.be.equalTo([3]);
            expect(t2._data).to.be.equalTo([3, 2, 1]);
            expect(t2.getShape()).to.be.equalTo([3]);
        });
        it('should return correct dot product between matrix and vector', function()
        {
            var t1 = new Tensor([[1, 2, 3], [1, 2, 3]]);
            var t2 = new Tensor([3, 2, 1]);
            var t3 = t1.dot(t2);
            assert(t3 instanceof Tensor);
            expect(t3.getShape()).to.be.equalTo([2]);
            expect(t3._data).to.be.equalTo([10, 10]);
            // t1 and t2 must be intact.
            expect(t1._data).to.be.equalTo([1, 2, 3, 1, 2, 3]);
            expect(t1.getShape()).to.be.equalTo([2, 3]);
            expect(t2._data).to.be.equalTo([3, 2, 1]);
            expect(t2.getShape()).to.be.equalTo([3]);
        });
        it('should return correct dot product between matrices', function()
        {
            var t1 = new Tensor([[1, 2, 3], [1, 2, 3]]);
            var t2 = new Tensor([[2, 1], [2, 1], [2, 1]]);
            var t3 = t1.dot(t2);
            assert(t3 instanceof Tensor);
            expect(t3.getShape()).to.be.equalTo([2, 2]);
            expect(t3._data).to.be.equalTo([12, 6, 12, 6]);
            // t1 and t2 must be intact.
            expect(t1._data).to.be.equalTo([1, 2, 3, 1, 2, 3]);
            expect(t1.getShape()).to.be.equalTo([2, 3]);
            expect(t2._data).to.be.equalTo([2, 1, 2, 1, 2, 1]);
            expect(t2.getShape()).to.be.equalTo([3, 2]);
        });
        it('should return correct dot product between tensor and vector', function()
        {
            var t1 = new Tensor([[[1,2],[3,4]], [[5,6],[7,8]]]);
            var t2 = new Tensor([1, 2]);
            var t3 = t2.dot(t1);
            assert(t3 instanceof Tensor);
            expect(t3.getShape()).to.be.equalTo([2, 2]);
            expect(t3._data).to.be.equalTo([7, 10, 19, 22]);
            // t1 and t2 must be intact.
            expect(t1._data).to.be.equalTo([1, 2, 3, 4, 5, 6, 7, 8]);
            expect(t1.getShape()).to.be.equalTo([2, 2, 2]);
            expect(t2._data).to.be.equalTo([1, 2]);
            expect(t2.getShape()).to.be.equalTo([2]);
        });
        it('should return correct dot product between vector and tensor', function()
        {
            var t1 = new Tensor([[[1,2],[3,4]], [[5,6],[7,8]]]);
            var t2 = new Tensor([1, 2]);
            var t3 = t1.dot(t2);
            assert(t3 instanceof Tensor);
            expect(t3.getShape()).to.be.equalTo([2, 2]);
            expect(t3._data).to.be.equalTo([5, 11, 17, 23]);
            // t1 and t2 must be intact.
            expect(t1._data).to.be.equalTo([1, 2, 3, 4, 5, 6, 7, 8]);
            expect(t1.getShape()).to.be.equalTo([2, 2, 2]);
            expect(t2._data).to.be.equalTo([1, 2]);
            expect(t2.getShape()).to.be.equalTo([2]);
        });
    });
    describe('shapes', function()
    {
        it('correct reshape', function()
        {
            var t1 = new Tensor(2, 3, 1);
            var t2 = t1.reshape(3, 2);
            expect(t2.getShape()).to.be.equalTo([3, 2]);
            // t1 must be intact.
            expect(t1.getShape()).to.be.equalTo([2, 3, 1]);
        });
        it('size must be the same after reshape', function()
        {
            function throwError()
            {
                var t = new Tensor(2, 3, 2);
                t.reshape(3, 2);
            }

            expect(throwError).to.throw(Error);
        });
        it('infer size', function()
        {
            var t1 = new Tensor(2, 3);
            var t2 = t1.reshape(3, -1);
            expect(t2.getShape()).to.be.equalTo([3, 2]);
            // t1 must be intact.
            expect(t1.getShape()).to.be.equalTo([2, 3]);
        });
        it('infer more than one size', function()
        {
            function throwError()
            {
                var t = new Tensor(2, 3);
                t.reshape(3, -1, -1);
            }

            expect(throwError).to.throw(Error);
        });
        it('flatten', function()
        {
            var t = new Tensor([[2], [3]]);
            var t2 = t.flatten();
            expect(t2.getShape()).to.be.equalTo([2]);
            // t must be intact.
            expect(t.getShape()).to.be.equalTo([2, 1]);
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
        it('should return correct tensor', function()
        {
            var t = new Tensor([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]]);
            var slice = t.slice(-1, 3);
            assert(slice instanceof Tensor);
            assert(slice.getSize() == 3);
            assert(slice._offset == 3);
            expect(slice.getShape()).to.be.equalTo([3]);
            expect(slice._increments).to.be.equalTo([4]);
            var data = [];
            function addData(a) { data.push(a); return a; }
            slice.apply(addData);
            expect(data).to.be.equalTo([3, 7, 11]);
        });
        it('should return correct transpose', function()
        {
            var t = new Tensor([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]]);
            var tt = t.transpose();
            assert(tt instanceof Tensor);
            assert(tt.getSize() == 12);
            expect(tt.getShape()).to.be.equalTo([4, 3]);
            assert(tt.get(0, 1) == 4);
            // t must be intact.
            expect(t.getShape()).to.be.equalTo([3, 4]);
            assert(t.get(0, 1) == 1);
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
        it('should return correct to string after slice', function()
        {
            var t = new Tensor([[0, 11], [22, 33]]);
            assert(t.slice(1).toString() == "[22, 33]");
        });
    });
});
