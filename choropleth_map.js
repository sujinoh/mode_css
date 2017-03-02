var version = "0.12";

var tt = {
  
  reportError: function(msg) {
    $("<h1 class='mode-error'>").text(msg).prependTo(document.body);
  },

  getColumnsFromQuery: function(queryName) {
    var columns = datasets.filter(function(d) { if (d) { return d.queryName == queryName;}; })[0];
    if (!columns) {
      tt.reportError("No such query: '" + queryName + "'");
      return [];
    }
    return columns.columns
  },

  getDataFromQuery: function(queryName) {
    var data = datasets.filter(function(d) { if (d) { return d.queryName == queryName;}; })[0];
    if (!data) {
      tt.reportError("No such query: '" + queryName + "'");
      return [];
    }
    return data.content;
  },

  makeId: function(chars) {
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
        text = "";

    for (var i=0; i < chars; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },

  addContainerElement: function(el) {

    id = tt.makeId(10);

    if (el == "body") {
      $("<div id='" + id + "'></div>").addClass(id).addClass("mode-graphic-container").appendTo(".mode-content");
    } else if ($(el).length === 0) {
      tt.reportError("No such element: '" + el + "'");
    } else {
      $(el).addClass("mode-graphic-container");
      $(el).addClass(id)
    }

    return "." + id;
  },

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
  }
} 
