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
    this.numberOfFiles = 0
    this.zoomGroups = new Map()
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

  const update = (event, source) =>  {
    const nodes = root.descendants().reverse();
    const links = root.links();

    tree(root);

    let left = root;
    let right = root;
    let top = root;
    let bottom = root;
    const min_width = d3.select('.tree-container').style('width')
    const min_height = d3.select('.tree-container').style('height')

    root.eachBefore(node => {
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
      .data(nodes, d => d.id);

    const nodeEnter = node.enter().append("g")
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on("click", (event, d) => {
          d.children = d.children ? null : d._children;
          update(event, d);
        });

    nodeEnter.append("circle")
        .attr("r", d => d.depth === 0 ? 5 : 2.5)
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
        .attr("paint-order", "stroke");

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
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }
  root.x0 = dy / 2;
  root.y0 = 0;
  root.descendants().forEach((d, i) => {
    d.id = i;
    d._children = d.children;
    if (d.depth && d.data.name.length !== 7) d.children = null;
  });

  update(null, root);
  this.rightClick(container)
  return this.svg.node();
  }
  rightClick(container) {
    console.log(container)
    container.on('contextmenu',(e) => {
      e.preventDefault()
      const menu = document.createElement('div')
      menu.style.width = '70px'
      menu.style.height = '80px'

    })
  }
  Debouncer(renderVisualization, slider, filterValue, filterPathByYear, filterNodesByYear, links, root) {
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
          const later = () => {
              clearTimeout(timeout);
              func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
      };
  }

  const debouncedRender = debounce((pathData, nodeData) => {
      renderVisualization(pathData, nodeData);
  }, 100);

  slider.addEventListener('input', (e) => {
      this.sliderValue = e.target.value;
      filterValue.textContent = e.target.value;
      
      filterPathByYear = links.filter(
          link => Number(link.target.data.year) >= Number(this.sliderValue)
      );
      filterNodesByYear = root.descendants().filter(
          row => Number(row.data.year) >= Number(this.sliderValue)
      );
      debouncedRender(filterPathByYear, filterNodesByYear);
  });

  const resetBtn = document.querySelector('.reset-btn') || createResetButton();
  resetBtn.addEventListener('click', () => {
      slider.value = timeScale[0]
      filterValue.textContent = timeScale[0];
      renderVisualization(links, root.descendants());
  });
  }
}

