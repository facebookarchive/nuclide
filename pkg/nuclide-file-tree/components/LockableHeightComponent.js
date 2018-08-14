"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LockableHeight = void 0;

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
class LockableHeight extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lockedHeight: null
    };
  }

  componentDidMount() {
    if (this.props.isLocked) {
      this.setState({
        lockedHeight: 0
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.isLocked !== nextProps.isLocked) {
      const lockedHeight = nextProps.isLocked ? this._currentHeight() : null;
      this.setState({
        lockedHeight
      });
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
      const {
        lockedHeight
      } = this.state; // Flexbox supercedes the height attributes, so we use min/max heigh.

      style = {
        maxHeight: lockedHeight,
        minHeight: lockedHeight
      };
      className = 'nuclide-file-tree-locked-height';
    }

    return React.createElement("div", {
      style: style,
      className: className,
      ref: node => {
        // $FlowFixMe(>=0.53.0) Flow suppress
        this._root = node;
      }
    }, this.props.children);
  }

}

exports.LockableHeight = LockableHeight;