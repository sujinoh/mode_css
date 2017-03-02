


// Built with Leaflet
  // http://leaflet.github.io/Leaflet.heat/demo/
  leafletMap: function(o) {
    var id = tt.makeId(10);

    var latColumn = o["lat_column"],
        lngColumn = o["lng_column"],
        queryName = o["query_name"],
        // Optional
        title = o["title"] || queryName,
        height = o["height"] || 400,
        htmlElement= o["html_element"] || "body",
        centerLat = o["center_lat"] || 39.5,
        centerLng = o["center_lng"] || -98.35,
        zoom = o["starting_zoom"] || 4,
        dotRadius = o["dot_size"] || .4,
        dotOpacity = o["dot_opacity"] || .8;

    var data = tt.getDataFromQuery(queryName),
        validData = [];

    data.forEach(function(d) {
      if (typeof d[latColumn] === "number" && typeof d[lngColumn] === "number") {
        validData.push(d)
      }
    })

    var uniqContainerClass = tt.addContainerElement(htmlElement);

    d3.select(uniqContainerClass)
      .style("height",height + "px")
      .append("div")
      .attr("class","mode-graphic-title")
      .text(title)

    var mapHeight = height - $(uniqContainerClass + ".mode-graphic-title").height(),
        mapWidth = $(uniqContainerClass).width();

    d3.select(uniqContainerClass)
      .append("div")
      .attr("class","mode-leaflet-map")
      .attr("id",id)
      .style("height",mapHeight + "px")
      .style("width",mapWidth + "px")

    var baseLayer = L.tileLayer(
      'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    });

    var d = {
      max: 8,
      data: validData
    };

    var cfg = {
      "radius": dotRadius,
      "maxOpacity": dotOpacity,
      "scaleRadius": true,
      "useLocalExtrema": true,
      "latField": latColumn,
      "lngField": lngColumn
    };

    var C = {
      "lat": centerLat,
      "lng": centerLng,
      "zoom": zoom
    };

    var heatmapLayer = new HeatmapOverlay(cfg);

    var map = new L.Map(id, {
      center: new L.LatLng(C.lat, C.lng),
      zoom: Math.floor(C.zoom),
      layers: [baseLayer, heatmapLayer]
    });

    heatmapLayer.setData(d);
    
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map); 
    
     
  }
