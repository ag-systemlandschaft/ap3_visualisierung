function addZoom(svg) {
    let g = svg.append("g");
    let hover = d3.select("#hoverText");
    let zoom = d3.zoom()
        .scaleExtent([0.2, 5])
        .on('zoom', function(event) {
            g.attr('transform', event.transform);
            hover.attr('transform', event.transform);
        });
    svg.call(zoom);

    const zoomBy = (scaleFactor) => {
        const svgNode = svg.node();
        const transform = d3.zoomTransform(svgNode);

        const newScale = transform.k * scaleFactor;
        const center = [svg.attr("width") / 2, svg.attr("height") / 2];

        const newTransform = d3.zoomIdentity
            .translate(transform.x, transform.y)
            .scale(newScale);

        svg.call(zoom.transform, newTransform, center);
    };

    const panBy = (dx, dy) => {
        const transform = d3.zoomTransform(svg.node());
        svg.transition().call(
            zoom.transform,
            d3.zoomIdentity.translate(transform.x + dx, transform.y + dy).scale(transform.k)
        );
    };

    d3.select("#zoom-in").on("click", () => zoomBy(1.2)); // Zoom in by 20%
    d3.select("#zoom-out").on("click", () => zoomBy(1 / 1.2)); // Zoom out by 20%
    d3.select("#reset").on("click", () => svg.transition().call(zoom.transform, d3.zoomIdentity)); // Reset view
    d3.select("#pan-left").on("click", () => panBy(50, 0)); // Pan left
    d3.select("#pan-right").on("click", () => panBy(-50, 0)); // Pan right
    d3.select("#pan-up").on("click", () => panBy(0, 50)); // Pan up
    d3.select("#pan-down").on("click", () => panBy(0, -50));
}

function addDrag(simulation) {

    function dragstarted(event, d) {
        if (!event.active) {
            simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) {
            simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

function addTooltip(svg, system, dataExchange) {
    system
        .on("mouseover", function (event, d) {
            const g = d3.select(this);
            g.raise();
            g.select(".hoverText")
                .attr("display", "initial");
            d3.select(event.currentTarget).classed("hovered", true)
        })
        .on("mouseout", function (event, d) {
            const g = d3.select(this)
            g.select(".hoverText").attr("display", "none");
            d3.select(event.currentTarget).classed("hovered", false)
        });

    dataExchange
        .on("mouseover", function (event, d) {
            const transform = d3.zoomTransform(svg.node());
            const [x, y] = transform.invert(d3.pointer(event, svg.node()));
            const hoverText = d3.select("#hoverText");
            hoverText.raise()
            hoverText
                .attr("display", "initial")
                .attr("y", y);
            hoverText.selectAll("tspan")
                .data(d.processes
                    .filter(process => process.active)
                    .map(p => `${p.name}`)
                )
                .join("tspan")
                .attr("x", x + 20)
                .attr("dy", (d, i) => (i === 0 ? 0 : 20))
                .text(d => d);
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
            const hoverText = d3.select("#hoverText");
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

function addClickHandler(svg, system, dataExchange, filters) {
    system.on("click", (event, node) => {
        addSystemInfo(node);

        resetColors(system, true);
        d3.select(event.currentTarget)
            .classed("selected", true);

        markAdjacentElements(dataExchange, system, node);

        const globalTransform = event.target.parentElement.parentElement.parentElement.getAttribute('transform');
        let globalTranslateMatch = ["0.0", "0.0"];
        if(globalTransform) {
            globalTranslateMatch = globalTransform.match(/translate\(([^,]+),([^)]+)\)/);
        }

        const transform = event.target.parentElement.getAttribute('transform');
        const translateMatch = transform.match(/translate\(([^,]+),([^)]+)\)/);
        if (translateMatch) {
            const globalTranslateX = parseFloat(globalTranslateMatch[1]) || 0;
            const globalTranslateY = parseFloat(globalTranslateMatch[2]) || 0;
            const translateX = parseFloat(translateMatch[1]);
            const translateY = parseFloat(translateMatch[2]);
            
            const g = d3.select("g");
            const transform = d3.zoomTransform(g.node());
            const newTransform = transform.translate(-(translateX+globalTranslateX), -(translateY+globalTranslateY));
            g.transition()
                .duration(500)
                .attr("transform", newTransform);
        }
        event.stopPropagation();
    });

    dataExchange.on("click", (event, d) => {
        addDataExchangeInfo(d, filters);

        resetColors(system, true);
        const paths = actualExchangePaths(event.currentTarget);
        paths.classed("selected", true)

        system.classed(
            "adjacent-to-selected",
            (_, index) =>
                [d.source.index, d.target.index].includes(index)
        )

        const markerEndUrl = paths.attr("marker-end");
        const markerId = markerEndUrl.match(/#(.*)\)/)?.[1];
        if (markerId) {
            d3.select(`#${markerId}`)
                .select("path")
                .attr("fill", "var(--exchange-selected-color)");
        }

        event.stopPropagation();
    });

    svg.on("click", () => {
        // due to the event.stopPropagation() in the other handlers, this means "click elsewhere"
        resetColors(system, false);
        setDefaultInfoText();
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
            [e.source.id, e.target.id].includes(systemNode.id)
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
