const rightClick = (container, treeInstance) => {

  let currentNode = null
  
  d3.selectAll(`.tree-group-${treeInstance.id}`).on('contextmenu', function(event, d) {
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
          showNotification(`Deleting node: ${currentNode.data.name}`, 'crimson');
          deleteNode(currentNode, treeInstance);
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
  
  home.svg.on('contextmenu', function(event) {
    if (event.target.tagName === 'svg' || event.target.classList.contains('visualization-container')) {
      container.selectAll('.right-click-menu').remove();
    }
  });
  home.svg.on('click', () => {
    container.selectAll('.right-click-menu').remove();
  })
}

const deleteNode = (selectedNode, treeInstance) => {
    
  if (selectedNode.depth === 0) {
    showNotification("Cannot delete root node", 'crimson');
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
    treeInstance.update(null, parent);
    treeInstance.container.selectAll('.right-click-menu').remove();
  }
}