function setFilters(filters, dataExchanges) {
    const filterContainer = document.querySelector(".filters");
    filterContainer.innerHTML = filters.map(filter => `
        <details style="background-color: ${filterBackgroundColor}">
            <summary>${filter.name}</summary>
            <hr style="margin: 0; background-color: ${systemColor}">
            ${optionsFor(filter, dataExchanges)}
        </details><br>
    `).join("");
    filterContainer.innerHTML += `<button onclick="applyFilter()">Apply Filter</button>`;
}

function optionsFor(filter, dataExchanges) {
    return filter.options.map(option => {
        const count = dataExchanges
            .flatMap(exchange => exchange.processes)
            .filter(process => process.active)
            .filter(process => process.properties[filter.id] !== undefined ? process.properties[filter.id].includes(option) : false)
            .length;
        return `
            <input type="checkbox" name="${filter.id}" value="${option}" style="margin-left: 15px">
            <label for="${filter.id}" id="${option}">${option} (${count})</label>
            <br>
        `
    }).join("\n");
}

function applyFilter() {
    const selectedFilters = new Map();
    filters.forEach(filter => {
        const filterId = filter.id;
        const selectedOptions = Array.from(document.querySelectorAll(`input[name="${filterId}"]:checked`))
            .map(checkbox => checkbox.value);
        selectedFilters.set(filterId, selectedOptions);
    });

    globalDataExchanges.forEach(exchange => {
        exchange.processes.forEach(process => {
            let processActive = true;

            selectedFilters.forEach((selectedOptions, filterId) => {
                if (selectedOptions.length === 0) return;

                const filterProperties = process.properties[filterId];

                if (!filterProperties || !filterProperties.some(option => selectedOptions.includes(option))) {
                    processActive = false;
                }
            });
            
            process.active = processActive;
        });
    });

    filterDateExchange(globalDataExchanges);
    updateOptionCounts(globalDataExchanges);
}

function updateOptionCounts(dataExchanges) {
    filters.forEach(filter => {
        filter.options.forEach(option => {
            const count = dataExchanges
                .flatMap(exchange => exchange.processes)
                .filter(process => process.active)
                .filter(process => process.properties[filter.id] !== undefined ? process.properties[filter.id].includes(option) : false)
                .length;

            const optionElement = document.querySelector(`label[for="${filter.id}"][id="${option}"]`);
            if (optionElement) {
                optionElement.innerHTML = `${option} (${count})`;
            }
        })
    });
}