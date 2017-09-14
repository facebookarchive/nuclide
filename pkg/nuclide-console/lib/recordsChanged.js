'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = recordsChanged;

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Check to see if the records have changed. This is optimized to take advantage of the knowledge
 * knowledge that record lists are only ever appended.
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

function recordsChanged(a, b) {
  var _ref, _ref2;

  return a.length !== b.length || ((_ref = last(a)) != null ? _ref.id : _ref) !== ((_ref2 = last(b)) != null ? _ref2.id : _ref2);
}

const last = arr => arr[arr.length - 1];