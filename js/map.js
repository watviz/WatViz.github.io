let gm;
function plotMaps(dp) {
    let longAccessor = (d) => {
        return d[COL_LONG];
    }
    let latAccessor = (d) => {
        return d[COL_LAT];
    }
    gm = new GoogleMap("map");
    gm.fitBounds(wells, longAccessor, latAccessor);
    gm.dispatch.on("draw", draw);

    function draw(event) {
        plotContours(event);
        // plotWells(event);
    }

    function plotWells(event) {
        let layer = event.overlayMouseTarget;
        let transform = event.transform(longAccessor, latAccessor);
        let marker = layer.select("#wellsGroup").selectAll("g").data(wells);

        //Update existing
        marker.each(transform);
        marker.exit().remove();

        let enter = marker.enter().append("g")
            .each(transform)
            .attr("class", "marker");

        enter.append("circle")
            .attr("r", 1.4326530612244897)
            // .attr("fill", d => color.waterLevel(d[COL_AVERAGE_OVERTIME]))
            // .attr("fill", "rgba(0,0,0,0.5)")
            .attr("fill", "red")
            .attr("stroke", "black")
            .attr("fill-opacity", .5)
            .attr("stroke-width", 0.6)
            .on("mouseover", d=>{
                showTip(d, formatData);
            })
            .on("mouseout", ()=>{
                hidetip();
            });
    }

    function addDivPixelFromLatLng(wells, fromLatLngToDivPixel) {
        //let us get the data of one month
        wells = wells.map(well => {
            let p = fromLatLngToDivPixel(well[COL_LAT], well[COL_LONG]);
            well.x = p.x;
            well.y = p.y;
            return well;
        });
        return wells;
    }

    function plotContours(event) {
        let svg = event.overlayLayer;
        let g = svg.select("#contoursGroup");
        g.selectAll("*").remove();
        if(wells.length <= 0){
            return;//Don't do any further drawing if wells is empty
        }

        let fromLatLngToDivPixel = event.fromLatLngToDivPixel;
        wells = addDivPixelFromLatLng(wells, fromLatLngToDivPixel);
        let gridSize = 30;
        let recbin = new RecBinner(wells, gridSize);
        let grid = recbin.grid;

        g.attr("class", "contour");
        g.attr("transform", `translate(${grid.x}, ${grid.y})`);
        g.selectAll("path")
            .data(d3.contours().smooth(true)
                .size(grid.size)
                .thresholds(color.waterLevel.domain())
                (grid.map(g => g.value)))
            .enter().append("path")
            .attr("d", d3.geoPath(d3.geoIdentity().scale(grid.scale)))
            .attr("fill", function (d) {
                return color.waterLevel(d.value);
            })
            .attr("stroke", "#000")
            .attr("stroke-width", 0.3)
            .attr("class", "marker")
            .attr("opacity", contourOpacity)
            .attr("stroke-linejoin", "round");
    }
}
