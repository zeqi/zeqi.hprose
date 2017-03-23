/**
 * Base api module
 * @module commonApi
 */

'use strict';

//===============================
//      Third party module
//===============================
let Q = require('q');

//===============================
//      Custom module
//===============================
let debug = require('debug');
let log = debug('zeqi.hprose:common:commonApi:log');
let error = debug('zeqi.hprose:common:commonApi:error');
error.log = console.error.bind(console);

let EventEmitter = require('events');

class commonApi extends EventEmitter {
  constructor(dao) {
    super();
    this.dao = dao;
  }

  create(filter, docs, callback) {
    var self = this;
    self.dao.create(filter, docs).then(data => {
      return data;
    }).nodeify(callback);
  }

  update(filter, body, options, callback) {
    var self = this;
    self.dao.update(filter, body, options).then(data => {
      return data;
    }).nodeify(callback);
  }

  findOneAndUpdate(filter, body, options, callback) {
    var self = this;
    return self.dao.findOneAndUpdate(filter, body, options).then(data => {
      delete data.tracking;
      return data;
    }).nodeify(callback);
  }
}

module.exports = commonApi;