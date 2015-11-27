app.controller('UserCtrl', function ($scope, $state, LoginHandler, DataHandler) {
    $scope.tab = 1;
    
    $scope.init = function () {
        if (LoginHandler.checkLoginStatus()) {
            var isAdmin = DataHandler.getObject("isAdmin");
            if (isAdmin === true) {
                $state.go("admin");
            } else {
                $state.go('user.index');
//                $state.go('user.visual');
            }
        } else $state.go('login');
    }
    $scope.init();

    $scope.logOut = function () {
        LoginHandler.logout();
        $state.go('login', null);
    }
});