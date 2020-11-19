from flask import Flask, redirect, render_template, jsonify
import requests
from networkx.algorithms import community
from flask import request
import json
import os
import networkx as nx
import matplotlib.pyplot as plt
import numpy as np
import uuid
import itertools
import time

app = Flask(__name__, template_folder='templates')

@app.route('/', methods=["GET"])
def index():
    data = {
        "list" : os.listdir('./static/ressources/'),
    }
    return render_template('index.html', data=data)

@app.route('/graph/<graph_id>', methods=["GET"])
def load_graph(graph_id):
    return render_template('graph_display.html', data=graph_id)


@app.route('/upload_file', methods=["POST"])
def file_upload():
    if request.method == 'POST':
        f = request.files['file_field']

        # read gml file
        file_text = f.read().decode("utf-8")

        dir_name = str(uuid.uuid4().hex)
        path = os.getcwd()+"\\static\\ressources\\"+dir_name
        try:
            os.makedirs(path)
        except OSError:
            print ("Creation of the directory %s failed" % path)
        else:
            print ("Successfully created the directory %s" % path)

        # store gml file
        with open(os.getcwd()+"\\static\\ressources\\"+dir_name+"\\gml_file.gml", 'w') as outfile:
            outfile.write(file_text)

        graph = nx.read_gml(os.getcwd()+"\\static\\ressources\\"+dir_name+"\\gml_file.gml", label=None)

        nodesFile = []
        edgesFile = []

        ### Informations and computing relative to edges ###
        edgesBetweenness = getEdgesBetweenness(graph)

        for edge in graph.edges:
            edgesFile.append({
                'source': edge[0],
                'target' : edge[1],
                'edges_betweenness' : edgesBetweenness[edge],
                'type': 'type'
            })

        ### Informations and computing relative to nodes ###

        # degree_centrality
        degree_centrality = getDegreeCentrality(graph)
        # betweenness_centrality
        betweenness_centrality = getBetweenneessCentrality(graph)
        # closeness_centrality
        closeness_centrality = getClosenessCentrality(graph)
        # in_degree
        in_degree = getInDegree(graph)
        # out_degree
        out_degree = getOutDegree(graph)

        for i in range(0, len(graph.nodes)):
            id = list(graph.nodes)[i]
            try:
                label = graph.nodes[i]['label']
            except:
                label = id

            nodesFile.append({
                'id': id,
                'nom' : label,
                'degree_centrality': degree_centrality[id],
                'betweenness_centrality': betweenness_centrality[id],
                'closeness_centrality': closeness_centrality[id],
                'in_degree': in_degree[id],
                'out_degree': out_degree[id],
            })

        ### General informations about graph ###

        graphFile = {
            "nb_nodes" : getNbNodes(graph),
            "nb_edges" : getNbEdges(graph),
            "density" : getNetworkDensity(graph),
            "avg_path_lenght" : getNetworkAvgPathLength(graph)
        }

        with open(os.getcwd()+"\\static\\ressources\\"+dir_name+"\\graph_info.json", 'w') as outfile:
            json.dump(graphFile, outfile)

        with open(os.getcwd()+"\\static\\ressources/"+dir_name+"\\graph_nodes.json", 'w') as outfile:
            json.dump(nodesFile, outfile)

        with open(os.getcwd()+"\\static\\ressources\\"+dir_name+"\\graph_edges.json", 'w') as outfile:
            json.dump(edgesFile, outfile)

        ### Generating clusters ###

        # Cluster set generation with Girman Newman algorithm:
        clusteringSet = community.girvan_newman(graph)


        # For each set construct the json file.
        setId = 2
        performance = 0

        k = 0

        for set in clusteringSet:
            performanceSet = community.quality.performance(graph,list(set))
            if performanceSet > performance:
                performance = performanceSet
                print("increasing k = "+str(k)+" - "+str(performance))
            else:
                print("Final iteration because equals or decreasing : "+str(performance))
                break;

            k = k + 1

            clustersInfo = {
                "performance": performance,
                "nb_clust" : setId,
                "clusters" : [],
            }

            clustFile = [] # json vide
            clustId = 1 # set Id
            #forEach cluster look graph node and add it if it's in the cluster.
            for cluster in set:
                subgraph = graph.subgraph(list(cluster))
                clustersInfo["clusters"].append({
                    "id" : clustId,
                    "intra-density" : getNetworkDensity(subgraph),
                    "inter-density" : getInterDensity(subgraph, graph),
                    "most-important-node" : getMostImportantNode(subgraph)
                })

                for i in range(0, len(graph.nodes)):
                    id = list(graph.nodes)[i]
                    try:
                        label = graph.nodes[i]['label']
                    except:
                        label = id
                    if(id in list(subgraph.nodes)):
                        clustFile.append({
                            'id': id,
                            'nom' : label,
                            'cluster' : clustId,
                            'degree_centrality': degree_centrality[id],
                            'betweenness_centrality': betweenness_centrality[id],
                            'closeness_centrality': closeness_centrality[id],
                            'in_degree': in_degree[id],
                            'out_degree': out_degree[id],
                        })
                clustId += 1
            setId += 1

        with open(os.getcwd()+"\\static\\ressources\\"+dir_name+"\\graph_nodes.json", 'w') as outfile:
            json.dump(clustFile, outfile)

        with open(os.getcwd()+"\\static\\ressources\\"+dir_name+"\\clusters_info.json", 'w') as outfile:
            json.dump(clustersInfo, outfile)

        return redirect("/graph/"+dir_name, code=200)


