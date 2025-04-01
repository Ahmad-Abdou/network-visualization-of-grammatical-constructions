const container = document.querySelector('.tree-container')
const margin = {left: 50, top: 50, right: 50, bottom: 50}
let force, tree;
const modeBtn = document.getElementById('mode-btn')
let mode = "force"
let numberOfFiles = 0
let treeInstances = []
const chart = new Chart('#chart', 400, 400, margin)
let nodes = new Map();
let links = [];
let previousVerb = null;
let reset_btn = document.querySelector('.reset-btn')

function initializeVisualization() {
  d3.select('.tree-container').selectAll('svg').remove();
  
  if (mode === "force") {
    tree = null;
    force = new ForceSimulation('force-svg', container.clientWidth, container.clientHeight);
  } else if (mode === "tree") {
    force = null;
    tree = new Tree('tree-svg', container.clientWidth, container.clientHeight);
  }
  
  nodes.clear();
  links = [];
  previousVerb = null;
  
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
  const fileNodes = new Map();
  const fileLinks = [];
  let filePreviousVerb = null;

  csvData.forEach(row => {
    const columns = Object.keys(row);

    columns.forEach(verbKey => {
      if (verbKey.startsWith('verb')) {
        const verbValue = row[verbKey];
        if (verbValue) {
          if (!fileNodes.has(verbValue)) {
            fileNodes.set(verbValue, {
              name: verbValue,
              year: row['year'],
              frequency: row['frequency']
            });
          }
          if (filePreviousVerb) {
            fileLinks.push({ source: filePreviousVerb, target: verbValue });
          }
          filePreviousVerb = verbValue;
        }
      }
    });
    filePreviousVerb = null;
  });

  fileNodes.forEach((value, key) => {
    if (!nodes.has(key)) {
      nodes.set(key, value);
    }
  });
  
  links.push(...fileLinks);

  return { nodes: Array.from(fileNodes.values()), links: fileLinks };
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
    if(mode === 'tree' && tree) {
      tree.collapsable(root, treeInstance);
    } else if(mode === 'force' && force){
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
      const forceData = StructuringFileForce(csvData);
      const simulation = force.forceSimulation(forceData);
      simulation_timeline = simulation
    }
  });
}

// reset_btn.addEventListener('click', async () => {
//   if(force) {
//     d3.select(force).remove()
//     const res = await fetch('/api/data/reset', {
//       method: 'POST',
//       headers : {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({click: 'clicked'})
//     })
//   }
// })



reset_btn.addEventListener('click', async () => {
  if(force) {
    window.location.reload()
    const res = await fetch('/api/data/reset')
  }
})

window.onload = function() {
  document.querySelector('.file-input').addEventListener('change', getFileName);
}

const getFileName = (event) => {
  const files = event.target.files;
  const fileName = files[0].name;
  buildHirearchy(`/static/data/${fileName}`)
}