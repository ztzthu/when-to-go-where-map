/**
 * Handle everything that is on the right of the map.
 */

// Pie chart displaying the proportion of food and feed in the world.
function draw_pie_chart() {
  // Pie chart
  var width = 150;
  height = 150;
  margin = 20;

  var radius = Math.min(width, height) / 2 - margin;

  // Read the data
  d3.csv("data/pie.csv", read, function (error, data) {
    // TODO: connect to map timeline
    var year = "1961";

    let slider = document.getElementById("current_year_slider");
    slider.addEventListener("input", function () {
      let val = this.value;
      var currentData = data.filter(function (d) {
        // console.log("Later bitches", (1961 + parseval).toString());
        return d["Year"] == (1961 + parseInt(val)).toString();
      });

      update(currentData);
    });

    //var currentData = data.filter(function(d) {return d["Year"] == (1961 + parseInt(map_state.year)).toString()});
    var currentData = data.filter(function (d) {
      return d["Year"] == year;
    });

    // draw the pie chart with the data from the chosen year
    update(currentData);

    function update(data) {
      // Clear the previous pie chart
      const existing = document.getElementById("piechart");
      if (existing) {
        var child = existing.lastElementChild;
        while (child) {
          existing.removeChild(child);
          child = existing.lastElementChild;
        }
      }

      var svg = d3
        .select("#piechart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      console.log("Coucou j'update", data);
      // draw the legend
      var feedprop = data.filter(function (d) {
        return d.Element == "Feed";
      })[0].Prop;
      var foodprop = data.filter(function (d) {
        return d.Element == "Food";
      })[0].Prop;

      d3.select("#pielegend").html(
        "<div style='color: orange;'>Food: " +
          parseFloat(foodprop * 100).toFixed(2) +
          "%</div>" +
          "<div style='color: red;'>Feed: " +
          parseFloat(feedprop * 100).toFixed(2) +
          "%</div>"
      );

      // create the pie chart
      var pie = d3.layout
        .pie()
        .value(function (d) {
          return d.value.Prop;
        })
        .sort(function (a, b) {
          return d3.ascending(a.key, b.key);
        });
      var data_pie = pie(d3.entries(data));

      // draw the paths
      var u = svg.selectAll("path").data(data_pie);

      u.enter()
        .append("path")
        .attr("d", d3.svg.arc().innerRadius(0).outerRadius(radius))
        .attr("fill", function (d) {
          if (d.data.value.Element == "Feed") {
            return "red";
          } else return "orange";
        })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 1);

      u.exit().remove();
    }
  });

  // read in data
  function read(d) {
    d.year = d.Year;
    d.cat = d.Element;
    d.prop = +d.prop;
    return d;
  }
}

/**
 * Side bars showing the proportion of the population that can be feed using only feed for livestock.
 */
let calories_data = undefined;

function draw_calories_bars() {
  // Calorie Bars
  d3.csv("data/foodsupply.csv", function (d) {
    var dictionary = {};

    for (var i = 0, entry; i < d.length; i++) {
      entry = d[i];
      dictionary[entry.Year.concat(entry.Continent)] = entry.Value;
    }

    var max = 2500;
    var year = "1961";

    update(year);

    let slider = document.getElementById("current_year_slider");
    slider.addEventListener("input", function () {
      update(1961 + parseInt(this.value));
    });

    function update(year) {
      year = year.toString();

      // max calories and calories for the given year
      var asia_data = [2500, dictionary[year.concat("Asia")]];
      var africa_data = [2500, dictionary[year.concat("Africa")]];
      var eur_data = [2500, dictionary[year.concat("Europe")]];
      var na_data = [2500, dictionary[year.concat("North America")]];
      var sa_data = [2500, dictionary[year.concat("South America")]];
      var o_data = [2500, dictionary[year.concat("Oceania")]];

      const bars = [
        { id: "#asia", data: asia_data },
        { id: "#eur", data: eur_data },
        { id: "#oce", data: o_data },
        { id: "#southam", data: sa_data },
        { id: "#northam", data: na_data },
        { id: "#afr", data: africa_data },
      ];

      var x = d3.scale.linear().domain([0, max]).range([0, 400]);

      bars.forEach(({ id, data }) => {
        $(id).empty();

        var bar = d3
          .select(id, ".supply-stickman")
          .append("svg")
          .attr("class", "chart")
          .attr("width", 400)
          .attr("height", 40);

        bar
          .selectAll("rect")
          .data(data)
          .enter()
          .append("rect")
          .attr("width", x)
          .attr("height", 28);
      });
    }
  });
}

draw_pie_chart();
draw_calories_bars();