def getNbNodes(g):
    return len(list(g.nodes))

def getNbEdges(g):
    return len(list(g.edges))

def getEdgesBetweenness(g):
    return nx.edge_betweenness_centrality(g,k=None, normalized=True, weight=None, seed=None)

def getDegreeCentrality(g):
    return nx.degree_centrality(g)

def getBetweenneessCentrality(g):
    return nx.betweenness_centrality(g, k=None, normalized=True, weight=None, endpoints=False, seed=None)

def getClosenessCentrality(g):
    return nx.closeness_centrality(g, u=None, distance=None, wf_improved=True)

def maxDegree(g):
    max = 0;
    for degree in g.degree:
        if(degree[1] > max):
            max = degree[1]
    return max

def getNetworkDegreeCentrality(g):
    maxDeg = maxDegree(g)
    N=len(g.nodes)
    res=0
    for degree in  g.degree:
        res += maxDeg - degree[1]
    return res/((N-1)*(N-2))

def getNetworkAvgPathLength(g):
    if nx.is_connected(g) :
        return nx.average_shortest_path_length(g, weight=None)
    else:
        tab = []
        for c in nx.algorithms.connected_components(g):
            C = g.subgraph(c).copy()
            tab.append(nx.average_shortest_path_length(C))
        return np.mean(tab)

def getOutDegree(g):
    res=[]
    for node in g.nodes:
        if isinstance(g,nx.DiGraph):
            return g.out_degree
        else:
            return g.degree

def getInDegree(g):
    res=[]
    for node in g.nodes:
        if isinstance(g,nx.DiGraph):
            return g.in_degree
        else:
            return g.degree

def getNetworkDensity(g):
    return nx.density(g)

def girvanNewman(graph, k):
    t1 = time.time()
    comp = community.girvan_newman(graph)
    res =[]
    for communities in itertools.islice(comp, k): ## prend seulement les k itérations
        res.append(communities)
    t2 = time.time()
    girvanPerf = t2 - t1
    return res, girvanPerf

def getInterDensity(subgraph, graph):
    nb_inter=0
    nbc=len(subgraph.nodes)
    nb = len(graph.nodes)
    for edge in graph.edges:
        if((edge[0] in list(subgraph.nodes) and edge[1] not in list(subgraph.nodes))
            or (edge[1] in list(subgraph.nodes) and edge[0] not in list(subgraph.nodes))):
            nb_inter+=1
    return nb_inter/(nbc*(nb-nbc))

def getMostImportantNode(subgraph):
    max = 0
    max_id = 0
    for couple in subgraph.degree:
        if(couple[1] >= max):
            max = couple[1]
            max_id = couple[0]
    return max_id



if __name__ == "__main__":
    app.run()
