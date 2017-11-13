
module.exports = (function (m)
{
	/**
	 * Represents a Tensor.
	 * 
	 * @class Tensor
	 * 
	 * @param {...number} dims Tensor dimensions or data array.
	 */
	var Tensor = function ()
	{
	    if (typeof arguments[0] == "object")
	    	this._initFromData(arguments[0]);
	    else if (typeof arguments[0] == "number")
	    	this._initFromDim(arguments);
	    else
	    	this._initFromDim([]);
	};

	Tensor.prototype._initFromDim = function (dimensions)
	{
		var ndim = dimensions.length;
	    var dims = new Array(ndim);

        // Check dims.
	    for (var i = ndim - 1; i >= 0; i--)
	    {
	    	var arg = dimensions[i];
	        if (arg <= 0)
	        	throw new Error("Dimension must be positive");

	        dims[i] = arg;
	    }

	    this._ndim = ndim;
	    this._dims = dims;
	    this._setSize();
	    this._data = new Float64Array(this._size);
	};

	Tensor.prototype._initFromData = function (data)
	{
	    this._dims = new Array(0);

	    var flatten = [];
	    this._parseData(data, flatten, 0);

	    this._setSize();
		this._data = new Float64Array(flatten);
	};

    Tensor.prototype._parseData = function (data, flatten, depth)
    {
        // Base case.
        if (typeof data == "number")
        {
            flatten.push(data);
            return;
        }

        // Recursion.
        if (this._dims.length <= depth)
            this._dims.push(data.length);
        else if (this._dims[depth] != data.length)
            throw new Error("Dimensions at the same level must match");
        for (var i = 0; i < data.length; ++i)
        {
            this._parseData(data[i], flatten, depth + 1);
        }
    };

    /**
     * Set the total size and cumulative sizes.
     */
    Tensor.prototype._setSize = function ()
    {
        var size = 1;
        var ndim = this._dims.length;
	    var cumulativeSize = new Array(ndim);

	    for (var i = ndim - 1; i >= 0; i--)
	    {
	    	cumulativeSize[i] = size;
	        size *= this._dims[i];
	    }

        this._ndim = ndim;
	    this._size = ndim == 0 ? 0 : size;
	    this._csize = cumulativeSize;
    };

	/**
	 * Return the size of the underlying data array.
	 * 
	 * @return {number} Size of the data array.
	 */
	Tensor.prototype.getSize = function ()
	{
	    return this._size;
	};

	/**
	 * Return the number of dimensions.
	 * 
	 * @return {number} Number of dimensions.
	 */
	Tensor.prototype.getNumDim = function ()
	{
	    return this._ndim;
	};

	/**
	 * Return the shape of the tensor.
	 * 
	 * @return {array} Shape of the tensor.
	 */
	Tensor.prototype.getShape = function ()
	{
	    return this._dims.slice();
	};

	/**
	 * Set the given position of the tensor to the given value.
	 * 
	 * Example:
	 *		var t = new Tensor(5, 5);
	 *		// Set the center element to 7.
	 *		t.set(
	 *			2, // row
	 *			2, // column
	 *			7) // value
	 * 
	 * @param {...number} Coordinates on the tensor.
	 * @param {number} Value.
	 */
	Tensor.prototype.set = function ()
	{
		var idx = this._toIndex(arguments);
		this._data[idx] = arguments[arguments.length - 1];
	};

	/**
	 * Return the value on given position.
	 * 
	 * @param {...number} Coordinates.
	 * @return {number} Value in that position.
	 */
	Tensor.prototype.get = function ()
	{
		var idx = this._toIndex(arguments);
		return this._data[idx];
	};

	/**
	 * Coordinates to index in the underlying data array.
	 * 
	 * @param {...number} Coordinates.
	 * @return {number} Index.
	 */
	Tensor.prototype.toIndex = function ()
	{
		return this._toIndex(arguments);
	};

	/**
	 * Coordinates to index in the underlying data array.
	 * 
	 * @param {array} Coordinates array.
	 * @return {number} Index.
	 */
	Tensor.prototype._toIndex = function (args)
	{
		var idx = 0;
		for (var i = this._ndim - 1; i >= 0; i--)
		{
			idx += this._csize[i] * args[i];
		}

		return idx;
	};

	/**
	 * Return the coordinates of the given index in the underlying data array.
	 * It is the inverse operation to toIndex.
	 * 
	 * @param {number} Index to convert.
	 * @return {array} Coordinates of the index in the data array.
	 */
	Tensor.prototype.toCoordinates = function (idx)
	{
		var coordinates = new Array(this._ndim);
		for (var i = 0; i < this._ndim; ++i)
		{
			var div = Math.floor(idx / this._csize[i]);
			coordinates[i] = div;
			idx -= div * this._csize[i];
		}

		return coordinates;
	};

	/**
	 * Return a string representation of the tensor.
	 * 
	 * @return {string} Representation of the tensor.
	 */
	Tensor.prototype.toString = function ()
	{
		return this._toString(0, 0, "\n ").value;
	};

	Tensor.prototype._toString = function (dim, idx, scope)
	{
		// Base case.
		if (dim == this._ndim)
			return {
				idx: idx + 1,
				value: this._data[idx]
			};

		// Recursion.
		var out = "[";
		var dim_size = this._dims[dim];
		for (var i = 0; i < dim_size; i++)
		{
			var res = this._toString(dim + 1, idx, scope + " ");
			idx = res.idx;
			out += res.value;
			if (i != dim_size - 1)  // if no last value of dimension
				if (dim < this._ndim - 1)  // if no last dimension
					out += "," + scope;
				else  // if last dimension
					out += ", ";
		}
		out += "]";
		
		return {
			idx: idx,
			value: out
		};
	};

	/**
	 * Print the string representation of the tensor.
	 */
	Tensor.prototype.print = function ()
	{
		console.log(this.toString());
	};

	m.Tensor = Tensor;

	return m;
}(module.exports));
