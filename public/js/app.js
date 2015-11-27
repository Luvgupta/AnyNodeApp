var app = angular.module("starter", [
    "ui.router",
    "ngAnimate",
    "ui.bootstrap",
	"chart.js"
]);

var state_login = {
    "url": "/login",
    "templateUrl": "templates/login/login.html",
    "controller": "LoginCtrl"
};

var state_dash = {
    "url": "/dashboard",
    "templateUrl": "templates/dash/dash.html",
    "controller": "DashCtrl"
};

var state_index = {
    "url": "/index",
    "templateUrl": "templates/index/index.html",
    "controller": "IndexCtrl",
    "params": {
        "id": null,
    }
};

var state_admin_index = {
    "url": "/admin",
    "templateUrl": "templates/admin_home/admin.html",
    "controller": "AdminCtrl",
    "params": {
        "id": null,
    }
};

var state_visualization = {
    "url": "/visualization",
    "templateUrl": "templates/visualization/visual.html",
    "controller": "VisualCtrl",
    "params": {
        "id": null,
    }
};

var state_mgmt = {
    "url": "/mgmt",
    "templateUrl": "templates/mgmt/mgmt.html",
    "controller": "MgmtCtrl"
};

var state_user_home = {
	"url": "/",
    "templateUrl": "templates/user_home/user.html",
    "controller": "UserCtrl"
};


// todo remove this
//console.clear();

app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
    $stateProvider
        .state("login", state_login)
		.state("user", state_user_home)
        .state("user.index", state_index)
		.state("user.visual", state_visualization)
		.state("user.mgmt", state_mgmt)
        .state("dash", state_dash)
		.state("admin", state_admin_index);
});

var appCtrl = angular.module("appController", []);

function log(s) {
    console.log("# " + JSON.stringify(s, null, "\t"));
}


// based on the locale, change the strings

function getDateTime(incomingDate) {
    if (typeof incomingDate != "undefined") {
        var sd = incomingDate;
        var syear = sd.getFullYear();
        var smonth = ("0" + (sd.getMonth() + 1)).slice(-2);
        var sdate = ("0" + sd.getDate()).slice(-2);
        var shours = ("0" + sd.getHours()).slice(-2);
        var sminutes = ("0" + sd.getMinutes()).slice(-2);
        var startDate = syear + "-" + smonth + "-" + sdate;
        var startTime = shours + ":" + sminutes;
        return startDate + " " + startTime;
    }
    return "";
}

var loc_hist = "";
