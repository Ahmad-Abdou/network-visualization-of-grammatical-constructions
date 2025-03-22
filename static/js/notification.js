const showNotification = (message, color) => {
  const notification = d3.select('#notification')
  notification.text(message)
    .style('opacity', 1)
    .style('top', '20px')
    .attr('fill', 'black')
    .style('background-color', color)

  
  setTimeout(() => {
    notification.transition()
      .duration(500)
      .style('opacity', 0)
      .style('top', '10px')
  }, 2000);
}