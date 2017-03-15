var hprose = require("hprose");
var client = hprose.Client.create("http://127.0.0.1:8080/");
var proxy = client.useService(["create"]);
proxy.create({ username: 'zeqi', password: '123123', mobile: '13572147742' }, function (result) {
    console.log(result);
});