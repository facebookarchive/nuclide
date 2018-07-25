"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TunnelsPanelContents = void 0;

function _passesGK() {
  const data = _interopRequireDefault(require("../../../commons-node/passesGK"));

  _passesGK = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _ManualTunnelSection() {
  const data = _interopRequireDefault(require("./ManualTunnelSection"));

  _ManualTunnelSection = function () {
    return data;
  };

  return data;
}

function _TunnelsPanelTable() {
  const data = require("./TunnelsPanelTable");

  _TunnelsPanelTable = function () {
    return data;
  };

  return data;
}

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
class TunnelsPanelContents extends React.Component {
  constructor() {
    super();
    this.state = {
      allowManualTunnels: false
    };
    (0, _passesGK().default)('nuclide_allow_manual_tunnels').then(result => {
      this.setState({
        allowManualTunnels: result
      });
    });
  }

  render() {
    if (this.state.allowManualTunnels) {
      return React.createElement("div", {
        className: "nuclide-ssh-tunnels-panel-contents"
      }, React.createElement(_TunnelsPanelTable().TunnelsPanelTable, {
        tunnels: this.props.tunnels,
        closeTunnel: this.props.closeTunnel
      }), React.createElement(_ManualTunnelSection().default, {
        workingDirectoryHost: this.props.workingDirectoryHost,
        openTunnel: this.props.openTunnel
      }));
    } else {
      return React.createElement("div", {
        className: "nuclide-ssh-tunnels-panel-contents"
      }, React.createElement(_TunnelsPanelTable().TunnelsPanelTable, {
        tunnels: this.props.tunnels,
        closeTunnel: this.props.closeTunnel
      }));
    }
  }

}

exports.TunnelsPanelContents = TunnelsPanelContents;