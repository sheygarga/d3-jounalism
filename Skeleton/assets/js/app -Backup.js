// When the browser window is resized, responsify() is called.
d3.select(window).on("resize", makeResponsive);

// When the browser loads, makeResponsive() is called.
makeResponsive();

// The code for the chart is wrapped inside a function that automatically resizes the chart
function makeResponsive() {
  // if the SVG area isn't empty when the browser loads, remove it and replace it with a resized version of the chart
  var svgArea = d3.select(".chart").select("svg");
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // SVG wrapper dimensions are determined by the current width and height of the browser window.
  var svgWidth = window.innerWidth;
  var svgHeight = window.innerHeight;

  //var svgWidth = 400;
  //var svgHeight = 200;

  var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
  var chart = d3.select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //var chart = svg.append("g");

  // Append a div to the body to create tooltips, assign it a class
  d3.select("#scatter")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  d3.csv("data/data.csv", function (err, usData) {
    if (err) throw err;

    usData.forEach(function (data) {
      data.diabetes = +data.diabetes;
      data.poverty = +data.poverty;
      data.internet = +data.internet;
      data.median_age = +data.median_age;
      data.education = +data.education;
      data.education = +data.obesity;
    });


    // Create scale functions
    var yLinearScale = d3.scaleLinear()
      .range([height, 0]);

    var xLinearScale = d3.scaleLinear()
      .range([0, width]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    ///////////////////////////START NEW CODE
    // These variables store the minimum and maximum values in a column in data.csv
    var xMin;
    var xMax;
    var yMin;
    var yMax;

    // This function identifies the minimum and maximum values in a column in hairData.csv
    // and assign them to xMin and xMax variables, which will define the axis domain
    function findMinAndMaxX(dataColumnX) {
      xMin = d3.min(usData, function (data) {
        return +data[dataColumnX] * 0.8;
      });

      xMax = d3.max(usData, function (data) {
        return +data[dataColumnX] * 1.1;
      });
    }

    function findMinAndMaxY(dataColumnY) {
      yMax = d3.max(usData, function (data) {
        return +data[dataColumnY] * 1.1;
      });

      yMin = d3.min(usData, function (data) {
        return +data[dataColumnY] * 0.8;
      });
    }

    // The default x-axis is 'poverty', default y-axis is 'diabetes'
    // Another axis can be assigned to the variable during an onclick event.
    // This variable is key to the ability to change axis/data column
    var currentAxisLabelX = "poverty";
    var currentAxisLabelY = "diabetes";

    // Call findMinAndMax() with 'hair_length' as default
    findMinAndMaxX(currentAxisLabelX);//ISSUE HERE
    findMinAndMaxY(currentAxisLabelY);//ISSUE HERE

    // Set the domain of an axis to extend from the min to the max value of the data column
    xLinearScale.domain([xMin, xMax]);
    yLinearScale.domain([yMin, yMax]);


    ///////////////END NEW CODE

    // Scale the domain//START REPLACED (WAS WORKING)//////////////////////
    //xLinearScale.domain([20, d3.max(usData, function(data) {
    // return +data.poverty * 1.1;
    //})]);
    //yLinearScale.domain([0, d3.max(usData, function(data) {
    //  return +data.diabetes * 1.1;
    //})]);
    /////////////////////FINISH REPLACED CODE (WAS WORKING) ////////////////

    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([50, -80])
      .html(function (data) {
        var state = data.state;
        var povertyLevel = data.poverty;
        var diabetes = data.diabetes;
        var internet = data.internet;
        var median_age = data.median_age;
        var education = data.education;

        return (state + "<br> Poverty Level: " + povertyLevel + "<br> Diabetes: " + diabetes +
          "<br> internet: " + internet + "<br> median age: " + median_age +
          "<br> education level: " + education);
      });

    chart.call(toolTip);

    chart.selectAll("circle")
      .data(usData)
      .enter().append("circle")
      .attr("cx", function (data, index) {
        
        return xLinearScale(data[currentAxisLabelX]);
      })
      .attr("cy", function (data, index) {
        return yLinearScale(data[currentAxisLabelY]);
      })
      .attr("r", "15")
      .attr("fill", "red")
      .on("click", function (data) {
        toolTip.show(data);
      })
      // onmouseout event
      .on("mouseout", function (data, index) {
        toolTip.hide(data);
      });

    chart.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chart.append("g")
      .call(leftAxis);

    //append y-axis labels - DEFAULT
    chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 20)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText active")
      .attr("data-axis-name", "diabetes")
      .text("% of Population Below Poverty Line");

    //append y-axis labels - DEFAULT
    chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText inactive")
      .attr("data-axis-name", "obesity")
      .text("% of Population Classified as Obese");

    chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 60)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText inactive")
      .attr("data-axis-name", "internet")
      .text("Level of Internet Use");


    // Append x-axis labels -- default
    chart.append("text")
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
      .attr("class", "axisText active")
      .attr("data-axis-name", "poverty")
      .text("% of Population below Poverty Line");

    //// Append x-axis labels ---FIX THESE, THEY'RE INACTIVE
    chart.append("text")
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 40) + ")")
      .attr("class", "axisText inactive")
      .attr("data-axis-name", "education")
      .text("Education Level");

    chart.append("text")
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 60) + ")")
      .attr("class", "axisText inactive")
      .attr("data-axis-name", "income")
      .text("Median Income Level");
    //////////////WRAP INACTIVE AXES

    // Change an axis's status from inactive to active when clicked (if it was inactive)
    // Change the status of all active axes to inactive otherwise
    function labelChange(clickedAxis) {
      d3
        .selectAll(".axisText")
        .filter(".active")
        // An alternative to .attr("class", <className>) method. Used to toggle classes.
        .classed("active", false)
        .classed("inactive", true);

      clickedAxis.classed("inactive", false).classed("active", true);
    }

    d3.selectAll(".axisText").on("click", function () {
      // Assign a variable to current axis
      var clickedSelection = d3.select(this);
      // "true" or "false" based on whether the axis is currently selected
      var isClickedSelectionInactive = clickedSelection.classed("inactive");
      // console.log("this axis is inactive", isClickedSelectionInactive)
      // Grab the data-attribute of the axis and assign it to a variable
      // e.g. if data-axis-name is "poverty," var clickedAxis = "poverty"
      var clickedAxis = clickedSelection.attr("data-axis-name");
      console.log("current axis: ", clickedAxis);

      // The onclick events below take place only if the x-axis is inactive
      // Clicking on an already active axis will therefore do nothing
      if (isClickedSelectionInactive) {
        // Assign the clicked axis to the variable currentAxisLabelX
        currentAxisLabelX = clickedAxis;
        // Call findMinAndMax() to define the min and max domain values.
        findMinAndMaxX(currentAxisLabelX);
        // Set the domain for the x-axis
        xLinearScale.domain([xMin, xMax]);
        // Create a transition effect for the x-axis
        chart
          .select(".x-axis")
          .transition()
          // .ease(d3.easeElastic)
          .duration(1800)
          .call(bottomAxis);
        // Select all circles to create a transition effect, then relocate its horizontal location
        // based on the new axis that was selected/clicked
        d3.selectAll("circle").each(function () {
          d3
            .select(this)
            .transition()
            // .ease(d3.easeBounce)
            .attr("cx", function (data) {
              return xLinearScale(data[currentAxisLabelX]);
            })
            .duration(1800);
        });

        // Change the status of the axes. See above for more info on this function.
        labelChange(clickedSelection);
      }


    });
  });
};  