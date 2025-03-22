let wordColor = '#FFB200'
let yearColor = '#3d348b'
let frequencyColor = '#8d0801'
const overlapColor = 'green'

const wordContainer = document.getElementById('word-color')
wordContainer.value = wordColor
wordContainer.addEventListener('input', (e) => {
  wordColor = e.target.value
  updateAllFilters()
});

const yearContainer = document.getElementById('year-color');
yearContainer.value = yearColor;
yearContainer.addEventListener('input', (e) => {
  yearColor = e.target.value;
  updateAllFilters();
});

const frequencyContainer = document.getElementById('frequency-color');
frequencyContainer.value = frequencyColor;
frequencyContainer.addEventListener('input', (e) => {
  frequencyColor = e.target.value;
  updateAllFilters();
});


function search(){
  document.getElementById('searchWord').addEventListener('input', updateAllFilters);
  document.getElementById('searchYear').addEventListener('input', updateAllFilters);
  document.getElementById('searchFrequency').addEventListener('input', updateAllFilters);
}


function updateAllFilters() {
  const wordSearch = document.getElementById('searchWord').value.toLowerCase();
  const yearSearch = document.getElementById('searchYear').value.toLowerCase();
  const frequencySearch = document.getElementById('searchFrequency').value.toLowerCase();

  d3.selectAll('.tree-group').each(function(d) {
    const node = d3.select(this);
    const textElem = node.select('text');
    const circleElem = node.select('circle');

    const wordMatch = wordSearch && d.data.name.toLowerCase() === wordSearch;
    const yearMatch = yearSearch && d.data.year?.toString().toLowerCase() === yearSearch;
    const frequencyMatch = frequencySearch && d.data.frequency?.toString().toLowerCase() === frequencySearch;

    const matchCount = [wordMatch, yearMatch, frequencyMatch].filter(Boolean).length

    let color
    if (matchCount >= 2) {
      color = overlapColor;
    } else if (matchCount === 1) {
      if (wordMatch) {
        color = wordColor
      }
      else if (yearMatch) {
        color = yearColor
      }
      else if (frequencyMatch){
        color = frequencyColor
      }
    } else {
      color = d._children ? "#555" : "#999"
    }

    textElem.transition().duration(1250)
      .attr('fill', color)
      .attr('font-size', matchCount ? '15px' : (d.depth === 0 ? '12px' : '10px'))
      .attr('transform', d => d._children ? 'translate(-5, 0)' : 'translate(5, 0)');

    circleElem.transition().duration(1250)
      .attr('fill', color)
      .attr('r', matchCount ? '7' : (d.depth === 0 ? 7 : 2.5));
  });

  wordContainer.style.visibility = wordSearch ? 'visible' : 'hidden';
  yearContainer.style.visibility = yearSearch ? 'visible' : 'hidden';
  frequencyContainer.style.visibility = frequencySearch ? 'visible' : 'hidden';
}