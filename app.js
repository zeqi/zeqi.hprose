'user strict';

let config = require('config');
let hprose = require("hprose");

let common = require('zeqi.common');
let DS = common.DS;
DS.initAllDS(config.get('DataProviders'))

let userDao = require('./persistence/dao/user');

function create(body, callback) {
  return userDao.save('default', body).nodeify(callback);
}
let server = hprose.Server.create("http://127.0.0.1:8080");
server.addAsyncFunction(create, 'user');
server.start();