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
    this.numberOfFiles = 0
    this.zoomGroups = new Map()
    this.yearSliderValue = document.querySelector('.year-filter-slide')
    this.yearFilterValue = document.querySelector('.year-filter-value')
    this.years = new Set()
    this.frequencySliderValue = document.querySelector('.frequency-filter-slide')
    this.frequencyFilterValue = document.querySelector('.frequency-filter-value')
    this.frequencies = new Set()
    this.filteredNodes = []
    this.update = null
    this.search()
    this.yearIsChanged = false
    this.frequencyIsChanged = false
  }
  buildHierarchyFromCSV_5_Verbs(csvData, file) {
    let root = { name: file.slice(7, file.length - 4), children: [] };
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
    const nestedData = this.buildHierarchyFromCSV_5_Verbs(csvData, file);
    this.numberOfFiles++
    const root = d3.hierarchy(nestedData)
    this.collapsable(root)
  })
  }

  collapsable(root) {
  const dx = 15;
  const dy = (this.width - this.margin.right - this.margin.left) / (1 + root.height);

  const tree = d3.tree().nodeSize([dx, dy]);
  const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

  const container = this.svg.append('g')
      .attr('class', `visualization-container-${this.numberOfFiles}`);

    container
      .attr("viewBox", [-this.margin.left, -this.margin.top, this.width, this.height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif; user-select: none;")
      .attr('transform', 'translate(50, 100)')

  const gLink = container.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

  const gNode = container.append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    const zoomG = container.append('g')
    .attr('id',`zoom-group-${this.numberOfFiles}`)
    .attr('class',`zoom-group`)

    zoomG.append(() => gLink.node())
    zoomG.append(() => gNode.node())

    const zoom = d3.zoom()
    .on('zoom', (event) => {
      container.select('g').attr('transform', event.transform)
    })
    this.zoomGroups.set(this.numberOfFiles, container);

    container.call(zoom)

    this.update = (event, source) =>  {
      this.filteredNodes = []
      const nodes = root.descendants();
      const rootNode = nodes.find(n => n.depth === 0);
      this.filteredNodes.push(rootNode);
      
      const maxDepth = Math.max(...nodes.map(n => n.depth));
      for (let depth = 1; depth <= maxDepth; depth++) {
        const nodesAtDepth = nodes.filter(n => n.depth === depth);
        nodesAtDepth.forEach(node => {
          if(this.yearIsChanged) {
            if (node.data.year >= this.yearSliderValue.value && 
              this.filteredNodes.includes(node.parent)) {
            this.filteredNodes.push(node);
          }
        }
        else if (this.frequencyIsChanged) {
          if (node.data.frequency >= this.frequencySliderValue.value && 
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
          yearOldSizeSet = this.years.size
          frequencyOldSizeSet = this.frequencies.size

          node._children.forEach(child => {
            if(!this.years.has(child.data.year)){
              this.years.add(child.data.year);
            }
            if(!this.frequencies.has(child.data.frequency)){
              this.frequencies.add(child.data.frequency);
            }
          })
          if( this.years.size >  yearOldSizeSet) {
            this.yearSliderValue.min = Math.min(...this.years);
            this.yearSliderValue.max = Math.max(...this.years);
            this.yearSliderValue.value = Math.min(...this.years);
            this.yearFilterValue.textContent = this.yearSliderValue.value ;
            this.yearIsChanged = true
            this.frequencyIsChanged = false
          }
          if( this.frequencies.size >  frequencyOldSizeSet) {
            this.frequencySliderValue.min = Math.min(...this.frequencies);
            this.frequencySliderValue.max = Math.max(...this.frequencies);
            this.frequencySliderValue.value = Math.min(...this.frequencies);
            this.frequencyFilterValue.textContent = this.frequencySliderValue.value;
            this.yearIsChanged = false
            this.frequencyIsChanged = true
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

      const node = gNode.selectAll("g")
        .data(this.filteredNodes, d => d.id);

      const nodeEnter = node.enter().append("g")
          .attr('class', 'tree-group')
          .attr("transform", d => `translate(${source.y0},${source.x0})`)
          .attr("fill-opacity", 0)
          .attr("stroke-opacity", 0)
          .on("click", (event, d) => {
            d.children = d.children ? null : d._children;
            this.update(event, d)
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
      this.rightClick(root, container)
    }
    root.x0 = dy / 2
    root.y0 = 0
    root.descendants().forEach((d, i) => {
      d.id = i;
      d._children = d.children
      if (d.depth) d.children = null;
    });

    this.update(null, root)
    this.filterByYear(root) 
    this.filterByFrequency(root)

    return this.svg.node();
  }
  rightClick(root, container) {
    const self = this
    
    let currentNode = null
    
    d3.selectAll('.tree-group').on('contextmenu', function(event, d) {
      event.preventDefault()
      event.stopPropagation()
    
      currentNode = d
      
      const [x, y] = d3.pointer(event, container.node());
      
      container.selectAll('.right-click-menu').remove()
      
      const menuGroup = container.append('g')
        .attr('class', 'right-click-menu')
        .attr('transform', `translate(${x}, ${y})`)
      
      menuGroup.append('rect')
        .transition()
        .attr('width', 160)
        .attr('height', 2)
        .duration(200)
        .transition()
        .duration(300)
        .attr('width', 160)
        .attr('height', 50)
        .attr('fill', 'lightgrey')
        .attr('rx', 5)
        .attr('ry', 5)
      
      const hovering_rect = menuGroup.append('rect')
        .attr('class', 'highlight-rect')
        .attr('width', 150)
        .attr('height', 30)
        .attr('x', 5)
        .attr('y', 10)
        .attr('fill', 'gold')
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('opacity', 0);
      
      const deleteText = menuGroup.append('text')
        .attr('transform', `translate(${15}, ${30})`)
        .text('Delete Node')
        .attr('font-size', '14px')
        .style('opacity', 0)
        .style('pointer-events', 'all')
        .on('click', function() {
          if (currentNode) {
            self.showNotification(`Deleting node: ${currentNode.data.name}`);
            self.deleteNode(currentNode);
          }
        });
      
      deleteText.transition()
        .delay(320)
        .style('opacity', 1);
      
      hovering_rect.on('mouseover', () => hovering_rect.attr('opacity', 0.7));
      deleteText.on('mouseover', () => hovering_rect.attr('opacity', 0.7));
      
      hovering_rect.on('mouseout', () => hovering_rect.attr('opacity', 0));
      deleteText.on('mouseout', () => hovering_rect.attr('opacity', 0));
    });
    
    container.on('click', () => {
      container.selectAll('.right-click-menu').remove();
    });
    
    this.svg.on('contextmenu', function(event) {
      if (event.target.tagName === 'svg' || event.target.classList.contains('visualization-container')) {
        container.selectAll('.right-click-menu').remove();
      }
    });
  }

  deleteNode(selectedNode) {
    
    if (selectedNode.depth === 0) {
      this.showNotification("Cannot delete root node");
      return;
    }
    
    const parent = selectedNode.parent;
    
    if (parent) {

      if (parent.children) {
        parent.children = parent.children.filter(child => child.id !== selectedNode.id);
        
        if (parent.children.length === 0) {
          parent.children = null;
        }
      }
      
      if (parent._children) {
        parent._children = parent._children.filter(child => child.id !== selectedNode.id);
        
        if (parent._children.length === 0) {
          parent._children = null;
        }
      }
      this.update(null, parent);
      d3.selectAll('.right-click-menu').remove();
    }
  }

  showNotification(message) {
    const notification = d3.select('#notification');
    notification.text(message)
      .style('opacity', 1)
      .style('top', '20px')
      .attr('fill', 'crimson')

    
    setTimeout(() => {
      notification.transition()
        .duration(500)
        .style('opacity', 0)
        .style('top', '10px')
    }, 2000);
  }

  search() {
    d3.select('#searchField').on('input', (e) => {
      const searchedText = e.target.value.toLowerCase()
      d3.selectAll('.tree-group').each(function(d) {
        const nodeText = d.data.name.toLowerCase()
        const selectedElementText = d3.select(this).select('text')
        const selectedElementCircle = d3.select(this).select('circle')
        selectedElementText.transition().attr('fill',d => d._children ? "#555" : "#999").attr('font-size', d => d.depth === 0 ? '12px' : '10px')
        selectedElementCircle.transition().attr('fill',d => d._children ? "#555" : "#999").attr('r',d => d.depth === 0 ? 8 : 2.5)

        if(searchedText === nodeText) {
          selectedElementText.transition().duration(1250).attr('fill','#0080FF').attr('font-size', '18px').attr('transform',  d => d._children  ?'translate(-5, 0)': 'translate(5, 0)')
          selectedElementCircle.transition().duration(1250).attr('fill','#0080FF').attr('r','8')
        }
      })
    })
  }

  filterByYear(root) {
    d3.select('.year-filter-slide').on('input', (e) => {
      this.yearFilterValue.textContent = e.target.value;
      this.yearIsChanged = true
      this.frequencyIsChanged = false
      this.update(null, root);

    })
  }
  filterByFrequency(root) {
    // console.log(this.frequencies)
    // setTimeout(() => {
    //   this.frequencySliderValue.min = Math.min(...this.frequencies);
    //   this.frequencySliderValue.max = Math.max(...this.frequencies);
    //   this.frequencySliderValue.value = Math.min(...this.frequencies);
    //   this.frequencyFilterValue.textContent = this.frequencySliderValue.value;
    // }, 0);
    d3.select('.frequency-filter-slide').on('input', (e) => {
      this.frequencyFilterValue.textContent = e.target.value;
      this.frequencyIsChanged = true
      this.yearIsChanged = false
      this.update(null, root);

    })
  }
}

