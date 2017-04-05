'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

var _CustomPaneItem;

function _load_CustomPaneItem() {
  return _CustomPaneItem = require('../../nuclide-ui/CustomPaneItem');
}

var _VcsLog;

function _load_VcsLog() {
  return _VcsLog = _interopRequireDefault(require('./VcsLog'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class VcsLogPaneItem extends (_CustomPaneItem || _load_CustomPaneItem()).CustomPaneItem {
  __renderPaneItem(options) {
    return _react.default.createElement((_VcsLog || _load_VcsLog()).default, options.initialProps);
  }

  updateWithLogEntries(logEntries) {
    this.__component.setState({ logEntries });
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

exports.default = document.registerElement('nuclide-vcs-log', { prototype: VcsLogPaneItem.prototype });