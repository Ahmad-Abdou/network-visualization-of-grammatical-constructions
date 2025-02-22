
const container = document.querySelector('.container')
const home = new Home('#container', container.clientWidth, container.clientHeight)

window.onload = function() {
  document.querySelector('.file-input').addEventListener('change', getFileName);
}
const getFileName = (event) => {
  const files = event.target.files;
  const fileName = files[0].name;
  home.buildHirearchy(`./data/${fileName}`)
}

