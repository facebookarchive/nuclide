"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LockableHeight = void 0;

var React = _interopRequireWildcard(require("react"));

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._root = React.createRef(), this.state = {
      lockedHeight: null
    }, _temp;
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
      this.setState({
        lockedHeight: nextProps.isLocked ? (0, _nullthrows().default)(this._root.current).clientHeight : null
      });
    }
  }

  render() {
    let style = {};
    let className = null;

    if (this.props.isLocked) {
      const {
        lockedHeight
      } = this.state; // Flexbox supercedes the height attributes, so we use min/max height.

      style = {
        maxHeight: lockedHeight,
        minHeight: lockedHeight
      };
      className = 'nuclide-file-tree-locked-height';
    }

    return React.createElement("div", {
      style: style,
      className: className,
      ref: this._root
    }, this.props.children);
  }

}

exports.LockableHeight = LockableHeight;