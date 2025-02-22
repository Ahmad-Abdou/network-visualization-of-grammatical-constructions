class Home {
  constructor(id, width, height) {
    this.id = id
    this.width = width
    this.height = height
    this.margin = {top:50, right : 50, bottom: 50, left: 50}
    this.innerWidth = this.width - this.margin.left - this.margin.right
    this.innerHeight = this.height - this.margin.top - this.margin.bottom
    this.svg = d3.select('.container').append('svg').attr('width', this.width).attr('height', this.height)
    this.g = this.svg.append('g').attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
  }

  buildHierarchyFromCSV_5_Verbs(csvData) {
    let root = { name: "root", children: [] };
    csvData.forEach(row => {
      const columns = Object.keys(row)
      const verbs = columns.slice(0, columns.length-2)
      let current = root;
      verbs.forEach(verbKey => {
        const verbValue = row[verbKey];
        if (verbValue) {
          let child = current.children.find(c => c.name === verbValue);
          if (!child) {
            child = { name: verbValue, children: [] };
            current.children.push(child);
          }
          current = child;
        }
      });
    });
  
    return root;
  }
  buildHirearchy(file) {
    d3.csv(file).then((csvData) => {
    const treeLayout = d3.tree().size([this.innerHeight, this.innerWidth])

    const nestedData = this.buildHierarchyFromCSV_5_Verbs(csvData);
    const root = d3.hierarchy(nestedData)
    const links = treeLayout(root).links()
    const linkPathGenerator = d3.linkHorizontal().x(d => d.y).y(d => d.x)

    this.svg.call(d3.zoom().on('zoom', (event) => {
      this.g.attr('transform', event.transform)
    }))

    this.g.selectAll('path')
    .data(links)
    .join('path')
    .attr('d', linkPathGenerator)
    .attr('fill', 'none')
    .attr('stroke', 'black')


    // this.g
    // .selectAll('text')
    // .data(root.descendants())
    // .join('text')
    // .attr('x', d=>d.y)
    // .attr('y', d=> d.x)
    // .attr('dy', '1.5em')
    // .text(d => d.data.name )
    // .attr('text-anchor', 'middle')
    // .attr('font-size', d => Math.max(12 - d.depth * 2, 15) + 'px')

    const nodes = this.g
    .selectAll('circle')
    .data(root.descendants())
    .join('circle')
    .attr('cx', d=>d.y)
    .attr('cy', d=> d.x)
    .attr('r', '3')

    const toolTips = this.g.append('g').attr('class', 'tooltips').style('display', 'none')

    toolTips.append('rect')
    .attr('width', 100)
    .attr('height', 50)
    .style('fill', '#0080FF')
    .attr('rx', '10')
    .attr('ry', '10')
  
    toolTips.append('text')
    .attr('font-size', '12px')
    .attr('color', 'red')

    nodes.on('mouseover', function() {
      toolTips.style('display', 'block')     
    }).on('mousemove', function(event, data) {
      const [x,y] = d3.pointer(event)
      toolTips.attr('transform', `translate(${x - 50},${y - 60})`);
      toolTips.selectAll('#tooltip-text').remove();

      toolTips.append('text')
      .attr('id', 'tooltip-text')
      .data(data)
      .text(d => d.data.name)
      .attr('x', 50)
      .attr('y', 30)
      .attr('text-anchor', 'middle')

      toolTips.style('display', 'block')     
    }).on('mouseout', function() {
      toolTips.selectAll('#tooltip-text').remove()
      toolTips.style('display', 'none')     
    })
    })





  }
}

