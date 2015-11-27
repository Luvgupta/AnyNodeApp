app.factory('Socket', function () {
    // init socket
    var hostname = parent.document.location.hostname;
    var ioSocket = io.connect('http://' + hostname + ':80');

    return {
        on: function (eventName, callback) {
            ioSocket.on(eventName, function (_d) {
                callback(_d);
            });
        },
        emit: function (eventName, data) {
            ioSocket.emit(eventName, data);
        }
    }
});