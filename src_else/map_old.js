/**
 * Handles the main map component using Leaflet.
 * The data has been parsed previously and encoded as a GeoJson object.
 */

var map = L.map("map").setView([0, 0], 2);

/**
 * Map settings
 */
const PALETTE = [
  "#FFFFFF",
  "#FFFFB2",
  "#FECC5C",
  "#FD8D3C",
  "#F03B20",
  "#BD0026",
];

const AVAILABLE_MODES = [
  {
    data_key: "prop_food",
    label: "Food: Aliment for feeding people",
    grades: [300, 500, 15000, 50000],
    unit: "thousand tons/capita",
  },
  {
    data_key: "prop_feed",
    label: "Feed: Aliment for feeding livestock",
    grades: [300, 500, 15000, 50000],
    unit: "thousand tons/capita",
  },
  {
    data_key: "food_supply",
    label: "Overall: overall aliment supply",
    grades: [2300, 2600, 3100, 3400],
    unit: "kcal/capita/day",
  },
];

// // const data_per_country = {}

// var width = 600;
// var height = 600;

// var padding = { top: 50, right: 50, bottom: 50, left: 50 };

// // var min = 1;
// // var max = 100;

// var svg = d3.select('#myPlot')
//             .attr('width', width + 'px')
//             .attr('height', height + 'px');

// var xScale = d3.scaleLinear()
//             .domain([1, 12])
//             .range([0, width - padding.left - padding.right]);

// var yScale = d3.scaleLinear()
//             .domain([0, max])
//             .range([height - padding.top - padding.bottom, 0]);

// var xAxis = d3.axisBottom()
//               .scale(xScale);

// var yAxis = d3.axisLeft()
// 			        .scale(yScale);

// svg.append('g')
//   .attr('class', 'axis')
//   .attr('transform', 'translate(' + padding.left + ',' + (height - padding.bottom) + ')')
//   .call(xAxis);

// svg.append('g')
//   .attr('class', 'axis')
// 	.attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
// 	.call(yAxis);

// d3.csv("./data/test.csv", function(d){
//   return {
//       code: d.code,
//       density: d.density
//   };
// }).then(function(data) {
//   const current_country = "OW"
//   var data_per_country = []
//   for (var i = 0; i < data.length; i++) {
//     (data[i].code == current_country)
//       ? data_per_country.push(data[i].density)
//       : true;
//   }
//   for (var i = 0; i < data_per_country.length; i++){
//     d3.select("body")
//       .append("p")
//       .text(data_per_country[i])
//   }
// });

/**
 * Event listeners
 */
// The display mode and the current year displayed can be changed dynamically
const map_state = {
  mode: AVAILABLE_MODES[2],
  year: 51,
};

// Update map display mode
document.getElementsByName("scales").forEach((el) => {
  el.addEventListener("change", function () {
    map_state.mode = AVAILABLE_MODES[parseInt(this.value)];
    reset_geojson();
  });
});

// Handle year slider events. Update the map and label on input
let slider = document.getElementById("current_year_slider");
slider.addEventListener("input", function () {
  map_state.year = this.value;
  document.getElementById("current_year").innerHTML =
    "Current Year: " + (1961 + parseInt(this.value));
  reset_geojson();
});

/**
 * Map UTILS functions
 */

// Returns the color for a given cell
function getColor(d, feature) {
  let thresholds = map_state.mode.grades;

  return d === 0
    ? PALETTE[0]
    : d > thresholds[3]
    ? PALETTE[5]
    : d > thresholds[2]
    ? PALETTE[4]
    : d > thresholds[1]
    ? PALETTE[3]
    : d > thresholds[0]
    ? PALETTE[2]
    : d < thresholds[0]
    ? PALETTE[1]
    : PALETTE[0];
}

// Style for each country
const style = (feature) => {
  const property = feature.properties[map_state.mode.data_key];
  return {
    fillColor: getColor(property ? property[map_state.year] : 0, "food_supply"),
    weight: 1,
    opacity: 1,
    color: "white",
    dashArray: "1",
    fillOpacity: 0.7,
  };
};

/**
 * Map Setup
 */
var geojson, info, legend;

// On country hover, change the border style.
function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 2,
    color: "#666",
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  info.update(layer.feature.properties);
}

// On country unhover, reset
function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}

