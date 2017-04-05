'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevicePanel = undefined;

var _react = _interopRequireDefault(require('react'));

var _PanelComponentScroller;

function _load_PanelComponentScroller() {
  return _PanelComponentScroller = require('../../../nuclide-ui/PanelComponentScroller');
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

class DevicePanel extends _react.default.Component {

  render() {
    return _react.default.createElement(
      'div',
      { style: { display: 'flex', flexDirection: 'column', width: '100%' } },
      _react.default.createElement(
        (_PanelComponentScroller || _load_PanelComponentScroller()).PanelComponentScroller,
        null,
        _react.default.createElement(
          'div',
          { className: 'padded', style: { flex: 1, minWidth: 'min-content' } },
          _react.default.createElement(
            'span',
            null,
            'TODO'
          )
        )
      )
    );
  }
}
exports.DevicePanel = DevicePanel;