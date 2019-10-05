// Storing the API endpoint's into a query url variable
var earth_quake_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var tectonic_plate_url = "https://raw.githubusercontent.com/fraxen/tectonic_plates/master/GeoJSON/PB2002_boundaries.json"


// Using d3 to parse the jason data in order to obtain it
d3.json(earth_quake_url, function(data) {
    create_features(data.features);
});

// Defining the function to run on each feature when the pop up it displayed
function create_features(quake_data) {
    var earthquakes = L.geoJSON(quake_data, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3> Magnitude: " + feature.properties.mag +"</h3><h3> Location: "+ feature.properties.place +
              "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
          },

          // Adding the attributes to each point when displayed
          point_to_layer: function (feature, latlng) {
            return new L.circle(latlng,
              {radius: radiusgrabber(feature.properties.mag),
              fillColor: color_grabber(feature.properties.mag),
              fillOpacity: .6,
              color: "#000",
              stroke: true,
              weight: .8
          })
        }
        });

    create_map(earthquakes);
}

// Function that is reading in my api and accessing the lightmap, outdoors, and satellite data to render on the page
function create_map(earthquakes) {

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
    var layer_maps = {
        "Light Map": lightMap,
        "Outdoors": outdoors,
        "Satellite": satellite
    };

    // Create tectonic layer variable that stores the layergroup
    var tectonic_plates = new L.LayerGroup();

    // Create overlay object to hold overlay layer
    var overlay_maps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": tectonic_plates
    };

    // Variable that stores the map that is layered on top of everything on page
    var generated_map = L.map("map", {
        center: [40.7, -94.5],
        zoom: 3,
        layers: [lightMap, earthquakes, tectonic_plates]
    });

    // Add tectonic plates data
    d3.json(tectonic_plate_url, function(tonic_data) {
        L.geoJson(tonic_data, {
            color: "yellow",
            weight: 2
        })
        .addTo(tectonic_plates);
    });

    //Add layer control to map for generating differen maps on the same page
    L.control.layers(layer_maps, overlay_maps, {
        collapsed: false
    }).addTo(generated_map);

    // Creating a legend to display the legend
    var legend = L.control({
        position: "bottomright"
    });

    // Adding the legend to the page referencing the div tab
    legend.onAdd = function(generated_map) {
        var div = L.DomUtil.create("div", "info legend"),
        gradients = [0, 1, 2, 3, 4, 5],
        labels = [];

    // Creating a ledgend where we reference the first one and go to the length of gradients on the ledgend and adding gradient attributes
    for (var i = 0; i < gradients.length; i++) {
        div.innerHTML +=
            '<i style="background:' + color_grabber(gradients[i] + 1) + '"></i> ' +
            gradients[i] + (gradients[i + 1] ? '&ndash;' + gradients[i + 1] + '<br>' : '+');
    }
    return div;
    };
    legend.addTo(generated_map);
}

// Creating the color function that give all the earthquake pop ups color based on it's magnitude
function color_grabber(magnitude) {
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
function radiusgrabber(magnitude) {
    return magnitude * 25000;
};