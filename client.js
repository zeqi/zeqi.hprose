var hprose = require("hprose");
var client = hprose.Client.create("http://127.0.0.1:8080/");
var proxy = client.useService(['create', 'findOneAndUpdate']);
/*proxy.create({username: 'zeqi', password: '123123', mobile: '13572147742'}).then(data=> {
  console.log('doc', data);
}).fail(err=> {
  console.log('error', err);
});*/

//{$addToSet: {tracking: {ip: '127.0.0.1'}}}
proxy.findOneAndUpdate({condition: {mobile: '13572147742'}}, {username: 'zeqi'}).then(data => {
  console.log('doc', data);
}).fail(err => {
  console.log('error', err);
});
