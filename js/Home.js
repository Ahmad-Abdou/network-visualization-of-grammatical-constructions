class Home {
  constructor(id, width, height) {
    this.id = id
    this.width = width
    this.height = height
    this.margin = {top:50, right : 50, bottom: 50, left: 50}
    this.svg = d3.select('.tree-container').append('svg').attr('width', this.width).attr('height', this.height)
    this.zoomGroups = new Map()
    this.filteredNodes = []
    this.update = null
  }


  collapsable(root, treeInstance) {
  const dx = 15;
  const dy = (this.width - this.margin.right - this.margin.left) / (1 + root.height);

  const tree = d3.tree().nodeSize([dx, dy]);
  const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

  const container = this.svg.append('g')
      .attr('class', `visualization-container-${treeInstance.id}`)
      .attr('id', `visualization-container-${treeInstance.id}`);
    
    treeInstance.container = container;

    container
      .attr("viewBox", [-this.margin.left, -this.margin.top, this.width, this.height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif; user-select: none;")
      .attr('transform', 'translate(60, 100)')

  const gLink = container.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

  const gNode = container.append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    const zoomG = container.append('g')
    .attr('id',`zoom-group-${numberOfFiles}`)
    .attr('class',`zoom-group`)

    zoomG.append(() => gLink.node())
    zoomG.append(() => gNode.node())

    const zoom = d3.zoom()
    .on('zoom', (event) => {
      container.select('g').attr('transform', event.transform)
    })
    this.zoomGroups.set(numberOfFiles, container);

    container.call(zoom)

    const updateFunction = (event, source) => {
      this.filteredNodes = [];
      const nodes = root.descendants();
      const rootNode = nodes.find(n => n.depth === 0);
      this.filteredNodes.push(rootNode);
      
      const maxDepth = Math.max(...nodes.map(n => n.depth));
      for (let depth = 1; depth <= maxDepth; depth++) {
        const nodesAtDepth = nodes.filter(n => n.depth === depth);
        nodesAtDepth.forEach(node => {
          if(yearIsChanged) {
            if (node.data.year >= minYearSliderValue.value && node.data.year <= maxYearSliderValue.value &&
              this.filteredNodes.includes(node.parent)) {
            this.filteredNodes.push(node);
          }
        }
        else if (frequencyIsChanged) {
          if (node.data.frequency >= frequencySliderValue.value && 
            this.filteredNodes.includes(node.parent)) {
          this.filteredNodes.push(node);
        }
      }
        });
      }

      const links = this.filteredNodes
        .filter(d => d.parent && this.filteredNodes.includes(d.parent))
        .map(d => ({ source: d.parent, target: d })); 
      tree(root);
      
      let left = root;
      let right = root;
      let top = root;
      let bottom = root;
      const min_width = d3.select('.tree-container').style('width')
      const min_height = d3.select('.tree-container').style('height')
      let yearOldSizeSet = 0
      let frequencyOldSizeSet = 0
      root.eachBefore(node => {
        if (node._children) {
          yearOldSizeSet = years.size
          frequencyOldSizeSet = frequencies.size

          node._children.forEach(child => {
            if(!years.has(child.data.year)){
              years.add(child.data.year);
            }
            if(!frequencies.has(child.data.frequency)){
              frequencies.add(child.data.frequency);
            }
          })
          if( years.size >  yearOldSizeSet) {
            const minYear = Math.min(...years);
            const maxYear = Math.max(...years);
            
            minYearSliderValue.min = minYear;
            minYearSliderValue.max = maxYear;
            maxYearSliderValue.min = minYear;
            maxYearSliderValue.max = maxYear;
            
            minYearSliderValue.value = minYear;
            maxYearSliderValue.value = maxYear;
            
            minYearFilterValue.textContent = minYear;
            maxYearFilterValue.textContent = maxYear;
        
            yearIsChanged = true;
            frequencyIsChanged = false;
          }
          if( frequencies.size >  frequencyOldSizeSet) {
            frequencySliderValue.min = Math.min(...frequencies);
            frequencySliderValue.max = Math.max(...frequencies);
            frequencySliderValue.value = Math.min(...frequencies);
            frequencyFilterValue.textContent = frequencySliderValue.value;
            yearIsChanged = false
            frequencyIsChanged = true
          }
          
      }
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });

      const height = Math.max(right.x - left.x + this.margin.top + this.margin.bottom, min_height);
      const width = Math.max(bottom.y - top.y + this.margin.left + this.margin.right, min_width);
      const transition = container.transition()
          .duration(750)
          .attr("height", height)
          .attr("viewBox", [
            -this.margin.left,            
            left.x - this.margin.top,
            Math.max(width, min_width),
            Math.max(height, min_height)
        ])
          .tween("resize", window.ResizeObserver ? null : () => () => this.svg.dispatch("toggle"));

      const node = gNode.selectAll("g.tree-group")
        .data(this.filteredNodes, d => d.id)

      const nodeEnter = node.enter().append("g")
          .attr('class', `tree-group tree-group-${treeInstance.id}`)
          .attr("transform", d => `translate(${source.y0},${source.x0})`)
          .attr("fill-opacity", 0)
          .attr("stroke-opacity", 0)
          .on("click", (event, d) => {
            d.children = d.children ? null : d._children;
            updateFunction(event, d)
          }).on('mouseover', (e) => {
            d3.select(e.target).attr('r', 7).attr('fill', 'crimson').attr('opacity', '0.7').attr('transform', 'translate(2,0)')
          }).on('mouseout', (e, d) => {
            d3.selectAll('.tree-group').selectAll('circle')
              .each(function(d) {
                if (d3.select(this).attr('fill') === 'crimson') {
                  d3.select(this)
                    .attr("fill", d => d._children ? "#555" : "#999")
                    .attr("r", d => d.depth === 0 ? 8 : 2.5)
                    .attr('opacity', '1')
                    .attr('transform', 'translate(0,0)');
                }
              })
          })

      nodeEnter.append("circle")
          .attr("r", d => d.depth === 0 ? 8 : 2.5)
          .attr("fill", d => d._children ? "#555" : "#999")
          .attr("stroke-width", 10);

      nodeEnter.append("text")
          .attr("dy", "0.31em")
          .attr("x", d => d._children ? -6 : 6)
          .attr("text-anchor", d => d._children ? "end" : "start")
          .attr('font-size', d => d.depth === 0 ? '12px' : '10px')
          .text(d => d.data.name)
          .attr("stroke-linejoin", "round")
          .attr("stroke-width", 3)
          .attr("stroke", "white")
          .attr("paint-order", "stroke")
          .attr('transform',  d => d.depth === 0 ?'translate(-5, 0)': 'translate(0, 0)')

      const nodeUpdate = node.merge(nodeEnter).transition(transition)
          .attr("transform", d => `translate(${d.y},${d.x})`)
          .attr("fill-opacity", 1)
          .attr("stroke-opacity", 1);

      const nodeExit = node.exit().transition(transition).remove()
          .attr("transform", d => `translate(${source.y},${source.x})`)
          .attr("fill-opacity", 0)
          .attr("stroke-opacity", 0);

      const link = gLink.selectAll("path")
        .data(links, d => d.target.id);

      const linkEnter = link.enter().append("path")
          .attr("d", d => {
            const o = {x: source.x0, y: source.y0};
            return diagonal({source: o, target: o});
          });

      link.merge(linkEnter).transition(transition)
          .attr("d", diagonal);

      link.exit().transition(transition).remove()
          .attr("d", d => {
            const o = {x: source.x, y: source.y};
            return diagonal({source: o, target: o});
          });

      root.eachBefore(d => {
        d.x0 = d.x
        d.y0 = d.y
      });
      rightClick(container, treeInstance)
    };
    
    treeInstance.update = updateFunction
    this.update = updateFunction

    root.x0 = dy / 2
    root.y0 = 0
    root.descendants().forEach((d, i) => {
      d.id = i
      d._children = d.children
      if (d.depth) d.children = null
    });

    updateFunction(null, root)
    filterByYear(root, treeInstance)
    filterByFrequency(root, treeInstance)
    search()

    return this.svg.node()
  }
}

