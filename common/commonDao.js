/**
 * Operation database base module
 * @module commonDao
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
let log = debug('zeqi.hprose:common:commonDao:log');
let error = debug('zeqi.hprose:common:commonDao:error');
error.log = console.error.bind(console);

let EventEmitter = require('events');

//===============================
//      Logical start
//===============================
/**
 * Property to return when an error occurs in the operating database
 * @class
 */
class DaoError {
  /**
   * DaoError class constructor
   * @constructor
   * @param message
   * @param value
   * @param name
   * @param kind
   * @param path
   * @param reason
   */
  constructor(message, value, name, kind, path, reason) {
    this.message = message || 'Dao Error';
    this.value = value || '';
    this.name = name || 'DaoError';
    this.kind = kind || '';
    this.path = path || '';
    this.reason = reason || 'Dao Internal Error';
  }
}

/**
 * Operation database common class
 */
class CommonDao extends EventEmitter {
  constructor(model) {
    super();
    this.model = model;
    this.task = null;
    this.method = '';
  }

  /**
   * Error handler
   * @param task {object} The task being performed
   * @returns {DaoError}
   */
  taskError(task) {
    var self = this;
    return new DaoError('Exec function ' + self.method + ' find invalid task:' + JSON.stringify(task), task)
  }

  paramError(param) {
    var self = this;
    return new DaoError('Exec function ' + self.method + ' find invalid param:' + JSON.stringify(param), param)
  }

  execTask(task, callback) {
    var self = this;
    var method = self.method || 'execTask';
    if (!task) {
      return Q.reject(self.taskError(task)).nodeify(callback);
    }
    return Q.Promise(function (resolve, reject) {
      task.exec(function (err, result) {
        if (err) {
          error(method, '[error]', err);
          return reject(err);
        } else {
          log(method, '[result]', result);
          var data = result && result._doc
          return resolve(data);
        }
      });
    }).nodeify(callback);
  }

  getDonmain(filter) {
    if (!filter) {
      filter = {};
    }
    if (!filter.domain) {
      filter.domain = 'default';
    }
    return filter.domain;
  }

  create(filter, docs, callback) {
    this.method = 'create';
    var self = this;
    if (!Array.isArray(docs)) {
      docs = [docs];
    }
    return Q.Promise(function (resolve, reject) {
      self.model(self.getDonmain(filter)).create(docs, function (err, data) {
        if (err) {
          error(self.method, '[error]', err);
          return reject(err);
        } else {
          log(self.method, '[result]', data);
          return resolve(data);
        }
      });
    }).nodeify(callback);
  }

  save(filter, doc, callback) {
    this.method = 'save';
    var self = this;
    if (Array.isArray(doc)) {
      return this.create(doc, callback).nodeify(callback);
    }
    return Q.Promise(function (resolve, reject) {
      var mode = new self.model(self.getDonmain(filter))(doc);
      mode.save(function (err, data) {
        if (err) {
          error(self.method, '[error]', err);
          return reject(err);
        } else {
          log(self.method, '[result]', data);
          return resolve(data);
        }
      });
    }).nodeify(callback);
  }

  defineFind(filter, options) {
    var method = 'defineFind';
    var self = this;
    if (!filter) {
      filter = {};
    }
    if (!filter.condition) {
      filter.condition = filter;
    }
    if (!options) {
      options = {};
    }
    if (typeof options != 'object') {
      options = {};
    }
    var task = self.model(self.getDonmain(filter)).find(filter.condition, options);
    if (filter.sort) {
      task.sort(filter.sort);
    }
    if (filter.skip) {
      task.skip(filter.skip);
    }
    if (filter.limit) {
      task.skip(filter.limit);
    }
    return task;
  }

  defineCount(filter, options) {
    var method = 'defineCount';
    var self = this;
    if (!filter) {
      filter = {};
    }
    if (!filter.condition) {
      filter.condition = filter;
    }
    var task = self.model(self.getDonmain(filter)).count(filter.condition);
    return task;
  }

  find(filter, options, callback) {
    this.method = 'find';
    var self = this;
    return self.execTask(self.defineFind(filter, options), callback).nodeify(callback);
  }

  count(filter, options, callback) {
    this.method = 'count';
    var self = this;
    return self.execTask(self.defineCount(filter), callback).nodeify(callback);
  }

