function addSystemInfo(d) {
    const infoText = document.querySelector(".infoText");
    infoText.innerHTML = `
        <b style="color: black">${d.name} (${d.shortName})</b>
        <p style="color: black">Betreiber: ${d.provider}<br></p>
        <hr style="margin: 0">
        ${d.description}<br>
        ${addHTMLLink("Link zu weiteren Informationen", d.link)}
        ${d.group}<br>   
    `
}

function addDataExchangeInfo(d, filters) {
    const infoText = document.querySelector(".infoText");
    infoText.innerHTML = d.processes.map(d => `
        <details>
        <summary><b style="color: black">${d.name}</b></summary>
        <hr style="margin: 0">
        ${d.description}<br>
        ${addHTMLLink("Link zu weiteren Informationen", d.link)}
        ${addHTMLLink("Link zur Schnittstelle", d.interfaceLink)}
        ${addProperties(d.properties, filters)}
        <br>
        </details>
    `).join("\n");
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
            <summary>${filter.name}</summary>
            <hr style="margin: 0">
            ${properties[filter.id]}
        </details>
    `).join("\n");
}