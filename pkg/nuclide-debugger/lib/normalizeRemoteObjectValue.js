Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.normalizeRemoteObjectValue = normalizeRemoteObjectValue;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

function normalizeRemoteObjectValue(remoteObject) {
  if (remoteObject == null) {
    return null;
  }
  var modifiedProperties = {};
  var normalizeUnderscores = function normalizeUnderscores(field) {
    (0, (_assert2 || _assert()).default)(remoteObject != null);
    modifiedProperties[field] = remoteObject[field];
    var underscoreField = '_' + field;
    if (remoteObject.hasOwnProperty(underscoreField) && remoteObject[underscoreField] != null) {
      modifiedProperties[field] = String(remoteObject[underscoreField]);
    } else if (remoteObject.hasOwnProperty(field) && remoteObject[field] != null) {
      modifiedProperties[field] = String(remoteObject[field]);
    }
  };
  ['type', 'description', 'objectId', 'value'].forEach(normalizeUnderscores);
  return _extends({}, remoteObject, modifiedProperties);
}