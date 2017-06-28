'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertValue = convertValue;

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _helpers;

function _load_helpers() {
  return _helpers = require('./helpers');
}

var _ObjectId;

function _load_ObjectId() {
  return _ObjectId = require('./ObjectId');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Converts a dbgp value to a Chrome RemoteObject.
 */
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
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function convertStringValue(dbgpProperty) {
  let value;
  if (dbgpProperty.hasOwnProperty('_')) {
    value = dbgpProperty.$.encoding === 'base64' ? // $FlowFixMe(peterhal)
    (0, (_helpers || _load_helpers()).base64Decode)(dbgpProperty._) : `TODO: Non-base64 encoded string: ${JSON.stringify(dbgpProperty)}`;
  } else {
    // zero length strings have no dbgpProperty._ property
    value = '';
  }

  return {
    type: 'string',
    value
  };
}

function convertIntValue(dbgpProperty) {
  const value = dbgpProperty.$.encoding === 'base64' ? `TODO: Base64 encoded int: ${JSON.stringify(dbgpProperty)}` : dbgpProperty._;
  return {
    type: 'number',
    value
  };
}

function convertFloatValue(dbgpProperty) {
  const value = dbgpProperty.$.encoding === 'base64' ? `TODO: Base64 encoded float: ${JSON.stringify(dbgpProperty)}` : dbgpProperty._;
  return {
    type: 'number',
    value
  };
}

function convertBoolValue(dbgpProperty) {
  if (!(dbgpProperty._ != null)) {
    throw new Error('Invariant violation: "dbgpProperty._ != null"');
  }

  const value = dbgpProperty.$.encoding === 'base64' ? `TODO: Base64 encoded bool: ${JSON.stringify(dbgpProperty)}` : toBool(dbgpProperty._);
  return {
    type: 'boolean',
    value
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
  const remoteId = getAggregateRemoteObjectId(contextId, dbgpProperty);
  const numchildren = String(dbgpProperty.$.numchildren != null ? dbgpProperty.$.numchildren : 0);
  let description = `Array[${numchildren}]`;
  if (dbgpProperty.$.recursive != null) {
    description = '* Recursive *';
  }
  return {
    description,
    type: 'object',
    objectId: remoteId
  };
}

function convertObjectValue(contextId, dbgpProperty) {
  const remoteId = getAggregateRemoteObjectId(contextId, dbgpProperty);
  let description = getObjectDescription(dbgpProperty);
  if (dbgpProperty.$.recursive != null) {
    description = '* Recursive *';
  }
  return {
    description,
    type: 'object',
    objectId: remoteId
  };
}

function getObjectDescription(dbgpProperty) {
  const { classname, numchildren } = dbgpProperty.$;
  switch (classname) {
    case 'HH\\Map':
    case 'HH\\ImmMap':
    case 'HH\\Vector':
    case 'HH\\ImmVector':
    case 'HH\\Set':
    case 'HH\\ImmSet':
      return `${classname}[${numchildren || 0}]`;
    default:
      return classname;
  }
}

function getAggregateRemoteObjectId(contextId, dbgpProperty) {
  // If the DbgpProperty represents an empty array or object, the `pagesize` and `numchildren`
  // will be omitted so we handle this "zero" case specially.
  const numchildren = Number(dbgpProperty.$.numchildren || 0);
  const pagesize = Number(dbgpProperty.$.pagesize) || 0;
  let pageCount = 0;
  if (pagesize !== 0) {
    pageCount = Math.trunc((numchildren + pagesize - 1) / pagesize) || 0;
  }
  (_utils || _load_utils()).default.debug(`numchildren: ${numchildren} pagesize: ${pagesize} pageCount ${pageCount}`);
  if (pageCount > 1) {
    const elementRange = {
      pagesize,
      startIndex: 0,
      count: numchildren
    };

    if (!(dbgpProperty.$.fullname != null)) {
      throw new Error('Invariant violation: "dbgpProperty.$.fullname != null"');
    }

    return (0, (_ObjectId || _load_ObjectId()).remoteObjectIdOfObjectId)((0, (_ObjectId || _load_ObjectId()).pagedObjectId)(contextId, dbgpProperty.$.fullname, elementRange));
  } else {
    if (!(dbgpProperty.$.fullname != null)) {
      throw new Error('Invariant violation: "dbgpProperty.$.fullname != null"');
    }

    return (0, (_ObjectId || _load_ObjectId()).remoteObjectIdOfObjectId)((0, (_ObjectId || _load_ObjectId()).singlePageObjectId)(contextId, dbgpProperty.$.fullname, 0));
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