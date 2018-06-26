'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Tree;

function _load_Tree() {
  return _Tree = require('../../../../../nuclide-commons-ui/Tree');
}

var _react = _interopRequireWildcard(require('react'));

var _DebuggerProcessTreeNode;

function _load_DebuggerProcessTreeNode() {
  return _DebuggerProcessTreeNode = _interopRequireDefault(require('./DebuggerProcessTreeNode'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
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

class ThreadTreeNode extends _react.Component {
  constructor(props) {
    super(props);

    this.handleSelect = () => {
      this.props.service.focusStackFrame(null, this.props.thread, null, true);
    };

    this.handleSelect = this.handleSelect.bind(this);
  }

  render() {
    const { thread, service, title, childItems } = this.props;
    const focusedThread = service.viewModel.focusedThread;
    const isFocused = focusedThread == null ? false : thread.threadId === focusedThread.threadId;

    const formattedTitle = _react.createElement(
      'span',
      {
        className: isFocused ? 'debugger-tree-process-thread-selected' : '',
        title: 'Thread ID: ' + thread.threadId + ', Name: ' + thread.name },
      title
    );

    return childItems == null || childItems.length === 0 ? _react.createElement(
      (_Tree || _load_Tree()).TreeItem,
      { onSelect: this.handleSelect },
      formattedTitle
    ) : _react.createElement((_DebuggerProcessTreeNode || _load_DebuggerProcessTreeNode()).default, {
      formattedTitle: formattedTitle,
      childItems: childItems
    });
  }
}
exports.default = ThreadTreeNode;