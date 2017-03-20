'user strict';

let config = require('config');
let hprose = require("hprose");

let common = require('zeqi.common');
let DS = common.DS;
DS.initAllDS(config.get('DataProviders'));

let userDao = require('./persistence/dao/user');

function create(body, callback) {
  return userDao.save(null, body).nodeify(callback);
}

function findOneAndUpdate(filter, body, callback) {
  return userDao.findOneAndUpdate(filter, body).nodeify(callback);
}
let server = hprose.Server.create("http://127.0.0.1:8080");
server.addAsyncFunction(create);
server.addAsyncFunction(findOneAndUpdate);
server.start();