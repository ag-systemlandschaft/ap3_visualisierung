let zoom;

// the viewBox matches the svg's size in pixels and is centered on (0, 0), so the zoom identity centers the origin
function updateViewBox(svg) {
    const {width, height} = svg.node().getBoundingClientRect();
    svg.attr("viewBox", [-width / 2, -height / 2, width, height]);
}

// bounding box (in graph coordinates) of all visible data exchanges including their systems and labels,
// or null if no data exchange is visible
function visibleExchangeBounds(svg) {
    const boxes = [];
    const systems = new Set();
    svg.selectAll("#data-exchanges > g")
        .filter(d => isExchangeVisible(d))
        .each(function (d) {
            boxes.push(d3.select(this).select(".actual-exchange").node().getBBox());
            systems.add(d.source);
            systems.add(d.target);
        });
    svg.selectAll("#systems > g")
        .filter(d => systems.has(d))
        .each(function (d) {
            // a system's own bbox doesn't include its translate(x, y)
            const box = this.getBBox();
            boxes.push({x: box.x + d.x, y: box.y + d.y, width: box.width, height: box.height});
        });
    if (boxes.length === 0) {
        return null;
    }
    const x0 = d3.min(boxes, b => b.x);
    const y0 = d3.min(boxes, b => b.y);
    const x1 = d3.max(boxes, b => b.x + b.width);
    const y1 = d3.max(boxes, b => b.y + b.height);
    return {x: x0, y: y0, width: x1 - x0, height: y1 - y0};
}

// zooms so that the given bounds (default: the whole graph) fill the view
function fitToView(svg, animated = true, bounds = svg.select("#systems").node().getBBox()) {
    const [, , width, height] = svg.attr("viewBox").split(",").map(Number);
    if (!bounds || (!bounds.width && !bounds.height)) {
        return;
    }
    const [minScale, maxScale] = zoom.scaleExtent();
    const scale = Math.max(minScale, Math.min(maxScale,
        (1 - 2 * zoomSettings.fitMargin) * Math.min(width / (bounds.width || 1), height / (bounds.height || 1))
    ));
    const transform = d3.zoomIdentity
        .scale(scale)
        .translate(-(bounds.x + bounds.width / 2), -(bounds.y + bounds.height / 2));
    (animated ? svg.transition().duration(500) : svg).call(zoom.transform, transform);
}

function addZoom(svg) {
    const baseGraph = svg.select("#baseGraph");
    const hover = d3.select("#hoverInfo");
    updateViewBox(svg);
    zoom = d3.zoom()
        .scaleExtent([zoomSettings.minScale, zoomSettings.maxScale])
        .on('zoom', function(event) {
            baseGraph.attr('transform', event.transform);
            hover.attr('transform', event.transform);
        });
    svg.call(zoom);

    window.addEventListener("resize", () => updateViewBox(svg));

    const zoomBy = (scaleFactor) => svg.transition().duration(200).call(zoom.scaleBy, scaleFactor);

    const panBy = (dx, dy) => {
        const transform = d3.zoomTransform(svg.node());
        svg.transition().call(
            zoom.transform,
            d3.zoomIdentity.translate(transform.x + dx, transform.y + dy).scale(transform.k)
        );
    };

    d3.select("#zoom-in").on("click", () => zoomBy(1.2)); // Zoom in by 20%
    d3.select("#zoom-out").on("click", () => zoomBy(1 / 1.2)); // Zoom out by 20%
    d3.select("#reset").on("click", () => fitToView(svg)); // Reset view: show the whole graph
    d3.select("#pan-left").on("click", () => panBy(50, 0)); // Pan left
    d3.select("#pan-right").on("click", () => panBy(-50, 0)); // Pan right
    d3.select("#pan-up").on("click", () => panBy(0, 50)); // Pan up
    d3.select("#pan-down").on("click", () => panBy(0, -50));
}

