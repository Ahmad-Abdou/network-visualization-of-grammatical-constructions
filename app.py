from flask import Flask, render_template, request, jsonify
import networkx as nx

app = Flask(__name__)

@app.route("/")
def index():
   return render_template('index.html')

@app.route("/api/data", methods=["POST"])
def fetchData():
    data = request.json
    csv_data = data.get('csvData')
    print(csv_data)
    return jsonify({"receivedData": csv_data})

if __name__ == '__main__':
    app.run(debug=True)