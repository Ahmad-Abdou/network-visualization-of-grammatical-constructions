from flask import Flask, render_template, request, jsonify
import networkx as nx

app = Flask(__name__)

@app.route("/")
def index():
   return render_template('index.html')

@app.route("/api/data", methods=["POST"])
def fetchData():
   data = request.json
   csv_data = data.get('csvData', []) 
   degrees = get_degree(csv_data)
   return jsonify({"degrees": degrees})

def get_degree(passed_list):
   G = nx.DiGraph()
   for entry in passed_list:
        verbs = [entry[key] for key in entry if key.startswith('verb')]
        nx.add_path(G, verbs)
   degrees = dict(G.degree())
   return degrees

if __name__ == '__main__':
    app.run(debug=True)