[1mdiff --cc app.py[m
[1mindex 8c60551,86fd2aa..0000000[m
[1m--- a/app.py[m
[1m+++ b/app.py[m
[36m@@@ -43,14 -43,15 +43,21 @@@[m [mdef file_upload()[m
              print ("Successfully created the directory %s" % path)[m
  [m
          # store gml file[m
[31m-         with open(os.getcwd()+"\\static\\ressources\\"+dir_name+"\\gml_file.gml", 'w') as outfile:[m
[32m+         with open(os.getcwd()+"/static/ressources/"+dir_name+"/gml_file.gml", 'w') as outfile:[m
              outfile.write(file_text)[m
  [m
[32m++<<<<<<< HEAD[m
[32m +        graph = nx.read_gml(os.getcwd()+"\\static\\ressources\\"+dir_name+"\\gml_file.gml", label=None)[m
[32m +        print(len(graph.nodes))[m
[32m +        print(len(graph.edges))[m
[32m++=======[m
[32m+         graph = nx.read_gml(os.getcwd()+"/static/ressources/"+dir_name+"/gml_file.gml", label=None)[m
[32m+            [m
[32m+         if(len(list(graph.nodes)) >= 5000):[m
[32m+             graph = graph.subgraph(list(graph.nodes)[0:5000])[m
[32m+             [m
[32m++>>>>>>> origin/antoine[m
  [m
[31m-         nodesFile = [][m
          edgesFile = [][m
  [m
          ### Informations and computing relative to edges ###[m
[36m@@@ -77,6 -78,7 +84,10 @@@[m
          # out_degree[m
          out_degree = getOutDegree(graph)[m
  [m
[32m++<<<<<<< HEAD[m
[32m++=======[m
[32m+         [m
[32m++>>>>>>> origin/antoine[m
          ### General informations about graph ###[m
  [m
          graphFile = {[m
[36m@@@ -86,10 -88,11 +97,15 @@@[m
              "avg_path_lenght" : getNetworkAvgPathLength(graph)[m
          }[m
  [m
[31m-         with open(os.getcwd()+"\\static\\ressources\\"+dir_name+"\\graph_info.json", 'w') as outfile:[m
[32m+         with open(os.getcwd()+"/static/ressources/"+dir_name+"/graph_info.json", 'w') as outfile:[m
              json.dump(graphFile, outfile)[m
  [m
[32m++<<<<<<< HEAD[m
[32m +        with open(os.getcwd()+"\\static\\ressources\\"+dir_name+"\\graph_edges.json", 'w') as outfile:[m
[32m++=======[m
[32m+ [m
[32m+         with open(os.getcwd()+"/static/ressources/"+dir_name+"/graph_edges.json", 'w') as outfile:[m
[32m++>>>>>>> origin/antoine[m
              json.dump(edgesFile, outfile)[m
  [m
          ### Generating clusters ###[m
[36m@@@ -111,56 -113,73 +126,123 @@@[m
                  print("increasing k = "+str(k)+" - "+str(performance))[m
              else:[m
                  print("Final iteration because equals or decreasing : "+str(performance))[m
[32m++<<<<<<< HEAD[m
[32m +                break[m
[32m++=======[m
[32m+                 selectedSet = set[m
[32m+                 break;[m
[32m++>>>>>>> origin/antoine[m
  [m
              k = k + 1[m
[32m+             [m
[32m+         nb_clust = len(selectedSet)[m
[32m+         nb_inters = 0[m
[32m+         nb_intras = 0 [m
[32m+ [m
[32m+         clustsFile = {[m
[32m+             "performance": performance,[m
[32m+             "nb_clust" : nb_clust,[m
[32m+             "clusters" : [],[m
[32m+         }[m
[32m+ [m
[32m+         nodesFile = [] # json vide[m
[32m+         clustId = 1 # set Id[m
[32m+         [m
[32m+         #forEach cluster look graph node and add it if it's in the cluster.[m
[32m+         for cluster in set:[m
[32m+             subgraph = graph.subgraph(list(cluster))[m
[32m+             nb_nodes_cls = len(list(subgraph.nodes))[m
[32m+             nb_intras_cls = len(list(subgraph.edges))[m
[32m+             nb_inter_cls = getNbInterEdges(subgraph,graph)[m
[32m+ [m
[32m+             nb_intras += nb_intras_cls[m
[32m+             nb_inters += nb_inter_cls[m
[32m+ [m
[32m+             clustsFile["mean_nb_intra"] = nb_intras/nb_clust[m
[32m+             clustsFile["mean_nb_inters"] = nb_inters/nb_clust[m
[32m+ [m
[32m+             clustsFile["clusters"].append({[m
[32m+                 "id" : clustId,[m
[32m+                 "nb_nodes" : nb_nodes_cls,[m
[32m+                 "nb_intra_edges" : nb_intras_cls,[m
[32m+                 "nb_inter_edges" : nb_inter_cls,[m
[32m+                 "intra-density" : getNetworkDensity(subgraph),[m
[32m+                 "inter-density" : getInterDensity(subgraph, graph),[m
[32m+                 "most-important-node" : getMostImportantNode(subgraph)[m
[32m+             })[m
[32m+ [m
[32m+             for i in range(0, len(graph.nodes)):[m
[32m+                 id = list(graph.nodes)[i][m
[32m+                 try:[m
[32m+                     label = graph.nodes[i]['label'][m
[32m+                 except:[m
[32m+                     label = id[m
[32m+                 if(id in list(subgraph.nodes)):[m
[32m+                     nodesFile.append({[m
[32m+                         'id': id,[m
[32m+                         'nom' : label,[m
[32m+                         'cluster' : clustId,[m
[32m+                         'degree_centrality': degree_centrality[id],[m
[32m+                         'betweenness_centrality': betweenness_centrality[id],[m
[32m+                         'closeness_centrality': closeness_centrality[id],[m
[32m+                         'in_degree': in_degree[id],[m
[32m+                         'out_degree': out_degree[id],[m
[32m+                     })[m
[32m+             clustId += 1[m
[32m+ [m
[32m+         with open(os.getcwd()+"/static/ressources/"+dir_name+"/graph_nodes.json", 'w') as outfile:[m
[32m+             json.dump(nodesFile, outfile)[m
  [m
[32m++<<<<<<< HEAD[m
[32m +            clustsFile = {[m
[32m +                "performance": performance,[m
[32m +                "iteration_number": k,[m
[32m +                "nb_clust" : setId,[m
[32m +                "clusters" : [],[m
[32m +            }[m
[32m +[m
[32m +            nodesFile = [] # json vide[m
[32m +            clustId = 1 # set Id[m
[32m +            #forEach cluster look graph node and add it if it's in the cluster.[m
[32m +            for cluster in set:[m
[32m +                subgraph = graph.subgraph(list(cluster))[m
[32m +                clustsFile["clusters"].append({[m
[32m +                    "id" : clustId,[m
[32m +                    "intra-density" : getNetworkDensity(subgraph),[m
[32m +                    "inter-density" : getInterDensity(subgraph, graph),[m
[32m +                    "most-important-node" : getMostImportantNode(subgraph)[m
[32m +                })[m
[32m +[m
[32m +                for i in range(0, len(graph.nodes)):[m
[32m +                    id = list(graph.nodes)[i][m
[32m +                    try:[m
[32m +                        label = graph.nodes[i]['label'][m
[32m +                    except:[m
[32m +                        label = id[m
[32m +                    if(id in list(subgraph.nodes)):[m
[32m +                        nodesFile.append({[m
[32m +                            'id': id,[m
[32m +                            'nom' : label,[m
[32m +                            'cluster' : clustId,[m
[32m +                            'degree_centrality': degree_centrality[id],[m
[32m +                            'betweenness_centrality': betweenness_centrality[id],[m
[32m +                            'closeness_centrality': closeness_centrality[id],[m
[32m +                            'in_degree': in_degree[id],[m
[32m +                            'out_degree': out_degree[id],[m
[32m +                        })[m
[32m +                clustId += 1[m
[32m +            setId += 1[m
[32m +[m
[32m +        with open(os.getcwd()+"\\static\\ressources\\"+dir_name+"\\graph_nodes.json", 'w') as outfile:[m
[32m +            json.dump(nodesFile, outfile)[m
[32m +[m
[32m +        with open(os.getcwd()+"\\static\\ressources\\"+dir_name+"\\clusters_info.json", 'w') as outfile:[m
[32m++=======[m
[32m+         with open(os.getcwd()+"/static/ressources/"+dir_name+"/clusters_info.json", 'w') as outfile:[m
[32m++>>>>>>> origin/antoine[m
              json.dump(clustsFile, outfile)[m
  [m
[31m -        return redirect("/graph/"+dir_name, code=200)[m
[32m +        return redirect("/graph/"+dir_name)[m
  [m
  [m
  def getNbNodes(g):[m
[1mdiff --git a/.idea/workspace.xml b/.idea/workspace.xml[m
[1mindex ddab2f6..3882c72 100644[m
[1m--- a/.idea/workspace.xml[m
[1m+++ b/.idea/workspace.xml[m
[36m@@ -2,8 +2,13 @@[m
 <project version="4">[m
   <component name="ChangeListManager">[m
     <list default="true" id="76755870-a01e-44e8-8a36-ede6e1918364" name="Default Changelist" comment="">[m
[32m+[m[32m      <change afterPath="$PROJECT_DIR$/static/ressources/4b5da93158ac4245a3aedf3014dad81a/gml_file.gml" afterDir="false" />[m
       <change beforePath="$PROJECT_DIR$/.idea/workspace.xml" beforeDir="false" afterPath="$PROJECT_DIR$/.idea/workspace.xml" afterDir="false" />[m
[31m-      <change beforePath="$PROJECT_DIR$/static/assets/js/graph_display.js" beforeDir="false" afterPath="$PROJECT_DIR$/static/assets/js/graph_display.js" afterDir="false" />[m
[32m+[m[32m      <change beforePath="$PROJECT_DIR$/app.py" beforeDir="false" afterPath="$PROJECT_DIR$/app.py" afterDir="false" />[m
[32m+[m[32m      <change beforePath="$PROJECT_DIR$/static/ressources/3dd4b34acaed4787844c80aa8ec169a7/gml_file.gml" beforeDir="false" afterPath="$PROJECT_DIR$/static/ressources/3dd4b34acaed4787844c80aa8ec169a7/gml_file.gml" afterDir="false" />[m
[32m+[m[32m      <change beforePath="$PROJECT_DIR$/static/ressources/3dd4b34acaed4787844c80aa8ec169a7/graph_edges.json" beforeDir="false" afterPath="$PROJECT_DIR$/static/ressources/3dd4b34acaed4787844c80aa8ec169a7/graph_edges.json" afterDir="false" />[m
[32m+[m[32m      <change beforePath="$PROJECT_DIR$/static/ressources/3dd4b34acaed4787844c80aa8ec169a7/graph_info.json" beforeDir="false" afterPath="$PROJECT_DIR$/static/ressources/3dd4b34acaed4787844c80aa8ec169a7/graph_info.json" afterDir="false" />[m
[32m+[m[32m      <change beforePath="$PROJECT_DIR$/static/ressources/3dd4b34acaed4787844c80aa8ec169a7/graph_nodes.json" beforeDir="false" afterPath="$PROJECT_DIR$/static/ressources/3dd4b34acaed4787844c80aa8ec169a7/graph_nodes.json" afterDir="false" />[m
     </list>[m
     <option name="SHOW_DIALOG" value="false" />[m
     <option name="HIGHLIGHT_CONFLICTS" value="true" />[m
[36m@@ -56,7 +61,7 @@[m
       <workItem from="1605770210671" duration="2141000" />[m
       <workItem from="1605788698183" duration="7188000" />[m
       <workItem from="1606135827513" duration="616000" />[m
[31m-      <workItem from="1606136459540" duration="7131000" />[m
[32m+[m[32m      <workItem from="1606136459540" duration="7620000" />[m
     </task>[m
     <servers />[m
   </component>[m
* Unmerged path static/ressources/3dd4b34acaed4787844c80aa8ec169a7/gml_file.gml
* Unmerged path static/ressources/3dd4b34acaed4787844c80aa8ec169a7/graph_edges.json
* Unmerged path static/ressources/3dd4b34acaed4787844c80aa8ec169a7/graph_info.json
* Unmerged path static/ressources/3dd4b34acaed4787844c80aa8ec169a7/graph_nodes.json
