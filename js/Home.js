class Home {
  constructor(id, width, height) {
    this.id = id
    this.width = width
    this.height = height
    this.margin = {top:50, right : 50, bottom: 50, left: 50}
    this.innerWidth = this.width - this.margin.left - this.margin.right
    this.innerHeight = this.height - this.margin.top - this.margin.bottom
    this.svg = d3.select('.tree-container').append('svg').attr('width', this.width).attr('height', this.height)
    this.g = this.svg.append('g').attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
    this.verbKeys = null
    this.timeValues = null
    this.frequenciesValues = null
    this.sliderValue = null

  }

  buildHierarchyFromCSV_5_Verbs(csvData) {
    let root = { name: "root", children: [] };
    csvData.forEach(row => {
      const columns = Object.keys(row)
      let current = root;
      columns.forEach(verbKey => {
        if(verbKey.startsWith('year')) {
          this.timeValues = row[verbKey]
        } else if(verbKey.startsWith('frequency')) {
          this.frequenciesValues = row[verbKey]
        } else if(verbKey.startsWith('verb')) {
          const verbValue = row[verbKey];
          if (verbValue) {
            let child = current.children.find(c => c.name === verbValue);
            if (!child) {
              child = { name: verbValue, year:row['year'], frequency : row['frequency'], children: [] };
              current.children.push(child);
            }
            current = child;
          }
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


    const frequencyExtent = d3.extent(links, d=> d.target.data.frequency)
    const StrokeScale = d3.scaleLinear().domain(frequencyExtent).range([1, 5])
    const opacityScale = d3.scaleLinear().domain(frequencyExtent).range([0.5, 1])

    const timeScale = d3.extent(links, d=> d.target.data.year)

    const filteredNodes = root.descendants().filter((row) => row.data.frequency > this.sliderValue)
    const filteredLinks = links.filter(link => link.target.data.frequency > this.sliderValue)

    const slider = document.querySelector('.filter-slide')
    slider.min = timeScale[0]
    slider.max = timeScale[1]
    slider.value = this.sliderValue

    let filterValue = document.querySelector('.filter-value')

    slider.addEventListener('input', (e) => {
      this.sliderValue = e.target.value
      filterValue.textContent = e.target.value
    })

    this.svg.call(d3.zoom().on('zoom', (event) => {
      this.g.attr('transform', event.transform)
    }))

    this.g.selectAll('path')
    .data(filteredLinks)
    .join('path')
    .attr('d', linkPathGenerator)
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', d => StrokeScale(d.target.data.frequency))
    .attr('stroke-opacity', d => opacityScale(d.target.data.frequency))

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
    .attr('class', 'nodes')
    .data(filteredNodes)
    .join('circle')
    .attr('cx', d=>d.y)
    .attr('cy', d=> d.x)
    .attr('r', d => Math.max(12 - d.depth * 2, 3) + 'px')

    const toolTips = this.g.append('g').attr('class', 'tooltips').style('display', 'none')

    toolTips.append('rect')
    .attr('class', 'rect-tooltips')
    .attr('width', 150)
    .attr('height', 90)
    .style('fill', '#0080FF')
    .attr('rx', '10')
    .attr('ry', '10')
    .attr('y', '-40')
    .attr('x', '-60')

    toolTips.append('text')
    .attr('font-size', '12px')
    .attr('color', 'red')

    nodes.on('mouseover', function() {
      toolTips.style('display', 'block')     
    }).on('mousemove', function(event, data) {
      const [x,y] = d3.pointer(event)
      toolTips.attr('transform', `translate(${x - 50},${y - 60})`);
      toolTips.selectAll('#tooltip-text').remove();

      toolTips.selectAll('text')
      .attr('id', 'tooltip-text')
      .data([`Name: ${data.data.name}`,
            `Year: ${data.data.year}`,
            `Frequency: ${data.data.frequency}`])
      .join('text')
      .attr('x', 20)
      .attr('y', (d,i) => (30 * i) -20)
      .attr('text-anchor', 'middle')
      .text(d=>d)

      toolTips.style('display', 'block')     
    }).on('mouseout', function() {
      toolTips.selectAll('#tooltip-text').remove()
      toolTips.style('display', 'none')     
    })
    })

  }
  
}

