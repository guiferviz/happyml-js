
module.exports = (function (m)
{
	/**
	 * Represents a Tensor.
	 * 
	 * @class Tensor
	 * 
	 * @prop {array} _data: flatten array with all the data of the tensor.
	 * @prop {number} _size: total number of elements of the tensor. The length
	 *		of _data is not always _size.
	 * @prop {array} _shape: shape (array with the size of each dimension) of
	 *		the tensor.
	 * @prop {number} _ndims: number of dimensions.
	 * @prop {array} _increments: the number of items to add from moving to one
	 *		element to the consecutive one.
	 * @prop {number} _offset: offset of the first element of the tensor in the
	 *		_data array.
	 * @prop {boolean} _owns_data: indicates whether the underlying array is
	 *		specific of the current tensor or borrowed from another tensor.
	 * 
	 * 
	 * @param {...number} dims Tensor dimensions.
	 * 
	 * @param {array} Data array.
	 * 
	 * @param {Tensor} Tensor to clone.
	 * @param {boolean} Shadow copy.
	 */
	var Tensor = function ()
	{
		if (arguments[0] instanceof Tensor)
	    	this._initCopy(arguments[0], arguments[1]);
	    else if (arguments[0] instanceof Array)
	    	this._initFromData(arguments[0]);
	    else if (typeof arguments[0] == "number")
	    	this._initFromShape(arguments);
	    else
	    {
			var params = arguments[0] || {};
			if (!!params.data)
			{
				this._initFromData(params.data);
				if (!!params.shape)
					this._reshapeThis(params.shape);
			}
			else if (!!params.shape)
				this._initFromShape(params.shape);
			else
				this._initVoid();
		}
	};

	Tensor.range = function (start, end, increments)
	{
		if (end == undefined)
		{
			end = start;
			start = 0;
		}
		increments = increments || 1;

		var size = Math.abs((end - start) / increments);
		var t = new Tensor(size);
		for (var i = 0, value = start; i < size; ++i, value += increments)
		{
			t._data[i] = value;
		}
		return t;
	};

	Tensor.prototype._initVoid = function ()
	{
		this._data = null;
    	this._size = 0;
    	this._shape = [];
    	this._ndims = 0;
    	this._increments = [];
    	this._offset = 0;
	};

	/**
	 * Create a copy from other tensor.
	 * Shallow copy uses a reference for the underlying data array,
	 * deep copies make a copy of that array.
	 * 
	 * @param {Tensor} Tensor to clone.
	 * @param {boolean} If true, shallow copy, else deep copy.
	 */
	Tensor.prototype._initCopy = function (tensor, shallow)
	{
	    this._size = tensor._size;
		this._shape = tensor._shape.slice();
		this._ndims = tensor._ndims;
	    this._increments = tensor._increments.slice();
	    this._offset = tensor._offset;
	    // shallow or deep copy
	    // TODO: iterate instead of slice only when no contiguous data.
	    this._data = shallow ? tensor._data.slice() : tensor._data;
	};

	/**
	 * Init tensor from an array of dimensions: a shape.
	 * 
	 * @param {array} List of dimensions.
	 */
	Tensor.prototype._initFromShape = function (newShape)
	{
		var ndims = newShape.length;
	    var shape = new Array(ndims);

        // Check dims.
	    for (var i = ndims - 1; i >= 0; i--)
	    {
	    	var arg = newShape[i];
	        if (arg <= 0)
	        	throw new Error("Dimension must be positive");

	        shape[i] = arg;
	    }

	    this._offset = 0;
	    this._setShape(shape);
	    this._data = new Float64Array(this._size);
	};

	/**
	 * Init tensor from an array of data.
	 * Data must have same sizes through dimensions.
	 */
	Tensor.prototype._initFromData = function (data)
	{
	    this._shape = new Array(0);

	    var flatten = [];
	    var shape = [];
	    this._parseData(data, flatten, shape, 0);

	    this._setShape(shape);
	    this._offset = 0;
		this._data = new Float64Array(flatten);
	};

	/**
	 * Recursive function that reads data and inits tensor.
	 */
    Tensor.prototype._parseData = function (data, flatten, shape, depth)
    {
        // Base case.
        if (typeof data == "number")
        {
            flatten.push(data);
            return;
        }

        // Recursion.
        if (shape.length <= depth)
            shape.push(data.length);
        else if (shape[depth] != data.length)
            throw new Error("Dimensions at the same level must match");
        for (var i = 0; i < data.length; ++i)
        {
            this._parseData(data[i], flatten, shape, depth + 1);
        }
    };

    /**
     * Set the total size and cumulative sizes.
     */
    Tensor.prototype._setShape = function (shape)
    {
        var size = 1;
        var ndims = shape.length;
	    var increments = new Array(ndims);

	    for (var i = ndims - 1; i >= 0; i--)
	    {
	    	increments[i] = size;
	        size *= shape[i];
	    }

		this._shape = shape;
        this._ndims = ndims;
	    this._size = ndims == 0 ? 0 : size;
	    this._increments = increments;
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
	Tensor.prototype.getNumDims = function ()
	{
	    return this._ndims;
	};

	/**
	 * Return the shape of the tensor.
	 * 
	 * @return {array} Shape of the tensor.
	 */
	Tensor.prototype.getShape = function ()
	{
	    return this._shape.slice();
	};

	/**
	 * Set the given position of the tensor to the given value.
	 * 
	 * Example:
	 *		var t = new Tensor(6, 6);
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

	Tensor.prototype.slice = function ()
	{
		return this._slice(arguments);
	};

	Tensor.prototype._slice = function (coords)
	{
		var newTensor = new Tensor();
		var newShape = [];
		var newIncrements = [];
		var size = 1;
		var offset = 0;
		for (var i = 0; i < this._ndims; ++i)
		{
			if (i >= coords.length || coords[i] == -1)
			{
				size *= this._shape[i];
				newShape.push(this._shape[i]);
				newIncrements.push(this._increments[i]);
			}
			else
				offset += coords[i] * this._increments[i];
		}

		newTensor._data = this._data;
		newTensor._size = size;
		newTensor._shape = newShape;
		newTensor._ndims = newShape.length;
		newTensor._increments = newIncrements;
		newTensor._offset = offset;

		return newTensor;
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
		var idx = this._offset;
		for (var i = this._ndims - 1; i >= 0; i--)
		{
			idx += this._increments[i] * args[i];
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
		var coordinates = new Array(this._ndims);
		for (var i = 0; i < this._ndims; ++i)
		{
			var div = Math.floor(idx / this._increments[i]);
			coordinates[i] = div;
			idx -= div * this._increments[i];
		}

		return coordinates;
	};

	Tensor.prototype.transpose = function ()
	{
		var newTensor = new Tensor(this, false);
		newTensor._shape.reverse();
		newTensor._increments.reverse();

		return newTensor;
	};

	Tensor.prototype.next = function (coords, idx)
	{
		for (var i = this._ndims - 1; i >= 0; --i)
		{
			if (coords[i] == -1)
			{
				continue;
			}
			else if (++coords[i] == this._shape[i])
			{
				coords[i] = 0;
				if (i > 0)
				{
					// The next multiplication can be precomputed.
					idx -= this._increments[i] * (this._shape[i] - 1);
				}
				else // (i == 0)
					return -1;
			}
			else
			{
				return idx + this._increments[i];
			}
		}

		return -1;
	};

	Tensor.prototype.reshape = function ()
	{
		return this._reshape(arguments);
	};

	Tensor.prototype._reshape = function (newShape)
	{
		var t = this.copy();
		var shape = this._checkShape(newShape);

		t._setShape(shape);

		return t;
	};

	Tensor.prototype._reshapeThis = function (newShape)
	{
		var shape = this._checkShape(newShape);
		this._setShape(shape);
	};

	Tensor.prototype._checkShape = function (newShape)
	{
		var inferSize = -1;
		var size = 1;
		var ndims = newShape.length;
		var shape = new Array(ndims);

		for (var i = ndims - 1; i >= 0; --i)
			if (newShape[i] == -1)
			{
				if (inferSize != -1)
					throw new Error("More than one inferred dimension");
				inferSize = i;
			}
			else
			{
				shape[i] = newShape[i];
				size *= newShape[i];
			}

		if (inferSize != -1)
		{
			var inferredSize = this._size / size;
			size = this._size;
			shape[inferSize] = inferredSize;
		}

		if (size != this._size)
			throw new Error("Size must be the same after reshape");

		return shape;
	};

	Tensor.prototype.flatten = function ()
	{
		var newTensor = new Tensor(this);
		newTensor._shape = [this._size];
		
		return newTensor;
	};

	/**
	 * Return a string representation of the tensor.
	 * 
	 * @return {string} Representation of the tensor.
	 */
	Tensor.prototype.toString = function ()
	{
		var coord = new Array(this._ndims).fill(0);
		var idx = this._offset;
		return this._toString(0, coord, idx, "\n ").value;
	};

	Tensor.prototype._toString = function (dim, coord, idx, scope)
	{
		// Base case.
		if (dim == this._ndims)
			return {
				idx: this.next(coord, idx),
				value: this._data[idx]
			};

		// Recursion.
		var out = "[";
		var dim_size = this._shape[dim];
		for (var i = 0; i < dim_size; i++)
		{
			var res = this._toString(dim + 1, coord, idx, scope + " ");
			idx = res.idx;
			out += res.value;
			if (i != dim_size - 1)  // if no last value of dimension
				if (dim < this._ndims - 1)  // if no last dimension
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

	/**
	 * Deep copy of the tensor, that is, creates a new data array.
	 * 
	 * @returns {object} Deep copy of the tensor.
	 */
	Tensor.prototype.deepcopy = function ()
	{
		return new Tensor(this, true);
	};

	/**
	 * Shallow copy of the tensor, i.e., reuse the underlying data array.
	 * 
	 * @returns {object} Shallow copy of the tensor.
	 */
	Tensor.prototype.copy = function ()
	{
		return new Tensor(this, false);
	};

	Tensor.prototype.add = function (t)
	{
		return this.apply2(t, function (a, b) { return a + b; });
	};

	Tensor.prototype.sub = function (t)
	{
		return this.apply2(t, function (a, b) { return a - b; });
	};

	Tensor.prototype.mul = function (t)
	{
		return this.apply2(t, function (a, b) { return a * b; });
	};

	Tensor.prototype.apply = function (func)
	{
		var newTensor = new Tensor({shape: this._shape});
		var idxNew = 0;
		var coord = new Array(this._ndims).fill(0);
		var idx = this._offset;
		do
		{
			newTensor._data[idxNew++] = func(this._data[idx]);
		}
		while ((idx = this.next(coord, idx)) != -1);

		return newTensor;
	};

	Tensor.prototype.apply2 = function (t, func)
	{
		var newTensor = new Tensor({shape: this._shape});
		var idxNew = 0;
		var coordA = new Array(this._ndims).fill(0);
		var idxA = this._offset;
		var coordB = new Array(t._ndims).fill(0);
		var idxB = t._offset;
		do
		{
			newTensor._data[idxNew++] = func(this._data[idxA], t._data[idxB]);
		}
		while ((idxA = this.next(coordA, idxA)) != -1 &&
		       (idxB = t.next(coordB, idxB)) != -1);

		return newTensor;
	};

	Tensor.prototype.dot = function (t)
	{
		// Compute A.dot(B), where A = this, B = t
		var dimA = this._ndims - 1;
		var dimB = t._ndims - 2 >= 0 ? t._ndims - 2 : 0;
		var incSizeA = this._increments[dimA];
		var incSizeB = t._increments[dimB];
		console.assert(this._shape[dimA] == t._shape[dimB]);

		// Compute output shape.
		var outputShape = [];
		for (var i = 0; i < dimA; ++i)
			outputShape.push(this._shape[i]);
		for (i = 0; i < dimB; ++i)
			outputShape.push(t._shape[i]);
		if (dimB + 1 < t._ndims)
			outputShape.push(t._shape[dimB + 1]);
		if (outputShape.length == 0)
			outputShape.push(1);

		var newTensor = new Tensor({shape: outputShape});
		var idxNew = 0;
		var coordA = new Array(this._ndims).fill(0);
		coordA[dimA] = -1;
		var idxA = this._offset;
		var coordB = new Array(t._ndims).fill(0);
		coordB[dimB] = -1;
		do
		{
			var idxB = t._offset;
			do
			{
				var sum = 0;
				var _idxA = idxA,
				    _idxB = idxB;
				for (i = 0; i < this._shape[dimA]; ++i)
				{
					sum += this._data[_idxA] * t._data[_idxB];
				    _idxA += incSizeA;
				    _idxB += incSizeB;
				}
				newTensor._data[idxNew++] = sum;
			}
			while ((idxB = t.next(coordB, idxB)) != -1);
		}
		while ((idxA = this.next(coordA, idxA)) != -1);

		return newTensor;
	};

	m.Tensor = Tensor;

	return m;
}(module.exports));
