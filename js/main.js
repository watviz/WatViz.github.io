
d3.csv("data/well_data_full.optimized1.csv", function(err, data){
    dp = new dataProcessor(data);
    wells = dp.getWellByTimeSteps[timeStepTypeIndex](0);
    plotMaps(dp);
    playSlider = createPlaySlider(dp.minDate, dp.maxDate, "playButtonDiv", mapWidth, updatePlot, 500);
    //Plot the discrete heatmap
    heatmapPlotter = discreteHeatMapPlotter(dp, "heatmap", {});
    heatmapPlotter.plot();
    spinner.stop();
});
function updatePlot(h){
    let index = timeStepTypeIndex===0? utils.monthdiff(dp.minDate, h): utils.yeardiff(dp.minDate, h);
    wells = dp.getWellByTimeSteps[timeStepTypeIndex](index);
    gm.updateMap();
}
