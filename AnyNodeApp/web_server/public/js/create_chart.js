var chart;
    function initChart(data){
        nv.addGraph(function() {
            chart = nv.models.linePlusBarChart()
                .margin({top: 50, right: 60, bottom: 30, left: 70})
                .legendRightAxisHint(' [Using Right Axis]')
                .color(d3.scale.category10().range());

            chart.xAxis.tickFormat(function(d) {
                    return d3.time.format('%x')(new Date(d))
                })
                .showMaxMin(false);

            chart.y1Axis.tickFormat(function(d) { return  d3.format(',f')(d) });
            chart.bars.forceY([0]).padData(false);

            chart.x2Axis.tickFormat(function(d) {
                return d3.time.format('%x')(new Date(d))
            }).showMaxMin(false);

            d3.select('#chart1 svg')
                .datum(data)
                .transition().duration(500).call(chart);

            nv.utils.windowResize(chart.update);

            chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });

            return chart;
        });
    }