'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StatusBarTileComponent = undefined;

var _reactForAtom = require('react-for-atom');

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let StatusBarTileComponent = exports.StatusBarTileComponent = class StatusBarTileComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const classes = (0, (_classnames || _load_classnames()).default)('nuclide-busy-signal-status-bar', { 'loading-spinner-tiny': this.props.busy });
    return _reactForAtom.React.createElement('div', { className: classes });
  }
};