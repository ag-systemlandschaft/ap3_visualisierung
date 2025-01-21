function setFilters(filters, dataExchanges, svg) {
    const filterContainer = document.querySelector(".filters");
    filterContainer.innerHTML = filters.map(filter => `
        <details class="filter">
            <summary class="filter">${filter.name}</summary>
            <hr class="filter">
            ${optionsFor(filter)}
        </details><br>
    `).join("");
    updateOptionCounts(filters, dataExchanges);

    const buttonsContainer = document.querySelector(".buttons");
    const filterButton = document.createElement("button");
    filterButton.appendChild(document.createTextNode("Filtern"));
    filterButton.addEventListener("click", () => {applyFilter(filters, dataExchanges, svg)});
    filterButton.classList.add("filter-button");
    buttonsContainer.appendChild(filterButton);

    const resetButton = document.createElement("button");
    resetButton.appendChild(document.createTextNode("Zurücksetzen"));
    resetButton.classList.add("filter-button");
    resetButton.addEventListener("click", () => {resetFilter(filters, dataExchanges, svg)});
    buttonsContainer.appendChild(resetButton);
}

function optionsFor(filter) {
    return filter.options.sort().map(option => `
        <div style="display: flex; align-items: flex-start; gap: 10px;">
            <input type="checkbox" name="${filter.id}" value="${option}" style="margin-left: 15px; margin-top: 5px">
            <label for="${filter.id}" id="${option}" style="display: block;"></label>
        </div>
    `).join("\n");
}

function applyFilter(filters, dataExchanges, svg) {
    const selectedFilters = new Map();
    filters.forEach(filter => {
        const filterId = filter.id;
        const selectedOptions = Array.from(document.querySelectorAll(`input[name="${filterId}"]:checked`))
            .map(checkbox => checkbox.value);
        selectedFilters.set(filterId, selectedOptions);
    });

    dataExchanges.forEach(exchange => {
        exchange.processes.forEach(process => {
            let processActive = true;

            selectedFilters.forEach((selectedOptions, filterId) => {
                if (selectedOptions.length === 0) {
                    return;
                }

                const filterProperties = process.properties[filterId];

                if (!filterProperties || !filterProperties.some(option => selectedOptions.includes(option))) {
                    processActive = false;
                }
            });
            
            process.active = processActive;
        });
    });

    filterDataExchange(dataExchanges, svg);
    updateOptionCounts(filters, dataExchanges);
}

function resetFilter(filters, dataExchanges, svg) {
    filters.forEach(filter => {
        const filterId = filter.id;
        document.querySelectorAll(`input[name="${filterId}"]:checked`).forEach(checkbox => {
            checkbox.checked = false;
        });
    });

    dataExchanges.forEach(exchange => {
        exchange.processes.forEach(process => {
            process.active = true;
        });
    });

    filterDataExchange(dataExchanges, svg);
    updateOptionCounts(filters, dataExchanges);
}

function updateOptionCounts(filters, dataExchanges) {
    filters.forEach(filter => {
        filter.options.forEach(option => {
            const count = dataExchanges
                .flatMap(exchange => exchange.processes)
                .filter(process => process.active)
                .filter(process => process.properties[filter.id] !== undefined ? process.properties[filter.id].includes(option) : false)
                .length;

            const optionElement = document.querySelector(`label[for="${filter.id}"][id="${option}"]`);
            const optionCheckbox = document.querySelector(`input[name="${filter.id}"][value^="${option}"]`);
            if (optionElement) {
                optionElement.innerHTML = `${option} (${count})`;
                optionElement.style.color = "#434343";
                optionCheckbox.disabled = false;
                if(count === 0){
                    optionElement.style.color = "gray";
                    optionCheckbox.disabled = true;
                }
            }
        })
    });
}