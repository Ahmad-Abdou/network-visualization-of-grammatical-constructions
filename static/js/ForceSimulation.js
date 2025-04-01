class ForceSimulation {
  constructor(id, width, height) {
    this.id = id
    this.width = width
    this.height = height
    this.margin = {top:50, right : 50, bottom: 50, left: 50}
    this.svg = d3.select('.tree-container')
    .append('svg').attr('id', this.id)
    .attr('width', this.width)
    .attr('height', this.height)
    this.nodeGroup = null
    this.zoomGroups = new Map()
    this.NodeValues = null
    this.degree = null
    this.in_degree = null
    this.out_degree = null
    this.simulation = null
    this.allNodes = []
    this.allLinks = []
  }

  forceSimulation(root) {
    d3.select('#node-group').remove()
    this.nodeGroup = this.svg.append('g').attr('id', 'node-group')

    const nodes = root.nodes
    const links = root.links
    
    this.allNodes = nodes
    this.allLinks = links
    
    this.initializeFilters(nodes)
    
    this.simulation = d3.forceSimulation(nodes)
      .force("collide", d3.forceCollide(30).iterations(20))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      .force("link", d3.forceLink(links).id(d => d.name).distance(50).strength(1))
      .force("charge", d3.forceManyBody().distanceMin(200).distanceMax(1000).strength(-1))
      .stop()
  
      const numIterations = nodes.length > 100 ? 100 : 300
      for (let i = 0 ;i < numIterations ;i++) {
        this.simulation.tick()
      }

    const selected_option_degree = document.querySelector('.degree-selection')
    selected_option_degree.addEventListener('change', () => {
      this.updateVisualization()
    })
    
    this.createVisualization(nodes, links)
    
    this.setupFilterListeners(root)

    // return this.nodeGroup.node()
    return this.simulation
  }

  initializeFilters(nodes) {
    const nodeYears = new Set()
    const nodeFrequencies = new Set()
    
    nodes.forEach(node => {
      if (node.year) nodeYears.add(parseInt(node.year))
      if (node.frequency) nodeFrequencies.add(parseInt(node.frequency))
    })
    
    nodeYears.forEach(year => years.add(year))
    nodeFrequencies.forEach(freq => frequencies.add(freq))
    
    if (nodeYears.size > 0) {
      const minYear = Math.min(...nodeYears)
      const maxYear = Math.max(...nodeYears)
      
      minYearSliderValue.min = minYear
      minYearSliderValue.max = maxYear
      maxYearSliderValue.min = minYear
      maxYearSliderValue.max = maxYear
      
      minYearSliderValue.value = minYear
      maxYearSliderValue.value = maxYear
      
      minYearFilterValue.textContent = minYear
      maxYearFilterValue.textContent = maxYear
    }
    
    if (nodeFrequencies.size > 0) {
      const minFreq = Math.min(...nodeFrequencies)
      const maxFreq = Math.max(...nodeFrequencies)
      
      frequencySliderValue.min = minFreq
      frequencySliderValue.max = maxFreq
      frequencySliderValue.value = minFreq
      frequencyFilterValue.textContent = minFreq
    }
  }

  setupFilterListeners(root) {
    d3.select('.min-year-filter-slide').on(`input.force`, (e) => {
      minYearFilterValue.textContent = e.target.value
      yearIsChanged = true
      frequencyIsChanged = false
      this.applyFilters()
    })
    
    d3.select('.max-year-filter-slide').on(`input.force`, (e) => {
      maxYearFilterValue.textContent = e.target.value
      yearIsChanged = true
      frequencyIsChanged = false
      this.applyFilters()
    })
    
    d3.select('.frequency-filter-slide').on(`input.force`, (e) => {
      frequencyFilterValue.textContent = e.target.value
      frequencyIsChanged = true
      yearIsChanged = false
      this.applyFilters()
    })
  }

  applyFilters() {
    let filteredNodes = this.allNodes
    
    if (yearIsChanged) {
      const minYear = parseInt(minYearSliderValue.value)
      const maxYear = parseInt(maxYearSliderValue.value)
      
      filteredNodes = filteredNodes.filter(node => 
        node.year && parseInt(node.year) >= minYear && parseInt(node.year) <= maxYear
      )
    }
    
    if (frequencyIsChanged) {
      const minFreq = parseInt(frequencySliderValue.value)
      
      filteredNodes = filteredNodes.filter(node => 
        node.frequency && parseInt(node.frequency) >= minFreq
      )
    }
    
    const filteredNodeNames = new Set(filteredNodes.map(node => node.name))
    
    const filteredLinks = this.allLinks.filter(link => 
      filteredNodeNames.has(typeof link.source === 'object' ? link.source.name : link.source) && 
      filteredNodeNames.has(typeof link.target === 'object' ? link.target.name : link.target)
    )
    
    this.updateVisualization(filteredNodes, filteredLinks)
  }

  updateVisualization(filteredNodes = this.allNodes, filteredLinks = this.allLinks) {
    d3.select('#nodes').remove()
    d3.select('#links').remove()
    
    this.createVisualization(filteredNodes, filteredLinks)
    
    this.simulation.nodes(filteredNodes)
    this.simulation.force("link").links(filteredLinks)
    this.simulation.alpha(0.3).restart()
  }

  createVisualization(nodes, links) {
    const selected_option_degree = document.querySelector('.degree-selection')
    
    const link = this.nodeGroup.append("g")
      .attr("stroke", "#999")
      .attr('id', 'links')
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)

    const node = this.nodeGroup.append("g")
      .attr('id', 'nodes')
      .attr("fill", "crimson")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("fill", d => this.calculateNodeColor(d))
      .attr("stroke", d => d.children ? null : "#fff")
      .attr("r", (d) => {
        if (selected_option_degree.value === 'degree'){
          return this.calculateDegree(d)
        }else if (selected_option_degree.value === 'in_degree'){
          return this.calculateInDegree(d)
        }else if (selected_option_degree.value === 'out_degree'){
          return this.calculateOutDegree(d)
        }
      })
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .call(this.drag())
    

      this.showLabels(nodes)

      
    node.append("title")
      .text(d => {
        return`Name: ${d.name}\n Degree: ${this.degree[d.name]}\n In_degree: ${this.in_degree[d.name]}\n Out_degree: ${this.out_degree[d.name]}\n Year: ${d.year}\n Frequency: ${d.frequency}`
      })

    this.simulation.on("tick", () => {
      link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y)
  
      node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
    })

    this.nodeGroup.call(d3.zoom()
      .extent([[0, 0], [this.width, this.height]])
      .scaleExtent([-5, 8])
      .on("zoom", zoomed))

    function zoomed({transform}) {
      node.attr("transform", transform)
      link.attr("transform", transform)
    }
    
    this.setupSearch(node)
  }

  setupSearch(nodeSelection) {
    const updateSearchDisplay = () => {
      const wordSearch = document.getElementById('searchWord').value.toLowerCase()
      const yearSearch = document.getElementById('searchYear').value.toLowerCase()
      const frequencySearch = document.getElementById('searchFrequency').value.toLowerCase()
      
      nodeSelection.each(function(d) {
        const node = d3.select(this)
        const wordMatch = wordSearch && d.name.toLowerCase() === wordSearch
        const yearMatch = yearSearch && d.year?.toString().toLowerCase() === yearSearch
        const frequencyMatch = frequencySearch && d.frequency?.toString().toLowerCase() === frequencySearch
        
        const matchCount = [wordMatch, yearMatch, frequencyMatch].filter(Boolean).length
        
        let color
        if (matchCount >= 2) {
          color = overlapColor
        } else if (matchCount === 1) {
          if (wordMatch) {
            color = wordColor
          } else if (yearMatch) {
            color = yearColor
          } else if (frequencyMatch) {
            color = frequencyColor
          }
        } else {
          color = d3.select(this).attr('original-fill') || d3.select(this).attr('fill')
        }
        node.transition().duration(750)
          .attr('fill', color)
          // .attr('r', matchCount ? 10 : node.attr('original-r') || node.attr('r'))
      })
    }
    
    nodeSelection.each(function() {
      const node = d3.select(this)
      node.attr('original-fill', node.attr('fill'))
      node.attr('original-r', node.attr('r'))
    })
    
    document.getElementById('searchWord').addEventListener('input', updateSearchDisplay)
    document.getElementById('searchYear').addEventListener('input', updateSearchDisplay)
    document.getElementById('searchFrequency').addEventListener('input', updateSearchDisplay)
  }

  drag = () => {
    const sim = this.simulation
  
    function dragstarted(event, d) {
      if (!event.active) sim.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }
    
    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
    }
    
    function dragended(event, d) {
      if (!event.active) sim.alphaTarget(0)
      d.fx = null
      d.fy = null
    }
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
  }

  calculatePredominantNode(node){
    const nodeDegree = this.degree[node.name]
    if (nodeDegree === undefined) return null
    const values = Object.values(this.degree)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
  
    const scale = d3.scaleLinear().domain([minValue, maxValue]).range([3, 25])
  
    return scale(nodeDegree)
  }
  calculateDegree(node){
    const nodeDegree = this.degree[node.name]
    if (nodeDegree === undefined) return null
    const values = Object.values(this.degree)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
  
    const scale = d3.scaleLinear().domain([minValue, maxValue]).range([3, 25])
    return scale(nodeDegree)
  }
  calculateInDegree(node){
    const nodeDegree = this.in_degree[node.name]
    if (nodeDegree === undefined) return null
    const values = Object.values(this.in_degree)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
  
    const scale = d3.scaleLinear().domain([minValue, maxValue]).range([3, 25])

    return scale(nodeDegree)
  }
  calculateOutDegree(node){
    const nodeDegree = this.out_degree[node.name]
    if (nodeDegree === undefined) return null
    const values = Object.values(this.out_degree)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
  
    const scale = d3.scaleLinear().domain([minValue, maxValue]).range([3, 25])
  
    return scale(nodeDegree)
  }
  calculateNodeColor(node){
    const nodeDegree = this.degree[node.name]
    if (nodeDegree === undefined) return null

    const values = Object.values(this.degree)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)

    const colorScale = d3.scaleSequential(d3.interpolateRainbow).domain([minValue, maxValue])
    return colorScale(nodeDegree)
  }

  showLabels(nodes) {
    
    const labelCheckBox = document.getElementById('labels')
    labelCheckBox.addEventListener('change', (e) => {
      if(e.target.checked) {
        const labelGroup = d3.select('#node-group').append('g').attr('id', 'labels-group')

        labelGroup.selectAll("text")
        .data(nodes)
        .join("text")
        .text(d => d.name)
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr('font-size', 12)
        .attr('text-anchor', 'middle')
        .attr('font-weight', '700')
        .call(this.drag());
      } else {
        d3.select("#labels-group").remove();
      }


      
        
        // label.each(function(d) {
        //   const text = d3.select(this)
        //   const wordMatch = wordSearch && d.name.toLowerCase() === wordSearch
        //   const yearMatch = yearSearch && d.year?.toString().toLowerCase() === yearSearch
        //   const frequencyMatch = frequencySearch && d.frequency?.toString().toLowerCase() === frequencySearch
          
        //   const matchCount = [wordMatch, yearMatch, frequencyMatch].filter(Boolean).length
          
        //   let color
        //   if (matchCount >= 2) {
        //     color = overlapColor
        //   } else if (matchCount === 1) {
        //     if (wordMatch) {
        //       color = wordColor
        //     } else if (yearMatch) {
        //       color = yearColor
        //     } else if (frequencyMatch) {
        //       color = frequencyColor
        //     }
        //   } else {
        //     color = d3.select(this).attr('original-fill') || d3.select(this).attr('fill')
        //   }
        //   text.transition().duration(750)
        //     .attr('fill', color)
        //     .attr('font-size', d => d.name !== wordSearch ? 12 : 20)
        // })
      
    })
  }
}

