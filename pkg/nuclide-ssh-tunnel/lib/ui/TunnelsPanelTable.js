'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TunnelsPanelTable = undefined;

var _TunnelCloseButton;

function _load_TunnelCloseButton() {
  return _TunnelCloseButton = _interopRequireDefault(require('./TunnelCloseButton'));
}

var _Table;

function _load_Table() {
  return _Table = require('nuclide-commons-ui/Table');
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
class TunnelsPanelTable extends _react.default.Component {

  render() {
    const columns = [{
      title: 'From',
      key: 'from'
    }, {
      title: 'To',
      key: 'to'
    }, {
      title: 'Status',
      key: 'status'
    }, {
      title: '',
      key: 'close',
      width: 0
    }];
    const rows = this.props.tunnels.map(([tunnel, openTunnel]) => {
      let { host } = tunnel.from;
      const ignoredEnding = '.facebook.com';
      if (host.endsWith(ignoredEnding)) {
        host = host.slice(0, host.length - ignoredEnding.length);
      }
      return {
        className: 'nuclide-ssh-tunnels-table-row',
        data: {
          from: `${host}:${tunnel.from.port}`,
          to: `${tunnel.to.host}:${tunnel.to.port}`,
          status: openTunnel.state,
          close: _react.default.createElement((_TunnelCloseButton || _load_TunnelCloseButton()).default, {
            tunnel: tunnel,
            closeTunnel: this.props.closeTunnel
          })
        }
      };
    });
    return _react.default.createElement((_Table || _load_Table()).Table, {
      emptyComponent: () => _react.default.createElement(
        'div',
        { className: 'nuclide-ssh-tunnels-table-empty-message' },
        'No SSH tunnels are open.'
      ),
      className: 'nuclide-ssh-tunnels-table',
      rows: rows,
      columns: columns,
      selectable: true
    });
  }
}
exports.TunnelsPanelTable = TunnelsPanelTable;