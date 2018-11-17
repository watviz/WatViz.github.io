class RecBinner {
    constructor(wells, gridSize) {
        this.wells = wells;
        this.gridSize = gridSize;
    }
    get grid() {
        let self = this;
        let xExtent = d3.extent(this.wells.map(well => well.x));
        let yExtent = d3.extent(this.wells.map(well => well.y));
        let width = xExtent[1] - xExtent[0];
        let height = yExtent[1] - yExtent[0];
        let minX = xExtent[0];
        let minY = yExtent[0];
        let maxX = xExtent[1];
        let maxY = yExtent[1];
        let xStep =  width / this.gridSize;
        let yStep = xStep;
        let ySize = this.gridSize;//Default is equal to xGridSize
        if(yStep !=0){//if the step !=0 means, there is a step defined by x range => then we can use that step (this is to make sure that we will have the same scale later on for the geoPath
            ySize = Math.ceil(height/yStep);
        }

        let xyGridSize = [this.gridSize, ySize];
        this.xyGridSize = xyGridSize;
        let grid = new Array(this.xyGridSize[0] * this.xyGridSize[1]);
        //Initialize the grid
        for (let xi = 0; xi < this.xyGridSize[0]; xi++) {
            for (let yi = 0; yi < this.xyGridSize[1]; yi++) {
                let gi = getGridIndexFromXiYi(xi, yi);
                grid[gi] = [];
                grid[gi].x = xi;
                grid[gi].y = yi;
            }
        }

        this.wells.forEach(well=>{
            let xi = getXGridIndex(well.x);
            let yi = getYGridIndex(well.y);
            let gi = getGridIndexFromXiYi(xi, yi);
            grid[gi].push(well);
        });

        //Calculate the value for the grid.
        grid.forEach(g =>{
            if(g.length>0){
                g.value = d3.mean(g.map(w=>w[COL_AVERAGE_OVERTIME]));
            }else{
                g.value = null;
            }
        });
        grid.scale = width/this.xyGridSize[0];
        grid.x = minX;
        grid.y = minY;
        grid.size = this.xyGridSize;
        return grid;

        function getGridIndexFromXiYi(xi, yi) {
            return yi * self.xyGridSize[0] + xi;
        }
        function getXGridIndex(value){
            if(value == maxX){
                return self.xyGridSize[0]-1;
            }
            value = value - minX;
            return getGridIndex(value, xStep);
        }
        function getYGridIndex(value){
            if(value==maxY){
                return self.xyGridSize[1]-1;
            }
            value = value - minY;
            return getGridIndex(value, yStep);
        }
        function getGridIndex(value, step) {
            return Math.floor(value / step);
        }


    }
}