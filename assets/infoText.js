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
}