'use strict';

var debug = require('debug')('zeqi.hprose:base:dao:user');
var Q = require('q');

var CommonDao = require('../../common/commonDao');
var DaoError = CommonDao.DaoError;

class BaseDao extends CommonDao {
  constructor(model) {
    super(model);
  }
}

module.exports = BaseDao;