  findDocsAndCount(filter, options, callback) {
    this.method = 'findDocsAndCount';
    var self = this;
    var promises = [];
    promises.push(self.find(filter, options, callback));
    promises.push(self.count(filter, options, callback));

    return Q.allSettled(promises).then(function (result) {
      if (result && result[0].state == 'fulfilled' && result[1].state == 'fulfilled') {
        return {
          list: result[0].value,
          count: result[1].value
        }
      }
      return {
        list: [],
        count: 0
      }
    }).fail(function (err) {
      error(self.method, '[error]', err);
      return {
        list: [],
        count: 0
      }
    }).nodeify(callback);
  }

  defineFindOne(filter, options) {
    var method = 'defineFind';
    var self = this;
    if (!filter) {
      filter = {};
    }
    if (!filter.condition) {
      filter.condition = filter;
    }
    if (!options) {
      options = {};
    }
    if (typeof options != 'object') {
      options = {};
    }
    var task = self.model(self.getDonmain(filter)).findOne(filter.condition, options);
    if (filter.sort) {
      task.sort(filter.sort);
    }
    if (filter.skip) {
      task.skip(filter.skip);
    }
    if (filter.limit) {
      task.skip(filter.limit);
    }
    return task;
  }

  findOne(filter, options, callback) {
    this.method = 'findOne';
    var self = this;
    return self.execTask(self.defineFindOne(filter, options), callback).nodeify(callback);
  }

  findById(id, options, callback) {
    this.method = 'findById';
    var self = this;
    var task = self.model(self.getDonmain(filter)).findById(id, options);
    return self.execTask(task, callback).nodeify(callback);
  }

  update(filter, update, options, callback) {
    this.method = 'update';
    var self = this;
    if (!filter) {
      filter = {};
    }
    if (!filter.condition) {
      filter.condition = filter;
    }
    if (!options) {
      options = {};
    }
    var task = self.model(self.getDonmain(filter)).update(filter.condition, update, options);
    return self.execTask(task, callback).nodeify(callback);
  }

  findByIdAndUpdate(id, update, options, callback) {
    this.method = 'findByIdAndUpdate';
    var self = this;
    var task = self.model(self.getDonmain(filter)).findByIdAndUpdate(id, update, options);
    return self.execTask(task, callback).nodeify(callback);
  }

  findOneAndUpdate(filter, update, options, callback) {
    this.method = 'findOneAndUpdate';
    var self = this;
    if (!filter) {
      filter = {};
    }
    if (!filter.condition) {
      filter.condition = filter;
    }
    if (!options) {
      options = {};
    }
    var task = self.model(self.getDonmain(filter)).findOneAndUpdate(filter.condition, update, options);
    return self.execTask(task, callback).nodeify(callback);
  }

  remove(filter, options, callback) {
    this.method = 'remove';
    var self = this;
    if (!filter) {
      filter = {};
    }
    if (!filter.condition) {
      filter.condition = filter;
    }
    if (!options) {
      options = {};
    }
    var task = self.model(self.getDonmain(filter)).remove(filter.condition, options);
    return self.execTask(task, callback).nodeify(callback);
  }

  findByIdAndRemove(filter, id, options, callback) {
    this.method = 'findByIdAndRemove';
    var self = this;
    if (!filter) {
      filter = {};
    }
    if (!options) {
      options = {};
    }
    var task = self.model(self.getDonmain(filter)).findByIdAndRemove(id, options);
    return self.execTask(task, callback).nodeify(callback);
  }

  findOneAndRemove(filter, options, callback) {
    this.method = 'findOneAndRemove';
    var self = this;
    if (!filter) {
      filter = {};
    }
    if (!filter.condition) {
      filter.condition = filter;
    }
    if (!options) {
      options = {};
    }
    var task = self.model(self.getDonmain(filter)).findOneAndRemove(filter, options);
    return self.execTask(task, callback).nodeify(callback);
  }

  aggregate(filter, pipeline, options) {
    this.method = 'aggregate';
    var self = this;
    if (!filter) {
      filter = {};
    }
    if (!options) {
      options = {};
    }
    var task = self.model(self.getDonmain(filter)).aggregate(pipeline, options);
    return self.execTask(task, callback).nodeify(callback);
  }
}

module.exports = CommonDao;

module.exports.DaoError = DaoError;