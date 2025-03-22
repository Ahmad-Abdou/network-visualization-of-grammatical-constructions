const container = document.querySelector('.tree-container')
const margin = {left: 50, top: 50, right: 50, bottom: 50}
// const tree = new Tree('#tree-container', container.clientWidth, container.clientHeight)
const force = new ForceSimulation('#force-container', container.clientWidth, container.clientHeight)

const chart = new Chart('#chart', 400, 400, margin)
let numberOfFiles = 0
let treeInstances = []

const StructuringFile = (csvData, file) => {
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
const buildHirearchy = (file) => {
  d3.csv(file).then((csvData) => {
    // const nestedData = StructuringFile(csvData, file);
    // numberOfFiles++;
    // const root = d3.hierarchy(nestedData);
    
    // const treeInstance = {
    //   id: numberOfFiles,
    //   root: root,
    //   container: null,
    //   update: null
    // };
    // treeInstances.push(treeInstance);
    // tree.collapsable(root, treeInstance);
    const nestedData = StructuringFile(csvData, file);
    numberOfFiles++;
    const root = d3.hierarchy(nestedData);
    
    const treeInstance = {
      id: numberOfFiles,
      root: root,
      container: null,
      update: null
    };
    treeInstances.push(treeInstance);
    force.forceSimulation(root);
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

