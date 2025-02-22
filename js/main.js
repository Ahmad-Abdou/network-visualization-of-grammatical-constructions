
const container = document.querySelector('.container')
const home = new Home('#container', container.clientWidth, container.clientHeight)

home.buildHirearchy('./data/five.csv')
