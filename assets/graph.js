function initGraph (svg, systems, dataExchanges) {
    const simulation = d3.forceSimulation(systems)
        .force("link", d3.forceLink(dataExchanges).id(d => d.id).distance(40))
        .force("charge", d3.forceManyBody().strength(-1000))
        .force("x", d3.forceX())
        .force("y", d3.forceY());

    svg.select("g")
        .append("defs")
        .selectAll("marker")
        .data(dataExchanges)
        .join("marker")
        .attr("id", function (d) {
            return "arrow-link-" + d.index;
        })
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 12)
        .attr("refY", -0.5)
        .attr("markerWidth", 9)
        .attr("markerHeight", 9)
        .attr("markerUnits", "userSpaceOnUse")
        .attr("orient", "auto")
        .append("path")
        .attr("fill", "#D67AB1")
        .attr("d", "M0,-5L10,0L0,5");

    const dataExchange = svg.select("g")
        .append("g")
        .attr("fill", "none")
        .selectAll("path")
        .data(dataExchanges)
        .join("path")
        .attr("group-id", d => d.group)
        .attr("stroke", "#D67AB1")
        .attr("marker-end", function (d) {
            return "url(#arrow-link-" + d.index + ")";
        });

    const system = svg.select("g")
        .append("g")
        .attr("fill", "currentColor")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .selectAll("g")
        .data(systems)
        .join("g")
        .attr("group-id", d => d.group)
        .attr("fill", "#4A6E82")
        .call(drag(simulation));

    system.append("circle")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("r", 3);

    system.append("text")
        .attr("x", 16)
        .attr("y", "0.61em")
        .text(d => d.id)
        .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 3);

    simulation.on("tick", () => {
        dataExchange.attr("d", linkArc);
        system.attr("transform", d => `translate(${d.x},${d.y})`);
    });
}

// Calculate link arcs
function linkArc(d) {
    const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
    return `
      M${d.source.x},${d.source.y}
      A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
    `;
}