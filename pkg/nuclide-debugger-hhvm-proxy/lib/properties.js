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

var _ObjectId2;

function _ObjectId() {
  return _ObjectId2 = require('./ObjectId');
}

var _values2;

function _values() {
  return _values2 = require('./values');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

function convertProperties(id, properties) {
  (_utils2 || _utils()).default.log('Got properties: ' + JSON.stringify(properties));
  return properties.map(function (property) {
    return convertProperty(id, property);
  });
}

/**
 * Converts a DbgpProperty to a Chrome PropertyDescriptor.
 */
function convertProperty(contextId, dbgpProperty) {
  (_utils2 || _utils()).default.log('Converting to Chrome property: ' + JSON.stringify(dbgpProperty));
  var result = {
    configurable: false,
    enumerable: true,
    name: dbgpProperty.$.name || 'Anonymous Property',
    value: (0, (_values2 || _values()).convertValue)(contextId, dbgpProperty)
  };
  return result;
}

/**
 * Given an ObjectId for a multi page object, gets PropertyDescriptors
 * for the object's children.
 */
function getPagedProperties(pagedId) {
  (0, (_assert2 || _assert()).default)(pagedId.elementRange);
  var pagesize = pagedId.elementRange.pagesize;
  var endIndex = (0, (_ObjectId2 || _ObjectId()).endIndexOfObjectId)(pagedId);

  var childIds = (0, (_ObjectId2 || _ObjectId()).getChildIds)(pagedId);
  return childIds.map(function (childId) {
    var childStartIndex = (0, (_ObjectId2 || _ObjectId()).startIndexOfObjectId)(childId, pagesize);
    var childCount = (0, (_ObjectId2 || _ObjectId()).countOfObjectId)(childId, pagesize, endIndex);
    return {
      configurable: false,
      enumerable: true,
      name: 'Elements(' + childStartIndex + '..' + (childStartIndex + childCount - 1) + ')',
      value: {
        description: childCount + ' elements',
        type: 'object',
        objectId: (0, (_ObjectId2 || _ObjectId()).remoteObjectIdOfObjectId)(childId)
      }
    };
  });
}

module.exports = {
  convertProperties: convertProperties,
  convertProperty: convertProperty,
  getPagedProperties: getPagedProperties
};