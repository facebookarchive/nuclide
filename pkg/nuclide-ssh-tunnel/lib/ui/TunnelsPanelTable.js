'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TunnelsPanelTable = undefined;

var _Tunnel;

function _load_Tunnel() {
  return _Tunnel = require('../../../nuclide-socket-rpc/lib/Tunnel');
}

var _TunnelCloseButton;

function _load_TunnelCloseButton() {
  return _TunnelCloseButton = _interopRequireDefault(require('./TunnelCloseButton'));
}

var _Table;

function _load_Table() {
  return _Table = require('../../../../modules/nuclide-commons-ui/Table');
}

var _react = _interopRequireWildcard(require('react'));

var _immutable;

function _load_immutable() {
  return _immutable = require('immutable');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TunnelsPanelTable extends _react.Component {
  render() {
    const columns = [{
      title: 'Description',
      key: 'description'
    }, {
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
      width: 0,
      minWidth: 35
    }];
    const rows = this.props.tunnels.map(active => {
      const { from, to } = active.tunnel;
      const descriptions = new Set(active.subscriptions.map(s => s.description));
      return {
        className: 'nuclide-ssh-tunnels-table-row',
        data: {
          description: Array.from(descriptions).join(', '),
          from: `${(0, (_Tunnel || _load_Tunnel()).shortenHostname)(from.host)}:${from.port}`,
          to: `${(0, (_Tunnel || _load_Tunnel()).shortenHostname)(to.host)}:${to.port}`,
          status: active.state,
          close: _react.createElement((_TunnelCloseButton || _load_TunnelCloseButton()).default, {
            tunnel: active.tunnel,
            closeTunnel: this.props.closeTunnel
          })
        }
      };
    }).toArray();
    return _react.createElement((_Table || _load_Table()).Table, {
      emptyComponent: () => _react.createElement(
        'div',
        { className: 'nuclide-ssh-tunnels-table-empty-message' },
        'No tunnels are open.'
      ),
      rows: rows,
      columns: columns,
      selectable: true
    });
  }
}
exports.TunnelsPanelTable = TunnelsPanelTable; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                * @format
                                                */