// On country click, zoom to it
function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

// Setup the event listeners for each feature
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
  });
}

// Called every time the map needs to be redrawn with new data
function reset_geojson() {
  if (geojson) map.removeLayer(geojson);

  geojson = L.geoJson(worldData, { style, onEachFeature }).addTo(map);

  if (info) info.update();
  if (legend) legend.addTo(map);
}

var tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  className: "map-tiles",
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

reset_geojson();

/**
 * TOP RIGHT INFO CONTROL
 * Displays the hovered state's value
 */
info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info");
  this.update();

  return this._div;
};

info.update = function (props) {
  console.log(props);
  if (props !== undefined) {
    var current_country = props['ADM0_A3'];
  }
  
  d3.csv("./data/test.csv", function(d){
    return {
        code: d.code,
        density: d.density,
        year: d.year
    };
  }).then(function(data) {
    var data_per_country = {}
    for (var i = 0; i < data.length; i++) {
      (data[i].code == current_country)
        ? data_per_country[data[i].year] = data[i].density
        : true;
    }
    console.log(data_per_country);
    // for (var i = 0; i < data_per_country.length; i++){
    //   d3.select("body")
    //     .append("p")
    //     .text(data_per_country)
    // }
    // d3.select("body")
    //   .append("p")
    //   .text(data_per_country)
    
    var width = 600;
    var height = 600;
      
    var padding = { top: 50, right: 50, bottom: 50, left: 50 };
    
    var dataset = [[1, 224], [2, 528], [3, 756], [4, 632], [5, 582], [6, 704], [7, 766], [8, 804], [9, 884], [10, 960], [11, 1095], [12, 1250]];
    
    var min = d3.min(dataset, function(d) {
      return d[1];
    })
    var max = d3.max(dataset, function(d) {
      return d[1];
    })
    
    var xScale = d3.scaleLinear()
                    .domain([1, 12])
                    .range([0, width - padding.left - padding.right]);
    
    var yScale = d3.scaleLinear()
                    .domain([-10, max])
                    .range([height - padding.top - padding.bottom, 0]);
    
    var svg = d3.select('#myPlot')
                .attr('width', width + 'px')
                .attr('height', height + 'px');
    
    var xAxis = d3.axisBottom()
                  .scale(xScale);
    
    var yAxis = d3.axisLeft()
                  .scale(yScale);
    
    svg.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + padding.left + ',' + (height - padding.bottom) + ')')
      .call(xAxis);
    
    svg.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
      .call(yAxis);
    
    var linePath = d3.line()
                    .x(function(d){ return xScale(d[0]) })
                    .y(function(d){ return yScale(d[1]) });

    svg.append('g')
      .append('path')
      .attr('class', 'line-path')
      .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
      .attr('d', linePath(dataset))
      .attr('fill', 'none')
      .attr('stroke-width', 3)
      .attr('stroke', 'green');

    svg.append('g')
      .selectAll('circle')
      .data(dataset)
      .enter()
      .append('circle')
      .attr('r', 5)
      .attr('transform', function(d){
        return 'translate(' + (xScale(d[0]) + padding.left) + ',' + (yScale(d[1]) + padding.top) + ')'
      })
      .attr('fill', 'green');
  });


  let value =
    props && props[map_state.mode.data_key]
      ? Math.round(props[map_state.mode.data_key][map_state.year])
      : 0;

  this._div.innerHTML = `
    <h4>${map_state.mode.label}</h4>
    ${
      props
        ? `<b>${props.NAME_LONG}</b><br/> ${
          value != 0
            ? `${value} ${map_state.mode.unit}`
            : "(No data)"
        }`
        : "Hover over a state"
    }
  `;
  
  // Add information
};
info.addTo(map);

/**
 * ADD 
 */

/**
 * BOTTOM RIGHT LEGEND CONTROL
 * Displays the current grades scale
 */
legend = L.control({ position: "bottomright" });
legend.onAdd = function (map) {
  let div = L.DomUtil.create("div", "info legend");
  let grades = map_state.mode.grades;

  // Colored square for each grade
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML += `
      <div>
        <i style="background: ${getColor(grades[i] + 1)}"></i>
        ${grades[i]}${grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br/>" : "+"}
      </div>
    `;
  }

  return div;
};

legend.addTo(map);
