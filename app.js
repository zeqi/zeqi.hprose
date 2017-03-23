'user strict';

let Q = require('q');
let config = require('config');
let hprose = require("hprose");

let common = require('zeqi.common');
let DS = common.DS;
DS.initAllDS(config.get('DataProviders'));

let userApi = require('./persistence/api/user');

function create(body, callback) {
  return userApi.create(null, body).nodeify(callback);
}

function update(filter, body, callback) {
  return userApi.update(filter, body).then(data => {
    return data;
  }).nodeify(callback);
}

function findOneAndUpdate(filter, body, callback) {
  return userApi.findOneAndUpdate(filter, body).then(data => {
    data._id = data._id.toString();
    return data;
  }).fail(err => {
    return Q.reject(err);
  }).nodeify(callback);
}

let server = hprose.Server.create("http://127.0.0.1:8080");
server.addAsyncFunction(create);
server.addAsyncFunction(update);
server.addAsyncFunction(findOneAndUpdate);
server.start();