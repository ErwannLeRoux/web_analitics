from flask import Flask, render_template, jsonify
import requests
from flask import request
import json
import os
import networkx as nx
import matplotlib.pyplot as plt
import numpy as np

app = Flask(__name__, template_folder='templates')

@app.route('/', methods=["GET"])
def index():
    filename="karate"
    graph = nx.read_gml(os.getcwd()+"\\static\\ressources\\"+filename+".gml", label=None)
    edgesFile = []
    nodesFile = []

    centrality_dict = getDegreeCentrality(graph)
    centrality_list = list(centrality_dict.values())

    i = 0
    for item in graph.edges:
        edgesFile.append({
            'source': item[0],
            'target' : item[1],
            'type': 'type'
        })
        i = i +1

    i = 0
    for item in graph.nodes:
        nodesFile.append({
            'id': item,
            'centrality' : centrality_list[0]
        })
        i = i + 1

    with open(os.getcwd()+"\\static\\ressources\\graph_nodes.json", 'w') as outfile:
        json.dump(nodesFile, outfile)

    with open(os.getcwd()+"\\static\\ressources\\graph_edges.json", 'w') as outfile:
        json.dump(edgesFile, outfile)

    return render_template('index.html', data="")

#Utilities Methods
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
        tab_average_shortest_path_length = []
        for comp in nx.connected_components(g):
            for C in (g.subgraph(comp).copy()):
                tab_average_shortest_path_length = nx.average_shortest_path_length(C)
        return np.mean(tab_average_shortest_path_length)

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


if __name__ == "__main__":
    app.run()
