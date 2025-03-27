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
  }


  forceSimulation(root) {
    d3.select('#node-group').remove()
    this.nodeGroup = this.svg.append('g').attr('id', 'node-group')

    const nodes = root.nodes
    const links = root.links
    const simulation = d3.forceSimulation(nodes)
      .force("collide", d3.forceCollide(30).iterations(20))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      .force("link", d3.forceLink(links).id(d => d.name).distance(50).strength(1))
      .force("charge", d3.forceManyBody().distanceMin(200).distanceMax(1000).strength(-1))
      .stop()
      // .force("x", d3.forceX(this.width / 2))
      // .force("y", d3.forceY(this.height / 2));

      const workerCode = `
      self.onmessage = function(event) {
        const data = event.data

      const nodes = root.nodes
      const links = root.links
      const simulation = d3.forceSimulation(nodes)
      .force("collide", d3.forceCollide(30).iterations(20))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      .force("link", d3.forceLink(links).id(d => d.name).distance(50).strength(1))
      .force("charge", d3.forceManyBody().distanceMin(20).distanceMax(100).strength(-10))

      const numIterations = nodes.length > 100 ? 100 : 300
      for (let i = 0; i < numIterations; i++) {
        simulation.tick();
      }
    }

      `
      
  
      const numIterations = nodes.length > 100 ? 100 : 300
      for (let i = 0; i < numIterations; i++) {
        simulation.tick();
      }

    const link = this.nodeGroup.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);
  
    // const node = this.nodeGroup.append("g")
    //   .attr("fill", "crimson")
    //   .selectAll("circle")
    //   .data(nodes)
    //   .join("circle")
    //   .attr("fill", d => d.children ? null : "#17B169")
    //   .attr("stroke", d => d.children ? null : "#fff")
    //   .attr("r", d => d.children ? 5 : 3.5)
    //   .call(this.drag(simulation))
    const node = this.nodeGroup.append("g")
      .attr("fill", "crimson")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("fill", d => this.calculateNodeColor(d))
      .attr("stroke", d => d.children ? null : "#fff")
      .attr("r", d => this.calculateInDegree(d))
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .call(this.drag(simulation));
      

    node.append("title")
      .text(d => d.name);


    simulation.on("tick", () => {
      link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);
  
      node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
    });

    this.nodeGroup.call(d3.zoom()
    .extent([[0, 0], [ this.width,  this.height]])
    .scaleExtent([-5, 8])
    .on("zoom", zoomed));

    function zoomed({transform}) {
      node.attr("transform", transform);
      link.attr("transform", transform);

    }
    return this.nodeGroup.node();
  }

  drag = simulation => {
  
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        // .on("end", dragended);
  }

  calculatePredominantNode(node){
    const nodeDegree = this.degree[node.name];
    if (nodeDegree === undefined) return null;
    const values = Object.values(this.degree);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
  
    const scale = d3.scaleLinear().domain([minValue, maxValue]).range([3, 25]);
  
    return scale(nodeDegree);
  }
  calculateDegree(node){
    const nodeDegree = this.degree[node.name];
    if (nodeDegree === undefined) return null;
    const values = Object.values(this.degree);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
  
    const scale = d3.scaleLinear().domain([minValue, maxValue]).range([3, 25]);
    console.log(`${nodeDegree} :  ${scale(nodeDegree)}`)
    return scale(nodeDegree);
  }
  calculateInDegree(node){
    const nodeDegree = this.in_degree[node.name];
    if (nodeDegree === undefined) return null;
    const values = Object.values(this.in_degree);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
  
    const scale = d3.scaleLinear().domain([minValue, maxValue]).range([3, 25]);

    return scale(nodeDegree);
  }
  calculateOutDegree(node){
    const nodeDegree = this.out_degree[node.name];
    if (nodeDegree === undefined) return null;
    const values = Object.values(this.out_degree);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
  
    const scale = d3.scaleLinear().domain([minValue, maxValue]).range([3, 25]);
  
    return scale(nodeDegree);
  }
  calculateNodeColor(node){
    const nodeDegree = this.degree[node.name];
    if (nodeDegree === undefined) return null;

    const values = Object.values(this.degree);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const colorScale = d3.scaleSequential(d3.interpolateRainbow).domain([minValue, maxValue])
    return colorScale(nodeDegree)

    
  }
}

