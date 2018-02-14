'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNodeBinaryPath = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getNodeBinaryPath = exports.getNodeBinaryPath = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (path) {
    try {
      // $FlowFB
      return require('./fb-node-info').getNodeBinaryPath(path);
    } catch (error) {
      return 'node';
    }
  });

  return function getNodeBinaryPath(_x) {
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }