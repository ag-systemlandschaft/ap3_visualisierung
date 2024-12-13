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
                addGroup(d) + "<br>" +
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
    return "<b style='color: " + systemColor + "'>" + mainHeader + "</b>" +
        "<p style='color: " + systemColor + "'>" + subHeader + "</p>" +
        "<hr style='margin: 0'/>";
}

function addLink(d) {
    if (d.link === undefined) {
        return "";
    }
    return "<a>" + d.link + "</a>" + "<br>";
}

function addGroup(d) {
    return d.group !== undefined ? d.group : "";
}