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

class DebuggerProcessTreeNode extends _react.Component {
  constructor(props) {
    super(props);

    this.handleSelect = () => {
      this.setState(prevState => ({
        isCollapsed: !prevState.isCollapsed
      }));
    };

    this.state = {
      isCollapsed: false
    };
    this.handleSelect = this.handleSelect.bind(this);
  }

  render() {
    const { title, isFocused } = this.props;
    const formattedTitle = _react.createElement(
      'span',
      { className: isFocused ? 'debugger-tree-frame-selected' : '' },
      title
    );
    return _react.createElement(
      (_Tree || _load_Tree()).NestedTreeItem,
      {
        title: formattedTitle,
        collapsed: this.state.isCollapsed,
        onSelect: this.handleSelect },
      this.props.childItems
    );
  }
}
exports.default = DebuggerProcessTreeNode;