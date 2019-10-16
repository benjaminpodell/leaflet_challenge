// Storing the API endpoint's into a query url variable
var earthquake_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var tectonicplates_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_steps.json"


// Using d3 to parse the jason data in order to obtain it
d3.json(earthquake_url, function(data) {
    createFeatures(data.features);
});

// Defining the function to run on each feature when the pop up it displayed
function createFeatures(earthquake_data) {
    var earthquakes = L.geoJSON(earthquake_data, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: "+ feature.properties.place +
              "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
          },

          // Adding the attributes to each point when displayed
          pointToLayer: function (feature, latlng) {
            return new L.circle(latlng,
              {radius: radiusGrabber(feature.properties.mag),
              fillColor: colorGrabber(feature.properties.mag),
              fillOpacity: .6,
              color: "#000",
              stroke: true,
              weight: .8
          })
        }
        });

    createMap(earthquakes);
}

// Function that is reading in my api and accessing the lightmap, outdoors, and satellite data to render on the page
function createMap(earthquakes) {

    // Define map layers
    var lightMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: "pk.eyJ1IjoiYnBvZGVsbDEiLCJhIjoiY2sxNDB1MGxjMGZkeTNubHpoNml2ZDFiNSJ9.bqsaSIzSm4Mz7wxH442xMw"
    });

    var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: "pk.eyJ1IjoiYnBvZGVsbDEiLCJhIjoiY2sxNDB1MGxjMGZkeTNubHpoNml2ZDFiNSJ9.bqsaSIzSm4Mz7wxH442xMw"
    });

    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: "pk.eyJ1IjoiYnBvZGVsbDEiLCJhIjoiY2sxNDB1MGxjMGZkeTNubHpoNml2ZDFiNSJ9.bqsaSIzSm4Mz7wxH442xMw"
    });


     // Define all layer maps that are bases
     var baseMaps = {
        "Light Map": lightMap,
        "Outdoors": outdoors,
        "Satellite": satellite
    };

    // Create tectonic layer variable that stores the layergroup
    var tectonicplates = new L.LayerGroup();

    // Create overlay object to hold overlay layer
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": tectonicplates
    };

    // Variable that stores the map that is layered on top of everything on page
    var map_display = L.map("map", {
        center: [40, -95],
        zoom: 3,
        layers: [lightMap, earthquakes, tectonicplates]
    });

    // Add tectonic plates data
    d3.json(tectonicplates_url, function(tectonicdata) {
        L.geoJson(tectonicdata, {
            color: "yellow",
            weight: 2
        })
        .addTo(tectonicplates);
    });

    //Add layer control to map for generating differen maps on the same page
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map_display);

    // Creating a legend to display the legend
    var legend = L.control({
        position: "bottomleft"
    });

    // Adding the legend to the page referencing the div tab
    legend.onAdd = function(map) {
        var div = L.DomUtil.create("div", "info legend"),
        gradient = [0, 1, 2, 3, 4, 5],
        labels = [];

    // Creating a legend where we reference the first one and go to the length of gradients and add gradient attributes
    for (var i = 0; i < gradient.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colorGrabber(gradient[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
            gradient[i] + (gradient[i + 1] ? '&ndash;' + gradient[i + 1] + '<br>' : '+');
    }
    return div;
    };
    legend.addTo(map_display);
}

// Creating the color function that give all the earthquake pop ups color based on it's magnitude
function colorGrabber(magnitude) {
    if (magnitude > 5) {
        return 'red'
    } else if (magnitude > 4) {
        return 'orange'
    } else if (magnitude > 3) {
        return 'yellow'
    } else if (magnitude > 2) {
        return 'lightgreen'
    } else if (magnitude > 1) {
        return 'green'
    } else {
        return '#58C9CB'
    }
};

//Creating the radius of the function
function radiusGrabber(magnitude) {
    return magnitude * 30000;
};