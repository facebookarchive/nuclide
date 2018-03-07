'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NoProvidersView = undefined;

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * This view is rendered when no context providers are registered.
 */
const NoProvidersView = exports.NoProvidersView = () => {
  return _react.createElement(
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