/**
 * Handles the content of the pop-up displayed while clicking on a country for
 * a given year.
 */

function typesOfFoodBarPlot(agg_data, year) {
  const margin = { top: 10, right: 30, bottom: 120, left: 50 };
  const width = 620 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  $("#types_of_food_chart").empty();

  var data = agg_data.map((row) => ({
    group: row.group.split("-")[0].split("and products")[0],
    feed: row.feed[year] || 0,
    food: row.food[year] || 0,
  }));

  // Create svg object
  var svg = d3
    .select("#types_of_food_chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Headers
  var groups = data.map((row) => row.group);
  var subgroups = ["food", "feed"];

  // x axis
  var x = d3.scaleBand().domain(groups).range([0, width]).padding([0.4]);
  svg
    .append("g")
    .attr("class", "axisWhite")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(0))
    .selectAll("text")
    .attr("class", "rotated_label");

  const max = data.reduce((acc, curr) => {
    return Math.max(curr.feed, curr.food, acc);
  }, 0);

  // Add y axis
  var y = d3.scaleLinear().domain([0, max]).range([height, 0]);
  svg.append("g").attr("class", "axisWhite").call(d3.axisLeft(y));

  // scale for subgroups
  var xSubgroup = d3
    .scaleBand()
    .domain(subgroups)
    .range([0, x.bandwidth()])
    .padding([0.05]);

  // color palette
  var color = d3.scaleOrdinal().domain(subgroups).range(["red", "orange"]);

  // draw bars
  svg
    .append("g")
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("transform", function (d) {
      return "translate(" + x(d.group) + ",0)";
    })
    .selectAll("rect")
    .data(function (d) {
      return subgroups.map(function (key) {
        return { key: key, value: d[key] < 2 ? 2 : d[key] };
      });
    })
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return xSubgroup(d.key);
    })
    .attr("width", xSubgroup.bandwidth())
    .attr("fill", function (d) {
      return color(d.key);
    });

  svg
    .selectAll("rect")
    .transition()
    .duration(600)
    .attr("y", function (d) {
      return y(d.value);
    })
    .attr("height", function (d) {
      return height - y(d.value);
    })
    .delay(function (d, i) {
      return i * 10;
    });
}
