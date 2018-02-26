// Set up basemap
var Esri_WorldGrayCanvas = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
    maxZoom: 16
  }
);

// add map first
var map = L.map("map", {
  center: [39.952633, -75.153743],
  zoom: 15,
  layers: [Esri_WorldGrayCanvas]
});
map.zoomControl.setPosition("bottomleft");

/* ========
INDEGO Data Layer import and project
======== */

// indego geojson link
var indegoLink = "https://www.rideindego.com/stations/json/";

// object to hold stations once data is read
var stations;

// import and create an icon set
var indegoIconEmpty = L.icon({
  iconUrl: "js/images/marker-0@2x.png",
  iconSize: [30, 45]
});
var indegoIcon20 = L.icon({
  iconUrl: "js/images/marker-20@2x.png",
  iconSize: [30, 45]
});
var indegoIcon40 = L.icon({
  iconUrl: "js/images/marker-40@2x.png",
  iconSize: [30, 45]
});
var indegoIcon50 = L.icon({
  iconUrl: "js/images/marker-50@2x.png",
  iconSize: [30, 45]
});
var indegoIcon60 = L.icon({
  iconUrl: "js/images/marker-60@2x.png",
  iconSize: [30, 45]
});
var indegoIcon80 = L.icon({
  iconUrl: "js/images/marker-80@2x.png",
  iconSize: [30, 45]
});
var indegoIconFull = L.icon({
  iconUrl: "js/images/marker-100@2x.png",
  iconSize: [30, 45]
});
var indegoIconNA = L.icon({
  iconUrl: "js/images/marker-unavailable@2x.png",
  iconSize: [30, 45]
});

//feature.properties.bikesAvailable
// setIcons function
var pathOps = function(percentFull) {
  if (percentFull === 0) {
    return indegoIconEmpty;
  } else if (percentFull < 0.2) {
    return indegoIcon20;
  } else if (percentFull < 0.4) {
    return indegoIcon40;
  } else if (percentFull < 0.6) {
    return indegoIcon50;
  } else if (percentFull < 0.8) {
    return indegoIcon60;
  } else if (percentFull < 1) {
    return indegoIcon80;
  } else if (percentFull === 1) {
    return indegoIconFull;
  } else {
    return indegoIconNA;
  }
};

// calculate perecent full
var fullness = (bikes, docks) => {
  return bikes / docks;
};

//var popupContent = () => {   };

// call and wait for ajax download of json
function main() {
  var downloadData = url => $.ajax(url);
  downloadData(indegoLink).done(function(response) {
    // create layer group of station markers then map that to an anonymous function that
    // creates an a L.marker for each feature based on its coordinates, then sets the icon
    // using the pathOps and fullness helper functions defined above
    stations = L.layerGroup(
      _.map(response.features, function(feature) {
        return L.marker(
          // latlng coordinate array
          [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
          { icon: indegoIconNA } //icon set NA in case of failure
        ).setIcon(
          pathOps(
            fullness(
              feature.properties.bikesAvailable,
              feature.properties.totalDocks
            )
          )
        ).bindPopup(
          "<h3>" + feature.properties.name + "</h3>" +
          "<b><h4> Bikes Available: </b>" +
          feature.properties.bikesAvailable +
          "<br><b> Docks Available: </b>" +
          feature.properties.docksAvailable + "</h4>"
        );
      }) //close _.map
    ).addTo(map); //close stations and add to map
  }); // close downloadData
} // close main
