var utils = {};

utils.foo = function () {
	return 'bar';
};

utils.telemetryCollection = function (reg) {
	return "Telemetry." + reg.replace(/\s/g, '_');
}

utils.resolveAllPromises = function(prArray, callback){
	console.log("prArray is now" + prArray.length);
	if (prArray.length > 0) {
		
		prArray.shift().then(function () {
			console.log("Resolved 1!");
			utils.resolveAllPromises(prArray, callback);
		});
	} else {
		console.log("Invoking the callback!");
		callback();
	}
};

module.exports = utils;