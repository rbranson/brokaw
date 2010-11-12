# Brokaw

Brokaw is a general use publish/subscribe message broker built on Socket.IO and node.js. 

## The Sauce

Brokaw allows clients to subscribe to messages using a pattern matching expression, which makes it ideal for "feed" type data. It is also designed with performance in mind. It uses the glob-trie.js module for pattern matching, so it should scale well, even with tens or hundreds of thousands of subscriptions and high message volume.

## Message Routing

Each message is assigned a routing key, which is similar to a "topic" in a message queueing system. The message is delivered to any clients with subscription expressions that match the routing key. For example, if a client subscribes to "stocks.nasdaq.*" they will receive updates for any message with the routing keys like "stocks.nasdaq.msft" and "stocks.nasdaq.goog" but not "stocks.us.nyse.ibm" or "news."

## The Server

    $ npm install socket.io
    $ npm install glob-trie.js
    $ node server/brokaw.js

## The Client

    <script src="http://cdn.socket.io/stable/socket.io.js"></script>
    <script src="/path/to/brokaw/client/brokaw.js"></script>
    
    <script type="text/javascript">
      var brokaw = new Brokaw("localhost", 1025);
      brokaw.on("connect", function() {
        alert("Brokaw is connected!");
      });
      brokaw.on("connect", function() {
        alert("Brokaw is disconnected!");
      });
      brokaw.on("message", function(key, msg) {
        alert("brokaw message: " + key + ": " + msg);
      });
      
      brokaw.subscribe("/pets/*/bob");
      brokaw.subscribe("/pets/cheetahs*");
      
      brokaw.publish("/pets/snakes/bob", "Bob the Snake eats pythons for dinner!");
      brokaw.publish("/pets/cheetahs/drake", "Drake the Cheetah isn't very interesting :(");
      
      brokaw.unsubscribe("/pets/cheetahs*");
    <script>


## Notes

* This is *experimental* quality software.
* Tested on node v0.2.4.
* There is no node.js client yet. This is on the list.
* There is no security yet. I'm working out a good way to do this. So... a client can subscribe to "*" and get all the messages right now.
