var happyml = function(module) {
    var Tensor = function() {
        for (var size = 1, idx = new Array(arguments.length), i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (arg <= 0) throw new Error("Negative dimensions");
            size *= arg, idx[i] = arg;
        }
        this._idx = idx, this._size = size, this._data = new Float32Array(size);
    };
    return Tensor.prototype.getSize = function() {
        return this._size;
    }, module.Tensor = Tensor, module;
}((happyml = function(module) {
    return module.version = "0.0.0", module.greet = function() {
        console.log("Those about to learn we salute you :)");
    }, module;
}(happyml || {})) || {});