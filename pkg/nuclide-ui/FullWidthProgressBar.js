"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class FullWidthProgressBar extends React.Component {
  render() {
    const className = (0, _classnames().default)('nuclide-ui-full-width-progress-bar', {
      indeterminate: this._isIndeterminate()
    });
    return React.createElement("div", {
      className: className,
      hidden: !this.props.visible
    }, this._renderBar());
  }

  _isIndeterminate() {
    return this.props.progress == null;
  }

  _renderBar() {
    if (this._isIndeterminate()) {
      return null;
    }

    if (!(this.props.progress != null)) {
      throw new Error("Invariant violation: \"this.props.progress != null\"");
    }

    return React.createElement(Bar, {
      progress: this.props.progress
    });
  }

}

exports.default = FullWidthProgressBar;

class Bar extends React.Component {
  render() {
    const pct = Math.max(0, Math.min(100, this.props.progress * 100));
    return React.createElement("div", {
      className: "nuclide-ui-full-width-progress-bar-bar",
      style: {
        width: `${pct}%`
      }
    });
  }

}