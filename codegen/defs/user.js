/**
 * Created by zhuxijun on 16-4-27.
 */

module.exports = {

    //========================
    //  module info
    //========================
    moduleName: 'user',
    dsName: 'ds_5116pai',
    collectionName: 'user',

    //========================
    //  mongodb model
    //========================
    schema_desc: 'Mongoose database schema for user.',
    schema: [{
        name: 'mobile',
        type: 'String',
        description: 'User current use phone number, Do not repeat in the collection or table',
        comma: true,
    }, {
        name: 'name',
        type: 'String',
        description: 'User name',
        comma: true
    }, {
        name: 'status',
        type: '{'
        + 'type: Number,'
        + 'default: 0'
        + '}',
        description: 'Current user status active|verified',
        comma: true
    }, {
        name: 'gender',
        type: '{'
        + 'type: Number,'
        + 'default: 0'
        + '}',
        description: 'Current user gender 0:未知,1:男.2:女',
        comma: true
    }, {
        name: 'createTime',
        type: '{'
        + 'type: Date,'
        + 'default: Date.now'
        + '}',
        description: 'Current user create time',
        comma: false
    }],
    schema_statics: [{
        name: 'findByName',
        conditionParams: [{
            name: 'name',
            schenaValse: true,
            isparam: true,
            comma: false
        }],
        description: 'Get User by name'
    }],
    schena_methods: [{
        name: 'findByStatus',
        conditionParams: [{
            name: 'status',
            schenaValse: true,
            isparam: true,
            comma: false
        }],
        description: 'Get User by status'
    }],

    //========================
    //  Dao info
    //========================
    daoName: 'UserDao',
    dao_desc: 'According to the module definition, Create a module dao for the module ',
    is_inherits_baseDao: false,
    baseDao_path: '../../base/dao/user',

    //========================
    //  Interface info
    //========================
    serviceName: 'User',
}