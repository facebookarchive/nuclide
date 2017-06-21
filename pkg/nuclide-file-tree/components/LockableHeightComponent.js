'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LockableHeight = undefined;

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LockableHeight extends _react.default.Component {

  constructor(props) {
    super(props);
    this.state = {
      lockedHeight: null
    };
  }

  componentDidMount() {
    if (this.props.isLocked) {
      this.setState({ lockedHeight: 0 });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isLocked !== nextProps.isLocked) {
      const lockedHeight = nextProps.isLocked ? this._currentHeight() : null;
      this.setState({ lockedHeight });
    }
  }

  _currentHeight() {
    const computedStyle = window.getComputedStyle(this._root);
    return computedStyle.height;
  }

  render() {
    let style = {};
    let className = null;
    if (this.props.isLocked) {
      const { lockedHeight } = this.state;
      // Flexbox supercedes the height attributes, so we use min/max heigh.
      style = { maxHeight: lockedHeight, minHeight: lockedHeight };
      className = 'nuclide-file-tree-locked-height';
    }
    return _react.default.createElement(
      'div',
      {
        style: style,
        className: className,
        ref: node => {
          this._root = node;
        } },
      this.props.children
    );
  }
}
exports.LockableHeight = LockableHeight; /**
                                          * Copyright (c) 2015-present, Facebook, Inc.
                                          * All rights reserved.
                                          *
                                          * This source code is licensed under the license found in the LICENSE file in
                                          * the root directory of this source tree.
                                          *
                                          * 
                                          * @format
                                          */