"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _AtomInput() {
  const data = require("../../../../modules/nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _Button() {
  const data = require("../../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _ButtonGroup() {
  const data = require("../../../../modules/nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

function _Section() {
  const data = require("../../../../modules/nuclide-commons-ui/Section");

  _Section = function () {
    return data;
  };

  return data;
}

function _Tunnel() {
  const data = require("../../../nuclide-socket-rpc/lib/Tunnel");

  _Tunnel = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class ManualTunnelSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      description: '',
      family: 6,
      fromCurrentWorkingRoot: true,
      fromPortString: '',
      toPortString: ''
    };
  }

  render() {
    let boxContents;

    if (this.props.workingDirectoryHost == null || this.props.workingDirectoryHost === 'localhost') {
      boxContents = 'Set a remote Current Working Root to open tunnels to that host.';
    } else {
      boxContents = this._getManualEntryForm(this.props.workingDirectoryHost);
    }

    return React.createElement(_Section().Section, {
      headline: "Manual tunnel",
      collapsable: false
    }, React.createElement("div", {
      className: "nuclide-ssh-tunnels-manual-tunnel-section"
    }, boxContents));
  }

  _getManualEntryForm(hostname) {
    const workingRootLabel = React.createElement("code", {
      className: "nuclide-ssh-tunnels-manual-tunnel-section-host-field"
    }, (0, _Tunnel().shortenHostname)(hostname), ":");
    const localhostLabel = React.createElement("code", {
      className: "nuclide-ssh-tunnels-manual-tunnel-section-host-field"
    }, "localhost:");
    const fromAndToRow = React.createElement("div", {
      className: "nuclide-ssh-tunnels-manual-tunnel-section-row"
    }, React.createElement("div", null, this.state.fromCurrentWorkingRoot ? workingRootLabel : localhostLabel, React.createElement(_AtomInput().AtomInput, {
      placeholderText: "port",
      value: this.state.fromPortString,
      size: "sm",
      width: 40,
      onDidChange: text => this.setState({
        fromPortString: text,
        fromPort: this._parsePort(text)
      })
    })), React.createElement(_Button().Button, {
      onClick: () => this._switchToAndFrom()
    }, "\u21C4"), React.createElement("div", null, this.state.fromCurrentWorkingRoot ? localhostLabel : workingRootLabel, React.createElement(_AtomInput().AtomInput, {
      placeholderText: "port",
      value: this.state.toPortString,
      size: "sm",
      width: 40,
      onDidChange: text => this.setState({
        toPortString: text,
        toPort: this._parsePort(text)
      })
    })));
    const descriptionFamilyOpenRow = React.createElement("div", {
      className: "nuclide-ssh-tunnels-manual-tunnel-section-row"
    }, React.createElement(_AtomInput().AtomInput, {
      placeholderText: "description",
      className: "nuclide-ssh-tunnels-manual-tunnel-section-description",
      size: "sm",
      style: {
        'flex-grow': 1
      },
      onDidChange: description => this.setState({
        description
      })
    }), React.createElement(_ButtonGroup().ButtonGroup, null, React.createElement(_Button().Button, {
      key: "4",
      selected: this.state.family === 4,
      onClick: () => this.setState({
        family: 4
      })
    }, "IPv4"), React.createElement(_Button().Button, {
      key: "6",
      selected: this.state.family === 6,
      onClick: () => this.setState({
        family: 6
      })
    }, "IPv6")), React.createElement(_Button().Button, {
      disabled: !this._openButtonEnabled(),
      onClick: () => this._openTunnel()
    }, "Open"));
    return [fromAndToRow, descriptionFamilyOpenRow];
  }

  _openTunnel() {
    if (!(this.props.workingDirectoryHost != null && this.props.workingDirectoryHost !== 'localhost' && this.state.fromPort != null && this.state.toPort != null)) {
      throw new Error("Invariant violation: \"this.props.workingDirectoryHost != null &&\\n        this.props.workingDirectoryHost !== 'localhost' &&\\n        this.state.fromPort != null &&\\n        this.state.toPort != null\"");
    }

    const fromHost = this.state.fromCurrentWorkingRoot ? this.props.workingDirectoryHost : 'localhost';
    const toHost = this.state.fromCurrentWorkingRoot ? 'localhost' : this.props.workingDirectoryHost;
    const tunnel = {
      from: {
        host: fromHost,
        port: this.state.fromPort,
        family: this.state.family
      },
      to: {
        host: toHost,
        port: this.state.toPort,
        family: this.state.family
      },
      description: this.state.description.trim() || 'manual'
    };
    this.props.openTunnel(tunnel);
  }

  _openButtonEnabled() {
    return this.props.workingDirectoryHost != null && this.props.workingDirectoryHost !== 'localhost' && this.state.fromPort != null && this.state.toPort != null;
  }

  _switchToAndFrom() {
    // TODO: (wbinnssmith) T30771435 this setState depends on current state
    // and should use an updater function rather than an object

    /* eslint-disable react/no-access-state-in-setstate */
    this.setState({
      fromCurrentWorkingRoot: !this.state.fromCurrentWorkingRoot,
      fromPortString: this.state.toPortString,
      toPortString: this.state.fromPortString,
      fromPort: this.state.toPort,
      toPort: this.state.fromPort
    });
    /* eslint-enable */
  }

  _parsePort(text) {
    const port = parseInt(text, 10);

    if (!(port >= 0 && port <= 65535)) {
      return undefined;
    } else {
      return port;
    }
  }

}

exports.default = ManualTunnelSection;