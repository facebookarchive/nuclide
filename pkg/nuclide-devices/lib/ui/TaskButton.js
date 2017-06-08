'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskButton = undefined;

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _react = _interopRequireDefault(require('react'));

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

class TaskButton extends _react.default.Component {

  _getLabel() {
    if (!this.props.isRunning) {
      return this.props.name;
    }
    const progress = this.props.progress != null ? `${this.props.progress.toFixed(2)}%` : 'running';
    return _react.default.createElement(
      'i',
      null,
      this.props.name,
      ' (',
      progress,
      '). Click to cancel'
    );
  }

  render() {
    return _react.default.createElement(
      (_Button || _load_Button()).Button,
      {
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        onClick: this.props.isRunning ? this.props.cancel : this.props.start },
      this._getLabel()
    );
  }
}
exports.TaskButton = TaskButton;