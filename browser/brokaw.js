var Brokaw = function(server, port) {
    var self = this;
    
    this._port      = port || 80;
    this._socket    = new io.Socket(server, { port: this._port, resource: "brokaw" });
    this._events    = {};
    
    this._socket.connect();
    
    this._socket.on("connect", function() {
        self._emit("connect");
    });
    
    this._socket.on("disconnect", function() {
        self._emit("disconnect");
    });
    
    this._socket.on("message", function(data) {
        var msg = JSON.parse(data);
        
        for (key in msg) {
            self._emit("message", key, msg[key]);
        }
    });
};

Brokaw.prototype._emit = function(args) {
    var args    = Array.prototype.slice.call(arguments),
        ev      = args.shift(),
        calls   = this._events[ev];
    
    if (calls) {
        for (var i = 0, len = calls.length; i < len; i++) {
            calls[i].apply(calls[i], args);
        }
    }
}

Brokaw.prototype.on = function(ev, callback) {
    if (!this._events[ev]) {
        this._events[ev] = [];
    }
    
    this._events[ev].push(callback);
};

Brokaw.prototype.subscribe = function(expr) {
    this._socket.send({"subscribe": expr});
};

Brokaw.prototype.unsubscribe = function(expr) {
    this._socket.send({"unsubscribe": expr});
};

Brokaw.prototype.publish = function(key, msg) {
    var obj = {};
    obj[key] = msg;
    this._socket.send({"publish": obj});
};

