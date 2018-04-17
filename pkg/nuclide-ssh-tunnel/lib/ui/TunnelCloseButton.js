'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = TunnelCloseButton;

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function TunnelCloseButton(props) {
  return _react.createElement((_Button || _load_Button()).Button, {
    className: 'nuclide-ssh-tunnel-close-button',
    size: 'SMALL',
    icon: 'x',
    onClick: () => props.closeTunnel(props.tunnel)
  });
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */