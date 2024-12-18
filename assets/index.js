// Load data
d3.json("/data/data.json").then(init);

const systemColor = "#6667ab";
const selectedColor = "darkviolet";
const dataExchangeColor = "#434343";
const hoverColor = "darkblue";
const filterBackgroundColor = "#e9e9e9";

// Initialize the visualization
function init(data) {
    const systems = data.systems;
    const filters = data.propertyCategories;
    const dataExchanges = data.dataExchange;

    filters.sort((a, b) => a.name.localeCompare(b.name));

    //d3 Simulation search for id. Check if another tag can be defined as identifier
    systems.forEach(d => d.id = d.shortName);

    dataExchanges.forEach(d => d.processes.forEach(process => process.active = true));

    const infoText = document.querySelector(".infoText");
    infoText.innerText = `
        Diese Visualisierung zeigt Importdatenflüsse auf Basis von Echtdaten der ersten Fragerunde. 
        Für die erste prototypische Visualisierung wurde nur ein Bruchteil der vorhandenen Daten ausgewertet. 
        Aufgrund der High-Level-Darstellung gibt die Visualisierung aktuell keine Auskunft über potentielle Doppellieferungen. 
        Die Umsetzung des im AG-Kontext erarbeiteten Visualisierungskonzepts ist aktuell noch in Arbeit.
    `;

    const svg = d3.select("svg");
    addZoom(svg);
    initGraph(svg, systems, dataExchanges, filters);
    setFilters(filters, dataExchanges, svg);
}
