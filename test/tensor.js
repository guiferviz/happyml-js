/// <reference path="../src/tensor.js" />


describe('tensor.js', function()
{
    describe('constructor', function()
    {
        it('should return and object without errors', function()
        {
            new happyml.Tensor();
        });
        it('should throw and error (negative params)', function()
        {
            function throwError()
            {
                new happyml.Tensor(-1);
            }

            expect(throwError).to.throw(Error);
        });
        it('should return and object without errors (several args)', function()
        {
            new happyml.Tensor(2, 3, 4);
        });
        it('should return correct size', function()
        {
            var t = new happyml.Tensor(2, 3, 10);
            assert(t.getSize() == 60);
        });
    });
});
