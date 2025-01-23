function setFilters(filters, dataExchanges, svg) {
    const filterContainer = document.querySelector(".filters");
    filterContainer.innerHTML = filters.map(filter => `
        <details class="filter">
            <summary class="filter">${filter.name}</summary>
            <hr class="filter">
            ${optionsFor(filter)}
        </details>
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

const optionId = (filter, option) => [filter.id, option].join('-');

function optionsFor(filter) {
    return filter.options.sort().map(option => {
        const inputId = optionId(filter, option);
        return `
            <div style="display: flex; align-items: baseline; gap: 10px;">
                <input
                    type="checkbox"
                    name="${filter.id}"
                    id="${inputId}"
                    value="${option}"
                    style="margin-left: 15px; margin-top: 5px"
                >            
                <label
                    for="${inputId}"
                    id="${option}"
                    style="display: block;"
                    >
                </label>
        </div>`;
    }).join("");
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

            const id = optionId(filter, option);
            const optionElement = document.querySelector(`label[for="${id}"]`);
            const optionCheckbox = document.querySelector(`input[name="${filter.id}"][value^="${option}"]`);
            if (optionElement) {
                optionElement.innerHTML = `${option} (${count})`;
                optionCheckbox.disabled = count === 0;
                if (optionCheckbox.disabled) {
                    optionElement.style.color = "gray";
                } else {
                    optionElement.style.color = "#434343";
                    optionElement.style.cursor = "pointer";
                }
            }
        })
    });
}