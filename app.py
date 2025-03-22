from flask import Flask, render_template
import networkx as nx

app = Flask(__name__)

@app.route("/")
def index():
   return render_template('index.html')

G = nx.Graph()

if __name__ == '__main__':
    app.run(debug=True)