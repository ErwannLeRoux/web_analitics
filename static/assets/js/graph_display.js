$(document).ready(function() {
    let height = 9000
    let width = 9000

    let graph_id = window.location.pathname.split("/")[2]

    let general_informations = d3.json(`/static/ressources/${graph_id}/graph_info.json`)
    let edges_loading= d3.json(`/static/ressources/${graph_id}/graph_edges.json`)
    let nodes_loading = d3.json(`/static/ressources/${graph_id}/graph_nodes.json`)
    let clusters_loading = d3.json(`/static/ressources/${graph_id}/clusters_info.json`)

    general_informations.then(function(data) {
      $(".nbNodes").text(`Number of nodes : ${data.nb_nodes}`)
      $(".nbEdges").text(`Number of edges : ${data.nb_edges}`)
      $(".graphDensity").text(`Graph density : ${data.density}`)
      $(".averagePathLength").text(`Average path length : ${data.avg_path_lenght}`)
    })

    Promise.all([edges_loading, nodes_loading, clusters_loading]).then((data) => {
        let links = data[0]
        let nodes = data[1]
        let types = Array.from(new Set(links.map(d => d.type)))
        let color = d3.scaleOrdinal(types, d3.schemeCategory10)


        let str = `
          <li>Performance : ${data[2].performance}</li>
        `;

        $(".infos-clusters").find("ul").html(str)

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
            .attr("stroke", function(d) {
                if(d.source.cluster === d.target.cluster) {
                    return color(d.source.cluster)
                } else {
                    return "#585049"
                }
            })
            .on("mouseover", function(d) {
              let str = `
                <li>Source node id : ${d.source.id}</li>
                <li>Target node id : ${d.target.id}</li>
              `;
              $(".infos-edges").find("ul").html(str)
            })
            .on("mouseleave", function(d) {
              //$(".infos-edges").find("ul").html("")
            })
            //.attr("marker-end", d => `url(${new URL(`#arrow-${d.type}`, location)})`);
            // used for oriented graphs

        const node = svg.append("g")
            .attr("fill", "currentColor")
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("class", "cursor")
            .selectAll("g")
            .data(nodes)
            .join("g")
              .on("mouseover", function(d) {
                /* Displaying node informations */
                let str = `
                  <li>Id : ${d.id}</li>
                  <li>Name : ${d.nom}</li>
                  <li>Cluster : ${d.cluster}</li>
                  <li>Degree centrality : ${d.degree_centrality}</li>
                  <li>Betweenness_centrality : ${d.betweenness_centrality}</li>
                  <li>Closeness centrality : ${d.closeness_centrality}</li>
                  <li>In-Degree : ${d.in_degree}</li>
                  <li>Out-Degree : ${d.out_degree}</li>
                `;
                $(".nodes-infos").find("ul").html(str)


                /* Displaying cluster informations */
                let actualCluster = data[2].clusters.find((c) => {
                  return c.id == d.cluster
                })

                let str2 = `
                  <li>Performance : ${data[2].performance}</li>
                  <li>Iterations : ${data[2]["iteration_number"]}</li>
                  <li>Id : ${actualCluster.id}</li>
                  <li>Inter-density : ${actualCluster["inter-density"]}</li>
                  <li>Intra-density : ${actualCluster["intra-density"]}</li>
                  <li>Most important node : ${actualCluster["most-important-node"]}</li>
                `;
                $(".infos-clusters").find("ul").html(str2)
              })
              .on("mouseleave", function(d) {
                $(".infos").find("ul").html("")
              })
              //.call(drag(simulation));

        node.append("circle")
            .attr("fill", d => color(d.cluster))
            .attr("stroke", "white")
            .attr("stroke-width", 1.5)
            .attr("r", 4);

        node.append("text")
            .attr("x", 8)
            .attr("y", "0.31em")
            .text(function(d) {
                if(d.nom) return d.nom
                return d.id
            })
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
            $(".figure").css("cursor", "grab")
            x = e.clientX
            y = e.clientY
        })
        .mousemove(function(e) {
            if(isDragging) {
              vx = x - e.clientX
              vy = y - e.clientY

              let viewBox_values = svg_dom.attr("viewBox").split(",")
              let a = parseInt(viewBox_values[0]) + (vx / 10)
              let b = parseInt(viewBox_values[1]) + (vy / 10)
              let c = parseInt(viewBox_values[2])
              let d = parseInt(viewBox_values[3])

              svg_dom.attr("viewBox",`${a}, ${b}, ${c}, ${d}`)
            }
         })
        .mouseup(function() {
            let wasDragging = isDragging
            isDragging = false
            if (wasDragging) {
                $(".figure").css("cursor", "")
            }
        })

        svg_dom.bind('mousewheel DOMMouseScroll', function(event)
        {
          let viewBox_values = svg_dom.attr("viewBox").split(",")

          if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
            // scroll up
            let a = parseInt(viewBox_values[0]) + 150
            let b = parseInt(viewBox_values[1]) + 150
            let c = parseInt(viewBox_values[2]) - 300
            let d = parseInt(viewBox_values[3]) - 300
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
});
