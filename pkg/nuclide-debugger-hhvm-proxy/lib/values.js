

/**
 * Converts a dbgp value to a Chrome RemoteObject.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils2;

function _utils() {
  return _utils2 = _interopRequireDefault(require('./utils'));
}

var _helpers2;

function _helpers() {
  return _helpers2 = require('./helpers');
}

var _ObjectId2;

function _ObjectId() {
  return _ObjectId2 = require('./ObjectId');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

function convertValue(contextId, dbgpProperty) {
  switch (dbgpProperty.$.type) {
    case 'string':
      return convertStringValue(dbgpProperty);
    case 'int':
      return convertIntValue(dbgpProperty);
    case 'float':
      return convertFloatValue(dbgpProperty);
    case 'bool':
      return convertBoolValue(dbgpProperty);
    case 'null':
      return getNullValue();
    case 'undefined':
      return getUndefinedValue();
    case 'array':
      return convertArrayValue(contextId, dbgpProperty);
    case 'object':
      return convertObjectValue(contextId, dbgpProperty);
    default:
      // TODO: Remaining property types - closure, hashmap, ...
      return convertUnknownValue(dbgpProperty);
  }
}

function convertStringValue(dbgpProperty) {
  var value = undefined;
  if (dbgpProperty.hasOwnProperty('_')) {
    // $FlowFixMe(peterhal)
    value = dbgpProperty.$.encoding === 'base64' ? (0, (_helpers2 || _helpers()).base64Decode)(dbgpProperty._) : 'TODO: Non-base64 encoded string: ' + JSON.stringify(dbgpProperty);
  } else {
    // zero length strings have no dbgpProperty._ property
    value = '';
  }

  return {
    type: 'string',
    value: value
  };
}

function convertIntValue(dbgpProperty) {
  var value = dbgpProperty.$.encoding === 'base64' ? 'TODO: Base64 encoded int: ' + JSON.stringify(dbgpProperty) : dbgpProperty._;
  return {
    type: 'number',
    value: value
  };
}

function convertFloatValue(dbgpProperty) {
  var value = dbgpProperty.$.encoding === 'base64' ? 'TODO: Base64 encoded float: ' + JSON.stringify(dbgpProperty) : dbgpProperty._;
  return {
    type: 'number',
    value: value
  };
}

function convertBoolValue(dbgpProperty) {
  (0, (_assert2 || _assert()).default)(dbgpProperty._ != null);
  var value = dbgpProperty.$.encoding === 'base64' ? 'TODO: Base64 encoded bool: ' + JSON.stringify(dbgpProperty) : toBool(dbgpProperty._);
  return {
    type: 'boolean',
    value: value
  };
}

function getNullValue() {
  return {
    type: 'undefined',
    subtype: 'null',
    value: null
  };
}

function getUndefinedValue() {
  return {
    type: 'undefined',
    value: undefined
  };
}

function convertArrayValue(contextId, dbgpProperty) {
  var remoteId = getAggregateRemoteObjectId(contextId, dbgpProperty);
  var description = 'Array[' + (dbgpProperty.$.numchildren || 0) + ']';
  if (dbgpProperty.$.recursive != null) {
    description = '* Recursive *';
  }
  return {
    description: description,
    type: 'object',
    objectId: remoteId
  };
}

function convertObjectValue(contextId, dbgpProperty) {
  var remoteId = getAggregateRemoteObjectId(contextId, dbgpProperty);
  var description = dbgpProperty.$.classname;
  if (dbgpProperty.$.recursive != null) {
    description = '* Recursive *';
  }
  return {
    description: description,
    type: 'object',
    objectId: remoteId
  };
}

function getAggregateRemoteObjectId(contextId, dbgpProperty) {
  // If the DbgpProperty represents an empty array or object, the `pagesize` and `numchildren`
  // will be omitted so we handle this "zero" case specially.
  var numchildren = Number(dbgpProperty.$.numchildren || 0);
  var pagesize = Number(dbgpProperty.$.pagesize) || 0;
  var pageCount = 0;
  if (pagesize !== 0) {
    pageCount = Math.trunc((numchildren + pagesize - 1) / pagesize) || 0;
  }
  (_utils2 || _utils()).default.log('numchildren: ' + numchildren + ' pagesize: ' + pagesize + ' pageCount ' + pageCount);
  if (pageCount > 1) {
    var elementRange = {
      pagesize: pagesize,
      startIndex: 0,
      count: numchildren
    };
    (0, (_assert2 || _assert()).default)(dbgpProperty.$.fullname != null);
    return (0, (_ObjectId2 || _ObjectId()).remoteObjectIdOfObjectId)((0, (_ObjectId2 || _ObjectId()).pagedObjectId)(contextId, dbgpProperty.$.fullname, elementRange));
  } else {
    (0, (_assert2 || _assert()).default)(dbgpProperty.$.fullname != null);
    return (0, (_ObjectId2 || _ObjectId()).remoteObjectIdOfObjectId)((0, (_ObjectId2 || _ObjectId()).singlePageObjectId)(contextId, dbgpProperty.$.fullname, 0));
  }
}

function convertUnknownValue(dbgpProperty) {
  return {
    type: 'string',
    value: 'TODO: unknown: ' + JSON.stringify(dbgpProperty)
  };
}

function toBool(value) {
  switch (value) {
    case '0':
      return false;
    case '1':
      return true;
    default:
      return 'Unexpected bool value: ' + value;
  }
}

module.exports = { convertValue: convertValue };