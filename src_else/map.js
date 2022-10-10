/**
 * Handles the main map component using Leaflet.
 * The data has been parsed previously and encoded as a GeoJson object.
 */

var map = L.map("map").setView([20, 0], 2);
map.options.minZoom = 2;
map.options.maxZoom = 10;


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
    grades: [800, 1200, 1400, 1800],
    unit: "tons/capita",
  },
  {
    data_key: "prop_feed",
    label: "Feed: Aliment for feeding livestock",
    grades: [200, 400, 800, 1000],
    unit: "tons/capita",
  },
  {
    data_key: "food_supply",
    label: "Overall: overall aliment supply",
    grades: [2300, 2600, 3100, 3400],
    unit: "kcal/capita/day",
  },
];

/**
 * Event listeners
 */
// The display mode and the current year displayed can be changed dynamically
const map_state = {
  mode: AVAILABLE_MODES[2],
  year: 58,
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
    "Year: " + (1961 + parseInt(this.value));
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

function updateFocusedModal(feature) {
  $("#modal").modal("show");

  const { properties } = feature;
  $("#modal-title").html(
    properties.NAME_LONG + " - " + (1961 + parseInt(map_state.year))
  );

  typesOfFoodBarPlot(properties.types_of_food, map_state.year);
}

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
  updateFocusedModal(e.target.feature);
}

let t = false;
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
  console.log(geojson);

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
};
info.addTo(map);

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
//' ' + map_state.mode.unit

  return div;
};

legend.addTo(map);
