/**
 * Operation database base module
 * @module dao-->base
 */

'use strict'

//===============================
//      Third party package
//===============================
var Q = require('q');

//===============================
//      Custom package
//===============================
var debug = require('debug')('zeqi.hprose');
var error = debug('baseDao:error');

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
 * Operation database base class
 */
class Base {
    constructor(model) {
        this.model = model;
        this.task = null;
        this.method = '';
        this.customPageSize = 10;
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

    execTask(task, callback, methodName) {
        var self = this;
        if (!methodName) {
            methodName = self.method;
        }

        if (!task) {
            return Q.reject(self.taskError(task)).nodeify(callback);
        }
        return Q.Promise(function (resolve, reject) {
            task.exec(function (err, result) {
                if (err) {
                    error(methodName, 'Error:\n', err);
                    return reject(err);
                } else {
                    debug(methodName, 'Result:\n', result);
                    return resolve(result);
                }
            });
        }).nodeify(callback);
    }

    findDefine(condition, pageIndex, pageSize, sort) {
        var method = 'findDefine';
        var self = this;
        if (!condition) {
            condition = {};
        }
        var task = self.model.find(condition);
        if (validate.isNumber(pageIndex)) {
            if (!validate.isNumber(pageSize)) {
                pageSize = self.customPageSize;
            }
            var startLine = (pageIndex - 1) * pageSize
            task.limit(pageSize).skip(startLine);
        }
        if (validate.isObject(sort)) {
            task.sort(sort);
        }

        return task;
    }

    countDefine(condition) {
        var method = 'countDefine';
        var self = this;
        if (!condition) {
            condition = {};
        }
        var task = self.model.count(condition);
        return task;
    }

    save(data, callback) {
        if (Array.isArray(data)) {
            return this.create(data, callback);
        }
        var self = this;
        return Q.Promise(function (resolve, reject) {
            var mod = new self.model(data);
            mod.save(function (err, doc) {
                if (err) {
                    error(self.method, 'Error:\n', err);
                    return reject(err);
                } else {
                    debug(self.method, 'Result:\n', doc);
                    return resolve(doc);
                }
            });
        }).nodeify(callback);
    }

    create(data, callback) {
        this.method = 'create';
        var self = this;
        if (!Array.isArray(data)) {
            data = [data];
        }
        return Q.Promise(function (resolve, reject) {
            self.model.create(data, function (err, docs) {
                if (err) {
                    error(self.method, 'Error:\n', err);
                    return reject(err);
                } else {
                    debug(self.method, 'Result:\n', docs);
                    return resolve(docs);
                }
            });
        }).nodeify(callback);
    }

    find(condition, pageIndex, pageSize, sort, callback) {
        this.method = 'find';
        var self = this;
        var task = self.findDefine(condition, pageIndex, pageSize, sort);
        return self.execTask(task, callback, self.method).nodeify(callback);
    }

    findListAndCount(condition, pageIndex, pageSize, sort, callback) {
        this.method = 'findListAndCount';
        var self = this;
        if (!condition) {
            condition = {};
        }

        var promises = [];
        promises.push(self.find(condition, pageIndex, pageSize, sort, callback));
        promises.push(self.count(condition, callback));

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
            error(self.method, 'Error:\n', err);
            return {
                list: [],
                count: 0
            }
        }).nodeify(callback);
    }

    findAll(callback) {
        this.method = 'findAll';
        var self = this;
        var task = self.model.find();
        return self.execTask(task, callback).nodeify(callback);
    }

    findById(id, callback) {
        this.method = 'findById';
        var self = this;
        if (!id) {
            return Q.reject(self.paramError(id)).nodeify(callback);
        }
        var task = self.model.findById(id);
        return self.execTask(task, callback).nodeify(callback);
    }

    findOne(condition, callback) {
        this.method = 'findOne';
        var self = this;
        if (!condition) {
            condition = {};
        }
        var task = self.model.findOne(condition);
        return self.execTask(task, callback).nodeify(callback);
    }

    findByIdAndUpdate(id, update, options, callback) {
        this.method = 'findByIdAndUpdate';
        var self = this;
        if (!id) {
            return Q.reject(self.paramError(id)).nodeify(callback);
        }
        if (!update) {
            return Q.reject(self.paramError(update)).nodeify(callback);
        }

        var task = self.model.findByIdAndUpdate(id, update, options);
        return self.execTask(task, callback).nodeify(callback);
    }

    count(condition, callback) {
        this.method = 'count';
        var self = this;
        var task = self.countDefine(condition);
        return self.execTask(task, callback, self.method).nodeify(callback);
    }

    update(condition, update, options, callback) {
        this.method = 'update';
        var self = this;

        if (!condition) {
            Q.reject(self.paramError(condition)).nodeify(callback);
        }
        if (!update) {
            Q.reject(self.paramError(update)).nodeify(callback);
        }
        var task = self.model.update(condition, update, options);
        return self.execTask(task, callback).nodeify(callback);
    }

    findOneAndUpdate(condition, update, options, callback) {
        this.method = 'findOneAndUpdate';
        var self = this;
        if (!condition) {
            Q.reject(self.paramError(condition)).nodeify(callback);
        }
        if (!update) {
            Q.reject(self.paramError(update)).nodeify(callback);
        }
        var task = self.model.findOneAndUpdate(condition, update, options);
        return self.execTask(task, callback).nodeify(callback);
    }

    remove(condition, callback) {
        this.method = 'remove';
        var self = this;
        if (!condition) {
            Q.reject(self.paramError(condition)).nodeify(callback);
        }
        var task = self.model.remove(condition);
        return self.execTask(task, callback).nodeify(callback);
    }

    findByIdAndRemove(id, options, callback) {
        this.method = 'findByIdAndRemove';
        var self = this;
        if (!id) {
            Q.reject(self.paramError(id)).nodeify(callback);
        }
        if (!options) {
            options = {}
        }
        var task = self.model.findByIdAndRemove(id, options);
        return self.execTask(task, callback).nodeify(callback);
    }
}

module.exports = Base;

module.exports.DaoError = DaoError;