const search = () => {
  d3.select('#searchField').on('input', (e) => {
    const searchedText = e.target.value.toLowerCase()
    d3.selectAll('.tree-group').each(function(d) {
      const nodeText = d.data.name.toLowerCase()
      const selectedElementText = d3.select(this).select('text')
      const selectedElementCircle = d3.select(this).select('circle')
      selectedElementText.transition().attr('fill',d => d._children ? "#555" : "#999").attr('font-size', d => d.depth === 0 ? '12px' : '10px')
      selectedElementCircle.transition().attr('fill',d => d._children ? "#555" : "#999").attr('r',d => d.depth === 0 ? 8 : 2.5)

      if(searchedText === nodeText) {
        selectedElementText.transition().duration(1250).attr('fill','#0080FF').attr('font-size', '18px').attr('transform',  d => d._children  ?'translate(-5, 0)': 'translate(5, 0)')
        selectedElementCircle.transition().duration(1250).attr('fill','#0080FF').attr('r','8')
      }
    })
  })
}