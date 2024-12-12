function initInfoText(infoText) {
    d3.select(".infoText")
        .selectAll("span")
        .data(infoText)
        .enter()
        .append("span")
        .attr("class", "infoTextSpan")
        .attr("info-id", d => d.id === undefined ? d.name : d.id)
        .html(function (d) {
            return "<div>" + addTitle(d) +
                d.description + "<br>" +
                addLink(d) +
                addGroup(d) +
            "</div>";
        });

    const infoTexts = document.querySelectorAll(".infoTextSpan");
    infoTexts.forEach(span => span.style.display = "none");
    document.querySelector(".infoTextSpan[info-id='startupText']").style.display = "initial";
}

function addTitle(d) {
    if(d.name === undefined) {
        return "";
    }
    const mainHeader = d.name + (d.shortName !== undefined ? " (" + d.shortName + ")" : "");
    const subHeader = d.provider !== undefined ? "Betreiber: " + d.provider + "<br>" : "";
    return "<h1 style='font-size: larger'>" + mainHeader + "</h1>" +
        "<b>" + subHeader + "</b>";
}

function addLink(d) {
    if(d.link === undefined) {
        return "";
    }
    return "<a>" + d.link + "</a>" + "<br>";
}

function addGroup(d) {
    return d.group !== undefined ? d.group : "";
}