var debug = require('debug');
var log = debug('zeqi.hprose:client:log');
var error = debug('zeqi.hprose:client:error');
error.log = console.error.bind(console); // don't forget to bind to console!
var hprose = require("hprose");
var client = hprose.Client.create("http://127.0.0.1:8080/");
var proxy = client.useService(['create', 'update', 'findOneAndUpdate']);
/*proxy.create({username: 'zeqi', password: '123123', mobile: '13572147742'}).then(data=> {
 console.log('doc', data);
 }).fail(err=> {
 console.log('error', err);
 });*/

//{$addToSet: {tracking: {ip: '127.0.0.1'}}}
/*proxy.update({condition: {mobile: '13572147742'}}, {username: 'zeqi'}).then(data => {
  log('doc', data);
}).fail(err => {
  error(err);
});*/

proxy.findOneAndUpdate({ condition: { mobile: '13572147742' } }, { username: 'zeqi' }).then(data => {
  data._id = data._id.toString();
  log('doc', data);
}).fail(err => {
  error(err);
});