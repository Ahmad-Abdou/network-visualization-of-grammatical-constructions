const container = document.querySelector('.tree-container')
const margin = {left: 50, top: 50, right: 50, bottom: 50}
let force, tree;
const modeBtn = document.getElementById('mode-btn')
let mode = "force"
let numberOfFiles = 0
let treeInstances = []
const chart = new Chart('#chart', 400, 400, margin)


function initializeVisualization() {
  d3.select('.tree-container').selectAll('svg').remove();
  
  if (mode === "force") {
    tree = null;
    force = new ForceSimulation('force-svg', container.clientWidth, container.clientHeight);
  } else if (mode === "tree") {
    force = null;
    tree = new Tree('tree-svg', container.clientWidth, container.clientHeight);
  }
  
  if (treeInstances.length > 0) {
    treeInstances.forEach(instance => {
      if (mode === 'tree' && tree) {
        tree.collapsable(instance.root, instance);
      } else if (mode === 'force' && force) {
        force.forceSimulation(instance.root);
      }
    });
  }
}

initializeVisualization();

modeBtn.addEventListener('change', (e) => {
  mode = e.target.value;
  initializeVisualization();
});

const StructuringFileHierarchy = (csvData, file) => {
  let root = { name: file.slice(13, file.length - 4), children: [] };
  csvData.forEach(row => {
    const columns = Object.keys(row)
    let current = root;
    columns.forEach(verbKey => {
      if(verbKey.startsWith('verb')) {
        const verbValue = row[verbKey];
        if (verbValue) {
          let child = current.children.find(c => c.name === verbValue);
          if (!child) {
            child = { name: verbValue, year:row['year'], frequency : row['frequency'], children: [] };
            current.children.push(child);
          }
          current = child;
        }
      }
    });
  });
  return root;
}

const StructuringFileForce = (csvData) => {
  let nodes = new Map();
  let links = [];

  csvData.forEach(row => {
    const columns = Object.keys(row);
    let previousVerb = null;

    columns.forEach(verbKey => {
      if (verbKey.startsWith('verb')) {
        const verbValue = row[verbKey];
        if (verbValue) {
          if (!nodes.has(verbValue)) {
            nodes.set(verbValue, {
              name: verbValue,
              year: row['year'],
              frequency: row['frequency']
            });
          }
          if (previousVerb) {
            links.push({ source: previousVerb, target: verbValue });
          }
          previousVerb = verbValue;
        }
      }
    });
  });

  return { nodes: Array.from(nodes.values()), links };
}
const buildHirearchy = (file) => {
  d3.csv(file).then(async (csvData) => {
    const nestedData = StructuringFileHierarchy(csvData, file);
    numberOfFiles++;
    const root = d3.hierarchy(nestedData);
    const treeInstance = {
      id: numberOfFiles,
      root: root,
      container: null,
      update: null
    };
    treeInstances.push(treeInstance);
    try {
      const response = await fetch('/api/data', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({csvData})
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      force.degree = data.degree
      force.in_degree = data.in_degrees
      force.out_degree = data.out_degrees
    } catch (error) {
      console.error("Error posting data to server:", error);
    }
    if(mode === 'tree' && tree) {
      tree.collapsable(root, treeInstance);
    } else if(mode === 'force' && force){
      const root = StructuringFileForce(csvData);

      force.forceSimulation(root);
    }
  });
}

window.onload = function() {
  document.querySelector('.file-input').addEventListener('change', getFileName);
}

const getFileName = (event) => {
  const files = event.target.files;
  const fileName = files[0].name;
  buildHirearchy(`/static/data/${fileName}`)
}