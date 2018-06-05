'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TunnelsPanelContents = undefined;

var _react = _interopRequireWildcard(require('react'));

var _ManualTunnelSection;

function _load_ManualTunnelSection() {
  return _ManualTunnelSection = _interopRequireDefault(require('./ManualTunnelSection'));
}

var _TunnelsPanelTable;

function _load_TunnelsPanelTable() {
  return _TunnelsPanelTable = require('./TunnelsPanelTable');
}

var _immutable;

function _load_immutable() {
  return _immutable = require('immutable');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class TunnelsPanelContents extends _react.Component {

  render() {
    return _react.createElement(
      'div',
      { className: 'nuclide-ssh-tunnels-panel-contents' },
      _react.createElement((_TunnelsPanelTable || _load_TunnelsPanelTable()).TunnelsPanelTable, {
        tunnels: this.props.tunnels,
        closeTunnel: this.props.closeTunnel
      }),
      _react.createElement((_ManualTunnelSection || _load_ManualTunnelSection()).default, {
        workingDirectoryHost: this.props.workingDirectoryHost,
        openTunnel: this.props.openTunnel
      })
    );
  }
}
exports.TunnelsPanelContents = TunnelsPanelContents; /**
                                                      * Copyright (c) 2015-present, Facebook, Inc.
                                                      * All rights reserved.
                                                      *
                                                      * This source code is licensed under the license found in the LICENSE file in
                                                      * the root directory of this source tree.
                                                      *
                                                      * 
                                                      * @format
                                                      */