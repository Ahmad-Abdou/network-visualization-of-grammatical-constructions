class Chart {
  constructor(id, height, width, margin) {
    this.id = id;
    this.height = height;
    this.width = width;
    this.margin = margin;
    this.innerwidth = this.width - margin.left - margin.right
    this.innerheight = this.height - margin.bottom - margin.top
    this.svg = d3.select('#chart')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
    
    this.rect = null
    this.xScale = null
    this.yScale = null
  }

  drawAxis(data) {
    this.svg.select('.bar-chart-group').remove()
    this.chartGroup = this.svg.append('g')
    .attr('class', 'bar-chart-group')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    this.xScale = d3.scaleLinear()
      .domain([d3.min(Object.keys(data)) , d3.max(Object.keys(data))])
      .range([0,this.innerwidth]);

      this.yScale = d3.scaleLinear()
      .domain([0 , d3.max(Object.values(data))])
      .range([ this.innerheight,  0]);

    const xAxis = d3.axisBottom(this.xScale);
    const yAxis = d3.axisLeft(this.yScale);

    this.chartGroup.append('g')
      .attr('class', 'x-axis')
      .call(xAxis).attr('transform', `translate(0,${this.innerheight} )`)

    this.chartGroup.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
  }

  showBarChartData(data){ 
  const entries = Object.entries(data)
  const bars = this.chartGroup.selectAll('rect')
  .data(entries, (d, i) => d)
      .join('rect')
      .attr('x', d => this.xScale(d[0]))
      .attr('y', d => this.yScale(d[1]))

      this.chartGroup.append('g')
      .attr('class', 'tooltips')
      
      bars.on('mouseover', (e, d) => {
        const [x, y] = d3.pointer(e)
        this.chartGroup.select('.tooltips')
        .append('rect')
        .attr('class', 'rect-tooltips')
        .attr('width', 80)
        .attr('height', 70)
        .attr('x', x - 20)
        .attr('y', y - 70)
        .attr('fill', 'grey')
        .attr('opacity', 0.9)

        this.chartGroup.select('.tooltips')
        .append('text')
        .attr('class', 'text-tooltips')
        .attr('x', x + 30)
        .attr('y', y - 50)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .selectAll('tspan')
        .data([`Year: ${d[0]}`, `Frequency: ${d[1]}`])
        .join('tspan')
        .attr('x', x + 20)
        .attr('dy', (d, i) => i * 15)
        .text(d => d);
        this.rect = d3.select(e.target)
        this.rect.attr('fill', 'gold')
      })
      bars.on('mousemove', (e)=> {
        const [x, y] = d3.pointer(e)
        this.chartGroup.select('.tooltips').attr('x', x - 20).attr('y', y - 70)
        this.rect.attr('fill', 'gold')

      }).on('mouseout', (e) => {
        d3.select('.rect-tooltips').remove()
        d3.select('.text-tooltips').remove()
        this.rect.attr('fill', '#0080FF')
      })
      bars.transition()
      .duration(1250)
      .attr('width', 4)
      .attr('height', (d,i) => this.innerheight - this.yScale(d[1]))
      .attr('fill', '#0080FF')
      .attr('cursor', 'pointer')
      .attr('opacity', 0.5)

  }
}