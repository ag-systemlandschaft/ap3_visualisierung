function setFilters(filters) {
    //Filters without effect
    let filterContainer = document.querySelector(".filters");
    filters.forEach(filter => filterContainer.innerHTML +=
        "<label>"+filter.name+"</label><br>"+
        "<select name='"+filter.name+"' id='"+filter.id+"'>"+
        optionsFor(filter) +
        "</select><br>"
    );
}

function optionsFor(filter) {
    let options = ""
    filter.options.forEach(option => options +="<option value='"+option+"'>"+option+"</option>")
    return options
}