function initGraph(svg, systems, dataExchanges) {
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
        .selectAll("path")
        .data(dataExchanges)
        .join("path")
        .attr("group-id", d => d.group)
        .attr("stroke", dataExchangeColor)
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

    simulation.on("tick", () => {
        dataExchange.attr("d", linkArc);
        system.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    addTooltip(svg, system, dataExchange);
    addClickHandler(svg, system, dataExchange);
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
    let hoverTimeout;
    system.on("mouseover", (event, d) => {
        const [x, y] = d3.pointer(event, svg.node());
        clearTimeout(hoverTimeout);
        svg.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("id", "hoverText")
            .attr("fill", systemColor)
            .attr("stroke", "white")
            .attr("stroke-width", 5)
            .attr("paint-order", "stroke")
            .text(d.name);
    })
        .on("mouseout", () => {
            hoverTimeout = setTimeout(() => {
                d3.select("#hoverText").remove();
            }, 5);
        });

    dataExchange.on("mouseover", (event, d) => {
        const [x, y] = d3.pointer(event, svg.node());
        const text = svg.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("id", "hoverText")
            .attr("fill", dataExchangeColor)
            .attr("stroke", "white")
            .attr("stroke-width", 5)
            .attr("paint-order", "stroke");

        // Split your text into multiple lines
        const lines = d.processes.map(p => `- ${p.name}`);

        // Append each line as a separate `tspan`
        lines.forEach((line, i) => {
            text.append("tspan")
                .attr("x", x + 15) // Set x position for each line
                .attr("dy", i === 0 ? 0 : 15) // Adjust y position for each line
                .text(line);
        });
    })
        .on("mouseout", () => {
            d3.select("#hoverText").remove();
        });
}

function addClickHandler(svg, system, dataExchange) {
    function resetColors() {
        dataExchange.attr("stroke", dataExchangeColor);
        system.attr("fill", systemColor);
    }

    system.on("click", (event, d) => {
        const infoTexts = document.querySelectorAll(".infoTextSpan");
        infoTexts.forEach(span => span.style.display = "none");
        document.querySelector(".infoTextSpan[info-id='" + d.shortName + "']").style.display = "initial";

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
        const linkids = d.processes.map(d => d.name);
        const infoTexts = document.querySelectorAll(".infoTextSpan");
        infoTexts.forEach(span => span.style.display = "none");
        linkids.forEach(id => document.querySelector(".infoTextSpan[info-id='" + id + "']").style.display = "initial");

        resetColors();
        d3.select(event.currentTarget)
            .attr("stroke", selectedColor);
    })
}
