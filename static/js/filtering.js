let minYearSliderValue = document.getElementById('min-year-slider')
let maxYearSliderValue = document.getElementById('max-year-slider')
let minYearFilterValue = document.querySelector('.min-year-filter-value')
let maxYearFilterValue = document.querySelector('.max-year-filter-value')
let years = new Set()
let frequencySliderValue = document.querySelector('.frequency-filter-slide')
let frequencyFilterValue = document.querySelector('.frequency-filter-value')
let frequencies = new Set()
let yearIsChanged = false
let frequencyIsChanged = false

const filterByFrequency = (root, treeInstance) => {
  d3.select('.frequency-filter-slide').on(`input.tree-${treeInstance.id}`, (e) => {
    frequencyFilterValue.textContent = e.target.value;
    frequencyIsChanged = true;
    yearIsChanged = false;
    treeInstance.update(null, root);
  });
}

const filterByYear = (root, treeInstance) => {
  d3.select('.min-year-filter-slide').on(`input.tree-${treeInstance.id}`, (e) => {
    minYearFilterValue.textContent = e.target.value;
    yearIsChanged = true;
    frequencyIsChanged = false;
    treeInstance.update(null, root);
  });
  
  d3.select('.max-year-filter-slide').on(`input.tree-${treeInstance.id}`, (e) => {
    maxYearFilterValue.textContent = e.target.value;
    yearIsChanged = true;
    frequencyIsChanged = false;
    treeInstance.update(null, root);
  });
}