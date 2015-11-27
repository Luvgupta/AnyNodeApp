app.controller('LoginCtrl', function ($scope, $state, $rootScope, LoginHandler, DataHandler) {

    $scope.loginError = false;

    $scope.signIn = function () {
        var promise_to_login = LoginHandler.login($scope.username, $scope.organisation, $scope.password);
        promise_to_login.then(function (data) {
            $scope.loginError = false;
            DataHandler.setObject("token", "JWT "+data.token);
            DataHandler.setObject("isAdmin", data.isAdmin);
            DataHandler.setObject("canManageVehicles", data.canManageVehicles);
            DataHandler.setObject("canManageUsers", data.canManageUsers);
            DataHandler.setObject("vids", data.devices);
            if (data.isAdmin === true) {
                $state.go('admin');
            } else {
                $state.go('user');
            }
        }, function (data) {
            $scope.loginError = true;
        });
    }

    $scope.register = function () {}

    $scope.forgotPass = function () {}

});