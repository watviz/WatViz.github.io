/*Adapted from: https://bl.ocks.org/officeofjane/47d2b0bfeecfcb41d2212d06d095c763*/
/***
 * Should also add <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/> for the play/pause icon
 * @param startDate
 * @param endDate
 * @param divId the div to render the slider inside
 * @param updatePlot function to update the plut => it will output the date corresponding to the selected value
 * @param options should specify: {margin:{top: , left: , right: , bottom: }, }
 */
let timer;

function createPlaySlider(startDate, endDate, divId, divWidth, updatePlot, interval) {
    d3.select("#"+divId).selectAll("*").remove();
    let handlePath = "M-5.5,-5.5v10l6,5.5l6,-5.5v-10z";
    let divHeight = 50;
    let sliderMargin = {left: 40, top: 0, buttom: 0, right: 10};
    let formatTimeSteps = [d3.timeFormat("%b %Y"), d3.timeFormat("%Y")];
    if (timeStepTypeIndex === 0) {
        //Set start date, end date to be the same middle of the month/or to the same date => so that each time we add a scale step => it increase exactly 1 month
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 15);
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 15);
    }

    if (timeStepTypeIndex === 1) {
        //put it at the middle of the year just to make sure it would not slip our of a year each step (since for each step there might be some inaccuracy of precisions of floating divisions
        startDate = new Date(startDate.getFullYear(), 5, 15);
        endDate = new Date(endDate.getFullYear(), 5, 15);
    }

    let formatDateIntoYear = d3.timeFormat("%Y"),
        formatTimeStep = formatTimeSteps[timeStepTypeIndex],
        div = d3.select("#" + divId),
        svgWidth = divWidth,
        svgHeight = divHeight,
        sliderWidth = svgWidth - sliderMargin.left - sliderMargin.right;

    div.style("width", divWidth);
    div.style("height", divHeight);

    let play = "play_circle_filled";
    let pause = "pause_circle_filled";
    let playButton = div.append("i").attr("id", "play-button").attr("class", "material-icons");
    playButton.text(play);
    let svg = div
        .append("svg")
        .attr("class", "sliderSvg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    ////////// slider //////////
    let moving = false;
    let currentValue = 0;
    let targetValue = sliderWidth;
    let allSteps = [utils.monthdiff(startDate, endDate), utils.yeardiff(startDate, endDate)]
    let steps = allSteps[timeStepTypeIndex];
    let years = allSteps[1];
    let x = d3.scaleTime()
        .domain([startDate, endDate])
        .range([0, targetValue])
        .clamp(true);

    let slider = svg.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + sliderMargin.left + "," + (10 +1) + ")");//+1 for the border

    slider.append("line")
        .attr("class", "track")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-inset")
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function () {
                slider.interrupt();
            })
            .on("start drag", function () {
                currentValue = d3.event.x;
                update(x.invert(currentValue));
            })
        );

    //Calculating the ticks
    let ticks = [];
    for (let i = 0; i <= years; i++) {
        ticks[i] = new Date(startDate.getFullYear() + i, startDate.getMonth(), startDate.getDate());
    }

    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 20 + ")")
        .selectAll("text")
        .data(ticks)
        .enter()
        .append("text")
        .attr("class", "tick")
        .attr("opacity", (d, i)=>(i==0)?0:1)//at first disable the first tick label (since it is our current active label)
        .attr("x", x)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(function (d) {
            return formatDateIntoYear(d);
        });

    // let handle = slider.insert("circle", ".track-overlay")
    //     .attr("class", "handle")
    //     .attr("r", 10);
    let handle = slider.insert("g", ".track-overlay")
        .attr("class", "handle");
        handle.append("path")
        .attr("d", handlePath);

    let label = slider.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .text(formatTimeStep(startDate))
        .attr("transform", "translate(0," + (30) + ")");


    //Play button.
    playButton
        .on("click", function () {
            let button = d3.select(this);
            if (button.text() === pause) {
                moving = false;
                clearInterval(timer);
                button.text(play);
            } else {
                moving = true;
                timer = setInterval(step, interval);
                button.text(pause);
            }
        });

    function setPosition(position) {
        currentValue = position;
        if (currentValue >= targetValue) {
            //Due to the division precision of JS (for the step) + convertion back to date => sometimes the last year is not called => so in that case we just update to the last one for sure.
            update(endDate);
            moving = false;
            currentValue = 0;
            clearInterval(timer);
            playButton.text(play);
        }
        update(x.invert(currentValue));
    }

    function setTime(time){
        currentValue = x(time);
        setPosition(currentValue);
    }

    function step() {
        currentValue = currentValue + (targetValue / steps);
        setPosition(currentValue);
    }

    function update(h) {
        // update position and text of label according to slider scale
        let position = x(h);
        //Disable the ticks (at current step).
        let currentIndex = Math.floor(ticks.length*position/targetValue);
        d3.selectAll(".tick").attr("opacity", (d, i)=>{
           return (i===currentIndex || i=== currentIndex-1 || i===currentIndex+1)?0:1;
        });

        handle.attr("transform", `translate(${position}, 0)`);
        label.attr("x", position)
            .text(formatTimeStep(h));
        updatePlot(h);
    }

    this.setPosition = setPosition;
    this.setTime = setTime;
    return this;

}
