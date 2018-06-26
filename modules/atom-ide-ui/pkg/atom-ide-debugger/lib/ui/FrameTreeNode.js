'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _Tree;

function _load_Tree() {
  return _Tree = require('../../../../../nuclide-commons-ui/Tree');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
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

class FrameTreeNode extends _react.Component {
  constructor(props) {
    super(props);

    this.handleSelect = () => {
      this.props.service.focusStackFrame(this.props.frame, null, null, true);
    };

    this.handleSelect = this.handleSelect.bind(this);
  }

  render() {
    const { frame, service, text } = this.props;
    const activeFrame = service.viewModel.focusedStackFrame;
    const className = (activeFrame == null ? false : frame === activeFrame) ? (0, (_classnames || _load_classnames()).default)('debugger-tree-frame-selected', 'debugger-tree-frame') : 'debugger-tree-frame';

    const treeItem = _react.createElement(
      (_Tree || _load_Tree()).TreeItem,
      {
        className: className,
        onSelect: this.handleSelect,
        title: `Frame ID: ${frame.frameId}, Name: ${frame.name}` + (frame.thread.stopped && frame.thread.getCallStack()[0] === frame && frame.source != null && frame.source.name != null ? `, Stopped at: ${frame.source.name}: ${frame.range.end.row}` : '') },
      text
    );

    return treeItem;
  }
}
exports.default = FrameTreeNode;