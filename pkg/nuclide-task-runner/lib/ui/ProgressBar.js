'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProgressBar = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ProgressBar extends _react.default.Component {

  render() {
    const className = (0, (_classnames || _load_classnames()).default)('nuclide-task-runner-progress-bar', {
      indeterminate: this._isIndeterminate()
    });
    return _react.default.createElement(
      'div',
      { className: className, hidden: !this.props.visible },
      this._renderBar()
    );
  }

  _isIndeterminate() {
    return this.props.progress == null;
  }

  _renderBar() {
    if (this._isIndeterminate()) {
      return null;
    }

    if (!(this.props.progress != null)) {
      throw new Error('Invariant violation: "this.props.progress != null"');
    }

    return _react.default.createElement(Bar, { progress: this.props.progress });
  }
}

exports.ProgressBar = ProgressBar; /**
                                    * Copyright (c) 2015-present, Facebook, Inc.
                                    * All rights reserved.
                                    *
                                    * This source code is licensed under the license found in the LICENSE file in
                                    * the root directory of this source tree.
                                    *
                                    * 
                                    * @format
                                    */

class Bar extends _react.default.Component {

  render() {
    const pct = Math.max(0, Math.min(100, this.props.progress * 100));
    return _react.default.createElement('div', {
      className: 'nuclide-task-runner-progress-bar-bar',
      style: { width: `${pct}%` }
    });
  }
}