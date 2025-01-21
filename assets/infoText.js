function addSystemInfo(d) {
    const infoText = document.querySelector(".infoText");
    infoText.innerHTML = `
        <div class="system">
            <h3 class="title is-5 mb-2">${d.shortName}</h3>
            <hr style="margin: 0" class="system">
            Betreiber: ${d.provider}<br><br>
            ${d.description}<br><br>
            ${addHTMLLink("Link zu weiteren Informationen", d.link)}<br>
            ${d.group}<br>  
        </div> 
    `
}

function addDataExchangeInfo(d, filters) {
    const infoText = document.querySelector(".infoText");
    const single = d.processes.filter(process => process.active).length <= 1;
    infoText.innerHTML = `<h3 class='title is-5 mb-2'>Datenaustausch<br>${d.source.shortName} > ${d.target.shortName}</h3>` +
        d.processes
            .filter(process => process.active)
            .map(d => `
                <details class="dataExchange" ${single ? 'open' : ''}>
                    <summary class="dataExchange"><b style="color: black">${d.name}</b></summary>
                    <hr style="margin: 0;" class="dataExchange">
                    ${d.description}<br>
                    ${addHTMLLink("Link zu weiteren Informationen", d.link)}
                    ${addHTMLLink("Link zur Schnittstelle", d.interfaceLink)}
                    ${addProperties(d.properties, filters)}
                    <br>
                </details>
        `).join("<br>\n");
}

function addHTMLLink(text, value) {
    if (value === undefined) {
        return "";
    }
    return `${text}: <a href="${value}" target="_blank">${value}</a><br>`;
}

function addProperties(properties, filters) {
    return filters.map(filter => `
        <details>
            <summary class="property">${filter.name}</summary>
            ${properties[filter.id] ? properties[filter.id].join(", ") : "keine Angaben"}
        </details>
    `).join("\n");
}