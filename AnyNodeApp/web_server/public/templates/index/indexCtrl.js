app.controller('IndexCtrl', function ($scope, $state, $timeout, $q, Device, Socket, HTTP, LoginHandler, DataHandler) {
    //todo make as true
    $scope.makeVisibleStatusDetails = false;
    $scope.makeVisibleSearchResults = false;
    $scope.trackingFlag = true;
    $scope.enableTruckInfo = false;
    $scope.enableSmoothTracking = true;
    // todo make as false
    $scope.enableTripHistory = false;
    $scope.isPlayingBackData = false;
    $scope.queryResults = [];
    $scope.trackingList = [];
    $scope.aLabel = "R";
    $scope.showDebugButtons = false;
    $scope.showToast = false;
    $scope.showAlertIcons = true;
    $scope.showAlertListing = true;
    $scope.alertItemsPerPage = 5;
    $scope.maxDate = new Date();
    $scope.boundsOfAwesomeness = false;
    $scope.searchResults = false;
    $scope.playbackHistory = [];
    $scope.telemetryResults = [];
    $scope.sliderPos = 0;
    $scope.playSpeed = 500;
    $scope.play = false;
    $scope.playMarker = null;
    $scope.allAlert = [];
    $scope.devices = {};
    $scope.vSearch = "";
	$scope.searchResults = {};
    // todo make this false

    var zoomLevel = 10,
        zoomLevelForTracking = 15,
        zoomLevelForAlert = 17,
        mapMarkerList = {},
        pantoFlag = true,
        alertZoomOutFlag = false,
        alertMarker = new google.maps.Marker(),
        alertBackup,
        selectedDevice = null,
        previousCord,
        flag_showToast = true,
        markerInfoWindow = null,
        rectangle = null,
        animationPromise = null,
        playbackMarkerList = [],
        playbackPath,
        isAdmin,
        truckRoute;


    var getIcon = function (angle, color) {
        return {
            "path": "M 30 40 A 40 40 -90 1 1 -30 40 L 0 10 z",
            "scale": 0.2,
            "strokeWeight": 1,
            "strokeColor": "#333",
            //            "fillColor": color ? "#0096f4" : "#333",
            "fillColor": "#333",
            "fillOpacity": 0.75,
            "optimized": false,
            "rotation": angle
        };
    }

    var getPlaybackIcon = function (angle) {
        return {
            "path": "M 0 0 a 5 5 0 1 0 0.0001 0 z",
            "scale": 1,
            "strokeWeight": 1,
            "strokeColor": "#ffffff",
            "fillColor": "#2dac31",
            "fillOpacity": 1,
            "optimized": false,
            "rotation": angle
        };
    }

    var getPlaybackMarker = function (angle) {
        return {
            "path": "M 30 40 A 40 40 -90 1 1 -30 40 L 0 10 z",
            "scale": 0.2,
            "strokeWeight": 1,
            "strokeColor": "#eee",
            "fillColor": "#1c5200",
            "fillOpacity": 0.75,
            "optimized": false,
            "rotation": angle
        };
    }

    var getSelectedIcon = function () {
        return {
            "path": "M 30 40 A 40 40 -90 1 1 -30 40 L 0 10 z",
            "scale": 0.2,
            "strokeWeight": 1,
            "strokeColor": "#0096f4",
            "fillColor": "#0096f4",
            "fillOpacity": 1,
            "optimized": false,
        };
    }

    var lineOnMap = new google.maps.Polyline({
        strokeColor: '#00b3fd',
        strokeOpacity: 0.6,
        strokeWeight: 5,
        path: []
    });

    var playbackLine = new google.maps.Polyline({
        strokeColor: '#1c5200',
        strokeOpacity: 0.6,
        strokeWeight: 5,
        path: []
    });

    $scope.tabClick = function (type) {
        if (type == "home") {
            $scope.home_state = true;
            $scope.isHomeTab = true;
        } else {
            $state.go("visual", null);
        }
    };

    $scope.init = function () {
        if (LoginHandler.checkLoginStatus()) {
            isAdmin = DataHandler.getObject("isAdmin");
            if (isAdmin === true) {
                $state.go("admin");
            } else {
                initializeMap();
                $scope.vids = DataHandler.getObject("vids");
                $scope.vid = $scope.vids[0];
                $scope.devices = DataHandler.getObject("devices");

                if (Object.keys($scope.devices).length == 0) {
                    getVehicleList($scope.vids);
                } else {
                    for (var i = 0; i < $scope.vids.length; i++) {
                        getCurrentLocation($scope.vids[i]);
                    }
                }

                getAllAlerts();
                Socket.on("alert", alertSocketCallback);
                Socket.on("telemetry_response", telemetrySocketCallBack);
                Socket.emit("telemetry_request");

                $scope.tabClick("home");
                DataHandler.set("selectedDevice", $scope.vid);
                $scope.selectedDevice = $scope.devices[$scope.vids[0]];
				$scope.searchResults = $scope.devices;
            }
        } else $state.go('login');
    }

    $scope.init();

    // clean up functions
    $scope.$on('$destory', function (e) {
        $timeout.cancel($scope.myplaybackTimer);
    });

	$scope.filterVehicles = function () {
		var tempData = {};
		for(key in $scope.devices){
			var regNo = $scope.devices[key]._source.registrationNumber.toLowerCase();
			if(regNo.indexOf($scope.vSearch.toLowerCase()) > -1){
				tempData[key]=$scope.devices[key];
			}
		}
		$scope.searchResults = tempData;
    };

    $scope.selectDevice = function (_device) {
        $scope.vid = _device.vid;
        $scope.startTime = null;
        $scope.endTime = "";

        alertMarker.setMap(null);
        $scope.alertFilter = _device.vid;

        selectedDevice = _device;
        $scope.selectedDevice = _device;
        var point = new google.maps.LatLng(_device.telemetry.geo.split(',')[0], _device.telemetry.geo.split(',')[1]);
        $scope.map.setCenter(point);
        $scope.map.setZoom(zoomLevelForTracking);
        $scope.selectedDevice.map.setIcon(getIcon(_device.telemetry.angle, true));
        $scope.trackingFlag = true;
        if (lineOnMap != null) reset(function () {
            lineOnMap.setMap($scope.map);
            selectedDevice = _device.vid;
        });
        $scope.showAlertListing = false;
        $scope.makeVisibleStatusDetails = false;

        DataHandler.set("selectedDevice", $scope.vid);
    };

    $scope.showAlertOnMap = function (_alert) {
        $scope.trackingFlag = false;
        log(_alert._id);

        var contentString = "<div class='infoWindow'><strong class='header'>" + $scope.devices[_alert._source.tele.vid]._source.registrationNumber + "</strong><p><span class='message'>" + _alert._source.msg + "</span></p></div>";
        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });
        alertMarker.setMap(null);
        alertZoomOutFlag = true;
        alertMarker = new google.maps.Marker({
            position: new google.maps.LatLng(_alert._source.tele.geo.split(',')[0], _alert._source.tele.geo.split(',')[1]),
            map: $scope.map,
            icon: "/images/alert.png"
        });
        infowindow.open($scope.map, alertMarker);
        $scope.map.setZoom(zoomLevelForAlert);
        $scope.map.panTo(new google.maps.LatLng(_alert._source.tele.geo.split(',')[0], _alert._source.tele.geo.split(',')[1]));
    }

    $scope.markAlertRead = function (alert, _vid, _index) {
        $scope.showAlertOnMap(alert);
        Device.markAlertAsRead(alert._id).then(function (data) {
            $timeout(function () {
                $scope.allAlerts[_vid][_index]._source.isRead = true;
            }, 5000);
        }, function () {
            console.log("Error while marking alert as read");
        });
    };

    //functions outside of the $scope
    function initializeMap() {
        $scope.map = new google.maps.Map(document.getElementById('map'), {
            zoom: zoomLevel,
            panControl: false,
            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.LEFT_CENTER
            },
            center: {
                lat: 0,
                lng: 0
            },
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false
        });
    }

    // API calls
    function getVehicleList(devices) {
        for (var i = 0; i < devices.length; i++) {
            Device.getVehicleDetails(devices[i]).then(function (data) {
                var vid = data.vid;
                $scope.devices[vid] = data;
                DataHandler.setObject("devices", $scope.devices);
                getCurrentLocation(vid);
            }, function () {
                console.log("Error while fetching device details");
            });
        }
    }

    function getCurrentLocation(_id) {
        Device.getCurrentLocation(_id).then(function (_d) {
            if (_d) {
                $scope.devices[_id]["telemetry"] = _d;
                $scope.devices[_id]["map"] = new google.maps.Marker({
                    position: new google.maps.LatLng(_d.geo.split(',')[0], _d.geo.split(',')[1]),
                    map: $scope.map,
                    icon: getIcon(_d.angle),
                    animation: google.maps.Animation.DROP,
                    title: _id
                });
                $scope.devices[_id]["map"].addListener('click', function () {
                    markerOnClickListener($scope.devices[this.title]);
                });
                if (pantoFlag) {
                    var point = new google.maps.LatLng(_d.geo.split(',')[0], _d.geo.split(',')[1]);
                    $scope.map.panTo(point);
                    pantoFlag = false;
                }
            }
        }, function (_e) {
            console.log("No location data found for :: " + _id);
        });
    }

    function markerOnClickListener(_device) {
        alertMarker.setMap(null);

        $scope.showAlertIcons = false;
        $scope.showAlertDetails = false;
        $scope.makeVisibleStatusDetails = false;
        $scope.map.panTo(new google.maps.LatLng(_device.telemetry.geo.split(',')[0], _device.telemetry.geo.split(',')[1]));
        $scope.$apply(function () {
            /*$scope.addToTrackingList(_device._source.vid);*/
            $scope.selectDevice($scope.devices[_device._source.vid]);
        });
    }

    function getAllAlerts() {
        Device.getAlerts().then(function (_alerts) {
            groupAlerts(_alerts.hits);
        }, function (e) {
            console.error("Error getting alerts");
        })
    }

    function groupAlerts(alerts) {
        $scope.allAlerts = {};
        var i = 0;
        while (i < alerts.length) {
            var a = alerts[i];
            if (!$scope.allAlerts[a._source.tele.vid])
                $scope.allAlerts[a._source.tele.vid] = [];
            $scope.allAlerts[a._source.tele.vid].push(a);
            i++;
        }
        console.log($scope.allAlerts);
    }

    function reset(callback) {
        $timeout.cancel($scope.myplaybackTimer);
        selectedDevice = null;
        if (animationPromise != null) {
            animationPromise.then(function () {
                console.log("Nullifying the points, post animation...");
                nullifyPoints();
                if (callback) {
                    callback();
                }
            });
            animationPromise = null;
        } else {
            nullifyPoints();
            if (callback) {
                callback();
            }
        }
    }

    function nullifyPoints() {
        // todo uncomment this if multiple trackers are needed on the map
        lineOnMap.setMap(null);
        lineOnMap.setPath([]);
        selectedDevice = null;
        previousCord = null;
    }

    function computeSubBounds(mainBound) {
        var x1 = mainBound.getSouthWest().lng();
        var y1 = mainBound.getSouthWest().lat();
        var x2 = mainBound.getNorthEast().lng();
        var y2 = mainBound.getNorthEast().lat();
        var x = Math.abs(x2 - x1);
        var y = Math.abs(y2 - y1);
        var sw = new google.maps.LatLng((y1 + (y / 4)), (x1 + (x / 4)));
        var ne = new google.maps.LatLng(y1 + (3 * y / 4), (x1 + (3 * x / 4)));
        return new google.maps.LatLngBounds(sw, ne);

    };

    function drawSingleLine(_loc) {
        if (_loc.vid === selectedDevice) {
            //todo delete this line
            if (_loc.geo != previousCord) {
                var point = new google.maps.LatLng(_loc.geo.split(',')[0], _loc.geo.split(',')[1]);
                var truckPoint = new google.maps.LatLng(_loc.geo.split(',')[0], _loc.geo.split(',')[1]);
                var path = lineOnMap.getPath();
                var scrollBounds = computeSubBounds($scope.map.getBounds());
                if ($scope.boundsOfAwesomeness) {
                    if (rectangle != null) {
                        rectangle.setMap($scope.map);
                        rectangle.setBounds(scrollBounds);
                    } else {
                        rectangle = new google.maps.Rectangle({
                            strokeColor: '#FF0000',
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: '#FF0000',
                            fillOpacity: 0.35,
                            map: $scope.map,
                            bounds: scrollBounds
                        });
                    }
                } else {
                    if (rectangle != null && rectangle.getMap() != null) {
                        rectangle.setMap(null);
                    }
                }

                if ($scope.enableSmoothTracking && previousCord != null) {
                    var ite = 0;
                    var dx = (point.lat() - previousCord[0]) / 20;
                    var dy = (point.lng() - previousCord[1]) / 20;
                    var indx = 20;
                    var latLngArr = [];
                    while (ite < 20) {
                        latLngArr.push(new google.maps.LatLng((previousCord[0] + (ite * dx)), (previousCord[1] + (ite * dy))));
                        ite++;
                    }
                    ite = 0;

                    var animationDefer = $q.defer();
                    animationPromise = animationDefer.promise;
                    var animationStart = new Date();
                    var myVar = setInterval(function () {
                        var now = new Date();
                        if (ite < 20 && (now - animationStart) < 1000) {
                            var newPoint = latLngArr[ite];
                            $scope.devices[_loc.vid].map.setPosition(newPoint);

                            ite++;
                        } else {
                            if (ite != 20) {
                                // to do uncomment this like for debugging
                                // console.log("Timer Expired before we could complete.." + ite)
                            }
                        }
                    }, 49);
                    setTimeout(function () {
                        clearInterval(myVar);
                        if ($scope.trackingFlag && !scrollBounds.contains(point))
                            $scope.map.panTo(point);
                        //funCall();
                        lineOnMap.getPath().push(point);
                        $scope.devices[_loc.vid].map.setPosition(point);
                        animationDefer.resolve();
                    }, 1000);
                } else {
                    if ($scope.trackingFlag && !scrollBounds.contains(point))
                        $scope.map.panTo(point);
                    path.push(point);
                    $scope.devices[_loc.vid].map.setPosition(point);
                }

                if ($scope.trackingFlag && !scrollBounds.contains(point))
                    $scope.map.panTo(point);
                path.push(point);
                $scope.devices[_loc.vid].map.setPosition(point);
                previousCord = _loc.geo;
            } else {
                console.log("Truck has not moved");
            }
        }
    }

    function showToastMessage(_msg, _timeout) {
        if (flag_showToast) {
            flag_showToast = false;
            $scope.toastMessage = _msg;
            $scope.showToast = true;
            $timeout(function () {
                $scope.toastMessage = "";
                $scope.showToast = false;
                flag_showToast = true;
            }, _timeout);
        }
    }

    // socket callbacks
    function alertSocketCallback(_d) {
        $scope.$apply(function () {
            showToastMessage("New " + _d.type + " alert generated!", 5000);
        });
    }

    //    {
    //        "vid": "13512345007",
    //        "time": "2015-10-29T04:42:19.915Z",
    //        "acc": "On",
    //        "geo": "18.591845,73.79175333333333",
    //        "speed": 42,
    //        "angle": 333.42754414485296,
    //        "locate": "V",
    //        "mile": 125,
    //        "oil": 12,
    //        "engaged": true,
    //        "load%": 100
    //    }
    function telemetrySocketCallBack(_d) {
        if ($scope.devices[_d.vid]) {
            $scope.devices[_d.vid].telemetry = _d;
            if (selectedDevice == null || selectedDevice != _d.vid) { //Prevent the Selected Device Jumping about.
                $scope.devices[_d.vid].telemetry.speed = _d.speed;
                $scope.devices[_d.vid].telemetry.angle = _d.angle;
                $scope.devices[_d.vid].map.setPosition(new google.maps.LatLng(_d.geo.split(',')[0], _d.geo.split(',')[1]));
                $scope.devices[_d.vid].map.setIcon(getIcon(_d.angle));
                $scope.$apply(function () {});
            } else {
                if (!$scope.isPlayingBackData) {
                    $scope.devices[_d.vid].telemetry.speed = _d.speed;
                    $scope.devices[_d.vid].telemetry.angle = _d.angle;
                    $scope.devices[_d.vid].map.setIcon(getIcon(_d.angle, true));
                    $scope.devices[_d.vid].telemetry = _d;
                    drawSingleLine(_d);
                }
            }
        }
    }

});