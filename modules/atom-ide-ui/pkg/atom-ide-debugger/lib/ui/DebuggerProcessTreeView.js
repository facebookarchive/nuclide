'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DebuggerProcessTreeView;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _Block;

function _load_Block() {
  return _Block = require('../../../../../nuclide-commons-ui/Block');
}

var _react = _interopRequireWildcard(require('react'));

var _DebuggerProcessComponent;

function _load_DebuggerProcessComponent() {
  return _DebuggerProcessComponent = _interopRequireDefault(require('./DebuggerProcessComponent'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function DebuggerProcessTreeView(props) {
  return _react.createElement(
    'div',
    {
      className: (0, (_classnames || _load_classnames()).default)('debugger-container-new', 'debugger-breakpoint-list', 'debugger-tree') },
    _react.createElement(
      'div',
      { className: 'debugger-pane-content ' },
      _react.createElement(
        (_Block || _load_Block()).Block,
        null,
        _react.createElement((_DebuggerProcessComponent || _load_DebuggerProcessComponent()).default, { service: props.service })
      )
    )
  );
} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   *  strict-local
   * @format
   */