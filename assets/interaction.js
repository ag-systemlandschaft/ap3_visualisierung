function addZoom(svg) {
    let g = svg.append("g");
    let zoom = d3.zoom()
        .scaleExtent([0.2, 5])
        .on('zoom', function(event) {
            g.attr('transform', event.transform);
        });
    svg.call(zoom);
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
        .on("mouseover", function () {
            const g = d3.select(this)
            g.raise()
            g.select(".hoverText")
                .attr("display", "initial")
        })
        .on("mouseout", function () {
            const g = d3.select(this)
            g.select(".hoverText").attr("display", "none");
        });

    dataExchange
        .on("mouseover", function (event, d) {
            const [x, y] = d3.pointer(event, svg.node());
            const hoverText = d3.select("#hoverText");
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
        })
        .on("mouseout", function () {
            const hoverText = d3.select("#hoverText");
            hoverText.attr("display", "none");
        });
}

function addClickHandler(svg, system, dataExchange, filters) {
    function resetColors() {
        dataExchange.attr("stroke", "var(--exchange-color)");
        system.attr("fill", "var(--system-color)");
    }

    system.on("click", (event, d) => {
        addSystemInfo(d);

        resetColors();
        d3.select(event.currentTarget)
            .attr("fill", "var(--selected-color)");

        const transform = event.target.parentElement.getAttribute('transform');
        const translateMatch = transform.match(/translate\(([^,]+),([^)]+)\)/);
        if (translateMatch) {
            const translateX = parseFloat(translateMatch[1]);
            const translateY = parseFloat(translateMatch[2]);

            const g = d3.select("g");
            g.transition()
                .duration(500)
                .attr("transform", `translate(${-translateX},${-translateY})`);
        }
    })

    dataExchange.on("click", (event, d) => {
        addDataExchangeInfo(d, filters);

        resetColors();
        d3.select(event.currentTarget)
            .attr("stroke", "var(--selected-color)");
    })
}