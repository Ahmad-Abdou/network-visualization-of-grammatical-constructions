const container = document.querySelector('.tree-container')
const home = new Home('#tree-container', container.clientWidth, container.clientHeight)
let numberOfFiles = 0
let treeInstances = []

const buildHierarchyFromCSV_5_Verbs = (csvData, file) => {
  let root = { name: file.slice(7, file.length - 4), children: [] };
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
    const nestedData = buildHierarchyFromCSV_5_Verbs(csvData, file);
    numberOfFiles++;
    const root = d3.hierarchy(nestedData);
    
    const treeInstance = {
      id: numberOfFiles,
      root: root,
      container: null,
      update: null
    };
    treeInstances.push(treeInstance);
    home.collapsable(root, treeInstance);
  });
}

window.onload = function() {
  document.querySelector('.file-input').addEventListener('change', getFileName);
}

const getFileName = (event) => {
  const files = event.target.files;
  const fileName = files[0].name;
  buildHirearchy(`./data/${fileName}`)
}

