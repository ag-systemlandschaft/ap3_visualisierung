function initInfoText(infoText) {
    d3.select(".infoText")
        .selectAll("span")
        .data(infoText)
        .enter()
        .append("span")
        .attr("class", "infoTextSpan")
        .attr("info-id", d => d.id === undefined ? d.name : d.id)
        .html(function (d) {
            return d.description
        });

    const infoTexts = document.querySelectorAll(".infoTextSpan");
    infoTexts.forEach(span => span.style.display = "none");
    document.querySelector(".infoTextSpan[info-id='startupText']").style.display = "initial";

    addClickActions();
}

function addClickActions() {
    let systems = document.querySelectorAll("svg g circle, svg g text");
    let dataExchanges = document.querySelectorAll("svg g path");

    systems.forEach(system => system.addEventListener("click", function(e) {
        console.log("Clicked element:", e.target);
        let infoTexts = document.querySelectorAll(".infoTextSpan");
        infoTexts.forEach(span => span.style.display = "none");
        console.log("info-id:", e.target.parentElement.querySelector("text").innerHTML);
        document.querySelector(".infoTextSpan[info-id='" + e.target.parentElement.querySelector("text").innerHTML + "']").style.display = "initial";
    }));

    dataExchanges.forEach(dataExchange => dataExchange.addEventListener("click", function(e) {
        console.log("Clicked element:", e.target);
        const linkData = e.target.__data__; // Hier wird das Datenobjekt des Link-Elements abgerufen
        console.log(linkData);
        const linkids = linkData.processes.map(d => d.name);
        let infoTexts = document.querySelectorAll(".infoTextSpan");
        infoTexts.forEach(span => span.style.display = "none");
        console.log("info-ids:", linkids);
        linkids.forEach(id => document.querySelector(".infoTextSpan[info-id='" + id + "']").style.display = "initial");
    }));
}