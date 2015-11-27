app.controller('AdminCtrl', function ($scope, $state, $timeout, LoginHandler, DataHandler, Users, Device, Audit) {

    $scope.showAddUser = false;
    $scope.user = {};
    $scope.selectedUser = {};
    $scope.passwordError = false;
    $scope.createUserError = false;
    $scope.createDeviceError = false;
    $scope.deviceList = {};
    $scope.isAdmin = false;
    $scope.canAddDevices = false;
    $scope.canAddUsers = false;

    $scope.isCollapsed = false;

    var token;

    $scope.init = function () {
        $scope.user_state = true;
        $scope.device_state = false;
        $scope.isUserTab = true;
        $scope.isDeviceTab = false;

        fetchDeviceList();
        fetchUserList();
        fetchAuditList();

    };
    $scope.init();

    function fetchAuditList() {
        var promise_auditList = Audit.getAuditList(token);
        promise_auditList.then(function (data) {
            $scope.auditList = data.hits;
        }, function () {
            console.log("Error while fetching Audit Logs");
        });
    }

    function fetchDeviceList() {
        var promise_deviceList = Device.getVehicleList(token);
        promise_deviceList.then(function (data) {
            $scope.deviceList = data;
        }, function () {
            console.log("Error while fetching devices");
        });
    }

    function fetchUserList() {
        $timeout(function () {
            var promise_userList = Users.getUserList(token);
            promise_userList.then(function (data) {
                $scope.userList = data;
                $scope.userList.forEach(function (user) {
                    if (user.username === "admin") {
                        var index = $scope.userList.indexOf(user);
                        $scope.userList.splice(index, 1);
                    }
                });
                $scope.selectUser($scope.userList[0]);
                console.log($scope.userList);
            }, function () {
                console.log("Error while fetching devices");
                $scope.userList = [];
            });
        }, 1000);
    }

    $scope.tabClick = function (type) {
        $scope.device_state = false;
        $scope.user_state = false;
        $scope.audit_state = false;
        $scope.isDeviceTab = false;
        $scope.isUserTab = false;
        $scope.isAuditTab = false;
        if (type == "device") {
            $scope.device_state = true;
            $scope.isDeviceTab = true;
        } else if (type == "user") {
            $scope.user_state = true;
            $scope.isUserTab = true;
        } else {
            $scope.audit_state = true;
            $scope.isAuditTab = true;
        }
    };

    $scope.logOut = function () {
        var promise_logout = LoginHandler.logout();
        promise_logout.then(function (data) {
            DataHandler.remove("token");
            DataHandler.remove("isAdmin");
            DataHandler.remove("canManageVehicles");
            DataHandler.remove("canManageUsers");
            DataHandler.remove("devices");
            localStorage.clear();
            window.onpopstate = function (e) {
                window.history.forward(1);
            }
        }, function (data) {
            console.log("Error while logging out");
        });
        DataHandler.remove("token");
        DataHandler.remove("isAdmin");
        DataHandler.remove("canManageVehicles");
        DataHandler.remove("canManageUsers");
        DataHandler.remove("devices");
        localStorage.clear();
        window.onpopstate = function (e) {
            window.history.forward(1);
        }
        $state.go('login', null);
    };

    $scope.userReset = function () {
        $scope.showAddUser = !$scope.showAddUser;
        $scope.isUserUpdate = false;
        $scope.user = {};
    }

    $scope.openAddUser = function () {
        $scope.title = "Add New User";
        $scope.passwordError = false;
        $scope.createUserError = false;
        $scope.isUserAdd = true;
        $scope.isDisabled = false;
        $scope.user = {
            username: "",
            password: "",
            password2: "",
            org: "",
            isAdmin: false,
            canAddDevices: false,
            canAddUsers: false
        };
    };

    $scope.selectUser = function(_u){
        $scope.selectedUser = _u;
    }
    
    $scope.addUser = function (type) {
        if ($scope.user.username && $scope.user.password && $scope.user.password2) {
            $scope.createUserError = false;
            if ($scope.user.password === $scope.user.password2) {
                $scope.passwordError = false;
                if (type == "add") {
                    var userDetails = {
                        "username": $scope.user.username,
                        "password": $scope.user.password,
                        "org": $scope.user.org,
                        "isAdmin": $scope.user.isAdmin,
                        "canManageVehicle": $scope.user.canAddDevices,
                        "canManageUsers": $scope.user.canAddUsers
                    };

                    var promise_usrAdd = Users.addUser(userDetails);
                    promise_usrAdd.then(function (data) {
                        console.log("User added successfully");
                        fetchUserList();
                    }, function () {
                        console.log("Error while adding user");
                    });
                    $scope.userReset();
                } else {
                    var promise_usrUpdate = Users.updateUser($scope.user, $scope.password);
                    promise_usrUpdate.then(function (data) {
                        console.log("User updating successfully");
                    }, function () {
                        console.log("Error while updating user");
                    });
                }
            } else {
                $scope.passwordError = true;
            }
        } else {
            $scope.passwordError = false;
            $scope.createUserError = true;
        }
    };

    $scope.editUser = function (user) {
        $scope.showAddUser = true;
        $scope.user = user;
        $scope.title = "Update User";
        $scope.isUserUpdate = true;
        $scope.isDisabled = true;
        $scope.user = {
            username: user._source.username,
            password: "",
            password2: "",
            org: "",
            isAdmin: false,
            canAddDevices: false,
            canAddUsers: false
        }
    };

    $scope.deleteUser = function (user) {
        console.log("Delete user");
        var promise_deleteUser = Users.deleteUser(user);
        promise_deleteUser.then(function () {
            console.log("User deleted successfully");
            var index = $scope.userList.indexOf(user);
            if (index > -1) {
                $scope.userList.splice(index, 1);
            }
        }, function () {
            console.log("Error while deleting user");
        });
    };

    $scope.openAddDevice = function () {
        $scope.title = "Add New Device";
        $scope.isDeviceAdd = true;
        $scope.isDeviceDisabled = false;
        $scope.deviceId = "";
        $scope.regNo = "";
        $scope.make = "";
        $scope.model = "";
        $scope.permit = "";
        $scope.createDeviceError = false;
    };

    $scope.addDevice = function (type) {
        console.log("Click " + $scope.make);
        if ($scope.deviceId && $scope.regNo && $scope.make && $scope.model && $scope.permit) {
            var deviceData = {
                "vid": $scope.deviceId,
                "registrationNumber": $scope.regNo,
                "make": $scope.make,
                "permit": $scope.permit,
                "modelYear": $scope.model
            }

            if (type == "add") {
                var promise_addvehicle = Device.addNewVehicle(deviceData);
                promise_addvehicle.then(function (data) {
                    console.log("Successfully added vehicle");
                    $scope.deviceList.push({
                        "_source": deviceData
                    });
                }, function () {
                    console.log("Error while adding vehicle");
                });
            } else {
                deviceData.id = $scope.id;
                var promise_updatevehicle = Device.updateVehicle(deviceData);
                promise_updatevehicle.then(function () {
                    console.log("Successfully updated vehicle");
                    delete deviceData.id;

                    var index = $scope.deviceList.indexOf($scope.device);
                    if (index > -1) {
                        $scope.deviceList.splice(index, 1);
                    }
                    $scope.deviceList.push({
                        "_id": $scope.id,
                        "_source": deviceData
                    });
                }, function () {
                    console.log("Error while updating vehicle");
                });
            }
            angular.element("#deviceModal").modal('hide');
        } else {
            $scope.createDeviceError = true;
        }
    };

    $scope.editDevice = function (device) {
        $scope.title = "Update Device";
        $scope.isDeviceAdd = false;
        $scope.isDeviceDisabled = true;
        $scope.device = device;
        $scope.id = device._id;
        $scope.deviceId = device._source.vid;
        $scope.regNo = device._source.registrationNumber;
        $scope.make = device._source.make;
        $scope.model = device._source.modelYear;
        $scope.permit = device._source.permit;
    };

    $scope.deleteDevice = function (device) {
        var promise_deleteVehicle = Device.deleteVehicle(device._source.vid);
        promise_deleteVehicle.then(function () {
            console.log("Vehicle deleted successfully");
            var index = $scope.deviceList.indexOf(device);
            if (index > -1) {
                $scope.deviceList.splice(index, 1);
            }
        }, function () {
            console.log("Error while deleting vehicle");
        });
    };

    $scope.searchLogs = function () {
        $scope.searchResult = $scope.search;
    };
});