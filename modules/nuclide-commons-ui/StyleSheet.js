"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

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
class StyleSheet extends React.PureComponent {
  componentWillUnmount() {
    if (this._styleSheet != null) {
      this._styleSheet.dispose();
    }
  }

  componentDidMount() {
    this._updateStyleSheet();
  }

  componentDidUpdate() {
    this._updateStyleSheet();
  }

  render() {
    return null;
  }

  _updateStyleSheet() {
    if (this._styleSheet != null) {
      this._styleSheet.dispose();
    }

    this._styleSheet = atom.styles.addStyleSheet(this.props.css, {
      sourcePath: this.props.sourcePath,
      priority: this.props.priority
    });
  }

}

exports.default = StyleSheet;