function addDrag(simulation) {

    // the simulation is only restarted once the node is actually moved,
    // so a plain click doesn't shake the graph (nodes would otherwise move away under the mouse pointer)
    let moved = false;

    function dragstarted(event, d) {
        moved = false;
    }

    function dragged(event, d) {
        if (!moved) {
            moved = true;
            simulation.alphaTarget(0.3).restart();
        }
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (moved) {
            simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .clickDistance(4)
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

function addTooltipInteraction(svg, system, dataExchange) {
    // Don't raise() the node here: moving it in the DOM while hovering swallows the following click
    // and may swallow its mouseleave. For the latter, the hover state of all nodes is cleared on enter.
    system
        .on("mouseenter", function (event, d) {
            clearSystemHover(system);
            const g = d3.select(this);
            g.select(".hover-text")
                .attr("display", "initial");
            g.select(".hover-frame")
                .attr("display", "initial");
            g.classed("hovered", true);
        })
        .on("mouseleave", function (event, d) {
            clearSystemHover(d3.select(this));
        });

    dataExchange
        .on("mouseover", function (event, d) {
            const transform = d3.zoomTransform(svg.node());
            const [x, y] = transform.invert(d3.pointer(event, svg.node()));
            const hoverInfo = d3.select("#hoverInfo");
            const hoverText = d3.select("#hoverText");
            hoverInfo.raise()
                .attr("display", "initial")
            // we don't apply transform the the #hoverInfo because of conflict with zooming
            const translate = `translate(${x + 20}, ${y})`;
            hoverText.attr("transform", translate);
            hoverText.selectAll("tspan")
                .data(d.processes
                    .filter(process => process.active)
                    .map(p => `${p.name}`)
                )
                .join("tspan")
                .attr("x", 0)
                .attr("dy", (d, i) => (i === 0 ? 0 : 20))
                .text(d => d);

            const bbox = hoverText.node().getBBox();
            hoverInfo.select("#hoverFrame")
                .attr("x", bbox.x - padding.tooltip.x)
                .attr("y", bbox.y - padding.tooltip.y)
                .attr("width", bbox.width + 2 * padding.tooltip.x)
                .attr("height", bbox.height + 2 * padding.tooltip.y)
                .attr("transform", translate);

            // clear a possibly stuck hover state of other exchanges first
            d3.selectAll("#data-exchanges .hovered, marker path.hovered")
                .classed("hovered", false)
                .classed("marker", false);

            const paths = actualExchangePaths(event.currentTarget);
            paths.classed("hovered", true)

            const markerEndUrl = paths.attr("marker-end");
            const markerId = markerEndUrl.match(/#(.*)\)/)?.[1];
            if (markerId) {
                d3.select(`#${markerId}`)
                    .select("path")
                    .classed("hovered", true)
                    .classed("marker", true);
            }

            event.stopPropagation();
        })
        .on("mouseout", function (event, d) {
            const hoverText = d3.select("#hoverInfo");
            hoverText.attr("display", "none");
            const paths = actualExchangePaths(event.currentTarget);
            paths
                .classed("hovered", false)

            const markerEndUrl = paths.attr("marker-end");
            const markerId = markerEndUrl.match(/#(.*)\)/)?.[1];
            if (markerId) {
                d3.select(`#${markerId}`)
                    .select("path")
                    .classed("hovered", false)
                    .classed("marker", false);
            }
        });
}

function clearSystemHover(systems) {
    systems.classed("hovered", false);
    systems.selectAll(".hover-text, .hover-frame")
        .attr("display", "none");
}

// re-applies the current selection after filtering; set in addClickHandler
let refreshSelection = () => {};
// removes the current selection (back to the initial state); set in addClickHandler
let resetSelection = () => {};

function isExchangeVisible(exchange) {
    return exchange.processes.some(process => process.active);
}

function addClickHandler(svg, system, dataExchange, filters) {
    // the clicked system or data exchange, or null if nothing is selected
    let selection = null;

    const selectSystem = (node) => {
        selection = {system: node};
        addSystemInfo(node);

        resetColors(system, true);
        system.filter(d => d === node)
            .classed("selected", true)
            .raise();

        markAdjacentElements(dataExchange, system, node);
    };

    const selectExchange = (exchange) => {
        selection = {exchange: exchange};
        addDataExchangeInfo(exchange, filters);

        resetColors(system, true);
        const paths = actualExchangePaths(dataExchange.filter(d => d === exchange).node());
        paths.classed("selected", true)

        system.classed(
            "adjacent-to-selected",
            (_, index) =>
                [exchange.source.index, exchange.target.index].includes(index)
        )

        const markerEndUrl = paths.attr("marker-end");
        const markerId = markerEndUrl.match(/#(.*)\)/)?.[1];
        if (markerId) {
            d3.select(`#${markerId}`)
                .select("path")
                .attr("fill", "var(--exchange-selected-color)");
        }
    };

    const clearSelection = () => {
        selection = null;
        resetColors(system, false);
        setDefaultInfoText();
    };
    resetSelection = clearSelection;

    // a selection only stays active if it is still part of the filter result,
    // i.e. the selected system still has a visible data exchange, or the selected data exchange is still visible
    refreshSelection = () => {
        if (selection?.system) {
            const stillVisible = dataExchange.data()
                .some(e => isExchangeVisible(e) && [e.source, e.target].includes(selection.system));
            stillVisible ? selectSystem(selection.system) : clearSelection();
        } else if (selection?.exchange) {
            isExchangeVisible(selection.exchange) ? selectExchange(selection.exchange) : clearSelection();
        }
    };

    system.on("click", (event, node) => {
        selectSystem(node);

        // center the selected node via the zoom behavior, so later zooming/panning continues from here
        svg.transition()
            .duration(500)
            .call(zoom.translateTo, node.x, node.y);

        event.stopPropagation();
    });

    dataExchange.on("click", (event, d) => {
        selectExchange(d);
        event.stopPropagation();
    });

    svg.on("click", () => {
        // due to the event.stopPropagation() in the other handlers, this means "click elsewhere"
        clearSelection();
    });
}

function actualExchangePaths(element) {
    const parent = !element ? d3 : d3.select(element);
    return parent
        .selectAll("path")
        .filter(".actual-exchange");
}

function resetColors(system, somethingSelected = true) {
    d3.select("#data-exchanges")
        .classed("something-selected", somethingSelected);

    actualExchangePaths()
        .classed("selected", false);

    d3.selectAll("g")
        .classed("adjacent-to-selected", false)

    d3.selectAll("marker")
        .classed("adjacent-to-selected", false)
        .selectAll("path")
        .attr("fill", "var(--exchange-color)");

    d3.select("#systems")
        .classed("something-selected", somethingSelected);

    system
        .classed("selected", false);
}

function markAdjacentElements(dataExchange, allSystems, selectedSystem) {
    const adjacent = findAdjacents(dataExchange, selectedSystem);
    adjacent.exchanges
        .classed("adjacent-to-selected", true);
    d3.selectAll("marker")
        .classed(
            "adjacent-to-selected",
            (_, index, nodes) =>
                adjacent.markerIds.includes(nodes[index].id)
        );
    allSystems
        .classed(
            "adjacent-to-selected",
            (_, index) =>
                adjacent.nodeIndices.includes(index)
        );
}

function findAdjacents(dataExchange, systemNode) {
    const adjacentExchanges = dataExchange
        .filter(e =>
            isExchangeVisible(e) && [e.source.id, e.target.id].includes(systemNode.id)
        );
    const adjacentMarkerIds = adjacentExchanges
        .nodes()
        .map(e => `arrow-link-${e.id}`);
    const adjacentNodeIndices = adjacentExchanges
        .data()
        .map(exchange =>
            exchange.source.index === systemNode.index
                ? exchange.target.index
                : exchange.source.index
        );
    return {
        exchanges: adjacentExchanges,
        markerIds: adjacentMarkerIds,
        nodeIndices: adjacentNodeIndices,
    };
}
