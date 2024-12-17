function initGraph(svg, systems, dataExchanges, filters) {
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
        .attr("fill", dataExchangeColor)
        .attr("d", "M0,-5L10,0L0,5");

    const dataExchange = svg.select("g")
        .append("g")
        .attr("fill", "none")
        .selectAll("g")
        .data(dataExchanges)
        .join("g");

    dataExchange
        .append("path")
        .attr("id", (d,i) => i)
        .attr("stroke", dataExchangeColor)
        .attr("marker-end", function (d) {
            return "url(#arrow-link-" + d.index + ")";
        });

    dataExchange.append("text")
        .attr("class", "hoverText")
        .attr("fill", "orange")
        .attr("stroke", "white")
        .attr("stroke-width", 5)
        .attr("paint-order", "stroke")
        .attr("display", "none")
        .selectAll("tspan")
        .data(d => d.processes)
        .join("tspan")
        .attr("dy", (d, i) => i === 0 ? 0 : 15)
        .text(p => `- ${p.name}`);

    const system = svg.select("g")
        .append("g")
        .attr("fill", "currentColor")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .selectAll("g")
        .data(systems)
        .join("g")
        .attr("fill", systemColor)
        .call(drag(simulation));

    system.append("circle")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("r", d => 1.5 * d.numberProcesses);

    system.append("text")
        .attr("x", d => 1.5 * d.numberProcesses + 14)
        .attr("y", "0.61em")
        .text(d => d.id)
        .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 7);

    system.append("text")
        .attr("class", "hoverText")
        .attr("fill", "black")
        .attr("stroke", "white")
        .attr("stroke-width", 5)
        .attr("paint-order", "stroke")
        .attr("display", "none")
        .text(d => d.name);

    simulation.on("tick", () => {
        dataExchange.select("path").attr("d", linkArc);
        system.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    addTooltip(svg, system, dataExchange);
    addClickHandler(svg, system, dataExchange, filters);
}

// Calculate link arcs
function linkArc(d) {
    const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
    return `
      M${d.source.x},${d.source.y}
      A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
    `;
}

function addTooltip(svg, system, dataExchange) {
    system.on("mouseover", function () {
        const g = d3.select(this)
        g.raise()
        g.select(".hoverText")
            .attr("display", "initial")
    })
        .on("mouseout", function () {
            const g = d3.select(this)
            g.select(".hoverText").attr("display", "none");
        });

    dataExchange.on("mouseover", function () {
        const [x, y] = d3.pointer(event, svg.node());
        const path = d3.select(this)
        path.raise()
        path.select(".hoverText")
            .attr("display", "initial")
            .selectAll("tspan")
            .attr("x", x)
            .attr("y", y)
    })
        .on("mouseout", function () {
            const path = d3.select(this)
            path.select(".hoverText").attr("display", "none");
        });
}

function addClickHandler(svg, system, dataExchange, filters) {
    function resetColors() {
        dataExchange.select("path").attr("stroke", dataExchangeColor);
        system.attr("fill", systemColor);
    }

    system.on("click", (event, d) => {
        addSystemInfo(d)

        resetColors();
        d3.select(event.currentTarget)
            .attr("fill", selectedColor);

        const transform = event.target.parentElement.getAttribute('transform');
        const translateMatch = transform.match(/translate\(([^,]+),([^)]+)\)/);
        if (translateMatch) {
            const translateX = parseFloat(translateMatch[1]);
            const translateY = parseFloat(translateMatch[2]);

            g.transition()
                .duration(500)
                .attr("transform", `translate(${-translateX},${-translateY})`);
        }
    })

    dataExchange.on("click", (event, d) => {
        addDataExchangeInfo(d, filters)

        resetColors();
        d3.select(event.currentTarget).select("path")
            .attr("stroke", selectedColor);
    })
}