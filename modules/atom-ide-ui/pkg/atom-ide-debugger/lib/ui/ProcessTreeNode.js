'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ProcessTreeNode;

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

function ProcessTreeNode(props) {
  const { process, service, title, childItems } = props;
  const focusedProcess = service.viewModel.focusedProcess;

  const isFocused = process === focusedProcess;

  const tooltipTitle = service.viewModel.focusedProcess == null || service.viewModel.focusedProcess.configuration.adapterExecutable == null ? 'Unknown Command' : service.viewModel.focusedProcess.configuration.adapterExecutable.command + service.viewModel.focusedProcess.configuration.adapterExecutable.args.join(' ');

  const formattedTitle = _react.createElement(
    'span',
    {
      className: isFocused ? 'debugger-tree-process-thread-selected' : '',
      title: tooltipTitle },
    title
  );

  return childItems == null || childItems.length === 0 ? _react.createElement(
    (_Tree || _load_Tree()).TreeItem,
    null,
    formattedTitle
  ) : _react.createElement((_DebuggerProcessTreeNode || _load_DebuggerProcessTreeNode()).default, {
    formattedTitle: formattedTitle,
    childItems: childItems
  });
}