"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TunnelsPanelTable = void 0;

function _Tunnel() {
  const data = require("../../../nuclide-socket-rpc/lib/Tunnel");

  _Tunnel = function () {
    return data;
  };

  return data;
}

function _TunnelCloseButton() {
  const data = _interopRequireDefault(require("./TunnelCloseButton"));

  _TunnelCloseButton = function () {
    return data;
  };

  return data;
}

function _Table() {
  const data = require("../../../../modules/nuclide-commons-ui/Table");

  _Table = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _immutable() {
  const data = require("immutable");

  _immutable = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class TunnelsPanelTable extends React.Component {
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
      const {
        from,
        to
      } = active.tunnel;
      const descriptions = new Set(active.subscriptions.map(s => s.description));
      return {
        className: 'nuclide-ssh-tunnels-table-row',
        data: {
          description: Array.from(descriptions).join(', '),
          from: `${(0, _Tunnel().shortenHostname)(from.host)}:${from.port}`,
          to: `${(0, _Tunnel().shortenHostname)(to.host)}:${to.port}`,
          status: active.state,
          close: React.createElement(_TunnelCloseButton().default, {
            tunnel: active.tunnel,
            closeTunnel: this.props.closeTunnel
          })
        }
      };
    }).toArray();
    return React.createElement(_Table().Table, {
      emptyComponent: () => React.createElement("div", {
        className: "nuclide-ssh-tunnels-table-empty-message"
      }, "No tunnels are open."),
      rows: rows,
      columns: columns,
      selectable: true
    });
  }

}

exports.TunnelsPanelTable = TunnelsPanelTable;