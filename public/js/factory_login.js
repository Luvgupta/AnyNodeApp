app.factory('LoginHandler', function ($http, $q, DataHandler, HTTP) {

    var _username;
    var login = function (username, organisation, password) {
        var userCredentials = {
            username: username,
            org: organisation,
            password: password
        };
        var defer = $q.defer();

        $http({
            'method': "post",
            'url': api.user.login,
            'headers': {
                'Content-Type': "application/json"
            },
            'data': userCredentials
        }).success(function (data, status, headers, config) {
            defer.resolve(data);
        }).error(function (data, status, headers, config) {
            defer.reject();
        });

        return defer.promise;
    }


    var logout = function () {
        var defer = $q.defer();
        HTTP.GET(api.user.logoff).then(function (data) {
            defer.resolve(data);
        }, function (e) {
            defer.reject();
        });
        DataHandler.remove("token");
        DataHandler.remove("isAdmin");
        DataHandler.remove("canManageVehicles");
        DataHandler.remove("canManageUsers");
        DataHandler.remove("devices");
        DataHandler.remove("selectedDevice");
        window.localStorage.clear();
        return defer.promise;
    }

    var checkLoginStatus = function () {
        if (DataHandler.get('token')) return true;
        return false;
    }

    return {
        login: login,
        logout: logout,
        checkLoginStatus: checkLoginStatus,
        username: function () {
            return _username
        }
    }
});