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
                        ${d.description}
                    </details>
                    ${addProperties(d.properties, filters)}
                    <details style="visibility: ${d.link || d.interfaceLink ? 'visible' : 'collapse'}">
                        <summary class="property">Links</summary>
                        ${addHTMLLink("Link zu weiteren Informationen", d.link)}
                        ${addHTMLLink("Link zur Schnittstelle", d.interfaceLink)}
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
            ${properties[filter.id] ? properties[filter.id].join(", ") : "keine Angaben"}
        </details>
    `).join("\n");
}