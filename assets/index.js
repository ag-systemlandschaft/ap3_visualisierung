// Load data
d3.json("/data/data.json").then(init);

const systemColor = "black";
const dataExchangeColor = "#6667ab";

// Initialize the visualization
function init(data) {
    const dataExchanges = data.dataExchange,
        systems = data.systems,
        filters = data.propertyCategories

    //d3 Simulation search for id. Check if another tag can be defined as identifier
    systems.forEach(d => {d.id = d.shortName});

    const infoTexts = [{
        "id": "startupText",
        "description": "Diese Visualisierung zeigt Importdatenflüsse auf Basis von Echtdaten der ersten Fragerunde. Für die erste prototypische Visualisierung wurde nur ein Bruchteil der vorhandenen Daten ausgewertet. Aufgrund der High-Level-Darstellung gibt die Visualisierung aktuell keine Auskunft über potentielle Doppellieferungen. Die Umsetzung des im AG-Kontext erarbeiteten Visualisierungskonzepts ist aktuell noch in Arbeit."
    }].concat(systems).concat(dataExchanges.flatMap(dataExchange => dataExchange["processes"]))

    const svg = d3.select("svg");
    initZoomAndPan(svg)
    initGraph(svg, systems, dataExchanges);
    initInfoText(infoTexts)

    setFilters(filters);
}
