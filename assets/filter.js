function setFilters(filters, dataExchanges) {
    const filterContainer = document.querySelector(".filters");
    filterContainer.innerHTML = filters.map(filter => `
        <details style="background-color: ${filterBackgroundColor}">
            <summary>${filter.name}</summary>
            <hr style="margin: 0; background-color: ${systemColor}">
            ${optionsFor(filter, dataExchanges)}
        </details><br>
    `).join("");
}

function optionsFor(filter, dataExchanges) {
    return filter.options.map(option => {
        const count = dataExchanges
            .flatMap(exchange => exchange.processes)
            .filter(processe => processe.properties[filter.id] !== undefined ? processe.properties[filter.id].includes(option) : false)
            .length;
        return `
            <input type="checkbox" name="${filter.id}" value="${option}" style="margin-left: 15px">
            ${option} (${count})
            <br>
        `
    }).join("\n");
}