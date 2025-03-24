class ForceSimulation {
  constructor(id, width, height) {
    this.id = id
    this.width = width
    this.height = height
    this.margin = {top:50, right : 50, bottom: 50, left: 50}
    this.svg = d3.select('.tree-container').append('svg').attr('id', this.id).attr('width', this.width).attr('height', this.height)
    this.zoomGroups = new Map()
  }


  forceSimulation(root) {
    const links = root.links();
    const nodes = root.descendants();
  
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(0).strength(1))
        .force("charge", d3.forceManyBody().strength(-50))
        .force("x", d3.forceX(this.width / 2))
        .force("y", d3.forceY(this.height / 2));
  
  
    const link = this.svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line");
  
    const node = this.svg.append("g")
      .attr("fill", "red")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
        .attr("fill", d => d.children ? null : "green")
        .attr("stroke", d => d.children ? null : "#fff")
        .attr("r", d => d.children ? 5 : 3.5)
        .call(this.drag(simulation));
  
    node.append("title")
        .text(d => d.data.name);
  
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


    // d3.invalidation.then(() => simulation.stop());
  
    return this.svg.node();
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
        .on("end", dragended);
  }
}

