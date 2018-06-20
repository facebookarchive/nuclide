'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../../../modules/nuclide-commons-ui/AtomInput');
}

var _react = _interopRequireWildcard(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('../../../../modules/nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../../../modules/nuclide-commons-ui/ButtonGroup');
}

var _Section;

function _load_Section() {
  return _Section = require('../../../../modules/nuclide-commons-ui/Section');
}

var _Tunnel;

function _load_Tunnel() {
  return _Tunnel = require('../../../nuclide-socket-rpc/lib/Tunnel');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class ManualTunnelSection extends _react.Component {

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

    return _react.createElement(
      (_Section || _load_Section()).Section,
      { headline: 'Manual tunnel', collapsable: false },
      _react.createElement(
        'div',
        { className: 'nuclide-ssh-tunnels-manual-tunnel-section' },
        boxContents
      )
    );
  }

  _getManualEntryForm(hostname) {
    const workingRootLabel = _react.createElement(
      'code',
      { className: 'nuclide-ssh-tunnels-manual-tunnel-section-host-field' },
      (0, (_Tunnel || _load_Tunnel()).shortenHostname)(hostname),
      ':'
    );
    const localhostLabel = _react.createElement(
      'code',
      { className: 'nuclide-ssh-tunnels-manual-tunnel-section-host-field' },
      'localhost:'
    );
    const fromAndToRow = _react.createElement(
      'div',
      { className: 'nuclide-ssh-tunnels-manual-tunnel-section-row' },
      _react.createElement(
        'div',
        null,
        this.state.fromCurrentWorkingRoot ? workingRootLabel : localhostLabel,
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          placeholderText: 'port',
          value: this.state.fromPortString,
          size: 'sm',
          width: 40,
          onDidChange: text => this.setState({
            fromPortString: text,
            fromPort: this._parsePort(text)
          })
        })
      ),
      _react.createElement(
        (_Button || _load_Button()).Button,
        { onClick: () => this._switchToAndFrom() },
        '\u21C4'
      ),
      _react.createElement(
        'div',
        null,
        this.state.fromCurrentWorkingRoot ? localhostLabel : workingRootLabel,
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          placeholderText: 'port',
          value: this.state.toPortString,
          size: 'sm',
          width: 40,
          onDidChange: text => this.setState({
            toPortString: text,
            toPort: this._parsePort(text)
          })
        })
      )
    );
    const descriptionFamilyOpenRow = _react.createElement(
      'div',
      { className: 'nuclide-ssh-tunnels-manual-tunnel-section-row' },
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        placeholderText: 'description',
        className: 'nuclide-ssh-tunnels-manual-tunnel-section-description',
        size: 'sm',
        style: { 'flex-grow': 1 },
        onDidChange: description => this.setState({ description })
      }),
      _react.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        null,
        _react.createElement(
          (_Button || _load_Button()).Button,
          {
            key: '4',
            selected: this.state.family === 4,
            onClick: () => this.setState({ family: 4 }) },
          'IPv4'
        ),
        _react.createElement(
          (_Button || _load_Button()).Button,
          {
            key: '6',
            selected: this.state.family === 6,
            onClick: () => this.setState({ family: 6 }) },
          'IPv6'
        )
      ),
      _react.createElement(
        (_Button || _load_Button()).Button,
        {
          disabled: !this._openButtonEnabled(),
          onClick: () => this._openTunnel() },
        'Open'
      )
    );
    return [fromAndToRow, descriptionFamilyOpenRow];
  }

  _openTunnel() {
    if (!(this.props.workingDirectoryHost != null && this.props.workingDirectoryHost !== 'localhost' && this.state.fromPort != null && this.state.toPort != null)) {
      throw new Error('Invariant violation: "this.props.workingDirectoryHost != null &&\\n        this.props.workingDirectoryHost !== \'localhost\' &&\\n        this.state.fromPort != null &&\\n        this.state.toPort != null"');
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
    this.setState({
      fromCurrentWorkingRoot: !this.state.fromCurrentWorkingRoot,
      fromPortString: this.state.toPortString,
      toPortString: this.state.fromPortString,
      fromPort: this.state.toPort,
      toPort: this.state.fromPort
    });
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
exports.default = ManualTunnelSection; /**
                                        * Copyright (c) 2015-present, Facebook, Inc.
                                        * All rights reserved.
                                        *
                                        * This source code is licensed under the license found in the LICENSE file in
                                        * the root directory of this source tree.
                                        *
                                        * 
                                        * @format
                                        */