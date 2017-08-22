'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertProperties = convertProperties;
exports.convertProperty = convertProperty;
exports.getPagedProperties = getPagedProperties;

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _ObjectId;

function _load_ObjectId() {
  return _ObjectId = require('./ObjectId');
}

var _values;

function _load_values() {
  return _values = require('./values');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function convertProperties(id, properties) {
  (_utils || _load_utils()).default.debug('Got properties: ' + JSON.stringify(properties));
  return properties.map(property => convertProperty(id, property));
}

/**
 * Converts a DbgpProperty to a Chrome PropertyDescriptor.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function convertProperty(contextId, dbgpProperty) {
  (_utils || _load_utils()).default.debug('Converting to Chrome property: ' + JSON.stringify(dbgpProperty));
  const result = {
    configurable: false,
    enumerable: true,
    // flowlint-next-line sketchy-null-string:off
    name: dbgpProperty.$.name || 'Anonymous Property',
    value: (0, (_values || _load_values()).convertValue)(contextId, dbgpProperty)
  };
  return result;
}

/**
 * Given an ObjectId for a multi page object, gets PropertyDescriptors
 * for the object's children.
 */
function getPagedProperties(pagedId) {
  if (!pagedId.elementRange) {
    throw new Error('Invariant violation: "pagedId.elementRange"');
  }

  const pagesize = pagedId.elementRange.pagesize;
  const endIndex = (0, (_ObjectId || _load_ObjectId()).endIndexOfObjectId)(pagedId);

  const childIds = (0, (_ObjectId || _load_ObjectId()).getChildIds)(pagedId);
  return childIds.map(childId => {
    const childStartIndex = (0, (_ObjectId || _load_ObjectId()).startIndexOfObjectId)(childId, pagesize);
    const childCount = (0, (_ObjectId || _load_ObjectId()).countOfObjectId)(childId, pagesize, endIndex);
    return {
      configurable: false,
      enumerable: true,
      name: `Elements(${childStartIndex}..${childStartIndex + childCount - 1})`,
      value: {
        description: `${childCount} elements`,
        type: 'object',
        objectId: (0, (_ObjectId || _load_ObjectId()).remoteObjectIdOfObjectId)(childId)
      }
    };
  });
}