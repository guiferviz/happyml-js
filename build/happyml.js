var module = module || {};

module.exports = module.exports || {};

module.exports = function(happyml) {
    happyml.version = "0.0.1";
    happyml.greet = function() {
        console.log("Those about to learn we salute you :)");
    };
    return happyml;
}({});

module.exports = function(m) {
    var Tensor = function() {
        if (arguments[0] instanceof Tensor) this._initCopy(arguments[0], arguments[1]); else if (arguments[0] instanceof Array) this._initFromData(arguments[0]); else if (typeof arguments[0] == "number") this._initFromShape(arguments); else {
            var params = arguments[0] || {};
            if (!!params.data) {
                this._initFromData(params.data);
                if (!!params.shape) this._reshapeThis(params.shape);
            } else if (!!params.shape) this._initFromShape(params.shape); else this._initVoid();
        }
    };
    Tensor.range = function(start, end, increments) {
        if (end == undefined) {
            end = start;
            start = 0;
        }
        increments = increments || 1;
        var size = Math.abs((end - start) / increments);
        var t = new Tensor(size);
        for (var i = 0, value = start; i < size; ++i, value += increments) {
            t._data[i] = value;
        }
        return t;
    };
    Tensor.linspace = function(start, end, samples) {
        samples = samples || 10;
        var increment = Math.abs((end - start) / samples);
        var t = new Tensor(samples + 1);
        for (var i = 0, value = start; i <= samples; ++i, value += increment) {
            t._data[i] = value;
        }
        t._data[samples] = end;
        return t;
    };
    Tensor.prototype._initVoid = function() {
        this._data = null;
        this._size = 0;
        this._shape = [];
        this._ndims = 0;
        this._increments = [];
        this._offset = 0;
    };
    Tensor.prototype._initCopy = function(tensor, deepcopy) {
        this._size = tensor._size;
        this._shape = tensor._shape.slice();
        this._ndims = tensor._ndims;
        this._increments = tensor._increments.slice();
        this._offset = tensor._offset;
        if (deepcopy) {
            this._data = new Float64Array(this._size);
            var idxNew = 0;
            var coord = new Array(tensor._ndims).fill(0);
            var idx = tensor._offset;
            do {
                this._data[idxNew++] = tensor._data[idx];
            } while ((idx = tensor.next(coord, idx)) != -1);
        } else this._data = tensor._data;
    };
    Tensor.prototype._initFromShape = function(newShape) {
        var ndims = newShape.length;
        var shape = new Array(ndims);
        for (var i = ndims - 1; i >= 0; i--) {
            var arg = newShape[i];
            if (arg <= 0) throw new Error("Dimension must be positive");
            shape[i] = arg;
        }
        this._offset = 0;
        this._setShape(shape);
        this._data = new Float64Array(this._size);
    };
    Tensor.prototype._initFromData = function(data) {
        this._shape = new Array(0);
        var flatten = [];
        var shape = [];
        this._parseData(data, flatten, shape, 0);
        this._setShape(shape);
        this._offset = 0;
        this._data = new Float64Array(flatten);
    };
    Tensor.prototype._parseData = function(data, flatten, shape, depth) {
        if (typeof data == "number") {
            flatten.push(data);
            return;
        }
        if (shape.length <= depth) shape.push(data.length); else if (shape[depth] != data.length) throw new Error("Dimensions at the same level must match");
        for (var i = 0; i < data.length; ++i) {
            this._parseData(data[i], flatten, shape, depth + 1);
        }
    };
    Tensor.prototype._setShape = function(shape) {
        var size = 1;
        var ndims = shape.length;
        var increments = new Array(ndims);
        for (var i = ndims - 1; i >= 0; i--) {
            increments[i] = size;
            size *= shape[i];
        }
        this._shape = shape;
        this._ndims = ndims;
        this._size = ndims == 0 ? 0 : size;
        this._increments = increments;
    };
    Tensor.prototype.getSize = function() {
        return this._size;
    };
    Tensor.prototype.getNumDims = function() {
        return this._ndims;
    };
    Tensor.prototype.getShape = function() {
        return this._shape.slice();
    };
    Tensor.prototype.set = function() {
        var idx = this._toIndex(arguments);
        this._data[idx] = arguments[arguments.length - 1];
    };
    Tensor.prototype.get = function() {
        var idx = this._toIndex(arguments);
        return this._data[idx];
    };
    Tensor.prototype.slice = function() {
        return this._slice(arguments);
    };
    Tensor.prototype._slice = function(coords) {
        var newTensor = new Tensor();
        var newShape = [];
        var newIncrements = [];
        var size = 1;
        var offset = 0;
        for (var i = 0; i < this._ndims; ++i) {
            if (i >= coords.length || coords[i] == -1) {
                size *= this._shape[i];
                newShape.push(this._shape[i]);
                newIncrements.push(this._increments[i]);
            } else offset += coords[i] * this._increments[i];
        }
        newTensor._data = this._data;
        newTensor._size = size;
        newTensor._shape = newShape;
        newTensor._ndims = newShape.length;
        newTensor._increments = newIncrements;
        newTensor._offset = offset;
        return newTensor;
    };
    Tensor.prototype.toIndex = function() {
        return this._toIndex(arguments);
    };
    Tensor.prototype._toIndex = function(args) {
        var idx = this._offset;
        for (var i = this._ndims - 1; i >= 0; i--) {
            idx += this._increments[i] * args[i];
        }
        return idx;
    };
    Tensor.prototype.toCoordinates = function(idx) {
        var coordinates = new Array(this._ndims);
        for (var i = 0; i < this._ndims; ++i) {
            var div = Math.floor(idx / this._increments[i]);
            coordinates[i] = div;
            idx -= div * this._increments[i];
        }
        return coordinates;
    };
    Tensor.prototype.transpose = function() {
        var newTensor = new Tensor(this, false);
        newTensor._shape.reverse();
        newTensor._increments.reverse();
        return newTensor;
    };
    Tensor.prototype.next = function(coords, idx) {
        for (var i = this._ndims - 1; i >= 0; --i) {
            if (coords[i] == -1) {
                continue;
            } else if (++coords[i] == this._shape[i]) {
                coords[i] = 0;
                if (i > 0) {
                    idx -= this._increments[i] * (this._shape[i] - 1);
                } else return -1;
            } else {
                return idx + this._increments[i];
            }
        }
        return -1;
    };
    Tensor.prototype.reshape = function() {
        return this._reshape(arguments);
    };
    Tensor.prototype._reshape = function(newShape) {
        var t = this.copy();
        var shape = this._checkShape(newShape);
        t._setShape(shape);
        return t;
    };
    Tensor.prototype._reshapeThis = function(newShape) {
        var shape = this._checkShape(newShape);
        this._setShape(shape);
    };
    Tensor.prototype._checkShape = function(newShape) {
        var inferSize = -1;
        var size = 1;
        var ndims = newShape.length;
        var shape = new Array(ndims);
        for (var i = ndims - 1; i >= 0; --i) if (newShape[i] == -1) {
            if (inferSize != -1) throw new Error("More than one inferred dimension");
            inferSize = i;
        } else {
            shape[i] = newShape[i];
            size *= newShape[i];
        }
        if (inferSize != -1) {
            var inferredSize = this._size / size;
            size = this._size;
            shape[inferSize] = inferredSize;
        }
        if (size != this._size) throw new Error("Size must be the same after reshape");
        return shape;
    };
    Tensor.prototype.flatten = function() {
        var newTensor = this.deepcopy();
        newTensor._shape = [ this._size ];
        return newTensor;
    };
    Tensor.prototype.toString = function() {
        var coord = new Array(this._ndims).fill(0);
        var idx = this._offset;
        return this._toString(0, coord, idx, "\n ").value;
    };
    Tensor.prototype._toString = function(dim, coord, idx, scope) {
        if (dim == this._ndims) return {
            idx: this.next(coord, idx),
            value: this._data[idx]
        };
        var out = "[";
        var dim_size = this._shape[dim];
        for (var i = 0; i < dim_size; i++) {
            var res = this._toString(dim + 1, coord, idx, scope + " ");
            idx = res.idx;
            out += res.value;
            if (i != dim_size - 1) if (dim < this._ndims - 1) out += "," + scope; else out += ", ";
        }
        out += "]";
        return {
            idx: idx,
            value: out
        };
    };
    Tensor.prototype.print = function() {
        console.log(this.toString());
    };
    Tensor.prototype.deepcopy = function() {
        return new Tensor(this, true);
    };
    Tensor.prototype.copy = function() {
        return new Tensor(this, false);
    };
    Tensor.prototype.add = function(t) {
        return this.apply2(t, function(a, b) {
            return a + b;
        });
    };
    Tensor.prototype.sub = function(t) {
        return this.apply2(t, function(a, b) {
            return a - b;
        });
    };
    Tensor.prototype.mul = function(t) {
        return this.apply2(t, function(a, b) {
            return a * b;
        });
    };
    Tensor.prototype.apply = function(func) {
        var newTensor = new Tensor({
            shape: this._shape
        });
        var idxNew = 0;
        var coord = new Array(this._ndims).fill(0);
        var idx = this._offset;
        do {
            newTensor._data[idxNew++] = func(this._data[idx]);
        } while ((idx = this.next(coord, idx)) != -1);
        return newTensor;
    };
    Tensor.prototype.apply2 = function(t, func) {
        var newTensor = new Tensor({
            shape: this._shape
        });
        var idxNew = 0;
        var coordA = new Array(this._ndims).fill(0);
        var idxA = this._offset;
        var coordB = new Array(t._ndims).fill(0);
        var idxB = t._offset;
        do {
            newTensor._data[idxNew++] = func(this._data[idxA], t._data[idxB]);
        } while ((idxA = this.next(coordA, idxA)) != -1 && (idxB = t.next(coordB, idxB)) != -1);
        return newTensor;
    };
    Tensor.prototype.dot = function(t) {
        var dimA = this._ndims - 1;
        var dimB = t._ndims - 2 >= 0 ? t._ndims - 2 : 0;
        var incSizeA = this._increments[dimA];
        var incSizeB = t._increments[dimB];
        console.assert(this._shape[dimA] == t._shape[dimB]);
        var outputShape = [];
        for (var i = 0; i < dimA; ++i) outputShape.push(this._shape[i]);
        for (i = 0; i < dimB; ++i) outputShape.push(t._shape[i]);
        if (dimB + 1 < t._ndims) outputShape.push(t._shape[dimB + 1]);
        if (outputShape.length == 0) outputShape.push(1);
        var newTensor = new Tensor({
            shape: outputShape
        });
        var idxNew = 0;
        var coordA = new Array(this._ndims).fill(0);
        coordA[dimA] = -1;
        var idxA = this._offset;
        var coordB = new Array(t._ndims).fill(0);
        coordB[dimB] = -1;
        do {
            var idxB = t._offset;
            do {
                var sum = 0;
                var _idxA = idxA, _idxB = idxB;
                for (i = 0; i < this._shape[dimA]; ++i) {
                    sum += this._data[_idxA] * t._data[_idxB];
                    _idxA += incSizeA;
                    _idxB += incSizeB;
                }
                newTensor._data[idxNew++] = sum;
            } while ((idxB = t.next(coordB, idxB)) != -1);
        } while ((idxA = this.next(coordA, idxA)) != -1);
        return newTensor;
    };
    m.Tensor = Tensor;
    return m;
}(module.exports);

