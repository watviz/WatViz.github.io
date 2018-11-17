dataProcessor = function (data) {
    //convert data type.
    data = data.map(d => {
        d[COL_LONG] = +d[COL_LONG];
        d[COL_LAT] = +d[COL_LAT];
        d[COL_MEASUREMENT_DATE] = new Date(d[COL_MEASUREMENT_DATE]);
        d[COL_SATURATED_THICKNESS] = +d[COL_SATURATED_THICKNESS];
        return d;
    });
    //Filter data with negative saturated thickness
    data = data.filter(d => {
        if (d[COL_SATURATED_THICKNESS] <= 0 || d[COL_SATURATED_THICKNESS] == d[COL_WATER_ELEVATION]) {
            return false;
        } else {
            return true;
        }
    });

    let wells = getAllWells(data);
    let wellStatistics = processWellStatistics(wells);

    debugger
    //Sort the wells by number of samples.
    wells = wells.sort((a, b) => b.values.length - a.values.length);
    let allWellIds = unpack(wells, "key");
    let dateExtent = d3.extent(unpack(data, COL_MEASUREMENT_DATE));
    let minDate = dateExtent[0];
    let maxDate = dateExtent[1];
    //Add the month index to the data
    addMonthIndex();
    addYearIndex();

    let maxMonthIndex = d3.max(unpack(data, COL_MONTH_INDEX));
    let maxYearIndex = d3.max(unpack(data, COL_YEAR_INDEX));

    function unpack(rows, key) {
        return rows.map(r => r[key]);
    }

    function getAllWells(rows) {
        let nested = d3.nest().key(d => d[COL_WELL_ID]).entries(rows);
        processAverageValue(nested);
        processStandardDeviation(nested);
        processSuddenChange(nested);
        return nested;
    }

    function processSuddenChange(wells){
        wells.forEach(well=>{
            let maxSuddenIncrement = 0;
            let maxSuddenDecrement = 0;
            let prevDate;
            let currDate;
            let prevValue;
            let currValue;
            let measures = well.values.sort((a, b)=>(a[COL_MEASUREMENT_DATE] - b[COL_MEASUREMENT_DATE]));//ORDER BY DATE
            let length = measures.length;
            let measure = measures[0];
            currDate = measure[COL_MEASUREMENT_DATE];
            currValue = measure[COL_SATURATED_THICKNESS];
            let suddenIncrementD1;
            let suddenIncrementD2;
            let suddenDecrementD1;
            let suddenDecrementD2;
            for (let i = 1; i < length; i++) {
                prevDate = currDate;
                prevValue = currValue;
                measure = measures[i];
                currDate = measure[COL_MEASUREMENT_DATE];
                currValue = measure[COL_SATURATED_THICKNESS];
                if(utils.monthdiff(prevDate, currDate) <= 1){
                    //TODO: Should divide by the number of days between two dates too
                    let change = currValue - prevValue;
                    if(change > maxSuddenIncrement){
                        maxSuddenIncrement = change;
                        suddenIncrementD1 = prevDate;
                        suddenIncrementD2 = currDate;
                    }
                    if(change < maxSuddenDecrement){
                        maxSuddenDecrement = change;
                        suddenDecrementD1 = prevDate;
                        suddenDecrementD2 = currDate;
                    }
                }
            }

            well[COL_SUDDEN_DECREMENT_D1] = suddenDecrementD1;
            well[COL_SUDDEN_DECREMENT_D2] = suddenDecrementD2;
            well[COL_SUDDEN_DECREMENT] = maxSuddenDecrement;

            well[COL_SUDDEN_INCREMENT_D1] = suddenIncrementD1;
            well[COL_SUDDEN_INCREMENT_D2] = suddenIncrementD2;
            well[COL_SUDDEN_INCREMENT] = maxSuddenIncrement;
        });
        //Add sudden increment, group

    }
    function processWellStatistics(wells){
        let result = {};
        //Process the sudden decrement
        wells = wells.sort((a, b) => a[COL_SUDDEN_DECREMENT] - b[COL_SUDDEN_DECREMENT]);
        wells.forEach((well, i)=>{
            if(!result[well.key]) result[well.key] = {};
            result[well.key][COL_SUDDEN_DECREMENT_D1] = well[COL_SUDDEN_DECREMENT_D1];
            result[well.key][COL_SUDDEN_DECREMENT_D2] = well[COL_SUDDEN_DECREMENT_D2];
            result[well.key][COL_SUDDEN_DECREMENT] = well[COL_SUDDEN_DECREMENT];
            result[well.key][COL_SUDDEN_DECREMENT_GROUP] = (i<topRows) ? 1: 2;
        });
        //Process the sudden increment
        wells = wells.sort((a, b) => b[COL_SUDDEN_INCREMENT] - a[COL_SUDDEN_INCREMENT]);
        wells.forEach((well, i)=>{
            if(!result[well.key]) result[well.key] = {};
            result[well.key][COL_SUDDEN_INCREMENT_D1] = well[COL_SUDDEN_INCREMENT_D1];
            result[well.key][COL_SUDDEN_INCREMENT_D2] = well[COL_SUDDEN_INCREMENT_D2];
            result[well.key][COL_SUDDEN_INCREMENT] = well[COL_SUDDEN_INCREMENT];
            result[well.key][COL_SUDDEN_INCREMENT_GROUP] = (i<topRows) ? 1: 2;
        });
        //Process the standard deviation
        wells = wells.sort((a, b) => b[COL_STANDARD_DEVIATION] - a[COL_STANDARD_DEVIATION]);
        wells.forEach((well, i)=>{
            if(!result[well.key]) result[well.key] = {};
            result[well.key][COL_STANDARD_DEVIATION] = well[COL_STANDARD_DEVIATION];
            result[well.key][COL_STANDARD_DEVIATION_GROUP] = (i<topRows) ? 1: 2;
        });
        return result;
    }
    //We separate average out from standard deviation since for standard deviation (we measures for all wells in all time steps) but for average, it average over time step only (month, year)
    function processAverageValue(wells) {
        wells.forEach(well => {
            let measures = well.values;
            let thicknesses = unpack(measures, COL_SATURATED_THICKNESS);
            well[COL_AVERAGE_OVERTIME] = d3.mean(thicknesses);
            well[COL_LAT] = d3.mean(unpack(measures, COL_LAT));
            well[COL_LONG] = d3.mean(unpack(measures, COL_LONG));
        });
    }
    function processStandardDeviation(wells) {
        wells.forEach(well => {
            let measures = well.values;
            let thicknesses = unpack(measures, COL_SATURATED_THICKNESS);
            well[COL_STANDARD_DEVIATION] = d3.deviation(thicknesses);
            well[COL_LAT] = d3.mean(unpack(measures, COL_LAT));
            well[COL_LONG] = d3.mean(unpack(measures, COL_LONG));
        });
    }

    function getNestedByWellMonthData() {
        return getNestedByWellTimeStepData(COL_MONTH_INDEX);
    }

    function getNestedByWellYearData() {
        return getNestedByWellTimeStepData(COL_YEAR_INDEX);
    }

    function getNestedByWellTimeStepData(timeStepColumn) {
        let nested = d3.nest().key(w => "$" + w[COL_WELL_ID] + "_" + w[timeStepColumn]).entries(data);
        processAverageValue(nested);
        return nested;
    }

    function addMonthIndex() {
        data = data.map(d => {
            d[COL_MONTH_INDEX] = utils.monthdiff(minDate, d[COL_MEASUREMENT_DATE]);
            return d;
        });
    }

    function addYearIndex() {
        data = data.map(d => {
            d[COL_YEAR_INDEX] = d[COL_MEASUREMENT_DATE].getFullYear() - minDate.getFullYear();
            return d;
        });
    }

    function getWellMonthData() {
        return getWellTimeStepData(COL_MONTH_INDEX);
    }

    function getWellYearData() {
        return getWellTimeStepData(COL_YEAR_INDEX);
    }

    function getWellTimeStepData(timeStepColumn) {
        let maxIndex;
        if (timeStepColumn === COL_MONTH_INDEX) {
            maxIndex = maxMonthIndex;
        }
        if (timeStepColumn === COL_YEAR_INDEX) {
            maxIndex = maxYearIndex;
        }
        let wellTimeStepData = new Array(maxIndex + 1);
        for (let timeIndex = 0; timeIndex <= maxIndex; timeIndex++) {
            if (!wellTimeStepData[timeIndex]) {
                let wellt = data.filter(d => d[timeStepColumn] === timeIndex);
                let nested = d3.nest().key(w => w[COL_WELL_ID]).entries(wellt);
                processAverageValue(nested);
                wellTimeStepData[timeIndex] = nested;
            }
        }
        return wellTimeStepData;
    }

    let wellMonthData = getWellMonthData(COL_MONTH_INDEX);
    let wellYearData = getWellYearData(COL_YEAR_INDEX);
    let nestedByWellMonthData = getNestedByWellMonthData();
    let nestedByWellYearData = getNestedByWellYearData();

    function getWellByMonthIndex(monthIndex) {
        return wellMonthData[monthIndex];
    }

    function getWellByYearIndex(yearIndex) {
        return wellYearData[yearIndex];
    }

    function monthIndexToYear(month) {
        let date = utils.fromMonthIndexToDate(month, minDate);
        return date.getFullYear();
    }
    function dateToMonthIndex(date){
        return utils.monthdiff(minDate, date);
    }
    function dateToYearIndex(date){
        return utils.yeardiff(minDate, date);
    }
    //Exposing methods and data.
    this.wells = wells;
    this.getWellByTimeSteps = [getWellByMonthIndex, getWellByYearIndex];
    this.minDate = minDate;
    this.maxDate = maxDate;
    this.steps = [maxMonthIndex + 1, maxYearIndex+1];
    this.nestedByWellTimeStepData = [nestedByWellMonthData, nestedByWellYearData];
    this.allWellIds = allWellIds;
    this.monthIndexToYear = monthIndexToYear;
    this.data = data;
    this.wellStatistics = wellStatistics;
    this.dateToTimeIndexFunctions = [dateToMonthIndex, dateToYearIndex];
}