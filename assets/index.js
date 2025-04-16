// Load data
d3.json("data/data.json").then(init);

// Initialize the visualization
async function init(data) {
    // await checkAccess();

    const systems = data.systems;
    const filters = data.propertyCategories;
    const dataExchanges = data.dataExchange;

    filters.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    //d3 Simulation search for id. Check if another tag can be defined as identifier
    systems.forEach(d => d.id = d.shortName);

    dataExchanges.forEach(d => d.processes.forEach(process => process.active = true));
    setDefaultInfoText();

    const svg = d3.select("svg");
    svg.append("g").attr("id", "baseGraph");

    addTooltipElement(svg);
    addZoom(svg);
    initGraph(svg, systems, dataExchanges, filters);

    setFilters(filters, dataExchanges, svg);
    addSidebarToggle("sidebar-toggle-left", "sidebar-left", true)
    addSidebarToggle("sidebar-toggle-right", "sidebar-right", false)
}
