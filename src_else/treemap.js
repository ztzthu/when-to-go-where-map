window.addEventListener("message", function (e) {
  var data = e.data.data;
  return main(data);
});

var defaults = {
  margin: { top: 30, right: 0, bottom: 0, left: 0 },
  rootname: "TOP",
  format: ".0%",
  title: "",
  width: 1000,
  height: 500,
  title: "Aliments by Country and Food vs. Feed Proportions in 2019",
};

function main(data) {
  var dictionary = data.dict; // dictionary of food/feed amounts for each bo

  var formatNumber = d3.format(defaults.format),
    rname = defaults.rootname,
    margin = defaults.margin;

  $("#treemap").width(defaults.width).height(defaults.height);
  var width = defaults.width - margin.left - margin.right,
    height = defaults.height - margin.top - margin.bottom,
    transitioning;

  var color = d3.scale.category20();

  var colors = [
    "#4c6085",
    "#4380b9",
    "#39a0ed",
    "#38c9dd",
    "#36f1cd",
    "#25dbb8",
    "#13c4a3",
  ];

  var x = d3.scale.linear().domain([0, width]).range([0, width]);

  var y = d3.scale.linear().domain([0, height]).range([0, height]);

  var treemap = d3.layout
    .treemap()
    .children(function (d, depth) {
      return depth ? null : d._children;
    }) // return children if they exist
    .sort(function (a, b) {
      return a.value - b.value;
    }) //sorts descending (biggest in top left)
    .ratio((height / width) * 0.5 * (1 + Math.sqrt(5))) // sets layout ratio
    .round(false);

  // creating the main svg
  var svg = d3
    .select("#treemap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .style("margin-left", -margin.left + "px")
    .style("margin.right", -margin.right + "px")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("shape-rendering", "crispEdges");

  // creating the top bar
  var topbar = svg.append("g").attr("class", "topbar");

  topbar
    .append("rect")
    .attr("y", -margin.top)
    .attr("width", width)
    .attr("height", margin.top);

  topbar
    .append("text")
    .attr("x", 7)
    .attr("y", 8 - margin.top)
    .attr("dy", ".75em");

  $("#treemap").prepend("<p class='title'>" + defaults.title + "</p>");

  data.x = data.y = data.depth = 0;
  data.dx = width;
  data.dy = height;

  accumulate(data);
  layout(data);
  display(data);

  function accumulate(d) {
    return (d._children = d.values)
      ? (d.value = d.values.reduce(function (p, v) {
          return p + accumulate(v);
        }, 0))
      : d.value;
  }

  function layout(d) {
    if (d._children) {
      treemap.nodes({ _children: d._children });
      d._children.forEach(function (c) {
        c.x = d.x + c.x * d.dx;
        c.y = d.y + c.y * d.dy;
        c.dx *= d.dx;
        c.dy *= d.dy;
        c.parent = d;
        layout(c);
      });
    }
  }

  // called each time you click and a transition happens
  function display(d) {
    topbar.datum(d.parent).on("click", transition);

    topbar.select("text").text(addName(d)); // writes in the top bar

    var g1 = svg
      .insert("g", ".topbar") // creates the svg for the boxes (below the top bar)
      .datum(d)
      .attr("class", "grid");

    var g = g1
      .selectAll("g") // all the svgs for the children
      .data(d._children)
      .enter()
      .append("g");

    g.filter(function (d) {
      return d._children;
    })
      .classed("children", true)
      .on("click", transition); // add click transition to children

    // create boxes for children that you can see behind current level
    var children = g
      .selectAll(".child")
      .data(function (d) {
        return d._children || [d];
      })
      .enter()
      .append("g");

    children
      .append("rect")
      .attr("class", "child")
      .call(addRect)
      .append("title")
      .text(function (d) {
        return d.key + " (" + formatNumber(d.value) + ")";
      });

    g.append("rect").attr("class", "parent").call(addRect);

    // add images
    const images_map = {
      World: [
        { key: "Africa", path: "africa.jpeg" },
        { key: "Asia", path: "asia.png" },
        { key: "North America", path: "northamerica.jpeg" },
        { key: "South America", path: "southamericab.png" },
        { key: "Europe", path: "europe.png" },
        { key: "Oceania", path: "oceaniab.png" },
      ],
      Food: [
        { key: "Milk", path: "milkb.png" },
        { key: "Cereals", path: "cerealsborder.png" },
        { key: "Rice", path: "rice.png" },
        { key: "Vegetables", path: "vegetables.png" },
        { key: "Fruits", path: "fruitb.png" },
        { key: "Meat", path: "meatb.png" },
        { key: "Fish, Seafood", path: "seafoodb.png" },
        { key: "Others", path: "others2.png" },
        { key: "Maize", path: "maize.png" },
        { key: "Starchy Roots", path: "starchyroots.png" },
        { key: "Alcoholic Beverages", path: "alcohol.png" },
        { key: "Beer", path: "beer.png" },
        { key: "Wheat", path: "wheat.png" },
        { key: "Potatoes", path: "potatoes.png" },
        { key: "Sugar & Sweeteners", path: "sugar.png" },
        { key: "Cassava", path: "cassava.png" },
      ],
      Feed: [
        { key: "Milk", path: "milkb.png" },
        { key: "Cereals", path: "cerealsborder.png" },
        { key: "Rice", path: "rice.png" },
        { key: "Vegetables", path: "vegetables.png" },
        { key: "Fruits", path: "fruitb.png" },
        { key: "Meat", path: "meatb.png" },
        { key: "Fish, Seafood", path: "seafoodb.png" },
        { key: "Others", path: "others2.png" },
        { key: "Maize", path: "maize.png" },
        { key: "Starchy Roots", path: "starchyroots.png" },
        { key: "Alcoholic Beverages", path: "alcohol.png" },
        { key: "Beer", path: "beer.png" },
        { key: "Wheat", path: "wheat.png" },
        { key: "Potatoes", path: "potatoes.png" },
        { key: "Sugar & Sweeteners", path: "sugar.png" },
        { key: "Cassava", path: "cassava.png" },
      ],
    };

    if (images_map[d.key]) {
      images_map[d.key].forEach(({ key, path }) => {
        g.filter(function (d) {
          return d.key == key;
        })
          .append("image")
          .attr("xlink:href", "data/" + path)
          .call(addImage);
      });
    }

    // add food and feed images
    if (d.values.length == 2) {
      g.filter(function (d) {
        return d.key == "Food";
      })
        .append("image")
        .attr("xlink:href", "data/huma2.png")
        .call(addImage);
      g.filter(function (d) {
        return d.key == "Feed";
      })
        .append("image")
        .attr("xlink:href", "data/feed2.png")
        .call(addImage);
    }

    var names = g
      .append("text") // adds text to each g
      .attr("class", "ptext")
      .attr("dy", ".75em");

    names.append("tspan").text(function (d) {
      return d.key;
    });

    // calculate percentages for food/feed and aliments
    names
      .append("tspan")
      .attr("dy", "1.0em")
      .text(function (d) {
        // food vs feed screen
        if ((d.key == "Food") | (d.key == "Feed")) {
          var food =
            dictionary[d.parent.parent.key.concat(d.parent.key, "Food")];
          var feed =
            dictionary[d.parent.parent.key.concat(d.parent.key, "Feed")];
          return isNaN(food) | isNaN(feed)
            ? " "
            : formatNumber(d.value / (food + feed));
        }

        // aliment screen
        if (typeof d.element === "string") {
          var search = d.region.concat(d.subregion, d.element);
        }
        return isNaN(d.value / dictionary[search]) |
          (formatNumber(d.value / dictionary[search]) == "0%")
          ? ""
          : formatNumber(d.value / dictionary[search]);
      }); // adds values for final display
    names.call(text);

    g.selectAll("rect").style("fill", function (d) {
      var rand = Math.floor(Math.random() * 7);
      return colors[rand];
    }); // adds color to rectangles

    g.selectAll("rect")
      .filter(function (d) {
        return d.key == "Food";
      })
      .style("fill", "#6564DB");
    g.selectAll("rect")
      .filter(function (d) {
        return d.key == "Feed";
      })
      .style("fill", "#232ED1");
    g.selectAll("rect")
      .filter(function (d) {
        return d.key == "Africa";
      })
      .style("fill", "#7FDEFF");
    g.selectAll("rect")
      .filter(function (d) {
        return d.key == "Asia";
      })
      .style("fill", "#907AD6");
    g.selectAll("rect")
      .filter(function (d) {
        return d.key == "North America";
      })
      .style("fill", "#DABFFF");
    g.selectAll("rect")
      .filter(function (d) {
        return d.key == "South America";
      })
      .style("fill", "#6BB1D2");
    g.selectAll("rect")
      .filter(function (d) {
        return d.key == "Europe";
      })
      .style("fill", "#38c9dd");
    g.selectAll("rect")
      .filter(function (d) {
        return d.key == "Oceania";
      })
      .style("fill", "#38c9dd");

    // add top bar text for food on mouseover

    if ((d.key == "Food") | (d.key == "Feed")) {
      var cat2 = d.key;
      console.log(cat2);

      var boxes2 = d3.selectAll("rect");
      var finalboxes2 = boxes2.filter(function (d) {
        if (d != undefined) {
          return d.element == cat2;
        }
      });

      finalboxes2.on("mouseover", mouseover2).on("mouseleave", mouseleave2);

      var images2 = d3.selectAll("image");
      images2
        .on("mouseover", mouseover2)
        .on("mouseleave", mouseleave2);

      function mouseover2(d) {
        var formatNumber2 = d3.format(".2%");
        var search = d.region.concat(d.subregion, d.element);
        var val = d.value / dictionary[search];
        if (d != undefined) {
          topbar
            .append("text")
            .text(d.key + " " + formatNumber2(val))
            .attr("id", "alimentpercent")
            .attr("x", 700)
            .attr("y", 20 - margin.top);
        }
      }

      function mouseleave2(d) {
        d3.select("#alimentpercent").remove();
      }
    }



    // add country to top bar on mouseover
    if (
      (d.key == "Europe") |
      (d.key == "North America") |
      (d.key == "South America") |
      (d.key == "Africa") |
      (d.key == "Asia") |
      (d.key == "Oceania")
    ) {
      var cat = d.key;

      var boxes2 = d3.selectAll("rect");

      boxes2.on("mouseover", mouseover).on("mouseleave", mouseleave);

      function mouseover(d) {
        if (d != undefined) {
          topbar
            .append("text")
            .text(d.parent.key)
            .attr("id", "countryname")
            .attr("x", 450)
            .attr("y", 20 - margin.top);
        }
      }

      function mouseleave(d) {
        d3.select("#countryname").remove();
      }
    }

    // transition between grids
    function transition(d) {
      if (transitioning || !d) return;
      transitioning = true;

      var display2 = display(d), // create new_ display
        old = g1.transition().duration(750), // old display transition
        new_ = display2.transition().duration(750); // new_ display transition

      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      svg.style("shape-rendering", null);

      svg.selectAll(".grid").sort(function (a, b) {
        return a.depth - b.depth;
      });

      display2.selectAll("text").style("fill-opacity", 0);

      // transition to new_ view
      old.selectAll(".ptext").call(text).style("fill-opacity", 0); // normal text from previous disappears
      old.selectAll(".ctext").call(text2).style("fill-opacity", 0); // text of children behind
      new_.selectAll(".ptext").call(text).style("fill-opacity", 1); //normal text
      old.selectAll("rect").call(addRect); // draws rectangles
      new_.selectAll("rect").call(addRect); // draws rectangles
      old.selectAll("image").call(addImage); // draws images
      new_.selectAll("image").call(addImage);
      transitioning = false;

      // remove the old node
      old.remove().each("end", function () {
        svg.style("shape-rendering", "crispEdges");
      });
    }

    return g;
  }

  function text(text) {
    text.selectAll("tspan").attr("x", function (d) {
      return x(d.x) + 6;
    }); // moves continent names to x position
    text
      .attr("x", function (d) {
        return x(d.x) + 6;
      })
      .attr("y", function (d) {
        return y(d.y) + 6;
      }) // moves continent names to y position
      .style("font-size", function (d) {
        return this.getComputedTextLength() < x(d.x + d.dx) - 1.2 * x(d.x)
          ? "20px"
          : "12px";
      })
      .style("opacity", function (d) {
        return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0;
      }) // hides text that is too long
      .filter(function (d) {
        return (
          (d.key == "Asia") |
          (d.key == "Africa") |
          (d.key == "North America") |
          (d.key == "Europe") |
          (d.key == "South America") |
          (d.key == "Oceania")
        );
      })
      .style("font-size", "20px");
    text
      .filter(function (d) {
        return d.key == "Oceania";
      })
      .style("font-size", "16px")
      .attr("y", function (d) {
        return y(d.y) + 3;
      });
    text
      .filter(function (d) {
        return (d.key == "Food") | (d.key == "Feed");
      })
      .style("font-size", "25px");
  }

  // function for children text
  function text2(text) {
    text
      .attr("x", function (d) {
        return x(d.x + d.dx) - this.getComputedTextLength() - 6;
      })
      .attr("y", function (d) {
        return y(d.y + d.dy) - 6;
      })
      .style("opacity", function (d) {
        return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0;
      });
  }

  // position rects and images
  function addRect(rect) {
    rect
      .attr("x", function (d) {
        return x(d.x);
      })
      .attr("y", function (d) {
        return y(d.y);
      })
      .attr("width", function (d) {
        return x(d.x + d.dx) - x(d.x);
      })
      .attr("height", function (d) {
        return y(d.y + d.dy) - y(d.y);
      });
  }

  function addImage(image) {
    image
      .attr("x", function (d) {
        return x(d.x);
      })
      .attr("y", function (d) {
        return y(d.y);
      })
      .attr("width", function (d) {
        return x(d.x + d.dx) - x(d.x);
      })
      .attr("height", function (d) {
        return y(d.y + d.dy) - y(d.y);
      })
      .style("visibility", function (d) {
        return x(d.x + d.dx) - x(d.x) < defaults.width / 6
          ? "hidden"
          : "visible";
      });
  }

  // writes the name of the selection to the top bar
  function addName(d) {
    return d.parent ? addName(d.parent) + " / " + d.key : d.key;
  }
}

if (window.location.hash === "") {
  d3.json("data/json18.json", function (err, json) {
    if (!err) {
      var data = d3
        .nest()
        .key(function (d) {
          return d.region;
        })
        .key(function (d) {
          return d.subregion;
        })
        .key(function (d) {
          return d.element;
        })
        .entries(json);
      d3.json("data/sums.json", function (d) {
        var dictionary = {};

        for (var i = 0, entry; i < d.length; i++) {
          entry = d[i];
          dictionary[entry.region.concat(entry.subregion, entry.element)] =
            entry.value;
        }
        main({ key: "World", values: data, dict: dictionary });
      });
    }
  });
}
