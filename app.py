from flask import Flask, render_template, request, jsonify
import networkx as nx

app = Flask(__name__)
@app.route("/")
def index():
   return render_template('index.html')
allData = []

def calculate_degrees(passed_list):
   G = nx.DiGraph()
   for entry in passed_list:
        verbs = [entry[key] for key in entry if key.startswith('verb')]
        nx.add_path(G, verbs)
   degrees = dict(G.degree())
   in_degrees = dict(G.in_degree())
   out_degrees = dict(G.out_degree())

   return {'degree': degrees, 'in_degrees': in_degrees, 'out_degrees': out_degrees} 
@app.route("/api/data", methods=["POST"])
def post_data():
   global allData
   data = request.json
   csv_data = data.get('csvData', []) 
   if len(allData) != 0:
      allData.extend(csv_data)
   else:
       allData = csv_data
   all_degrees = calculate_degrees(allData)
   return jsonify(all_degrees)

@app.route('/api/data/reset', methods=["GET"])
def reset_data():
   global allData
   allData = []
   return jsonify({"status": "success", "message": "Data has been reset"})

if __name__ == '__main__':
    app.run(debug=True)