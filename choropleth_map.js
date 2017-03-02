
  // Modified from Alamode's "Choropleth"
  // https://bl.ocks.org/mbostock/4060606
  zipcodeChoropleth: function(o) {
    var id = tt.makeId(10);

    var queryName = o["query_name"],
        zipcodeColumn = o["zipcode_column"],
        valueColumn = o["value_column"],
        // Optional
        width = o["width"] || 950,
        height = o["height"] || width/1.9,
        title = o["title"] || queryName,
        valueRange = o["color_range"],
        colors = o["color_gradient"] || ["#FFF8CC","#FFF5B2","#FFF299","#E5D87F","#CCBF66","#B2A54C","#998C33","#7F7219","#665900"],
        htmlElement = o["html_element"] || "body";

    var data = tt.getDataFromQuery(queryName);

    var rateById = d3.map();

    var projection = d3.geoAlbersUsa()
        .scale(width)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    var uniqContainerClass = tt.addContainerElement(htmlElement);

    d3.select(uniqContainerClass)
        .append("div")
        .attr("class","mode-graphic-title")
        .text(title)

    svg = d3.select(uniqContainerClass)
        .append("div")
        .attr("class","mode-zipcode-chorolpleth")
        .append("svg")
        .attr("id","mode-zipcode-chorolpleth-" + id)
        .attr("width",width)
        .attr("height",height);

    data.forEach( function(d) {
      rateById.set(d[zipcodeColumn],+d[valueColumn]);
    })

    if (!valueRange) {
      colorDomain = d3.extent(data, function(d) { return d[valueColumn]; });
    } else {
      colorDomain = valueRange;
    }

    var quantize = d3.scale.quantize()
        .domain(colorDomain)
        .range(colors);

    queue()
        .defer(d3.json, "https://s3-us-west-2.amazonaws.com/mode-alamode/zips_us_topo.json")
        .await(ready);

    function ready(error, us) {

      d3.select("#mode-zipcode-chorolpleth-" + id)
          .append("g")
          .attr("class", "zipcodes")
        .selectAll(".mode-zipcode-chorolpleth-zipcodes" + id)
          .data(topojson.feature(us, us.objects.zip_codes_for_the_usa).features)
        .enter().append("path")
          .attr("class","mode-zipcode-chorolpleth-zipcodes-" + id)
          .attr("fill", function(d) { return quantize(rateById.get(d.properties.zip)); })
          .attr("d", path);

      // d3.select("#mode-county-chorolpleth-" + id)
      //     .append("path")
      //     .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      //     .attr("class", "mode-county-chorolpleth-states")
      //     .attr("d", path);
    }
  },

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
