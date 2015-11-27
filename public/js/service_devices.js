app.factory('Device', function ($q, $http, HTTP) {

    var methods = {};
	
    methods.getAlerts = function (token) {
        var defer = $q.defer();
        HTTP.GET(api.device.alert, token).then(function (d) {
            defer.resolve(d);
        }, function (e) {
            defer.reject();
        });
        return defer.promise;
    }

    methods.markAlertAsRead = function (_id) {
        var defer = $q.defer();
        HTTP.PUT(api.device.alert + "?id=" + _id).then(function (status) {
            defer.resolve();
        }, function (e) {
            defer.reject();
        });
        return defer.promise;
    }

    methods.getCurrentLocation = function (_id) {
        var defer = $q.defer();
        HTTP.GET(api.device.location + "?vid=" + _id).then(function (d) {
            defer.resolve(d);
        }, function (e) {
            defer.reject();
        });
        return defer.promise;
    }
	
	/** NEW APIS **/
	methods.getVehicleList = function(token){
		var defer = $q.defer();
		HTTP.GET(api.device.list, token).then(function(data){
			defer.resolve(data);
		}, function(){
			defer.reject(status);
		});
		
        return defer.promise;
	}
	
	methods.addNewVehicle = function(token, deviceData){
		var defer = $q.defer();
		HTTP.POST_HEADER("/api/device/add", token, deviceData).then(function(data){
			defer.resolve(data);
		}, function(){
			defer.reject(status);
		});
		
        return defer.promise;
	}
	
	methods.updateVehicle = function(token, deviceData){
		var defer = $q.defer();
		
		HTTP.POST_HEADER("/api/device/update", token, deviceData).then(function(data){
			defer.resolve(data);
		}, function(){
			defer.reject(status);
		});
        return defer.promise;
	}
	
	methods.deleteVehicle = function(token, deviceId){
		var defer = $q.defer();
		var url = "/api/device/delete?vid="+deviceId;
		HTTP.GET(url, token).then(function(data){
			defer.resolve(data);
		}, function(){
			defer.reject(status);
		});
		
        return defer.promise;
	}
	
	methods.getVehicleDetails = function(deviceId){
		var defer = $q.defer();
		var url = "/api/device/get?vid="+deviceId;
		HTTP.GET(url).then(function(data){
			defer.resolve(data);
		}, function(){
			defer.reject(status);
		});
		
        return defer.promise;
	}
	
	methods.getVehicleTelemetry = function(token, deviceId, startTime, endTime, offset){
		var defer = $q.defer();
		var url = "api/viz/telemetry?id=" + deviceId + "&st=" + startTime.toISOString() + "&et=" + endTime.toISOString() + "&offset="+offset;
		HTTP.GET(url, token).then(function(data){
			var totalData = data.total;
			var tempData = data.hits;
			
			if(totalData > 200 ){
				for(var i=200;i<totalData;i=i+200){
					url = "api/viz/telemetry?id=" + deviceId + "&st=" + startTime.toISOString() + "&et=" + endTime.toISOString() + "&offset="+i;
					HTTP.GET(url, token).then(function(data){
						tempData = tempData.concat(data.hits);
						if(i>totalData){
							defer.resolve(tempData);
						}
					}, function(){
						defer.reject(status);
					});
				}
			}else{
				defer.resolve(tempData);
			}
		}, function(){
			defer.reject(status);
		});
		
        return defer.promise;
	}
	
	methods.getDistFuelData = function(token, deviceId, startTime, endTime){
		var defer = $q.defer();
		var url = "api/viz/distFuel?id=" + deviceId + "&st=" + startTime.toISOString() + "&et=" + endTime.toISOString();
		HTTP.GET(url, token).then(function(data){
			defer.resolve(data);
		}, function(){
			defer.reject(status);
		});
		
        return defer.promise;
	}
	
    return methods;
});