module.exports = function(m) {
    var ctx = {
        parent: null,
        margin: undefined,
        width: 400,
        height: 400,
        limits: undefined,
        tooltip: undefined,
        color: undefined,
        ids: {
            line: 0,
            scatter: 0
        }
    };
    var defaultLimits = {
        xmin: -1,
        xmax: 1,
        ymin: -1,
        ymax: 1
    };
    var defaultMargin = {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    };
    var plotId = 0;
    var d3js_urls = [ "https://d3js.org/d3.v4.js" ];
    if (typeof d3 === "undefined") {
        d3js_urls.forEach(_addScript);
    }
    function _addScript(src) {
        var s = document.createElement("script");
        s.src = src;
        s.async = false;
        document.head.appendChild(s);
    }
    function createTooltip() {
        ctx.tooltip = d3.select("body").append("div").attr("class", "happyml-tooltip").style("position", "absolute").style("visibility", "hidden").style("background-color", "rgba(255,255,255,0.8)").style("padding", "3px").style("border-radius", "3px");
    }
    function createScales(limits) {
        limits = limits || {};
        limits.xmin = _default(limits.xmin, defaultLimits.xmin);
        limits.xmax = _default(limits.xmax, defaultLimits.xmax);
        limits.ymin = _default(limits.ymin, defaultLimits.ymin);
        limits.ymax = _default(limits.ymax, defaultLimits.ymax);
        ctx.limits = limits;
        ctx.xScale = d3.scaleLinear().domain([ limits.xmin, limits.xmax ]).range([ 0, ctx.canvasWidth ]);
        ctx.yScale = d3.scaleLinear().domain([ limits.ymax, limits.ymin ]).range([ 0, ctx.canvasHeight ]);
    }
    function createAxis() {
        ctx.xAxis = d3.axisBottom(ctx.xScale).ticks(5).tickSize(ctx.canvasHeight);
        ctx.yAxis = d3.axisLeft(ctx.yScale).ticks(5).tickSize(ctx.canvasWidth);
        ctx.axisLayer = ctx.canvas.append("g").attr("class", "happyml-axis");
        ctx.gX = ctx.axisLayer.append("g").attr("class", "happyml-axis-x").call(ctx.xAxis);
        ctx.gY = ctx.axisLayer.append("g").attr("class", "happyml-axis-y").attr("transform", _translate(ctx.canvasWidth, 0)).call(ctx.yAxis);
        styleAxis();
    }
    function styleAxis() {
        ctx.gX.selectAll("line").attr("stroke", "#CCC").filter(function(d) {
            return d == 0;
        }).attr("stroke", "black");
        ctx.gY.selectAll("line").attr("stroke", "#CCC").filter(function(d) {
            return d == 0;
        }).attr("stroke", "black");
    }
    function createZoom() {
        ctx.zoom = d3.zoom().scaleExtent([ .25, 4 ]).on("zoom", function zoomed() {
            ctx.plotLayer.attr("transform", d3.event.transform);
            ctx.plotLayer.selectAll("path").attr("stroke-width", 2 / d3.event.transform.k);
            ctx.plotLayer.selectAll("circle").attr("r", 3 / d3.event.transform.k);
            ctx.gX.call(ctx.xAxis.scale(d3.event.transform.rescaleX(ctx.xScale)));
            ctx.gY.call(ctx.yAxis.scale(d3.event.transform.rescaleY(ctx.yScale)));
            styleAxis();
        });
        ctx.svg.call(ctx.zoom);
    }
    function createCanvas() {
        ctx.mask = ctx.svg.append("defs").append("clipPath").attr("id", "happyml-plots-mask").style("pointer-events", "none").append("rect").attr("x", 0).attr("y", 0).attr("width", ctx.canvasWidth).attr("height", ctx.canvasHeight);
        ctx.canvas = ctx.svg.append("g").attr("id", "happyml-canvas").attr("transform", _translate(ctx.margin.left, ctx.margin.top));
    }
    function createLabels(options) {
        if (options.xlabel || options.ylabel || options.title) {
            ctx.labelLayer = ctx.svg.append("g").attr("id", "happyml-labels");
            if (options.xlabel) {
                ctx.labelLayer.append("text").attr("id", "happyml-label-x").text(options.xlabel).attr("x", ctx.margin.left + ctx.canvasWidth / 2).attr("y", ctx.margin.top + ctx.canvasHeight).attr("dy", "1.5em").style("text-anchor", "middle");
            }
            if (options.ylabel) {
                var x = ctx.margin.left;
                var y = ctx.margin.top + ctx.canvasHeight / 2;
                ctx.labelLayer.append("text").attr("id", "happyml-label-y").text(options.ylabel).attr("x", x).attr("y", y).attr("dy", "-1em").attr("transform", _rotate(-90, x, y)).style("text-anchor", "middle");
            }
            if (options.title) {
                ctx.labelLayer.append("text").attr("id", "happyml-title").text(options.title).attr("x", ctx.margin.left + ctx.canvasWidth / 2).attr("y", ctx.margin.top).attr("dy", "-0.5em").style("text-anchor", "middle");
            }
        }
        ctx.svg.append("foreignObject").html('<span class="katex"><span class="katex-mathml"><math><semantics><mrow><msup><mi>x</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">x^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="strut" style="height:0.8141079999999999em;"></span><span class="strut bottom" style="height:0.8141079999999999em;vertical-align:0em;"></span><span class="base"><span class="mord"><span class="mord mathit">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141079999999999em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathrm mtight">2</span></span></span></span></span></span></span></span></span></span></span>').attr("x", 0).attr("y", 0).attr("width", 100).attr("height", 100);
    }
    function _translate(x, y) {
        return "translate(" + x + "," + y + ")";
    }
    function _rotate(angle, x, y) {
        x = _default(x, 0);
        y = _default(y, 0);
        return "rotate(" + angle + ", " + x + ", " + y + ")";
    }
    function _default(value, defaultValue) {
        if (value !== undefined) return value;
        return defaultValue;
    }
    function _nextId(type) {
        return "happyml-layer-" + type + "-" + ctx.ids[type]++;
    }
    function _prepareXY(x, y) {
        x = x.flatten()._data;
        y = y.flatten()._data;
        if (ctx.limits == undefined) {
            var limits = {};
            limits.xmin = d3.min(x);
            limits.xmax = d3.max(x);
            limits.ymin = d3.min(y);
            limits.ymax = d3.max(y);
            createScales(limits);
        }
        return {
            x: x,
            y: y
        };
    }
    function init(parent, options) {
        parent = typeof parent == "string" ? d3.select(parent) : parent;
        options = options || {};
        var width = options.width || ctx.width;
        var height = options.height || ctx.height;
        var margin = options.margin;
        margin.left = _default(margin.left, defaultMargin.left);
        margin.right = _default(margin.right, defaultMargin.right);
        margin.top = _default(margin.top, defaultMargin.top);
        margin.bottom = _default(margin.bottom, defaultMargin.bottom);
        var padding = options.padding || ctx.padding;
        var limits = options.limits;
        ctx.color = d3.schemeCategory10;
        ctx.parent = parent;
        ctx.margin = margin;
        ctx.width = width;
        ctx.height = height;
        ctx.canvasWidth = width - margin.left - margin.right;
        ctx.canvasHeight = height - margin.top - margin.bottom;
        ctx.svg = parent.append("svg").attr("width", ctx.width).attr("height", ctx.height).style("user-select", "none").style("background-color", "white");
        createLabels(options);
        createTooltip();
        createCanvas();
        createScales(options.limits);
        createAxis();
        createZoom();
        ctx.plotLayer = ctx.canvas.append("g").attr("id", "happyml-plots-mask").attr("clip-path", "url(#happyml-plots-mask)").append("g").attr("id", "happyml-plots");
        return ctx.svg;
    }
    function line(x, y) {
        var data = _prepareXY(x, y);
        x = data.x;
        y = data.y;
        var idNumber = ctx.ids.line;
        var idName = _nextId("line");
        var line = d3.line().x(function(d, _) {
            return ctx.xScale(d);
        }).y(function(_, i) {
            return ctx.yScale(y[i]);
        });
        var layer = ctx.plotLayer.append("g").attr("id", idName).attr("class", "happyml-layer");
        layer.append("path").datum(x).attr("fill", "none").attr("stroke", ctx.color[idNumber]).attr("stroke-width", 2).attr("class", "happyml-line").attr("d", line);
    }
    function scatter(x, y, options) {
        var data = _prepareXY(x, y);
        x = data.x;
        y = data.y;
        options = options || {};
        var idNumber = ctx.ids.scatter;
        var idName = _nextId("scatter");
        var tooltip = ctx.tooltip;
        var layer = ctx.plotLayer.append("g").attr("id", idName).attr("class", "happyml-layer");
        layer.selectAll("circle").data(x).enter().append("circle").attr("class", "happyml-circle").attr("r", 3).attr("cx", function(d, _) {
            return ctx.xScale(d);
        }).attr("cy", function(_, i) {
            return ctx.yScale(y[i]);
        }).style("fill", ctx.color[idNumber]).on("mouseover", function(d, i) {
            tooltip.style("visibility", "visible").html("(" + d.toFixed(2) + ", " + y[i].toFixed(2) + ")").style("left", d3.event.pageX + 5 + "px").style("top", d3.event.pageY - 28 + "px");
        }).on("mouseout", function(d) {
            tooltip.style("visibility", "hidden");
        });
        return layer;
    }
    m.plot = {
        ctx: ctx,
        init: init,
        line: line,
        scatter: scatter,
        createScales: createScales
    };
    return m;
}(module.exports);

var happyml = module.exports;