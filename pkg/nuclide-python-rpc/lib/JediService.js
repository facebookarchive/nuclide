'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get_hover = exports.get_references = exports.get_definitions = exports.get_completions = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

// This file contains RPC definitions for jediserver.py.

let get_completions = exports.get_completions = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (src, contents, sysPath, line, column) {
    throw new Error('RPC Stub');
  });

  return function get_completions(_x, _x2, _x3, _x4, _x5) {
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

let get_definitions = exports.get_definitions = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (src, contents, sysPath, line, column) {
    throw new Error('RPC Stub');
  });

  return function get_definitions(_x6, _x7, _x8, _x9, _x10) {
    return _ref2.apply(this, arguments);
  };
})();

let get_references = exports.get_references = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (src, contents, sysPath, line, column) {
    throw new Error('RPC Stub');
  });

  return function get_references(_x11, _x12, _x13, _x14, _x15) {
    return _ref3.apply(this, arguments);
  };
})();

let get_hover = exports.get_hover = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (src, contents, sysPath,
  // It's much easier to get the current word from JavaScript.
  word, line, column) {
    throw new Error('RPC Stub');
  });

  return function get_hover(_x16, _x17, _x18, _x19, _x20, _x21) {
    return _ref4.apply(this, arguments);
  };
})();

exports.get_outline = get_outline;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function get_outline(src, contents) {
  throw new Error('RPC Stub');
}