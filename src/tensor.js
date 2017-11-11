
module.exports = (function (m)
{
	var Tensor = function ()
	{
	    var ndim = arguments.length;
	    var idx = new Array(ndim);
	    var cumulativeSize = new Array(ndim);
	    var size = 1;
	    for (var i = ndim - 1; i >= 0; i--)
	    {
	    	var arg = arguments[i];
	        if (arg <= 0)
	        {
	        	throw new Error("Dimension must be positive");
	        }

	        cumulativeSize[i] = size;
	        size *= arg;
	        idx[i] = arg;
	    }

	    this._idx = idx;
	    this._ndim = ndim;
	    this._size = ndim == 0 ? 0 : size;
	    this._csize = cumulativeSize;
	    this._data = new Float64Array(size);
	};

	Tensor.prototype.getSize = function ()
	{
	    return this._size;
	};

	Tensor.prototype.getNumDim = function ()
	{
	    return this._ndim;
	};

	Tensor.prototype.getShape = function ()
	{
	    return this._idx.slice();
	};

	Tensor.prototype.set = function ()
	{
		var idx = this._toIndex(arguments);
		this._data[idx] = arguments[arguments.length - 1];
	};

	Tensor.prototype.get = function ()
	{
		var idx = this._toIndex(arguments);
		return this._data[idx];
	};

	Tensor.prototype.toIndex = function ()
	{
		return this._toIndex(arguments);
	};

	Tensor.prototype._toIndex = function (args)
	{
		var idx = 0;
		for (var i = this._ndim - 1; i >= 0; i--)
		{
			idx += this._csize[i] * args[i];
		}

		return idx;
	};

	Tensor.prototype.toString = function ()
	{
		var out = "";
		var idx = 0;
		for (var d = this._ndim - 1; d >= 0; d++)
		{
			var dim_size = this._idx[d];
			for (var i = 0; i < dim_size; ++i)
			{
				out += this._data[idx++];
				out += " ";
			}
			out += "\n";
		}
		
		return out;
	};

	m.Tensor = Tensor;

	return m;
}(module.exports));
