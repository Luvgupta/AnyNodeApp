app.factory('HTTP', function ($http, $q, DataHandler) {

    var GET = function (url) {
        var token = DataHandler.getObject("token");
        var defer = $q.defer();
        $http({
            method: "get",
            url: url,
            headers: {
                "Authorization": token
            }
        }).success(function (data, status, headers, config) {
            defer.resolve(data);
        }).error(function (data, status, headers, config) {
            defer.reject(status);
        });
        return defer.promise;
    }

    var POST = function (url, data) {
        var token = DataHandler.getObject("token");
        var defer = $q.defer();
        $http({
            method: "post",
            url: url,
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            data: data
        }).success(function (data, status, headers, config) {
            defer.resolve(data);
        }).error(function (data, status, headers, config) {
            defer.reject();
        });
        return defer.promise;
    }

    var PUT = function (url) {
        var token = DataHandler.getObject("token");
        var defer = $q.defer();
        $http({
            method: "put",
            url: url,
            headers: {
                "Authorization": token
            }
        }).success(function (data, status, headers, config) {
            defer.resolve(status);
        }).error(function (data, status, headers, config) {
            defer.reject();
        });
        return defer.promise;
    }


    return {
        GET: GET,
        POST: POST,
        PUT: PUT
    }
});