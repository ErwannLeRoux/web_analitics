$(document).ready(function() {
    let height = 6000
    let width = 6000

    let graph_id = window.location.pathname.split("/")[2]

    let edges_loading= d3.json(`/static/ressources/${graph_id}/graph_edges.json`)
    let nodes_loading = d3.json(`/static/ressources/${graph_id}/graph_nodes.json`)

    Promise.all([edges_loading, nodes_loading]).then((data) => {
        let links = data[0]
        let nodes = data[1]
        let types = Array.from(new Set(links.map(d => d.type)))
        let color = d3.scaleOrdinal(types, d3.schemeCategory10)

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("charge", d3.forceManyBody().strength(-400))
            .force("x", d3.forceX())
            .force("y", d3.forceY());

        const svg = d3.select(".figure").append("svg")
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .style("font", "12px sans-serif");

        // Per-type markers, as they don't inherit styles.
        svg.append("defs").selectAll("marker")
            .data(types)
            .join("marker")
            .attr("id", d => `arrow-${d}`)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", -0.5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("fill", color)
            .attr("d", "M0,-5L10,0L0,5");

        const link = svg.append("g")
            .attr("fill", "none")
            .attr("stroke-width", 1.5)
            .selectAll("path")
            .data(links)
            .join("path")
            .attr("class", function(d) {
              //console.log(d)
            })
            .attr("stroke", d => color(d.type))
            // used for oriented graphs
            //.attr("marker-end", d => `url(${new URL(`#arrow-${d.type}`, location)})`);

        const node = svg.append("g")
            .attr("fill", "currentColor")
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("class", "cursor")
            .selectAll("g")
            .data(nodes)
            .join("g")
              .on("mouseover", function(d) {
                $(".infos").text(JSON.stringify(d))
              })
              //.call(drag(simulation));

        node.append("circle")
            .attr("stroke", "white")
            .attr("stroke-width", 1.5)
            .attr("r", 4);

        node.append("text")
            .attr("x", 8)
            .attr("y", "0.31em")
            .text(d => d.id)
            .clone(true).lower()
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 3);

        simulation.on("tick", () => {
            link.attr("d", linkArc);
            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        let svg_dom = $("svg")

        let isDragging = false
        let x = 0
        let y = 0

        $(".figure").mousedown(function(e) {
            isDragging = true
            x = e.clientX
            y = e.clientY
        })
        .mousemove(function(e) {
            if(isDragging) {
              vx = x - e.clientX
              vy = y - e.clientY

              let viewBox_values = svg_dom.attr("viewBox").split(",")
              let a = parseInt(viewBox_values[0]) + vx
              let b = parseInt(viewBox_values[1]) + vy
              let c = parseInt(viewBox_values[2])
              let d = parseInt(viewBox_values[3])

              svg_dom.attr("viewBox",`${a}, ${b}, ${c}, ${d}`)
            }
         })
        .mouseup(function() {
            let wasDragging = isDragging
            isDragging = false
            if (!wasDragging) {
                console.log("fini !")
            }
        })

        svg_dom.bind('mousewheel DOMMouseScroll', function(event)
        {
          let viewBox_values = svg_dom.attr("viewBox").split(",")

          let eventX = event.originalEvent.x
          let eventY = event.originalEvent.y

          if(eventX < 300 && eventY < 300) {
            console.log("top left x: "+eventX+" y: "+eventY)
          } else if(eventX >= 300 && eventY >= 300) {
            console.log("bottom right x: "+eventX+" y: "+eventY)
          } else if(eventX < 300 && eventY > 300) {
            console.log("top right x: "+eventX+" y: "+eventY)
          } else if(eventX >= 300 && eventY < 300) {
            console.log("bottom left x: "+eventX+" y: "+eventY)
          }

          if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
            // scroll up
            let a = parseInt(viewBox_values[0]) + 250
            let b = parseInt(viewBox_values[1]) + 250
            let c = parseInt(viewBox_values[2]) - 500
            let d = parseInt(viewBox_values[3]) - 500
            if(c && d >= 500) {
              svg_dom.attr("viewBox",`${a}, ${b}, ${c}, ${d}`)
            }
          }
          else {
            // scroll down
            let a = parseInt(viewBox_values[0]) - 250
            let b = parseInt(viewBox_values[1]) - 250
            let c = parseInt(viewBox_values[2]) + 500
            let d = parseInt(viewBox_values[3]) + 500
            if(c && d >= 500) {
              svg_dom.attr("viewBox",`${a}, ${b}, ${c}, ${d}`)
            }

          }

        })


    }).catch(console.error)

    function linkArc(d) {
        const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
        return `
            M${d.source.x},${d.source.y}
            A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
        `;
    }

    drag = simulation => {
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    $("#gmlFile").on("change", function(e) {
        console.log(e.target.files[0])
    })


});

function gmlToJson() {

}
