function setFilters(filters, dataExchanges) {
    const filterContainer = document.querySelector(".filters");
    filterContainer.innerHTML = filters.map(filter => `
        <details style="background-color: ${filterBackgroundColor}; border-radius: 5px; padding: 10px">
            <summary>${filter.name}</summary>
            <hr>
            ${optionsFor(filter)}
        </details><br>
    `).join("");
    updateOptionCounts(filters, dataExchanges);

    const filterButton = document.createElement("button");
    filterButton.appendChild(document.createTextNode("Filtern"));
    filterButton.addEventListener("click", () => {applyFilter(filters, dataExchanges)});
    filterButton.classList.add("filter-button");
    filterContainer.appendChild(filterButton);

    const resetButton = document.createElement("button");
    resetButton.appendChild(document.createTextNode("Zurücksetzen"));
    resetButton.classList.add("filter-button");
    resetButton.addEventListener("click", () => {resetFilter(filters, dataExchanges)});
    filterContainer.appendChild(resetButton);
}

function optionsFor(filter) {
    return filter.options.map(option => `
        <input type="checkbox" name="${filter.id}" value="${option}" style="margin-left: 15px">
        <label for="${filter.id}" id="${option}"></label>
        <br>
    `).join("\n");
}

function applyFilter(filters, dataExchanges) {
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

    filterDataExchange(dataExchanges);
    updateOptionCounts(filters, dataExchanges);
}

function resetFilter(filters, dataExchanges) {
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

    filterDataExchange(dataExchanges);
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