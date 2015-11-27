app.controller('DateTimeModalInstanceCtrl', function ($scope, $modalInstance, title) {

    $scope.title = title;
    $scope.val = {
        d: new Date(),
        t: new Date()
    }

    $scope.max = new Date();

    $scope.ok = function () {
        var d = new Date();
        d.setTime((new Date($scope.val.t)).getTime());
        d.setDate((new Date($scope.val.d)).getDate());
        $modalInstance.close(d);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});