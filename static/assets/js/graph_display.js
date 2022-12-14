$(document).ready(function() {
    let height = 9000
    let width = 9000

    let graph_id = window.location.pathname.split("/")[2]

    let general_informations = d3.json(`/static/ressources/${graph_id}/graph_info.json`)
    let edges_loading= d3.json(`/static/ressources/${graph_id}/graph_edges.json`)
    let nodes_loading = d3.json(`/static/ressources/${graph_id}/graph_nodes.json`)
    let clusters_loading = d3.json(`/static/ressources/${graph_id}/clusters_info.json`)

    Promise.all([edges_loading, nodes_loading, clusters_loading, general_informations]).then((data) => {
        let edgesInClusters = 0
        let edgesOutClusters = 0
        let links = data[0]
        let nodes = data[1]
        let generalInfo = data[3]
        let types = Array.from(new Set(links.map(d => d.type)))
        let color = d3.scaleOrdinal(types, d3.schemeCategory10)

        // Highest betweeness
        nodes.sort(function(nodeA, nodeB) {
            return nodeB["betweenness_centrality"] - nodeA["betweenness_centrality"];
        });

        let maxBetweeness = nodes[0];

        // Highest closeness
        nodes.sort(function(nodeA, nodeB) {
            return nodeB["closeness_centrality"] - nodeA["closeness_centrality"];
        });

        let maxCloseness = nodes[0];

        // Degree centrality
        nodes.sort(function(nodeA, nodeB) {
            return nodeB["degree_centrality"] - nodeA["degree_centrality"];
        });

        let maxDegree = nodes[0];

        let strGeneralCluster = `
            <li>Number of clusters : ${data[2].nb_clust}</li>
            <li>Performance : ${data[2].performance}</li>
            <li>Girvan-Newman Iterations : ${data[2]["iteration_number"]}</li>
            <li>Average intra-clusters links : ${data[2].mean_nb_intra}</li>
            <li>Average inter-clusters links : ${data[2].mean_nb_inters}</li>
        `;

        $(".general-infos-clusters").find("ul").html(strGeneralCluster)

        let str = `
            <li>Number of nodes : ${generalInfo.nb_nodes}</li>
            <li>Number of edges : ${generalInfo.nb_edges}</li>
            <li>Graph density : ${generalInfo.density}</li>
            <li>Average path length :  ${generalInfo.avg_path_lenght}</li>
            <li>Node with max degree : ${maxDegree.nom}</li>
            <li>Node with max closeness : ${maxCloseness.nom}</li>
            <li>Node with max betweeness : ${maxBetweeness.nom}</li>
        `;

        $(".graph-infos").find("ul").html(str)

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
            .attr("class", "cursor")
            .attr("fill", "none")
            .attr("stroke-width", 1.5)
            .selectAll("path")
            .data(links)
            .join("path")
            .attr("stroke", function(d) {
                if(d.source.cluster === d.target.cluster) {
                    edgesInClusters++
                    return color(d.source.cluster)
                } else {
                    edgesOutClusters++
                    return "#585049"
                }
            })
            .on("mouseover", function(d) {
                /* Displaying cluster informations */
                let actualCluster = data[2].clusters.find((c) => {
                    if(d.source.cluster == d.target.cluster) {
                        return c.id == d.source.cluster
                    }
                })

                if(actualCluster) {
                    let str2 = `
                  <li>Id : ${actualCluster.id}</li>
                  <li>Inter-density : ${actualCluster["inter-density"]}</li>
                  <li>Intra-density : ${actualCluster["intra-density"]}</li>
                  <li>Most important node : ${actualCluster["most-important-node"]}</li>
                `;

                    $(".infos-cluster").find("ul").html(str2)
                }
              let str = `
                <li>Source node id : ${d.source.id}</li>
                <li>Target node id : ${d.target.id}</li>
                <li>Edges betweeness: ${d.edges_betweenness}</li>
              `;
              $(".infos-edges").find("ul").html(str)
            })
            .on("mouseleave", function(d) {
              $(".infos-edges").find("ul").html("")
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
                  <li>Id : ${actualCluster.id}</li>
                  <li>Inter-density : ${actualCluster["inter-density"]}</li>
                  <li>Intra-density : ${actualCluster["intra-density"]}</li>
                  <li>Most important node : ${actualCluster["most-important-node"]}</li>
                `;
                $(".infos-cluster").find("ul").html(str2)
              })
              .on("mouseleave", function(d) {
                  $(".infos-cluster").find("ul").html("")
                  $(".nodes-infos").find("ul").html("")
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

        console.log(edgesInClusters)
        console.log(edgesOutClusters)
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
