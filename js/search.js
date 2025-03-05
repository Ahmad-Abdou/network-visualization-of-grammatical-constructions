let wordColor = '#FFB200';
let yearColor = '#3d348b';
let frequencyColor = '#8d0801';

const wordContainer = document.getElementById('word-color');
wordContainer.value = wordColor;
wordContainer.addEventListener('input', (e) => {
  wordColor = e.target.value;
  updateWordMatches();
});

const yearContainer = document.getElementById('year-color');
yearContainer.value = yearColor;
yearContainer.addEventListener('input', (e) => {
  yearColor = e.target.value;
  updateYearMatches();
});

const frequencyContainer = document.getElementById('frequency-color');
frequencyContainer.value = frequencyColor;
frequencyContainer.addEventListener('input', (e) => {
  frequencyColor = e.target.value;
  updateFrequencyMatches();
});

function updateWordMatches() {
  const searchedText = document.getElementById('searchWord').value.toLowerCase();

  d3.selectAll('.tree-group').each(function(d) {
    const nodeText = d.data.name.toLowerCase();
    const selectedElementText = d3.select(this).select('text');
    const selectedElementCircle = d3.select(this).select('circle');

    if (searchedText === nodeText) {
      selectedElementText.transition().duration(1250)
        .attr('fill', wordColor)
        .attr('font-size', '15px')
        .attr('transform', d => d._children ? 'translate(-5, 0)' : 'translate(5, 0)');

      selectedElementCircle.transition().duration(1250)
        .attr('fill', wordColor)
        .attr('r', '7');

      wordContainer.style.visibility = 'visible';
    } else {
      selectedElementText.transition()
        .attr('fill', d => d._children ? "#555" : "#999")
        .attr('font-size', d => d.depth === 0 ? '12px' : '10px');

      selectedElementCircle.transition()
        .attr('fill', d => d._children ? "#555" : "#999")
        .attr('r', d => d.depth === 0 ? 7 : 2.5);
    }
  });
}

function updateYearMatches() {
  const searchedText = document.getElementById('searchYear').value.toLowerCase();

  d3.selectAll('.tree-group').each(function(d) {
    const nodeYear = d.data.year ? d.data.year.toString().toLowerCase() : "";
    const selectedElementText = d3.select(this).select('text');
    const selectedElementCircle = d3.select(this).select('circle');

    if (searchedText === nodeYear) {
      selectedElementText.transition().duration(1250)
        .attr('fill', yearColor)
        .attr('font-size', '15px')
        .attr('transform', d => d._children ? 'translate(-5, 0)' : 'translate(5, 0)');

      selectedElementCircle.transition().duration(1250)
        .attr('fill', yearColor)
        .attr('r', '7');

      yearContainer.style.visibility = 'visible';
    } else {
      selectedElementText.transition()
        .attr('fill', d => d._children ? "#555" : "#999")
        .attr('font-size', d => d.depth === 0 ? '12px' : '10px');

      selectedElementCircle.transition()
        .attr('fill', d => d._children ? "#555" : "#999")
        .attr('r', d => d.depth === 0 ? 7 : 2.5);
    }
  });
}

function updateFrequencyMatches() {
  const searchedText = document.getElementById('searchFrequency').value.toLowerCase();

  d3.selectAll('.tree-group').each(function(d) {
    const nodeFrequency = d.data.frequency ? d.data.frequency.toString().toLowerCase() : "";
    const selectedElementText = d3.select(this).select('text');
    const selectedElementCircle = d3.select(this).select('circle');

    if (searchedText === nodeFrequency) {
      selectedElementText.transition().duration(1250)
        .attr('fill', frequencyColor)
        .attr('font-size', '15px')
        .attr('transform', d => d._children ? 'translate(-5, 0)' : 'translate(5, 0)');

      selectedElementCircle.transition().duration(1250)
        .attr('fill', frequencyColor)
        .attr('r', '7');

      frequencyContainer.style.visibility = 'visible';
    } else {
      selectedElementText.transition()
        .attr('fill', d => d._children ? "#555" : "#999")
        .attr('font-size', d => d.depth === 0 ? '12px' : '10px');

      selectedElementCircle.transition()
        .attr('fill', d => d._children ? "#555" : "#999")
        .attr('r', d => d.depth === 0 ? 7 : 2.5);
    }
  });
}

const search = () => {
  d3.select('#searchWord').on('input', () => {
    updateWordMatches();
  });
  d3.select('#searchYear').on('input', () => {
    updateYearMatches();
  });
  d3.select('#searchFrequency').on('input', () => {
    updateFrequencyMatches();
  });
};