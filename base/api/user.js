'use strict';

var debug = require('debug')('zeqi.hprose:base:api:user');
var Q = require('q');

var CommonApi = require('../../common/commonApi');

class BaseApi extends CommonApi {
  constructor(model) {
    super(model);
  }
}

module.exports = BaseApi;