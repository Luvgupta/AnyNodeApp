app.controller('VisualCtrl', function ($scope, $state, $stateParams, $timeout, $interval, Device, LoginHandler, DataHandler) {

    $scope.showLegend = false;
    $scope.chartType = "Line";
    $scope.trucksSelectedForComparison = [];
    var graphs = {},
        selectedTruck,
        duration;
    $scope.listOfTrucks = ["Device 1", "Device 2", "Device 3", "Device 4"];

    //    $scope.chartColor = ['red', 'green'];

    $scope.onClick = function (points, evt) {
        console.log(points[0].value, points[1].value);
    };

    function init() {
        for (var i = 0; i < $scope.listOfTrucks.length; i++) {
            var data = initGraphData();
            data.dist.series.push($scope.listOfTrucks[i]);
            data.speed.series.push($scope.listOfTrucks[i]);
            data.fuel.series.push($scope.listOfTrucks[i]);
            graphs[$scope.listOfTrucks[i]] = data;
            generateData(365 * 24 * 4, $scope.listOfTrucks[i]);
        }
        $scope.truck($scope.listOfTrucks[0]);
        $scope.randomize(24);
    }

    function generateData(_duration, _key) {
        graphs[_key].dist.data.push([]);
        graphs[_key].fuel.data.push([]);
        graphs[_key].speed.data.push([]);
        for (var i = 0; i < _duration; i++) {
            graphs[_key].dist.data[0].push(rand());
            graphs[_key].fuel.data[0].push(rand());
            graphs[_key].speed.data[0].push(rand());
        }
    }

    $scope.randomize = function (_duration) {
        duration = _duration;
        $scope.graph = initGraphData();
        for (var t = 0; t < $scope.trucksSelectedForComparison.length; t++) {
            var data = JSON.parse(JSON.stringify(graphs[$scope.trucksSelectedForComparison[t]]));
            $scope.graph.dist.data.push([]);
            $scope.graph.fuel.data.push([]);
            $scope.graph.speed.data.push([]);
            $scope.graph.dist.series.push(data.dist.series[0]);
            $scope.graph.fuel.series.push(data.fuel.series[0]);
            $scope.graph.speed.series.push(data.speed.series[0]);
            $scope.graph.dist.labels = [];
            $scope.graph.fuel.labels = [];
            $scope.graph.speed.labels = [];
            var len = 0;
            var incrementor = 0;
            for (var i = 0; i < _duration; i++) {
                if (_duration == 24) incrementor = 4;
                if (_duration == 7) incrementor = 4 * 24;
                if (_duration == 30) incrementor = 4 * 24;
                if (_duration == 12) incrementor = 4 * 24 * 30;
                var max = len + incrementor;
                var dist_total = 0;
                var fuel_total = 0;
                var speed_total = 0;
                for (var j = len; j < max; j++) {
                    dist_total += data.dist.data[0][j];
                    fuel_total += data.fuel.data[0][j];
                    speed_total += data.speed.data[0][j];
                }
                len += incrementor;
                $scope.graph.dist.data[$scope.graph.dist.data.length - 1].push(dist_total);
                $scope.graph.fuel.data[$scope.graph.dist.data.length - 1].push(fuel_total);
                $scope.graph.speed.data[$scope.graph.dist.data.length - 1].push(speed_total);
                $scope.graph.dist.labels.push(i + 1);
                $scope.graph.fuel.labels.push(i + 1);
                $scope.graph.speed.labels.push(i + 1);
            }
        }
    }

    $scope.truck = function (_d) {
        if ($scope.trucksSelectedForComparison.indexOf(_d) == -1)
            $scope.trucksSelectedForComparison.push(_d);
        $scope.randomize(duration);
    }

    $scope.removeTruck = function (_i) {
        $scope.trucksSelectedForComparison.splice(_i, 1);
        $scope.randomize(duration);
    }

    function graphOnClick(points, evt) {
        if (duration == 24) $scope.randomize(24);
        if (duration == 7) $scope.randomize(24);
        if (duration == 30) $scope.randomize(24);
        if (duration == 12) $scope.randomize(30);
    }

    function initGraphData() {
        return {
            dist: {
                data: [],
                labels: [],
                series: [],
                legend: false,
                onClick: graphOnClick
            },
            fuel: {
                data: [],
                labels: [],
                series: [],
                legend: false,
                onClick: graphOnClick
            },
            speed: {
                data: [],
                labels: [],
                series: [],
                legend: false,
                onClick: graphOnClick
            }
        };
    }

    function rand() {
        return Math.floor(Math.random() * 100)
    }

    init();

});