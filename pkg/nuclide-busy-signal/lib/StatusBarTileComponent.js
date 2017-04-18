'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StatusBarTileComponent = undefined;

var _react = _interopRequireDefault(require('react'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class StatusBarTileComponent extends _react.default.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const classes = (0, (_classnames || _load_classnames()).default)('nuclide-busy-signal-status-bar', { 'loading-spinner-tiny': this.props.busy });
    return _react.default.createElement('div', { className: classes });
  }
}
exports.StatusBarTileComponent = StatusBarTileComponent;