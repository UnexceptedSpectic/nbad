import * as d3 from 'd3';

function createD3DonutChart(dataSource) {
const svg = d3.select('article.d3 p')
    .append('svg')
    .append('g')

svg.append('g')
    .attr('class', 'slices');
svg.append('g')
    .attr('class', 'labels');
svg.append('g')
    .attr('class', 'lines');

const width = 300;
const height = 300;
const radius = Math.min(width, height) / 2;

const pie = d3.layout.pie()
    .sort(null)
    .value((d) => d.value);

const arc = d3.svg.arc()
    .outerRadius(radius * 0.8)
    .innerRadius(radius * 0.4);

const outerArc = d3.svg.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

svg.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

const key = (d) => d.data.label;

const color = d3.scale.ordinal()
    // labels
    .domain(dataSource.labels)
    // colors
    .range(dataSource.datasets[0].backgroundColor);

function mapData() {
    const labels = color.domain();
    return labels.map(label => {
        return { label: label, value: dataSource.datasets[0].data[labels.indexOf(label)] };
    });
}

change(mapData());

function change(data) {

    /* ------- PIE SLICES -------*/
    const slice = svg.select('.slices').selectAll('path.slice')
        .data(pie(data), key);

    slice.enter()
        .insert('path')
        .style('fill', function(d) { return color(d.data.label); })
        .attr('class', 'slice');

    slice
        .transition().duration(1000)
        .attrTween('d', function(d) {
            this._current = this._current || d;
            const interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return arc(interpolate(t));
            };
        })

    slice.exit()
        .remove();

    /* ------- TEXT LABELS -------*/

    const text = svg.select('.labels').selectAll('text')
        .data(pie(data), key);

    text.enter()
        .append('text')
        .attr('dy', '.35em')
        .text(function(d) {
            return d.data.label;
        });

    function midAngle(d){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text.transition().duration(1000)
        .attrTween('transform', function(d) {
            this._current = this._current || d;
            const interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                const d2 = interpolate(t);
                const pos = outerArc.centroid(d2);
                pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                return 'translate('+ pos +')';
            };
        })
        .styleTween('text-anchor', function(d){
            this._current = this._current || d;
            const interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                const d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? 'start':'end';
            };
        });

    text.exit()
        .remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/

    const polyline = svg.select('.lines').selectAll('polyline')
        .data(pie(data), key);

    polyline.enter()
        .append('polyline');

    polyline.transition().duration(1000)
        .attrTween('points', function(d){
            this._current = this._current || d;
            const interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                const d2 = interpolate(t);
                const pos = outerArc.centroid(d2);
                pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [arc.centroid(d2), outerArc.centroid(d2), pos];
            };
        });

    polyline.exit()
        .remove();
};
}

export default createD3DonutChart;
