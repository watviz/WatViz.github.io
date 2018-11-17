var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0).style("z-index", 1000);
function showTip(d, formatData){
    let htmlstr = formatData(d);
    tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    tooltip.html(htmlstr)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
}
function hidetip(){
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
}
function formatData(d) {
    let wellId = d.key;
    //If the wellId contains $ and _, it means it was the combination of wellID + month, we split and take only well ID
    if(wellId.indexOf('$')>=0){
        wellId = wellId.replace('$', '').split('_')[0];
    }
    let position = `Long: ${d[COL_LONG]}<br/>Lat: ${d[COL_LAT]}`;
    let county = `County: ${d.values[0][COL_COUNTY]}`;
    let htmlStr = `<b>Well id: ${wellId}</b><br/>${position}<br/>${county}`;
        htmlStr +=`<br/>Overall deviation: ${dp.wellStatistics[wellId][COL_STANDARD_DEVIATION]}`;
        htmlStr +=`<br/>Sudden increment: ${dp.wellStatistics[wellId][COL_SUDDEN_INCREMENT]}`;
        htmlStr +=`<br/>Sudden decrement: ${dp.wellStatistics[wellId][COL_SUDDEN_DECREMENT]}`;
    let table = "<table>";
    let values = d.values;
    values.forEach(value=>{
        table += "<tr>";
        let date = utils.dateFormat(value[COL_MEASUREMENT_DATE]);
        let st = value[COL_SATURATED_THICKNESS];
        table += `<td>${date}</td><td style="text-align: right; padding-left: 10px;">${Math.round(st)}</td>`;
        table += "</tr>";
    });
    table += "</table>";
    htmlStr += table;
    return htmlStr;
}