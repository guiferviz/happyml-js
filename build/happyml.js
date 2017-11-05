var module = module || {};

module.exports = module.exports || {};

module.exports = function(happyml) {
    happyml.version = "0.0.0";
    happyml.greet = function() {
        console.log("Those about to learn we salute you :)");
    };
    return happyml;
}({});

module.exports = function(m) {
    var Tensor = function() {
        var size = 1;
        var ndim = arguments.length;
        var idx = new Array(ndim);
        for (var i = 0; i < ndim; i++) {
            var arg = arguments[i];
            if (arg <= 0) {
                throw new Error("Negative dimensions");
            }
            size *= arg;
            idx[i] = arg;
        }
        this._idx = idx;
        this._ndim = ndim;
        this._size = size;
        this._data = new Float32Array(size);
    };
    Tensor.prototype.getSize = function() {
        return this._size;
    };
    Tensor.prototype.getNumDim = function() {
        return this._ndim;
    };
    Tensor.prototype.getShape = function() {
        return this._idx.slice();
    };
    m.Tensor = Tensor;
    return m;
}(module.exports);

var happyml = module.exports;