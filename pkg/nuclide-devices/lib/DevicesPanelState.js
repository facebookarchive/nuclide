'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevicesPanelState = exports.WORKSPACE_VIEW_URI = undefined;

var _react = _interopRequireDefault(require('react'));

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('../../commons-atom/renderReactRoot');
}

var _DevicePanel;

function _load_DevicePanel() {
  return _DevicePanel = require('./ui/DevicePanel');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/devices'; /**
                                                                                   * Copyright (c) 2015-present, Facebook, Inc.
                                                                                   * All rights reserved.
                                                                                   *
                                                                                   * This source code is licensed under the license found in the LICENSE file in
                                                                                   * the root directory of this source tree.
                                                                                   *
                                                                                   * 
                                                                                   */

class DevicesPanelState {
  getTitle() {
    return 'Devices';
  }

  getIconName() {
    return 'device-mobile';
  }

  getPreferredWidth() {
    return 300;
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation() {
    return 'right';
  }

  getElement() {
    return (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.default.createElement((_DevicePanel || _load_DevicePanel()).DevicePanel, null));
  }
}
exports.DevicesPanelState = DevicesPanelState;