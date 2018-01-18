'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.secondIfFirstIsNull = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let secondIfFirstIsNull = exports.secondIfFirstIsNull = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (first, second) {
    return first != null ? first : second();
  });

  return function secondIfFirstIsNull(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})(); /**
       * Copyright (c) 2015-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the license found in the LICENSE file in
       * the root directory of this source tree.
       *
       * 
       * @format
       */

exports.wordUnderPoint = wordUnderPoint;

var _range;

function _load_range() {
  return _range = require('nuclide-commons-atom/range');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function wordUnderPoint(editor, point) {
  const match = (0, (_range || _load_range()).wordAtPosition)(editor, point);
  if (match != null && match.wordMatch.length > 0) {
    return match.wordMatch[0];
  }
  return null;
}