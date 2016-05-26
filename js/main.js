////////////////////////////////////////////////////BUBBLE CHART////////////////////////////////////////////////////
//////////////////////////////////////Made using data about artist type, begin year and end year ///////////////////

d3.csv('data/artists.csv', function (error, data) {

  var width = 900, height = 900;
  var fill = d3.scale.category20c();
  var svg = d3.select("#chart").append("svg")
      .attr("width", width)
      .attr("height", height);

      for (var j = 0; j < data.length; j++) {
        data[j].radius = +data[j].id / 80000;
        data[j].x = Math.random() * width;
        data[j].y = Math.random() * height;
      }

      var padding = 1;
      var maxRadius = d3.max(_.pluck(data, 'radius'));

      var getCenters = function (vname, size) {
        var centers, map;
        centers = _.uniq(_.pluck(data, vname)).map(function (d) {
          return {name: d, value: 1};
        });

        map = d3.layout.treemap().size(size).ratio(1/1);
        map.nodes({children: centers});

        return centers;
      };

      var nodes = svg.selectAll("circle")
      .data(data);

      nodes.enter().append("circle")
      .attr("class", "node")
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; })
      .attr("r", function (d) { return d.radius; })
      .style("fill", function (d) { return fill(d.id); })
      .on("mouseover", function (d) { showPopover.call(this, d); })
      .on("mouseout", function (d) { removePopovers(); })

      var force = d3.layout.force();

      draw('type');

      $( ".btn" ).click(function() {
        draw(this.id);
      });

      function draw (varname) {
        var centers = getCenters(varname, [800, 800]);
        force.on("tick", tick(centers, varname));
        labels(centers)
        force.start();
      }

      function tick (centers, varname) {
        var foci = {};
        for (var i = 0; i < centers.length; i++) {
          foci[centers[i].name] = centers[i];
        }
        return function (e) {
          for (var i = 0; i < data.length; i++) {
            var o = data[i];
            var f = foci[o[varname]];
            o.y += ((f.y + (f.dy / 2)) - o.y) * e.alpha;
            o.x += ((f.x + (f.dx / 2)) - o.x) * e.alpha;
          }
          nodes.each(collide(.11))
          .attr("cx", function (d) { return d.x; })
          .attr("cy", function (d) { return d.y; });
        }
      }

      function labels (centers) {
        svg.selectAll(".label").remove();
        svg.selectAll(".label")
        .data(centers).enter().append("text")
        .attr("class", "label")
        .text(function (d) { return d.name })
        .attr("transform", function (d) {
          return "translate(" + (d.x + (d.dx / 2)) + ", " + (d.y + 20) + ")";
        });
      }

      function removePopovers () {
        $('.popover').each(function() {
          $(this).remove();
        });
      }

      function showPopover (d) {
        $(this).popover({
          placement: 'auto top',
          container: 'body',
          trigger: 'manual',
          html : true,
          content: function() {
            return "Name: " + d.name + "<br/>Year Career Began: " + d.begin_date_year +
            "<br/>Year Career Ended: " + d.end_year_date + "<br/>Type: " + d.type;
          }
        });
        $(this).popover('show')
      }

      function collide(alpha) {
        var quadtree = d3.geom.quadtree(data);
        return function (d) {
          var r = d.radius + maxRadius + padding,
          nx1 = d.x - r,
          nx2 = d.x + r,
          ny1 = d.y - r,
          ny2 = d.y + r;
          quadtree.visit(function(quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== d)) {
              var x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = d.radius + quad.point.radius + padding;
              if (l < r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
              }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
          });
        };
      }
}); // ends d3.csv for bubble chart

////////////////////////////////////////////////////// DONUT CHART ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var width = 550,
    height = 350,
    radius = Math.min(width, height) / 2;

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 70);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.ordering_attribute; });

var svg = d3.select("#donutChart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.csv("data/series.csv", type, function(error, data) {
  if (error) throw error;

  var g = svg.selectAll(".arc")
      .data(pie(data))
      .enter().append("g")
      .attr("class", "arc");

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.type); });

  g.append("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".5em")
      .text(function(d) { return d.data.type; });
});

function type(d) {
  d.ordering_attribute = +d.ordering_attribute;
  return d;
}

////////////////////////////////////////////////////// BAR GRAPHS ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var w = 550; 
    var h = 390;

    var colorBar = d3.scale.category20b();
    var colorBarSecond = d3.scale.category20(); 

    var dataArray = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
                11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ]; 
 
    var xScale = d3.scale.ordinal()
      .domain(d3.range(dataArray.length))
      .rangeRoundBands([0, w], 0.05);

    var yScale = d3.scale.linear()
      .domain([0, d3.max(dataArray)])
      .range([0,h]); 

    var svgBar = d3.select("#bar")
      .append("svg")
      .attr("width", w)
      .attr("height", h); 

    svgBar.selectAll("rect")
      .data(dataArray)
      .enter()
      .append("rect")  
      .attr("x", function(d,i){
        return xScale(i); 
      })  
      .attr("y", function(d) {
        return h - yScale(d);
      })
      .attr("height", function(d) {
        return yScale(d);
      })
      .attr("width", xScale.rangeBand())
      .attr("height", function(d){
        return yScale(d); 
      })
      .attr("fill", colorBar); 
      // .attr("fill", function(d) {
     //    return "rgb(0, 0, " + (d * 10) + ")";
      // });

    svgBar.selectAll("text")
      .data(dataArray)
      .enter()
      .append("text")
      .text(function(d) {
        return d;
      })
      .attr("text-anchor", "middle")
      .attr("x", function(d, i) {
        return xScale(i) + xScale.rangeBand() / 2;
      })
      .attr("y", function(d) {
        return h - yScale(d) + 14;
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "11px")
      .attr("fill", "white");

    //First Button

    d3.select("#btn-one")
      .on("click", function(){
      
    var dataArray = [ 11, 12, 15, 20, 18, 17, 16, 18, 23, 25, 
                5, 10, 13, 19, 21, 25, 22, 18, 15, 13 ];

        svgBar.selectAll("rect")
          .data(dataArray)
          .transition()
          .duration(500)
          .attr("y", function(d){
            return h - yScale(d); 
          })
          .attr("height", function(d){
            return yScale(d); 
          })
          // .attr("fill", function(d){
          //  return "rgb(0, 0, " + (d * 10) + ")";
          // }); 
          .attr("fill", colorBarSecond); 

      svgBar.selectAll("text")
        .data(dataArray)
        .transition()
        .duration(500)
        .text(function(d){
          return d; 
        })
        .attr("x", function(d, i){
          return xScale(i) + xScale.rangeBand() / 2; 
        })
        .attr("y", function(d){
          return h - yScale(d) + 14; 
        })

      }); // ends on click

    