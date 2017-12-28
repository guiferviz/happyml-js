
module.exports = (function (m)
{
    /**
     * Plot context: current SVG element, parent element, scales...
     */
    var ctx = {
        parent: null,
        margin: undefined,
        width: 400,
        height: 400,
        limits: undefined,  // {xmin: #, xmax: #, ymin: #, ymax: #}
        tooltip: undefined,
        color: undefined,
        ids: {line: 0, scatter: 0}
    };
    var defaultLimits = {xmin: -1, xmax: 1, ymin: -1, ymax: 1};
    var defaultMargin = {top: 0, left: 0, right: 0, bottom: 0};
    var plotId = 0;

    var d3js_urls = [
        "https://d3js.org/d3.v4.js"//,
        //"https://d3js.org/d3-scale.v1.min.js"
    ];
    if (typeof d3 === "undefined")
    {
        d3js_urls.forEach(_addScript);
    }

    function _addScript(src)
    {
        var s = document.createElement("script");
        s.src = src;
        s.async = false;
        document.head.appendChild(s);
    }

    function createTooltip()
    {
        ctx.tooltip = d3.select("body").append("div")
            .attr("class", "happyml-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "rgba(255,255,255,0.8)")
            .style("padding", "3px")
            .style("border-radius", "3px");
    }

    function createScales(limits)
    {
        limits = limits || {};
        limits.xmin = _default(limits.xmin, defaultLimits.xmin);
        limits.xmax = _default(limits.xmax, defaultLimits.xmax);
        limits.ymin = _default(limits.ymin, defaultLimits.ymin);
        limits.ymax = _default(limits.ymax, defaultLimits.ymax);
        ctx.limits = limits;

        ctx.xScale = d3.scaleLinear()
            .domain([limits.xmin, limits.xmax])
            .range([0, ctx.canvasWidth]);
        ctx.yScale = d3.scaleLinear()
            .domain([limits.ymax, limits.ymin])
            .range([0, ctx.canvasHeight]);
    }

    function createAxis()
    {
        ctx.xAxis = d3.axisBottom(ctx.xScale)
            .ticks(5)
            .tickSize(ctx.canvasHeight);
            //.tickSizeOuter(0)
            //.tickPadding(ctx.canvasHeight);
        ctx.yAxis = d3.axisLeft(ctx.yScale)
            .ticks(5)
            .tickSize(ctx.canvasWidth);
            //.tickSizeOuter(0)
            //.tickPadding(-ctx.canvasWidth);

        ctx.axisLayer = ctx.canvas.append("g")
            .attr("class", "happyml-axis");
        ctx.gX = ctx.axisLayer.append("g")
            .attr("class", "happyml-axis-x")
            .call(ctx.xAxis);
        ctx.gY = ctx.axisLayer.append("g")
            .attr("class", "happyml-axis-y")
            .attr("transform", _translate(ctx.canvasWidth, 0))
            .call(ctx.yAxis);
        styleAxis();
    }

    function styleAxis()
    {
        ctx.gX.selectAll("line")
            .attr("stroke", "#CCC")
            .filter(function (d) { return d == 0; })
            .attr("stroke", "black");
        ctx.gY.selectAll("line")
            .attr("stroke", "#CCC")
            .filter(function (d) { return d == 0; })
            .attr("stroke", "black");
    }

    function createZoom()
    {
        ctx.zoom = d3.zoom()
            .scaleExtent([0.25, 4])  // limit zoom
            //.translateExtent([[xmin, ymin], [xmax, ymax]])  // limit translation
            .on("zoom", function zoomed()
            {
                ctx.plotLayer.attr("transform", d3.event.transform);
                ctx.plotLayer.selectAll("path")
                    .attr('stroke-width', 2 / d3.event.transform.k);
                ctx.plotLayer.selectAll("circle")
                    .attr("r", 3 / d3.event.transform.k);
                ctx.gX.call(ctx.xAxis.scale(d3.event.transform.rescaleX(ctx.xScale)));
                ctx.gY.call(ctx.yAxis.scale(d3.event.transform.rescaleY(ctx.yScale)));
                styleAxis();
            });
        ctx.svg.call(ctx.zoom);
    }

    function createCanvas()
    {
        ctx.mask = ctx.svg.append("defs")
            .append("clipPath")
            .attr("id", "happyml-plots-mask")
            .style("pointer-events", "none")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", ctx.canvasWidth)
            .attr("height", ctx.canvasHeight);
        ctx.canvas = ctx.svg.append("g")
            .attr("id", "happyml-canvas")
            .attr("transform", _translate(ctx.margin.left, ctx.margin.top));
    }

    function createLabels(options)
    {
        if (options.xlabel || options.ylabel || options.title)
        {
            ctx.labelLayer = ctx.svg.append("g")
                .attr("id", "happyml-labels");

            if (options.xlabel)
            {
                ctx.labelLayer.append("text")
                    .attr("id", "happyml-label-x")
                    .text(options.xlabel)
                    .attr("x", ctx.margin.left + ctx.canvasWidth / 2)
                    .attr("y", ctx.margin.top + ctx.canvasHeight)
                    .attr("dy","1.5em")
                    .style("text-anchor","middle");
            }
            if (options.ylabel)
            {
                var x = ctx.margin.left;
                var y = ctx.margin.top + ctx.canvasHeight / 2;
                ctx.labelLayer.append("text")
                    .attr("id", "happyml-label-y")
                    .text(options.ylabel)
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", "-1em")
                    .attr("transform", _rotate(-90, x, y))
                    .style("text-anchor","middle");
            }
            if (options.title)
            {
                ctx.labelLayer.append("text")
                    .attr("id", "happyml-title")
                    .text(options.title)
                    .attr("x", ctx.margin.left + ctx.canvasWidth / 2)
                    .attr("y", ctx.margin.top)
                    .attr("dy","-0.5em")
                    .style("text-anchor","middle");
            }
        }
        // Add latex x^2
        ctx.svg.append("foreignObject")
            .html('<span class="katex"><span class="katex-mathml"><math><semantics><mrow><msup><mi>x</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">x^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="strut" style="height:0.8141079999999999em;"></span><span class="strut bottom" style="height:0.8141079999999999em;vertical-align:0em;"></span><span class="base"><span class="mord"><span class="mord mathit">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141079999999999em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathrm mtight">2</span></span></span></span></span></span></span></span></span></span></span>')
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 100)
            .attr("height", 100);
    }

    function _translate(x, y)
    {
        return "translate(" + x + "," + y + ")";
    }

    function _rotate(angle, x, y)
    {
        x = _default(x, 0);
        y = _default(y, 0);

        return "rotate(" + angle + ", " + x + ", " + y + ")";
    }

    function _default(value, defaultValue)
    {
        if (value !== undefined)
            return value;
        return defaultValue;
    }

    function _nextId(type)
    {
        return "happyml-layer-" + type + "-" + ctx.ids[type]++;
    }

    function _prepareXY(x, y)
    {
        x = x.flatten()._data;
        y = y.flatten()._data;

        if (ctx.limits == undefined)
        {
            var limits = {};
            limits.xmin = d3.min(x);
            limits.xmax = d3.max(x);
            limits.ymin = d3.min(y);
            limits.ymax = d3.max(y);
            createScales(limits);
        }

        return {x: x, y: y};
    }

    function init(parent, options)
    {
        parent = (typeof parent == "string") ? d3.select(parent) : parent;
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

        ctx.svg = parent.append("svg")
            .attr("width", ctx.width)
            .attr("height", ctx.height)
            .style("user-select", "none")
            .style("background-color", "white");

        createLabels(options);
        createTooltip();
        createCanvas();
        createScales(options.limits);
        createAxis();
        createZoom();
        
        ctx.plotLayer = ctx.canvas.append("g")
            .attr("id", "happyml-plots-mask")
            .attr("clip-path", "url(#happyml-plots-mask)")
            .append("g")
            .attr("id", "happyml-plots");

        return ctx.svg;
    }

    function line(x, y)
    {
        var data = _prepareXY(x, y);
        x = data.x;
        y = data.y;

        var idNumber = ctx.ids.line;
        var idName = _nextId("line");
        var line = d3.line()
            .x(function(d, _) { return ctx.xScale(d); })
            .y(function(_, i) { return ctx.yScale(y[i]); });
        var layer = ctx.plotLayer.append("g")
            .attr("id", idName)
            .attr("class", "happyml-layer");

        layer.append("path")
            .datum(x)
            .attr("fill", "none")
            .attr("stroke", ctx.color[idNumber])
            .attr("stroke-width", 2)
            .attr("class", "happyml-line")
            .attr("d", line);
    }

    function scatter(x, y, options)
    {
        var data = _prepareXY(x, y);
        x = data.x;
        y = data.y;
        options = options || {};
        var idNumber = ctx.ids.scatter;
        var idName = _nextId("scatter");

        var tooltip = ctx.tooltip;
        var layer = ctx.plotLayer.append("g")
            .attr("id", idName)
            .attr("class", "happyml-layer");

        layer.selectAll("circle")
            .data(x)
            .enter()
            .append("circle")
            .attr("class", "happyml-circle")
            .attr("r", 3)
            .attr("cx", function (d, _) { return ctx.xScale(d); })
            .attr("cy", function (_, i) { return ctx.yScale(y[i]); })
            .style("fill", ctx.color[idNumber])
            .on("mouseover", function(d, i) {
                tooltip.style("visibility", "visible")
                    .html("(" + d.toFixed(2) + ", " + y[i].toFixed(2) + ")")
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
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
}(module.exports));