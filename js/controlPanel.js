function setOptions(theOptions, theDiv, theSelectedIndex){
    let sel = $("#"+theDiv);
    //Remove previous options
    sel.find('option')
        .remove();
    $.each(theOptions, (i, value) => {
        let op = $("<option></option>");
        if (i == theSelectedIndex) {
            op.attr("selected", "true");
        }
        op.text(value);
        sel.append(op);
    });
}
setOptions(timeStepOptions, "aggregationSelect", timeStepTypeIndex);
setOptions(groupOptions, "groupSelect", groupByIndex);
setOptions(groupSortOptions[groupByIndex], "groupOrderSelect", groupSortIndex);
setOptions(wellSortOptions, "wellOrderSelect", wellSortIndex);


function toggleSelections(value) {
    $("#groupSelect").attr("disabled", value);
    $("#locationOrderSelect").attr("disabled", value);
    $("#measureOrderSelect").attr("disabled", value);
    $("#outlierCheckbox").attr("disabled", value);
    $("#lensingCheckbox").attr("disabled", value);
}