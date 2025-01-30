function initGraph(svg, systems, dataExchanges, filters) {
    const simulation = d3.forceSimulation(systems)
        .force("link", d3.forceLink(dataExchanges).id(d => d.id).distance(physics.baseDistance))
        .force("charge", d3.forceManyBody().strength(-physics.repulsion))
        .force("collide", d3.forceCollide().radius(physics.collideRadius))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .velocityDecay(physics.velocityDecay)
    ;

    svg.select("g")
        .append("defs")
        .selectAll("marker")
        .data(dataExchanges)
        .join("marker")
        .attr("id", function (d) {
            return "arrow-link-" + d.index;
        })
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", (d) => {
            // fixes where the arrow ends, still pointing to the circle center
            return 9 + 1.2 * getRadius(d.target);
        })
        .attr("refY", -0.5)
        .attr("markerWidth", 9)
        .attr("markerHeight", 9)
        .attr("markerUnits", "userSpaceOnUse")
        .attr("orient", "auto")
        .append("path")
        .attr("fill", "var(--exchange-color)")
        .attr("d", "M0,-5L10,0L0,5");

    const dataExchange = createDataExchange(svg, dataExchanges);
    const dataExchangePaths = dataExchange.selectAll("path");
    const system = createSystem(svg, systems, simulation);

    simulation.on("tick", () => {
        dataExchangePaths.attr("d", calculateLinkArc);
        system.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    addTooltip(svg, system, dataExchange);
    addClickHandler(svg, system, dataExchange, filters);
}

function calculateLinkArc(d) {
    const r = exchangeArc.straightness * Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
    const targetRadius = getRadius(d.target);
    const sourceRadius = getRadius(d.source);

    const dx = d.target.x - d.source.x;
    const dy = d.target.y - d.source.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    // Adjust source and target points to account for circle radius
    const sourceX = d.source.x;
    const sourceY = d.source.y;
    const targetX = d.target.x;
    const targetY = d.target.y;

    return `M${sourceX},${sourceY} A${r},${r} 0 0,1 ${targetX},${targetY}`;
}

function createDataExchange(svg, dataExchanges) {
    const dataExchange = svg.select("g")
        .append("g")
        .attr("id", "data-exchanges")
        .attr("fill", "none")
        .selectAll("path")
        .data(dataExchanges)
        .join("g")
        .attr("id", (d, i) => i);

    // each dataExchange consists of two paths, one visible and one to allow for more tolerant interactions
    dataExchange
        .append("path")
        .classed("tolerance-layer", true)
        .attr("pointer-events", "all")
        .attr("stroke-opacity", 0)
        .attr("stroke-width", exchangeArc.tolerance);
    dataExchange
        .append("path")
        .classed("actual-exchange", true)
        .attr("stroke", "var(--exchange-color)")
        .attr("stroke-width", exchangeArc.thickness)
        .attr("marker-end", function (d) {
            return "url(#arrow-link-" + d.index + ")";
        });
    return dataExchange;
}

function getRadius(d) {
    return systemNode.radiusMin + (systemNode.radiusScaling * d.numberProcesses);
}

function createSystem(svg, systems, simulation) {
    const system = svg.select("g")
        .append("g")
        .attr("id", "systems")
        .attr("fill", "currentColor")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .selectAll("g")
        .data(systems)
        .join("g")
        .call(addDrag(simulation));

    system.append("circle")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("r", getRadius);

    system.append("text")
        .style("font-family", "var(--font-family), sans-serif")
        .attr("x", d => getRadius(d) + 14)
        .attr("y", "0.61em")
        .text(d => d.id)
        .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 7);

    system.append("text")
        .style("font-family", "var(--font-family), sans-serif")
        .attr("y", "-10px")
        .attr("x", d => getRadius(d) + 14)
        .attr("class", "hoverText")
        .attr("fill", "var(--hover-color)")
        .attr("stroke", "white")
        .attr("stroke-width", 10)
        .attr("paint-order", "stroke")
        .attr("display", "none")
        .text(d => d.name);
    return system;
}

function filterDataExchange(dataExchanges, svg) {
    svg.select("g")
        .select("g")
        .selectAll("path")
        .attr("display", d =>{
            const actual = dataExchanges.filter(exchange => exchange.source.shortName === d.source.shortName && exchange.target.shortName === d.target.shortName)[0];
            return actual.processes.some(process => process.active) ? "initial" : "none";
        }
        );
}