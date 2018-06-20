'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ThreadTreeNode;

var _react = _interopRequireWildcard(require('react'));

var _DebuggerProcessTreeNode;

function _load_DebuggerProcessTreeNode() {
  return _DebuggerProcessTreeNode = _interopRequireDefault(require('./DebuggerProcessTreeNode'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ThreadTreeNode(props) {
  const { thread, service, title, childItems } = props;
  const focusedThread = service.viewModel.focusedThread;
  const isFocused = focusedThread == null ? false : thread.threadId === focusedThread.threadId;

  return _react.createElement((_DebuggerProcessTreeNode || _load_DebuggerProcessTreeNode()).default, {
    isFocused: isFocused,
    title: title,
    childItems: childItems
  });
} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * 
   * @format
   */