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
    this.layoutType = 'tree'
    this.lowDeg = 0
    this.maxDeg = 0
    this.Sorted_degree = new Set()
    this.selected_option_degree = document.querySelector('.degree-selection')
    this.labelCheckBox = document.getElementById('labels')

  }

  reingoldTilfordLayout(nodes, links, rootNode = null, levelGap = 60, siblingGap = 40) {
    const graph = new Map()
    const inDegree = new Map()
    
    nodes.forEach(node => {
      graph.set(node.name, [])
      inDegree.set(node.name, 0)
    })
    
    links.forEach(link => {
      const source = typeof link.source === 'object' ? link.source.name : link.source
      const target = typeof link.target === 'object' ? link.target.name : link.target
      
      if (graph.has(source) && graph.has(target)) {
        graph.get(source).push(target)
        inDegree.set(target, (inDegree.get(target) || 0) + 1)
      }
    })
    
    if (!rootNode) {
      for (const [nodeName, degree] of inDegree.entries()) {
        if (degree === 0) {
          rootNode = nodeName
          break
        }
      }
    }
    
    if (!rootNode) {
      let maxOutDegree = -1;
      for (const [nodeName, children] of graph.entries()) {
        if (children.length > maxOutDegree) {
          maxOutDegree = children.length;
          rootNode = nodeName;
        }
      }
    }
    
    if (!rootNode && nodes.length > 0) {
      rootNode = nodes[0].name;
    }
    
    const positions = new Map()
    let nextX = 0
    
    const visited = new Set()
    const maxDepth = 100
    
    const layoutNode = (nodeName, depth) => {
      if (visited.has(nodeName) || depth > maxDepth) {
        return;
      }
      visited.add(nodeName);
      
      const children = graph.get(nodeName) || []
      
      if (children.length === 0) {
        positions.set(nodeName, { x: nextX, y: depth * levelGap })
        nextX += siblingGap
      } else {
        for (const child of children) {
          if (!visited.has(child)) {
            layoutNode(child, depth + 1)
          }
        }
        
        let sumX = 0
        let count = 0
        
        for (const child of children) {
          if (positions.has(child)) {
            sumX += positions.get(child).x
            count++
          }
        }
        
        const xPos = count > 0 ? sumX / count : nextX
        
        positions.set(nodeName, { 
          x: xPos, 
          y: depth * levelGap 
        })
        
        if (count === 0) {
          nextX += siblingGap
        }
      }
    }
    
    if (nodes.length > 1000) {
      const angleStep = (2 * Math.PI) / nodes.length
      const radius = Math.min(this.width, this.height) * 0.4
      
      nodes.forEach((node, i) => {
        const angle = i * angleStep
        node.x = this.width / 2 + radius * Math.cos(angle)
        node.y = this.height / 2 + radius * Math.sin(angle)
      })
      
      return nodes
    }
    
    try {
      if (rootNode) {
        layoutNode(rootNode, 0)
      
        let minX = Infinity
        let maxX = -Infinity
        
        positions.forEach(pos => {
          minX = Math.min(minX, pos.x)
          maxX = Math.max(maxX, pos.x)
        })
        
        const centerOffset = this.width / 2 - (maxX + minX) / 2
        
        const maxAllowedWidth = this.width * 0.8
        let scale = 1;
        if ((maxX - minX) > maxAllowedWidth) {
          scale = maxAllowedWidth / (maxX - minX);
        }
        
        nodes.forEach(node => {
          if (positions.has(node.name)) {
            const pos = positions.get(node.name)
            node.x = (pos.x * scale) + centerOffset
            node.y = pos.y + this.margin.top + 50
            
            const maxX = this.width - this.margin.right;
            const minX = this.margin.left;
            const maxY = this.height - this.margin.bottom;
            const minY = this.margin.top;
            
            node.x = Math.max(minX, Math.min(maxX, node.x));
            node.y = Math.max(minY, Math.min(maxY, node.y));
          } else {
            node.x = this.width / 2 + (Math.random() - 0.5) * 100
            node.y = this.height / 2 + (Math.random() - 0.5) * 100
          }
        })
      }
    } catch (e) {
      
      const cols = Math.ceil(Math.sqrt(nodes.length))
      const gridSize = Math.min(this.width, this.height) * 0.8 / cols
      
      nodes.forEach((node, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        node.x = this.margin.left + col * gridSize + gridSize/2
        node.y = this.margin.top + row * gridSize + gridSize/2
      })
    }
    
    return nodes
  }
  forceSimulation(root) {
    d3.select('#node-group').remove()
    this.nodeGroup = this.svg.append('g').attr('id', 'node-group')

    const nodes = root.nodes
    const links = root.links
    
    this.allNodes = nodes
    this.allLinks = links
    
    this.initializeFilters(nodes)
    
    if (this.layoutType === 'tree') {
      this.reingoldTilfordLayout(nodes, links)
    }
    
    this.simulation = d3.forceSimulation(nodes)
      .force("collide", d3.forceCollide(30).iterations(2))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      .force("link", d3.forceLink(links).id(d => d.name).distance(150).strength(0.1))
      .force("charge", d3.forceManyBody().strength(-100))
      .alphaDecay(0.05)
      

    if (this.layoutType === 'tree') {
      this.simulation.stop();
      for (let i = 0; i < 1; i++) {
        this.simulation.tick();
      }
    } else {
      this.simulation.stop();
      const numIterations = nodes.length > 100 ? 100 : 300
      for (let i = 0; i < numIterations; i++) {
        this.simulation.tick()
      }
    }

    this.selected_option_degree.addEventListener('change', () => {
      this.updateVisualization()
    })
    
    this.createVisualization(nodes, links)
    
    this.setupFilterListeners(root)

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
    
    if (this.layoutType === 'tree') {
      this.reingoldTilfordLayout(filteredNodes, filteredLinks)
    } else {
      if (!this.simulation) {
        this.simulation = d3.forceSimulation(filteredNodes)
          .force("collide", d3.forceCollide(30).iterations(20))
          .force("center", d3.forceCenter(this.width / 2, this.height / 2))
          .force("link", d3.forceLink(filteredLinks).id(d => d.name).distance(150).strength(1))
          .force("charge", d3.forceManyBody().distanceMin(200).distanceMax(1000).strength(-1))
          .stop()
      } else {
        this.simulation.nodes(filteredNodes)
        this.simulation.force("link").links(filteredLinks)
      }
      
      const numIterations = filteredNodes.length > 100 ? 100 : 300
      for (let i = 0; i < numIterations; i++) {
        this.simulation.tick()
      }
    }
    
    this.createVisualization(filteredNodes, filteredLinks)
    
    if (this.simulation) {
      this.simulation.nodes(filteredNodes)
      this.simulation.force("link").links(filteredLinks)
      this.simulation.alpha(0.3).restart()
    }
  }
  createVisualization(nodes, links) {
    
    this.linkGroup = this.nodeGroup.append("g").attr('id', 'links')
    this.Sorted_degree.clear()

    this.nodeMap = new Map()
    this.nodeRadiusMap = new Map()
    const node = this.nodeGroup.append("g")
      .attr('id', 'nodes')
      .attr("fill", "crimson")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("fill", d => {
        if (this.selected_option_degree.value === 'degree' || this.selected_option_degree.value === 'in_degree' || this.selected_option_degree.value === 'out_degree') {
          return this.calculateNodeColor(d)
        } else {
          return '#ADBCE6'
        }

      })
      .attr("stroke", d => d.children ? null : "#fff")
      .attr("r", (d) => {
        let radius
        d3.select('#legend-group').remove()
        if (this.selected_option_degree.value === 'degree'){
          radius = this.calculateDegree(d)
        } else if (this.selected_option_degree.value === 'in_degree'){
          radius = this.calculateInDegree(d)
        } else if (this.selected_option_degree.value === 'out_degree'){
          radius = this.calculateOutDegree(d)
        } else {
          radius = 20
        }
        
        this.nodeRadiusMap.set(d.name, radius)
        this.nodeMap.set(d.name, d) 
        return radius
      })
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .call(this.drag())

    this.createLegend()
    const linkEndpoints = new Set()
    
    const linkFrequencies = []
    
    links.forEach(link => {
      let sourceNode = typeof link.source === 'string' ? this.nodeMap.get(link.source) : link.source
      let targetNode = typeof link.target === 'string' ? this.nodeMap.get(link.target) : link.target
      
      if (sourceNode && targetNode) {
        const sourceFreq = sourceNode.frequency ? parseInt(sourceNode.frequency) : 0
        const targetFreq = targetNode.frequency ? parseInt(targetNode.frequency) : 0
        const combinedFreq = sourceFreq + targetFreq
        linkFrequencies.push(combinedFreq)
      }
    })
    
    const minLinkFreq = Math.min(...linkFrequencies.filter(f => f > 0), 1)
    const maxLinkFreq = Math.max(...linkFrequencies, 1)
    const linkWidthScale = d3.scaleLinear()
      .domain([minLinkFreq, maxLinkFreq])
      .range([1, 3])
    
    const showFrequencies = document.getElementById('frequencies').checked
    
    links.forEach((link, i) => {
      let sourceName, targetName
      let sourceNode, targetNode
      
      if (typeof link.source === 'string') {
        sourceName = link.source
        sourceNode = this.nodeMap.get(sourceName)
      } else {
        sourceName = link.source.name
        sourceNode = link.source
      }
      
      if (typeof link.target === 'string') {
        targetName = link.target
        targetNode = this.nodeMap.get(targetName)
      } else {
        targetName = link.target.name
        targetNode = link.target
      }
      
      const linkKey = `${sourceName}-${targetName}`
      
      linkEndpoints.add(linkKey)
      
      const linkElement = this.linkGroup.append("g")
        .attr("class", "link-group")
        .attr("data-source", sourceName)
        .attr("data-target", targetName)
      
      linkElement.datum({
        source: sourceName,
        target: targetName,
        element: linkElement
      })
      
      const sourceFreq = sourceNode.frequency ? parseInt(sourceNode.frequency) : 0
      const targetFreq = targetNode.frequency ? parseInt(targetNode.frequency) : 0
      const combinedFreq = sourceFreq + targetFreq
      
      const linkWidth = linkWidthScale(combinedFreq)
      
      linkElement.append("line")
        .attr("stroke", "#555")
        .attr("stroke-width", linkWidth)
        .attr("x1", sourceNode.x)
        .attr("y1", sourceNode.y)
        .attr("x2", targetNode.x)
        .attr("y2", targetNode.y)
      
      linkElement.append("text")
        .attr("class", "link-frequency")
        .attr("text-anchor", "middle")
        .attr("dy", -5)
        .text(combinedFreq)
        .attr("font-size", "10px")
        .attr("fill", "#555")
        .style("visibility", showFrequencies ? "visible" : "hidden")
      
      linkElement.append("polygon")
        .attr("points", "0,-6 12,0 0,6")
        .attr("data-source", sourceName)
        .attr("data-target", targetName)
      
      link.combinedFrequency = combinedFreq
      
      this.updateLinkPosition(linkElement, sourceNode, targetNode)
      
    })

    this.showLabels(nodes)
    
    node.append("title")
      .text(d => {
        return`Name: ${d.name}\n Degree: ${this.degree[d.name]}\n In_degree: ${this.in_degree[d.name]}\n Out_degree: ${this.out_degree[d.name]}\n Year: ${d.year}\n Frequency: ${d.frequency}`
      })

    this.simulation.on("tick", () => {
      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
      
      this.updateAllLinks()
      
      d3.select("#labels-group").selectAll("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y - this.nodeRadiusMap.get(d.name))
    })

    this.nodeGroup.call(d3.zoom()
      .extent([[0, 0], [this.width, this.height]])
      .scaleExtent([-5, 8])
      .on("zoom", ({transform}) => {
        node.attr("transform", transform)
        this.linkGroup.attr("transform", transform)
        
        const labels = d3.select("#labels-group")
        if (!labels.empty()) {
          labels.attr("transform", transform)
        }
      }))
    
    this.setupFrequencyToggle()
    this.setupSearch(node)
  }

  updateAllLinks() {
    this.linkGroup.selectAll("g.link-group").each((d) => {
      const sourceNode = this.nodeMap.get(d.source)
      const targetNode = this.nodeMap.get(d.target)
      if (sourceNode && targetNode) {
        this.updateLinkPosition(d.element, sourceNode, targetNode)
      } 
    })
  }
  updateLinkPosition(linkElement, sourceNode, targetNode) {
    if (!sourceNode || !targetNode) return
    
    const targetName = typeof targetNode === 'string' ? targetNode : targetNode.name
    
    const line = linkElement.select("line")
    const arrow = linkElement.select("polygon")
    const freqText = linkElement.select(".link-frequency")
    
    const sourceX = sourceNode.x
    const sourceY = sourceNode.y
    const targetX = targetNode.x
    const targetY = targetNode.y
    
    line
      .attr("x1", sourceX)
      .attr("y1", sourceY)
      .attr("x2", targetX)
      .attr("y2", targetY)
    
    const dx = targetX - sourceX
    const dy = targetY - sourceY
    const dist = Math.sqrt(dx * dx + dy * dy)
    
    if (dist > 0) {
      const nodeRadius = this.nodeRadiusMap.get(targetName) || 15
      
      const angle = Math.atan2(dy, dx) * 180 / Math.PI
      const offset = nodeRadius + 12
      const arrowX = targetX - (dx / dist * offset)
      const arrowY = targetY - (dy / dist * offset)
      
      arrow.attr("transform", `translate(${arrowX},${arrowY}) rotate(${angle})`)
      
      const textX = sourceX + dx / 2
      const textY = sourceY + dy / 2
      freqText.attr("x", textX).attr("y", textY)
    }
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
    const self = this
  
    function dragstarted(event, d) {
      if (!event.active) sim.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }
    
    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
      
      d.x = event.x
      d.y = event.y
      
      self.updateAllLinks()
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
  
    const scale = d3.scaleLinear().domain([minValue, maxValue]).range([8, 35])
  
    return scale(nodeDegree)
  }
  calculateDegree(node){
    const nodeDegree = this.degree[node.name]
    if (nodeDegree === undefined) return null
    const values = Object.values(this.degree)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
  
    const scale = d3.scaleLinear().domain([minValue, maxValue]).range([8, 35])
    return scale(nodeDegree)
  }
  calculateInDegree(node){
    const nodeDegree = this.in_degree[node.name]
    if (nodeDegree === undefined) return null
    const values = Object.values(this.in_degree)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
  
    const scale = d3.scaleLinear().domain([minValue, maxValue]).range([8, 35])

    return scale(nodeDegree)
  }
  calculateOutDegree(node){
    const nodeDegree = this.out_degree[node.name]
    if (nodeDegree === undefined) return null
    const values = Object.values(this.out_degree)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
  
    const scale = d3.scaleLinear().domain([minValue, maxValue]).range([8, 35])
  
    return scale(nodeDegree)
  }
  calculateNodeColor(node){
    let nodeDegree = null
    let values = null
    if (this.selected_option_degree.value === 'degree') {
      nodeDegree = this.degree[node.name]
      this.Sorted_degree.add(nodeDegree)
      values = Object.values(this.degree)
    } else if (this.selected_option_degree.value === 'in_degree') { 
      nodeDegree = this.in_degree[node.name]
      this.Sorted_degree.add(nodeDegree)
      values = Object.values(this.in_degree)
    } else if (this.selected_option_degree.value === 'out_degree') { 
      nodeDegree = this.out_degree[node.name]
      this.Sorted_degree.add(nodeDegree)
      values = Object.values(this.out_degree)
    }

    const sorted = values.sort()
    const minValue = Math.min(...sorted)
    const maxValue = Math.max(...sorted)
    this.lowDeg = minValue
    this.maxDeg = maxValue
    const colorScale = d3.scaleSequential(d3.interpolateBrBG).domain([minValue, maxValue])
    return colorScale(nodeDegree)
  }
  showLabels(nodes) {
    
    this.labelCheckBox.addEventListener('change', (e) => {
      if(e.target.checked) {
        d3.select("#labels-group").remove()
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
        .style('text-shadow', '0 0 3px white, 0 0 3px white, 0 0 3px white, 0 0 3px white')
        .call(this.drag())
      } else {
        d3.select("#labels-group").remove()
      }
    })
  }
  setupFrequencyToggle() {
    const frequencyCheckBox = document.getElementById('frequencies')
    frequencyCheckBox.addEventListener('change', (e) => {
      const visibility = e.target.checked ? "visible" : "hidden"
      this.linkGroup.selectAll(".link-frequency")
        .style("visibility", visibility)
    })
  }
  createLegend() {
    if (this.selected_option_degree.value === 'degree' || this.selected_option_degree.value === 'in_degree' || this.selected_option_degree.value === 'out_degree') {
      this.svg.append('g').attr('id', 'legend-group')
      const colorScale = d3.scaleSequential(d3.interpolateBrBG).domain([this.lowDeg, this.maxDeg])
      const sortedArr = [...this.Sorted_degree].sort((a, b) => a - b)
      d3.select('#legend-group')
      .selectAll('rect')
      .data(sortedArr)
      .join('rect')
      .attr('width', 30)
      .attr('height', 30)
      .attr('y', (d,i) => (30 * i) + this.height/ 4 )
      .attr('x', 20).attr('fill', d => colorScale(d))
      .on('mouseover', (event) => {
        d3.selectAll('circle').transition().attr('opacity', 1)
        const selectedLegendColor = d3.select(event.target).attr('fill')
        d3.selectAll('circle').filter(function (){
          return d3.select(this).attr('fill') !== selectedLegendColor
        }).transition()
        .attr('opacity', 0.1)
      }).on('mouseout', () => {
        d3.selectAll('circle').transition().attr('opacity', 1)
      })


      d3.select('#legend-group')
      .selectAll('text')
      .data(sortedArr)
      .join('text')
      .text(d => d)
      .attr('y', (d,i) => (30 * i) + this.height/ 4  + 15)
      .attr('x',(d,i) => 65).attr('font-size', 10)
    }
  }
}

