
const style = getComputedStyle(document.documentElement);

const padding = {
    tooltip: {
        x: parseFloat(style.getPropertyValue('--tooltip-padding-x')),
        y: parseFloat(style.getPropertyValue('--tooltip-padding-y')),
    },
    systemLabel: {
        x: parseFloat(style.getPropertyValue('--system-label-padding-x')),
        y: parseFloat(style.getPropertyValue('--system-label-padding-y')),
    }
};


function initGraph(svg, systems, dataExchanges, filters) {

    const simulation = d3.forceSimulation(systems)
        .force("link", d3.forceLink(dataExchanges).id(d => d.id).distance(physics.baseDistance))
        .force("charge", d3.forceManyBody().strength(-physics.repulsion))
        .force("collide", d3.forceCollide()
            .radius(d => physics.collideRadius + physics.collideTextScaling * d.shortName.length)
            .iterations(physics.collideIterations)
        )
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .velocityDecay(physics.velocityDecay)
    ;

    svg.select("#baseGraph")
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

    addTooltipInteraction(svg, system, dataExchange);
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
    const dataExchange = svg.select("#baseGraph")
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
    const system = svg.select("#baseGraph")
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
        .attr("x", d => getRadius(d) + systemNode.textXOffset)
        .attr("y", d => getRadius(d) + systemNode.textYOffset)
        .text(d => d.id)
        .each(function () {
            const bbox = this.getBBox();
            d3.select(this.parentNode)
                .append("rect")
                .attr("x", bbox.x - padding.systemLabel.x)
                .attr("y", bbox.y - padding.systemLabel.y + 2)
                .attr("width", bbox.width + 2 * padding.systemLabel.x)
                .attr("height", bbox.height + 2 * padding.systemLabel.y - 1)
                .attr("fill", "var(--system-label-background-color)")
                .attr("stroke", "var(--system-label-stroke-color)")
                .attr("stroke-width", "var(--system-label-stroke-width)")
                .classed("system-label", true)
                .lower();
        })

    system.append("text")
        .style("font-family", "var(--font-family), sans-serif")
        .attr("y", "-15px")
        .attr("x", d => getRadius(d) + 14)
        .attr("class", "hover-text")
        .attr("fill", "var(--system-hover-color)")
        .attr("paint-order", "stroke")
        .text(d => d.name)
        .each(function () {
            const bbox = this.getBBox();
            d3.select(this.parentNode)
                .append("rect")
                .attr("x", bbox.x - padding.tooltip.x)
                .attr("y", bbox.y - padding.tooltip.y + 2)
                .attr("width", bbox.width + 2 * padding.tooltip.x)
                .attr("height", bbox.height + 2 * padding.tooltip.y - 1)
                .attr("class", "hover-frame")
                .attr("display", "none")
                .lower();
        })
        .attr("display", "none");

    return system;
}

function filterDataExchange(dataExchanges, svg) {
    svg.select("#baseGraph")
        .select("g")
        .selectAll("path")
        .attr("display", d =>{
            const actual = dataExchanges.filter(exchange => exchange.source.shortName === d.source.shortName && exchange.target.shortName === d.target.shortName)[0];
            return actual.processes.some(process => process.active) ? "initial" : "none";
        }
        );
}


function addTooltipElement(svg) {
    const hoverInfo = svg.append("g")
        .attr("id", "hoverInfo")
        .attr("display", "none");
    hoverInfo.append("rect")
        .attr("id", "hoverFrame");
    hoverInfo.append("text")
        .attr("id", "hoverText");
}
