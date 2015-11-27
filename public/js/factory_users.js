app.factory('Users', function ($http, $q, DataHandler, HTTP) {

    var addUser = function (userDetails) {
		var defer = $q.defer();
        HTTP.POST(api.user.add, token, userDetails).then(function (d) {
            defer.resolve(d);
        }, function (e) {
            defer.reject();
        });
        return defer.promise;
    };

	var getUserList = function (token) {
        var defer = $q.defer();
        HTTP.GET(api.user.list,token).then(function (d) {
            defer.resolve(d);
        }, function (e) {
            defer.reject();
        });
        return defer.promise;
    }
	
	var updateUser = function(user, password){
		var userData = {
			"_id" : user._id,
			"username" : user._source.username,
			"org" : user._source.org,
			"password" : password
		};
		var defer = $q.defer();
		HTTP.POST(api.user.update, userData).then(function(data){
			defer.resolve(data);
		}, function(){
			defer.reject();
		});
        return defer.promise;
	}
	
	var deleteUser = function(token, user){
		var defer = $q.defer();
		var url = api.user.delete + "?id="+user._id+"&username="+user._source.username;
		HTTP.GET(url).then(function(data){
			defer.resolve(data);
		}, function(){
			defer.reject();
		});
		
        return defer.promise;
	}
	
    return {
        addUser: addUser,
		getUserList: getUserList,
		updateUser: updateUser,
		deleteUser: deleteUser
    }
});