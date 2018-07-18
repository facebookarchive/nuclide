"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _Tree() {
  const data = require("../../../../../nuclide-commons-ui/Tree");

  _Tree = function () {
    return data;
  };

  return data;
}

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class FrameTreeNode extends React.Component {
  constructor(props) {
    super(props);

    this.handleSelect = () => {
      this.props.service.focusStackFrame(this.props.frame, null, null, true);
    };

    this.handleSelect = this.handleSelect.bind(this);
  }

  render() {
    const {
      frame,
      service
    } = this.props;
    const activeFrame = service.viewModel.focusedStackFrame;
    const className = (activeFrame == null ? false : frame === activeFrame) ? (0, _classnames().default)('debugger-tree-frame-selected', 'debugger-tree-frame') : 'debugger-tree-frame';
    const treeItem = React.createElement(_Tree().TreeItem, {
      className: className,
      onSelect: this.handleSelect,
      title: `Frame ID: ${frame.frameId}, Name: ${frame.name}` + (frame.thread.stopped && frame.thread.getCallStack()[0] === frame && frame.source != null && frame.source.name != null ? `, Stopped at: ${frame.source.name}: ${frame.range.end.row}` : '')
    }, frame.name);
    return treeItem;
  }

}

exports.default = FrameTreeNode;