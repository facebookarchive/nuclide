'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _Tree;

function _load_Tree() {
  return _Tree = require('../../../../../nuclide-commons-ui/Tree');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class FrameTreeNode extends _react.Component {
  constructor(props) {
    super(props);

    this.handleSelect = () => {
      this.props.service.focusStackFrame(this.props.frame, null, null, true);
    };

    this.handleSelect = this.handleSelect.bind(this);
  }

  render() {
    const { frame, service } = this.props;
    const activeFrame = service.viewModel.focusedStackFrame;
    const className = (activeFrame == null ? false : frame.frameId === activeFrame.frameId) ? 'debugger-tree-frame-selected' : '';

    const treeItem = _react.createElement(
      (_Tree || _load_Tree()).TreeItem,
      { className: className, onSelect: this.handleSelect },
      this.props.text
    );

    return treeItem;
  }
}
exports.default = FrameTreeNode; /**
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