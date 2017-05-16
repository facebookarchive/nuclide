'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NoProvidersView = undefined;

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This view is rendered when no context providers are registered.
 */
const NoProvidersView = exports.NoProvidersView = () => {
  return _react.default.createElement(
    'div',
    null,
    'No providers registered!'
  );
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */