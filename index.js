let svg = d3.select("svg");

// Enable zoom & pan
let g = svg.append("g");
let zoom = d3.zoom()
    .scaleExtent([0.2, 5])
    .on('zoom', function(event) {
        g.attr('transform', event.transform);
    });
svg.call(zoom);

// Load data
d3.json("data.json").then(function(data) { init(data); });

// Enable draggin
drag = simulation => {

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

// Calculate link arcs
function linkArc(d) {
    const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
    return `
      M${d.source.x},${d.source.y}
      A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
    `;
}

// Initialize the visualization
function init(data) {

    let dataExchanges = data["dataExchange"],
        systems = data["systems"],
        filters = data["propertyCategories"]

    //d3 Simulation search for id. Check if another tag can be defined as identifier
    systems.forEach(d => {d["id"] = d["shortName"]});


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
        .attr("id", function(d) {return "arrow-link-" + d.index;})
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
        .attr("marker-end", function(d) { return "url(#arrow-link-" + d.index + ")"; });

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

    d3.select(".infoText")
        .selectAll("span")
        .data([{"id" : "startupText", "description" :"Diese Visualisierung zeigt Importdatenflüsse auf Basis von Echtdaten der ersten Fragerunde. Für die erste prototypische Visualisierung wurde nur ein Bruchteil der vorhandenen Daten ausgewertet. Aufgrund der High-Level-Darstellung gibt die Visualisierung aktuell keine Auskunft über potentielle Doppellieferungen. Die Umsetzung des im AG-Kontext erarbeiteten Visualisierungskonzepts ist aktuell noch in Arbeit.", "group": ""}].concat(systems))
        .enter()
        .append("span")
        .attr("class", "infoTextSpan")
        .attr("info-id", d => d.id)
        .html(function(d) { return d.description });

    setListeners();
    setFilters(filters);
}

function setListeners() {
    let systems = document.querySelectorAll("svg g circle, svg g text");
    let dataExchanges = document.querySelectorAll("svg g path");

    systems.forEach(system => system.addEventListener("click", function(e) {
        console.log("Clicked element:", e.target);
        let infoTexts = document.querySelectorAll(".infoTextSpan");
        infoTexts.forEach(span => span.style.display = "none");
        console.log("info-id:", e.target.parentElement.querySelector("text").innerHTML);
        document.querySelector(".infoTextSpan[info-id='" + e.target.parentElement.querySelector("text").innerHTML + "']").style.display = "initial";
    }));

    dataExchanges.forEach(dataExchange => dataExchange.addEventListener("click", function(e) {
        console.log("Clicked element:", e.target);
        const linkData = e.target.__data__; // Hier wird das Datenobjekt des Link-Elements abgerufen
        const linkid = linkData.id;
        let infoTexts = document.querySelectorAll(".infoTextSpan");
        infoTexts.forEach(span => span.style.display = "none");
        console.log("info-id:", linkid);
        document.querySelector(".infoTextSpan[info-id='" + linkid + "']").style.display = "initial";
    }));
}

function setFilters(filters) {
    //Filters without effect
    let filterContainer = document.querySelector(".filters");
    filters.forEach(filter => filterContainer.innerHTML +=
        "<label>"+filter.name+"</label><br>"+
        "<select name='"+filter.name+"' id='"+filter.id+"'>"+
        optionsFor(filter) +
        "</select><br>"
    );
}

function optionsFor(filter) {
    let options = ""
    filter.options.forEach(option => options +="<option value='"+option+"'>"+option+"</option>")
    return options
}
