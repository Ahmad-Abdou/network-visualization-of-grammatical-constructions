class Home {
  constructor(id, width, height, margin) {
    this.id = id
    this.width = width
    this.height = height
    this.margin = margin
    this.svg = d3.select('.container').append('svg').attr('width', this.width).attr('height', this.height).style('background-color', 'lightgrey')
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
    d3.csv(file).then((data) => {
      console.log(data)
      const table = d3.csvParse(data)
      console.log(table)
      const root = d3.stratify()
      .id((d) => d.name)
      .parentId((d) => d.parent)
    // (table)
    })

  }
}

