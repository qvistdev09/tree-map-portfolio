const svgPadding = { top: 0, right: 0, bottom: 0, left: 0 };
const dimensions = { x: 800, y: 650 };
const tilePadding = 3;
const charWidth = 5;
const titleRowDistance = 10;
const titleXPos = 3;

const containerDom = document.getElementById('container');

const tooltip = d3.select('#container').append('div').attr('id', 'tooltip');
const row1 = d3.select('#tooltip').append('p').html('row1');
const row2 = d3.select('#tooltip').append('p').html('row2');
const row3 = d3.select('#tooltip').append('p').html('row3');

d3.select('#container')
  .append('h1')
  .attr('id', 'title')
  .html('Video Game Sales');
d3.select('#container')
  .append('h2')
  .attr('id', 'description')
  .html('Top 100 Most Sold Video Games Grouped by Platform');

const svg = d3
  .select('#container')
  .append('svg')
  .attr('width', dimensions.x)
  .attr('height', dimensions.y);

const treemapWrapper = svg
  .append('g')
  .attr(
    'transform',
    'translate(' + svgPadding.left + ', ' + svgPadding.top + ')'
  );

d3.json(
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'
).then((data) => {
  let root = d3.hierarchy(data).sum((d) => d.value);

  d3
    .treemap()
    .tile(d3.treemapSquarify)
    .size([
      dimensions.x - svgPadding.left - svgPadding.right,
      dimensions.y - svgPadding.top - svgPadding.bottom,
    ])
    .paddingInner(tilePadding)
    .paddingOuter(1)(root);

  const categoriesArray = shuffle(data.children.map((d) => d.name));
  const colorScale = d3
    .scaleLinear()
    .domain([0, categoriesArray.length - 1])
    .range([0, 1]);

  treemapWrapper
    .selectAll('g')
    .data(root.leaves())
    .enter()
    .append('g')
    .attr('transform', (d) => 'translate(' + d.x0 + ', ' + d.y0 + ')')
    .attr('data-width', (d) => d.x1 - d.x0)
    .attr('data-title', (d) => d.data.name)
    .append('rect')
    .attr('class', 'tile')
    .attr('data-name', (d) => d.data.name)
    .attr('data-category', (d) => d.data.category)
    .attr('data-value', (d) => d.data.value)
    .attr('width', (d) => d.x1 - d.x0)
    .attr('height', (d) => d.y1 - d.y0)
    .style('fill', (d) => color(d.data.category, categoriesArray, colorScale))
    .on('mousemove', (d) => {
      row1.html('Name: ' + d.data.name);
      row2.html('Category: ' + d.data.category);
      row3.html('Value: ' + d.data.value);
      tooltip
        .attr('class', 'visible')
        .attr('data-value', d.data.value)
        .style('left', d3.mouse(containerDom)[0] + 10 + 'px')
        .style(
          'top',
          d3.mouse(containerDom)[1] -
            tooltip.node().getBoundingClientRect().height / 2 +
            'px'
        );
    })
    .on('mouseleave', (d) => {
      tooltip.attr('class', '');
    });

  treemapWrapper
    .selectAll('g')
    .append('text')
    .attr('class', 'tile-text')
    .each(function () {
      fitTitle(
        d3.select(this),
        d3.select(this.parentNode).attr('data-title'),
        d3.select(this.parentNode).attr('data-width'),
        titleRowDistance
      );
    });

  const legend = d3
    .select('#container')
    .append('svg')
    .attr('width', dimensions.x)
    .attr('height', 100);

  const legendScale = d3
    .scaleBand()
    .domain(categoriesArray)
    .range([0, dimensions.x]);
  const legendAxis = d3.axisBottom(legendScale);

  legend
    .append('g')
    .attr('id', 'legend')
    .attr('transform', 'translate(0, 40)')
    .call(legendAxis);

  d3.select('#legend')
    .selectAll('rect')
    .data(categoriesArray)
    .enter()
    .append('rect')
    .attr('class', 'legend-item')
    .attr('width', dimensions.x / categoriesArray.length - 20)
    .attr('height', dimensions.x / categoriesArray.length - 20)
    .attr('x', (d, i) => i * (dimensions.x / categoriesArray.length) + 10)
    .attr('y', (dimensions.x / categoriesArray.length) * -1 + 22)
    .attr('fill', (d) => color(d, categoriesArray, colorScale));
});

function fitTitle(obj, title, width, yPos) {
  let copiedTitle = title;
  remainingWords = [];
  const tspan = obj
    .append('tspan')
    .text(copiedTitle)
    .attr('y', yPos)
    .attr('x', titleXPos);

  while (
    tspan.node().getBoundingClientRect().width > width - titleXPos - 10 &&
    copiedTitle.split(' ').length > 1
  ) {
    tspan.text(
      copiedTitle
        .split(' ')
        .slice(0, copiedTitle.split(' ').length - 1)
        .join(' ')
    );
    remainingWords.unshift(
      copiedTitle.split(' ')[copiedTitle.split(' ').length - 1]
    );
    copiedTitle = copiedTitle
      .split(' ')
      .slice(0, copiedTitle.split(' ').length - 1)
      .join(' ');
  }

  if (remainingWords.length > 0) {
    fitTitle(obj, remainingWords.join(' '), width, yPos + titleRowDistance);
  }

  return;
}

function shuffle(array) {
  let copied = [...array];
  let shuffled = [];

  while (copied.length > 0) {
    let randomNr = Math.floor(Math.random() * copied.length);
    shuffled.push(copied[randomNr]);
    copied.splice(randomNr, 1);
  }

  return shuffled;
}

function color(string, categories, scale) {
  if (categories.indexOf(string) % 2 === 0) {
    return d3.interpolateRainbow(scale(categories.indexOf(string)));
  } else {
    return d3.interpolateSinebow(scale(categories.indexOf(string)));
  }
}
