// Brokaw is a publish/subscribe streaming message broker for web protocols

var http        = require("http"),
    sys         = require("sys"),
    io          = require("socket.io"),
    GlobTrie    = require("glob-trie.js");

var Brokaw = {};

Brokaw.Server = function(port) {
    var self = this;
    
    // setup the basic HTTP server -- socket.io will wrap this
    var server  = http.createServer(function(req, res) {
        // We have to respond with something, otherwise the connections hang :(
        res.writeHead(404);
        res.close();
    });
    server.listen(port);
    
    this._io    = io.listen(server, { "resource": "brokaw" });
    this._trie  = new GlobTrie();
    
    this._io.on("connection", function(conn) {
        new Brokaw.Server.Client(conn, self);
    });
};

Brokaw.Server.prototype.subscribe = function(client, expr) {
    this._trie.add(expr, client);
};

Brokaw.Server.prototype.unsubscribe = function(client, expr) {
    this._trie.remove(expr, client);
};

Brokaw.Server.prototype.publish = function(key, msg) {
    var subscribers = this._trie.collect(key),
        obj         = {},
        json;
    
    obj[key] = msg;
    json     = JSON.stringify(obj);
    
    for (var i = 0, len = subscribers.length; i < len; i++) {
        subscribers[i].deliver(json);
    }
};

Brokaw.Server.Client = function(conn, server) {
    var self = this;
    
    this._server        = server;
    this._conn          = conn;
    this._subscriptions = [];
    
    conn.on("message", function(msg) {
        self._onMessage(msg);
    });
    
    conn.on("disconnect", function() {
        self._onDisconnect();
    });    
};

Brokaw.Server.Client.prototype.deliver = function(msg) {
    this._conn.send(msg);
};

Brokaw.Server.Client.prototype._onMessage = function(json) {
    if ("subscribe" in json) {
        // { subscribe: "/routing/key/matcher" }
        this._subscribe(json["subscribe"]);
    }
    else if ("unsubscribe" in json) {
        // { unsubscribe: "/routing/key/matcher" }
        this._unsubscribe(json["unsubscribe"]);      
    }
    else if ("publish" in json) {
        // { publish: { "key": "..." } }
        this._publish(json["publish"]);
    }
};

Brokaw.Server.Client.prototype._onDisconnect = function() {
    for (var i = 0, len = this._subscriptions.length; i < len; i++) {
        this._server.unsubscribe(this, this._subscriptions[i]);
    }
};

Brokaw.Server.Client.prototype._subscribe = function(expr) {
    this._subscriptions.push(expr);
    this._server.subscribe(this, expr);
};

Brokaw.Server.Client.prototype._unsubscribe = function(expr) {
    var idx = this._subscriptions.indexOf(expr);
    
    if (idx != -1) {
        this._subscriptions.splice(idx, 1);
    }
    
    this._server.unsubscribe(this, expr);
};

Brokaw.Server.Client.prototype._publish = function(what) {
    for (key in what) {
        this._server.publish(key, what[key]);
    }
};

new Brokaw.Server(1025);
