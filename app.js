var hprose = require("hprose");
function hello(name, callback) {
    setTimeout(function() {
        callback("Hello " + name + "!");
    }, 10);
}
var server = hprose.Server.create("http://127.0.0.1:8080");
server.addAsyncFunction(hello);
server.start();