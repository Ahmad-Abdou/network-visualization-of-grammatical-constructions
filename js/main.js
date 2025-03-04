const container = document.querySelector('.tree-container')
const home = new Home('#tree-container', container.clientWidth, container.clientHeight)

window.onload = function() {
  document.querySelector('.file-input').addEventListener('change', getFileName);
  
  // Add ability to switch between trees if needed
  document.addEventListener('keydown', (event) => {
    // Optional: Add keyboard shortcuts to switch between trees
    if (event.key >= '1' && event.key <= '9') {
      const treeIndex = parseInt(event.key) - 1;
      if (home.treeInstances[treeIndex]) {
        // Focus on the selected tree
        home.treeInstances.forEach((tree, i) => {
          const opacity = i === treeIndex ? 1.0 : 0.3;
          tree.container.style("opacity", opacity);
        });
      }
    }
    // Press 0 to show all trees
    if (event.key === '0') {
      home.treeInstances.forEach(tree => {
        tree.container.style("opacity", 1.0);
      });
    }
  });
}

const getFileName = (event) => {
  const files = event.target.files;
  const fileName = files[0].name;
  home.buildHirearchy(`./data/${fileName}`)
}

function notifyMessage(text) {
  const notification = document.getElementById('notification');
  notification.textContent = text
  notification.style.transform = 'translate(0, 50px)'
  setTimeout(() => {
    notification.style.transform = 'translate(0, -290px)'
  }, 2000)
}
