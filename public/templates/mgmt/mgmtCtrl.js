app.controller('MgmtCtrl', function ($scope, $timeout, DataHandler, LoginHandler, Geo) {

    var zoomLevel = 10,
        zoomLevelForFence = 15,
        isEditMode = false,
        fence = null,
        marker = [],
        markers = [],
        tempEdit = false,
        currPosition = "",
        drawLine = "",
        lineTimer = null;

    $scope.isAdd = false;
    $scope.geofenceArr = [];
    $scope.geoFence = [];
    $scope.markers = [];

    $scope.init = function () {
        if (LoginHandler.checkLoginStatus()) {
            isAdmin = DataHandler.getObject("isAdmin");
            if (isAdmin === true) {
                $state.go("admin");
            } else {
                getGeoFenceList();
                initializeMap();
            }
        } else $state.go('login');
    }
    $scope.init();

    function initializeMap() {
        $scope.map = new google.maps.Map(document.getElementById('geomap'), {
            zoom: zoomLevel,
            panControl: false,
            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.LEFT_CENTER
            },
            center: {
                lat: 12.970110531016921,
                lng: 77.61092131957412
            },
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            disableDefaultUI: true,
            draggableCursor: 'crosshair'
        });

        $scope.map.addListener("click", function (event) {
            if ($scope.isAdd || $scope.isEdit) {
                currPosition = {
                    'lat': event.latLng.lat(),
                    'lng': event.latLng.lng()
                };
                drawPolygon(event.latLng.lat(), event.latLng.lng());
            }
        });

        $scope.map.addListener("mousemove", function (event) {
            var lineCordinates = [];
            if (currPosition) {
                lineCordinates.push(currPosition);
                lineCordinates.push({
                    'lat': event.latLng.lat(),
                    'lng': event.latLng.lng()
                });
                if (drawLine != "")
                    drawLine.setMap(null);
                drawLine = new google.maps.Polyline({
                    path: lineCordinates,
                    geodesic: true,
                    strokeColor: '#00F',
                    strokeOpacity: 0.5,
                    strokeWeight: 1
                });

                if (lineTimer) {
                    $timeout.cancel(lineTimer);
                }
                var lineTimer = $timeout(function () {
                    drawLine.setMap(null);
                }, 3000);
                drawLine.setMap($scope.map);
            }
        });
    }

    $scope.showAddFence = function () {
        $scope.isAdd = true;
        if (fence) fence.setMap(null);
        fence = null;
        marker = [];
    };

    $scope.addFence = function () {
        if ($scope.fenceName != "" && $scope.isEdit) {
            $scope.geofenceArr[edit_index].name = $scope.fenceName;
            $scope.geofenceArr[edit_index].points = JSON.parse(JSON.stringify($scope.geoFence));
            Geo.update($scope.geofenceArr[edit_index]).then(function (d) {
                console.log("Geo-fence successfully updated!");
                $timeout(function () {
                    getGeoFenceList();
                }, 3000);
            }, function (e) {
                console.error("Error creating geo fence!");
            });
        }
        if ($scope.fenceName != "" && $scope.isAdd) {
            var geoFence = {
                'name': $scope.fenceName,
                'points': JSON.parse(JSON.stringify($scope.geoFence))
            };
            $scope.geofenceArr.push(geoFence);
            Geo.create(geoFence).then(function (d) {
                console.log("Geo-fence successfully created!");
                $timeout(function () {
                    getGeoFenceList();
                }, 3000);
            }, function (e) {
                console.error("Error creating geo fence!");
            });
        }
        $scope.closeFence();
    };

    $scope.removePoint = function (_index) {
        $scope.geoFence.splice(_index, 1);
        marker[_index].setMap(null);
        if (fence) fence.setMap(null);
        fence = getPolygon($scope.geoFence);
        fence.setMap($scope.map);
        if (pointHighlight) pointHighlight.setMap(null);
    }

    var pointHighlight = null;
    $scope.pointMouseOver = function (_index) {
        if (pointHighlight) pointHighlight.setMap(null);
        pointHighlight = new google.maps.Marker({
            position: new google.maps.LatLng($scope.geoFence[_index].lat, $scope.geoFence[_index].lng),
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillOpacity: 0.7,
                fillColor: '#fce35a',
                strokeOpacity: 0.5,
                strokeColor: '#000',
                strokeWeight: 1,
                scale: 10,
            },
            map: $scope.map
        });
    }

    $scope.pointMouseLeave = function (_index) {
        if (pointHighlight) pointHighlight.setMap(null);
    }

    $scope.closeFence = function () {
        $scope.isAdd = false;
        $scope.isEdit = false;
        $scope.geoFence = [];
        if (fence) fence.setMap(null);
        marker.forEach(function (m) {
            m.setMap(null);
        });
        $scope.fenceName = "";
        currPosition = null;
        $scope.map.setZoom(zoomLevel);
    };

    $scope.showFence = function (_index) {
        markers = [];
        if (fence) fence.setMap(null);
        fence = getPolygon($scope.geofenceArr[_index].points);
        fence.setMap($scope.map);
        $scope.map.setZoom(zoomLevelForFence);
        $scope.map.panTo(new google.maps.LatLng($scope.geofenceArr[_index].points[0].lat, $scope.geofenceArr[_index].points[0].lng));
    };

    var edit_index;
    $scope.editFence = function (_index) {
        edit_index = _index;
        $scope.isEdit = true;
        $scope.fenceName = $scope.geofenceArr[_index].name;
        markers = $scope.geofenceArr[_index].points;
        markers.forEach(function (_marker) {
            marker.push(new google.maps.Marker({
                position: _marker,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillOpacity: 0.5,
                    fillColor: '#333',
                    strokeOpacity: 1.0,
                    strokeColor: '#000000',
                    strokeWeight: 1,
                    scale: 5
                },
                map: $scope.map
            }));
            $scope.geoFence.push(_marker);
        });
        currPosition = {
            'lat': markers[markers.length - 1].lat,
            'lng': markers[markers.length - 1].lng
        };
    };

    $scope.deleteFence = function () {
        Geo.deleteGeo($scope.geofenceArr[edit_index]._id).then(function (d) {
            $scope.geofenceArr.splice(edit_index, 1);
            console.log("Geo-fence successfully deleted!");
            $timeout(function () {
                getGeoFenceList();
            }, 3000);
        }, function (e) {
            console.error("Error creating geo fence!");
        });
        $scope.closeFence();
    }

    function getGeoFenceList() {
        Geo.listGeo().then(function (_d) {
            $scope.geofenceArr = [];
            $scope.geofenceArr = _d;
        }, function (_e) {
            console.error("Error retrieving geo-fence list...");
        });
    }

    function markerClick() {
        var i = marker.map(function (n) {
            return n.vb;
        }).indexOf(this);
        marker[i].vb.setMap(null);
        marker.splice(i, 1);

        var index = $scope.geoFence.map(function (x) {
            return x.lat;
        }).indexOf(this.position.G);
        if (index > -1) {
            $scope.geoFence.splice(index, 1);
        }

        if (fence) fence.setMap(null);

        fence = new google.maps.Polygon({
            paths: $scope.geoFence,
            strokeColor: '#000000',
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillOpacity: 0.25
        });
        fence.setMap($scope.map);
    }

    function drawPolygon(latitude, longitude) {
        var _marker = new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillOpacity: 0.7,
                fillColor: '#000',
                strokeOpacity: 1.0,
                strokeColor: '#000',
                strokeWeight: 1,
                scale: 5,
            },
            map: $scope.map
        });
        marker.push(_marker);
        $scope.$apply(function () {
            $scope.geoFence.push(currPosition);
        });
        if ($scope.geoFence.length > 2) {
            if (fence) fence.setMap(null);
            fence = getPolygon($scope.geoFence);
            fence.setMap($scope.map);
        }
    }

    function getPolygon(_points) {
        return new google.maps.Polygon({
            paths: _points,
            strokeColor: '#000000',
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillOpacity: 0.50,
            fillColor: '#7accff'
        });
    }

});