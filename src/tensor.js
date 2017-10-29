
var happyml = (function (module)
{
	var Tensor = function ()
	{
	    var size = 1;
	    var idx = new Array(arguments.length);
	    for (var i = 0; i < arguments.length; i++)
	    {
	    	var arg = arguments[i];
	        if (arg <= 0)
	        {
	        	throw new Error("Negative dimensions");
	        }
	        
	        size *= arg;
	        idx[i] = arg;
	    }
	    
	    this._idx = idx;
	    this._size = size;
	    this._data = new Float32Array(size);
	};

	Tensor.prototype.getSize = function ()
	{
	    return this._size;
	};

	module.Tensor = Tensor;

	return module;
}(happyml || {}));
