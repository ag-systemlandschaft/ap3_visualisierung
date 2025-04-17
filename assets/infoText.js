function addSystemInfo(d) {
    const infoText = document.querySelector(".infoText");
    infoText.innerHTML = `
        <div class="system">
            <h3 class="title is-5 mb-2">${d.shortName}</h3>
            <hr style="margin: 0" class="system">
            Betreiber: ${d.provider}<br><br>
            Kurzbeschreibung: ${d.description}<br><br>
            ${addHTMLLink("Link zu weiteren Informationen", d.link)}<br>
            ${d.group}<br>  
        </div> 
    `
}

function addDataExchangeInfo(d, filters) {
    const infoText = document.querySelector(".infoText");
    const single = d.processes.filter(process => process.active).length <= 1;
    infoText.innerHTML = `<h3 class='title is-5 mb-2' style="padding-bottom: 15px">Datenaustausch<br>${d.source.shortName} > ${d.target.shortName}</h3>` +
        d.processes
            .filter(process => process.active)
            .map(d => `
                <details class="dataExchange" ${single ? 'open' : ''}>
                    <summary class="dataExchange">${d.name}</summary>
                    <hr style="margin: 0;" class="dataExchange">
                    <details>
                        <summary class="property">Kurzbeschreibung</summary>
                        <div class="summaryContent">
                            ${d.description}
                        </div>
                    </details>
                    ${addProperties(d.properties, filters)}
                    <details style="visibility: ${d.link || d.interfaceLink ? 'visible' : 'collapse'}">
                        <summary class="property">Links</summary>
                        <div class="summaryContent">
                            ${addHTMLLink("Link zu weiteren Informationen", d.link)}
                            ${addHTMLLink("Link zur Schnittstelle", d.interfaceLink)}
                        </div>
                    </details>
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
            <div class="summaryContent">
                ${properties[filter.id] ? properties[filter.id].join(", ") : "keine Angaben"}
            </div>
        </details>
    `).join("\n");
}

function setDefaultInfoText() {
    const infoText = document.querySelector(".infoText");
    infoText.innerHTML = "";
    const heading = document.createElement('h3');
    heading.className = 'title is-5 mb-2';
    heading.textContent = 'Information';
    infoText.appendChild(heading);
    const textBody = document.createElement("div");
    // Anpassung erfolgt durch EZB
    textBody.innerHTML = `
        Diese Visualisierung wurde durch die AG Systemlandschaft E-Ressourcen erstellt.
        Sie basiert auf 23 Fragebögen. Aktuell werden Informationen zu 76 Systemen und 190 Datenflüssen angezeigt. Zeitraum der Datenerhebung: 09/2023 bis 03/2025</br></br></br>
        Weitere relevante Daten für unsere Systemlandkarte können über den <a href="https://ag-systemlandschaft.de/material/" target="blank">Fragebogen</a> eingereicht werden.
`;
    infoText.appendChild(textBody);
}