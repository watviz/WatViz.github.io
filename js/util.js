let utils = {
    datediff: function (first, second) {
        return Math.round((second - first) / (1000 * 60 * 60 * 24));
    },
    monthdiff: function (d1, d2) {
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months;
    },
    yeardiff: function(d1, d2){
        return d2.getFullYear() - d1.getFullYear();
    },
    monthFormat(date) {
        let formatter = d3.timeFormat('%Y-%m');
        return formatter(date);
    },
    dateFormat(date){
        let formatter = d3.timeFormat("%Y-%m-%d");
        return formatter(date);
    },
    formatDateIntoYear(date){
        return d3.timeFormat("%Y")(date);
    },
    formatDate(date){
        return d3.timeFormat("%b %Y")(date);
    },
    parseDate(date){
        return d3.timeParse("%m/%d/%y")(date);
    },
    fromMonthIndexToDate(monthIndex, minDate){
        let day = minDate.getDate();
        let month = minDate.getMonth();
        let year = minDate.getFullYear();
        let addedYears = Math.floor(monthIndex/12);
        let addedMonths = monthIndex - 12*addedYears;
        let newDate = new Date(year+addedYears, month+addedMonths, day);
        return newDate;
    }
};