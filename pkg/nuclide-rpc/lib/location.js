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

exports.locationToString = locationToString;
exports.locationsEqual = locationsEqual;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

function locationToString(location) {
  switch (location.type) {
    case 'source':
      return location.fileName + '(' + location.line + ')';
    case 'builtin':
      return '<builtin>';
    default:
      throw new Error('Bad location type');
  }
}

function locationsEqual(first, second) {
  if (first.type !== second.type) {
    return false;
  }
  switch (first.type) {
    case 'source':
      (0, (_assert2 || _assert()).default)(second.type === 'source');
      return first.fileName === second.fileName && first.line === second.line;
    case 'builtin':
      return true;
    default:
      throw new Error('Bad location type');
  }
}