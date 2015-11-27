app.factory('Audit', function ($http, $q, DataHandler, HTTP) {

    
	var getAuditList = function (token) {
        var defer = $q.defer();
        HTTP.GET("/api/util/audit?offset=0",token).then(function (d) {
            defer.resolve(d);
        }, function (e) {
            defer.reject();
        });
        return defer.promise;
    }
	
	
    return {
		getAuditList: getAuditList
    }
});