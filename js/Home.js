class Home {
  constructor(id, width, height) {
    this.id = id
    this.width = width
    this.height = height
    this.margin = {top:50, right : 0, bottom: 50, left: 0}
    this.innerWidth = this.width - this.margin.left - this.margin.right
    this.innerHeight = this.height - this.margin.top - this.margin.bottom
    this.svg = d3.select('.container').append('svg').attr('width', this.width).attr('height', this.height)
    this.g = this.svg.append('g').attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)

    this.nodes = new Map()
  }
 async render(file){
  this.buildHirearchy(file)
    // const nodeGroup = this.svg.append('g').attr('class', 'nodes')
    // d3.csv(file).then(rows => {
    //   rows.forEach((row, i) => {
    //     Object.keys(row)
    //     .filter(key => key.startsWith('verb') && row[key])
    //     .forEach(key => {
    //       const compositeKey = `row${i + 1}-${key}-${row[key]}`
    //       if(!this.nodes.has(compositeKey)) {
    //         this.nodes.set(compositeKey, {key: key , value: row[key]})
    //       }
    //     })

    //   });
    //   const uniqueNodes = Array.from(this.nodes)
    //   nodeGroup
    //   .selectAll('circle')
    //   .attr('id', (d,i) => { console.log(d[i])})
    //   .data(uniqueNodes)
    //   .join('circle')
    //   .attr('r', 5)
    //   .attr('cx',(d, i) => (50 * i) + 20)
    //   .attr('cy', (d, i) => (50 * i) + 20)
    //   .attr('fill', 'black')
    //   console.log(this.nodes)

    // })
  }

  buildHirearchy(file) {
    // d3.csv(file).then((data) => {
    //   console.log(data)
    //   const table = d3.csvParse(data)
    //   console.log(table)
    //   const root = d3.stratify()
    //   .id((d) => d.name)
    //   .parentId((d) => d.parent)
    // // (table)
    // })
    const treeLayout = d3.tree().size([this.innerWidth , this.innerHeight])
    
    const data = {
      name: "Eve",
      children: [
        {name: "Cain"},
        {name: "Seth", children: [{name: "Enos"}, {name: "Noam"}]},
        {name: "Abel"},
        {name: "Awan", children: [{name: "Enoch"}]},
        {name: "Azura"}
      ]
    }
    const root = d3.hierarchy(data)
    const links = treeLayout(root).links()
    const linkPathGenerator = d3.linkVertical().x(d => d.x).y(d => d.y)

    this.svg.call(d3.zoom().on('zoom', (event) => {
      this.g.attr('transform', event.transform)
    }))

    this.g.selectAll('path')
    .data(links)
    .join('path')
    .attr('d', linkPathGenerator)
    .attr('fill', 'none')
    .attr('stroke', 'black')

    this.g
    .selectAll('text')
    .data(root.descendants())
    .join('text')
    .attr('x', d=>d.x)
    .attr('y', d=> d.y)
    .attr('dy', '1.5em')
    .text(d => d.data.name )
    .attr('text-anchor', 'middle')
    .attr('font-size', d => 3.01 - d.depth + 'em')

    this.g
    .selectAll('circle')
    .data(root.descendants())
    .join('circle')
    .attr('cx', d=>d.x)
    .attr('cy', d=> d.y)
    .attr('r', '10')


  }
}

