app.factory('Geo', function ($http, $q, DataHandler, HTTP) {

    var create = function (geoFence) {
        var defer = $q.defer();
        HTTP.POST(api.geo.create, geoFence).then(function (d) {
            defer.resolve(d);
        }, function (e) {
            defer.reject();
        });
        return defer.promise;
    };

    var listGeo = function () {
        var defer = $q.defer();
        HTTP.GET(api.geo.list).then(function (d) {
            defer.resolve(d);
        }, function (e) {
            defer.reject();
        });
        return defer.promise;
    }

    var update = function (geoFence) {
        var defer = $q.defer();
        HTTP.POST(api.geo.update, geoFence).then(function (data) {
            defer.resolve(data);
        }, function () {
            defer.reject();
        });
        return defer.promise;
    }

    var deleteGeo = function (fence_id) {
        var defer = $q.defer();
        var url = api.geo.delete + "?id=" + fence_id;
        HTTP.GET(url).then(function (data) {
            defer.resolve(data);
        }, function () {
            defer.reject();
        });

        return defer.promise;
    }

    return {
        create: create,
        listGeo: listGeo,
        update: update,
        deleteGeo: deleteGeo
    }
});