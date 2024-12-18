function setFilters(filters, dataExchanges) {
    const filterContainer = document.querySelector(".filters");
    filterContainer.innerHTML = filters.map(filter => `
        <details style="background-color: ${filterBackgroundColor}; border-radius: 5px; padding: 10px">
            <summary>${filter.name}</summary>
            <hr>
            ${optionsFor(filter)}
        </details><br>
    `).join("");
    updateOptionCounts(dataExchanges);
    filterContainer.innerHTML += `<button class="filter-button" onclick="applyFilter()">Filtern</button>`;
    filterContainer.innerHTML += `<button class="filter-button" onclick="resetFilter()">Zurücksetzen</button>`;
}

function optionsFor(filter) {
    return filter.options.map(option => {
        return `
            <input type="checkbox" name="${filter.id}" value="${option}" style="margin-left: 15px">
            <label for="${filter.id}" id="${option}"></label>
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

function resetFilter() {
    filters.forEach(filter => {
        const filterId = filter.id;
        document.querySelectorAll(`input[name="${filterId}"]:checked`).forEach(checkbox => {
            checkbox.checked = false;
        });
    });

    globalDataExchanges.forEach(exchange => {
        exchange.processes.forEach(process => {
            process.active = true;
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
                optionElement.style.color = "#434343";
                if(count === 0){
                    optionElement.style.color = "gray";
                }
            }
        })
    });
}