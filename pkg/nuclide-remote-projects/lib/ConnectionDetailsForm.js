"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _connectionProfileUtils() {
  const data = require("./connection-profile-utils");

  _connectionProfileUtils = function () {
    return data;
  };

  return data;
}

function _addTooltip() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/addTooltip"));

  _addTooltip = function () {
    return data;
  };

  return data;
}

function _AtomInput() {
  const data = require("../../../modules/nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _lookupPreferIpV() {
  const data = _interopRequireDefault(require("../../nuclide-remote-connection/lib/lookup-prefer-ip-v6"));

  _lookupPreferIpV = function () {
    return data;
  };

  return data;
}

function _RadioGroup() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/RadioGroup"));

  _RadioGroup = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
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
 *  strict-local
 * @format
 */
const {
  SupportedMethods
} = _nuclideRemoteConnection().SshHandshake;

const authMethods = [SupportedMethods.PASSWORD, SupportedMethods.SSL_AGENT, SupportedMethods.PRIVATE_KEY];

/** Component to prompt the user for connection details. */
class ConnectionDetailsForm extends React.Component {
  constructor(props) {
    super(props);

    this._handleAuthMethodChange = newIndex => {
      this.props.onDidChange();
      this.setState({
        selectedAuthMethodIndex: newIndex
      });
    };

    this._handleInputDidChange = () => {
      this.props.onDidChange();
    };

    this._handleInputDidChangeForServer = () => {
      // If the input changed due to a higher level change in the
      // ConnectionDetailsPrompt, don't check for host collisions
      if (!this._promptChanged) {
        this._checkForHostCollisions(this._getText(this._server));

        this.props.onDidChange();
      }

      this._promptChanged = false;
    };

    this._handleKeyFileInputClick = event => {
      const privateKeyAuthMethodIndex = authMethods.indexOf(SupportedMethods.PRIVATE_KEY);
      this.setState({
        selectedAuthMethodIndex: privateKeyAuthMethodIndex
      }, () => {
        // when setting this immediately, Atom will unset the focus...
        setTimeout(() => {
          // $FlowFixMe
          _reactDom.default.findDOMNode(this._pathToPrivateKey).focus();
        }, 0);
      });
    };

    this._handlePasswordInputClick = event => {
      const passwordAuthMethodIndex = authMethods.indexOf(SupportedMethods.PASSWORD);
      this.setState({
        selectedAuthMethodIndex: passwordAuthMethodIndex
      }, () => {
        (0, _nullthrows().default)(this._password).focus();
      });
    };

    this._promptChanged = false;
    this.state = {
      username: props.initialUsername,
      server: props.initialServer,
      cwd: props.initialCwd,
      remoteServerCommand: props.initialRemoteServerCommand,
      sshPort: props.initialSshPort,
      pathToPrivateKey: props.initialPathToPrivateKey,
      selectedAuthMethodIndex: authMethods.indexOf(props.initialAuthMethod),
      displayTitle: props.initialDisplayTitle,
      IPs: null,
      shouldDisplayTooltipWarning: false
    };
  }

  _onKeyPress(e) {
    if (e.key === 'Enter') {
      this.props.onConfirm();
    }

    if (e.key === 'Escape') {
      this.props.onCancel();
    }
  }

  async _checkForHostCollisions(hostName) {
    const uniqueHosts = this.props.profileHosts;

    if (uniqueHosts == null || this.state.IPs == null) {
      return;
    }

    const IPs = await this.state.IPs;
    const ip = await (0, _lookupPreferIpV().default)(hostName).catch(() => {
      return;
    });
    let shouldDisplayWarning = false;

    if (ip == null) {
      if (this.state.shouldDisplayTooltipWarning) {
        this.setState({
          shouldDisplayTooltipWarning: false
        });
      }
    } else {
      for (let i = 0; i < uniqueHosts.length; i++) {
        if (hostName !== uniqueHosts[i]) {
          if (ip === IPs[i]) {
            shouldDisplayWarning = true;
          }
        }
      }

      if (this.state.shouldDisplayTooltipWarning !== shouldDisplayWarning) {
        this.setState({
          shouldDisplayTooltipWarning: shouldDisplayWarning
        });
      }
    }
  }

  render() {
    const {
      className,
      needsPasswordValue
    } = this.props;
    const activeAuthMethod = authMethods[this.state.selectedAuthMethodIndex]; // We need native-key-bindings so that delete works and we need
    // _onKeyPress so that escape and enter work

    const passwordLabelName = 'Password' + (needsPasswordValue ? ':' : '');
    const passwordLabel = React.createElement("div", {
      className: "nuclide-auth-method"
    }, React.createElement("div", {
      className: "nuclide-auth-method-label"
    }, passwordLabelName), needsPasswordValue ? React.createElement("div", {
      className: "nuclide-auth-method-input nuclide-auth-method-password",
      onClick: this._handlePasswordInputClick
    }, React.createElement("input", {
      type: "password",
      className: "nuclide-password native-key-bindings",
      disabled: activeAuthMethod !== SupportedMethods.PASSWORD,
      onChange: this._handleInputDidChange,
      onKeyPress: this._onKeyPress.bind(this),
      ref: el => {
        this._password = el;
      }
    })) : null);
    const privateKeyLabel = React.createElement("div", {
      className: "nuclide-auth-method"
    }, React.createElement("div", {
      className: "nuclide-auth-method-label"
    }, "Private Key File:"), React.createElement("div", {
      className: "nuclide-auth-method-input nuclide-auth-method-privatekey"
    }, React.createElement(_AtomInput().AtomInput, {
      disabled: activeAuthMethod !== SupportedMethods.PRIVATE_KEY,
      initialValue: this.state.pathToPrivateKey,
      onClick: this._handleKeyFileInputClick,
      onDidChange: this._handleInputDidChange,
      placeholder: "Path to private key",
      ref: input => {
        this._pathToPrivateKey = input;
      },
      unstyled: true
    })));
    const sshAgentLabel = React.createElement("div", {
      className: "nuclide-auth-method"
    }, "Use ssh-agent");
    let toolTipWarning;

    if (this.state.shouldDisplayTooltipWarning) {
      toolTipWarning = React.createElement("span", {
        style: {
          paddingLeft: 10
        },
        className: 'icon icon-info pull-right nuclide-remote-projects-tooltip-warning' // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
        ,
        ref: (0, _addTooltip().default)({
          // Intentionally *not* an arrow function so the jQuery
          // Tooltip plugin can set the context to the Tooltip
          // instance.
          placement() {
            // Atom modals have z indices of 9999. This Tooltip needs
            // to stack on top of the modal; beat the modal's z-index.
            this.tip.style.zIndex = 10999;
            return 'right';
          },

          title: 'One of your profiles uses a host name that resolves to the' + ' same IP as this one. Consider using the uniform host ' + 'name to avoid potential collisions.'
        })
      });
    }

    return React.createElement("div", {
      className: className
    }, React.createElement("div", {
      className: "form-group"
    }, React.createElement("label", null, "Username:"), React.createElement(_AtomInput().AtomInput, {
      initialValue: this.state.username,
      onDidChange: this._handleInputDidChange,
      ref: input => {
        this._username = input;
      },
      unstyled: true
    })), React.createElement("div", {
      className: "form-group nuclide-auth-server-group"
    }, React.createElement("div", {
      className: "nuclide-auth-server"
    }, React.createElement("label", null, "Server:", toolTipWarning), React.createElement(_AtomInput().AtomInput, {
      initialValue: this.state.server,
      onDidChange: this._handleInputDidChangeForServer,
      ref: input => {
        this._server = input;
      },
      unstyled: true
    })), React.createElement("div", {
      className: "col-xs-3"
    }, React.createElement("label", null, "SSH Port:"), React.createElement(_AtomInput().AtomInput, {
      initialValue: this.state.sshPort,
      onDidChange: this._handleInputDidChange,
      ref: input => {
        this._sshPort = input;
      },
      unstyled: true
    }))), React.createElement("div", {
      className: "form-group"
    }, React.createElement("label", null, "Initial Directory:"), React.createElement(_AtomInput().AtomInput, {
      initialValue: this.state.cwd,
      onDidChange: this._handleInputDidChange,
      ref: input => {
        this._cwd = input;
      },
      unstyled: true
    })), React.createElement("div", {
      className: "form-group"
    }, React.createElement("label", null, "Authentication method:"), React.createElement(_RadioGroup().default, {
      optionLabels: [passwordLabel, sshAgentLabel, privateKeyLabel],
      onSelectedChange: this._handleAuthMethodChange,
      selectedIndex: this.state.selectedAuthMethodIndex
    })), React.createElement("div", {
      className: "form-group"
    }, React.createElement("label", null, "Remote Server Command:"), React.createElement(_AtomInput().AtomInput, {
      initialValue: this.state.remoteServerCommand,
      onDidChange: this._handleInputDidChange,
      ref: input => {
        this._remoteServerCommand = input;
      },
      unstyled: true
    })));
  }

  componentDidMount() {
    const disposables = new (_UniversalDisposable().default)();
    this._disposables = disposables;

    const root = _reactDom.default.findDOMNode(this); // Hitting enter when this panel has focus should confirm the dialog.


    disposables.add(atom.commands.add( // $FlowFixMe
    root, 'core:confirm', event => this.props.onConfirm())); // Hitting escape should cancel the dialog.

    disposables.add(atom.commands.add('atom-workspace', 'core:cancel', event => this.props.onCancel()));

    if (this.props.profileHosts) {
      this.setState({
        IPs: (0, _connectionProfileUtils().getIPsForHosts)(this.props.profileHosts)
      });
    }
  }

  componentWillUnmount() {
    if (this._disposables) {
      this._disposables.dispose();

      this._disposables = null;
    }
  }

  getFormFields() {
    return {
      username: this._getText(this._username),
      server: this._getText(this._server),
      cwd: this._getText(this._cwd),
      remoteServerCommand: this._getText(this._remoteServerCommand) || (0, _connectionProfileUtils().getOfficialRemoteServerCommand)(),
      sshPort: this._getText(this._sshPort),
      pathToPrivateKey: this._getText(this._pathToPrivateKey),
      authMethod: this._getAuthMethod(),
      password: this._getPassword(),
      displayTitle: this.state.displayTitle
    };
  }

  focus() {
    (0, _nullthrows().default)(this._username).focus();
  } // Note: 'password' is not settable. The only exposed method is 'clearPassword'.


  setFormFields(fields) {
    this._setText(this._username, fields.username);

    this._setText(this._server, fields.server);

    this._setText(this._cwd, fields.cwd);

    this._setText(this._remoteServerCommand, fields.remoteServerCommand);

    this._setText(this._sshPort, fields.sshPort);

    this._setText(this._pathToPrivateKey, fields.pathToPrivateKey);

    this._setAuthMethod(fields.authMethod); // `displayTitle` is not editable and therefore has no `<atom-text-editor mini>`. Its value is
    // stored only in local state.


    this.setState({
      displayTitle: fields.displayTitle
    });
  }

  _getText(atomInput) {
    return atomInput && atomInput.getText().trim() || '';
  }

  _setText(atomInput, text) {
    if (text == null) {
      return;
    }

    if (atomInput) {
      atomInput.setText(text);
    }
  }

  _getAuthMethod() {
    return authMethods[this.state.selectedAuthMethodIndex];
  }

  _setAuthMethod(authMethod) {
    if (authMethod == null) {
      return;
    }

    const newIndex = authMethods.indexOf(authMethod);

    if (newIndex >= 0) {
      this.setState({
        selectedAuthMethodIndex: newIndex
      });
    }
  }

  _getPassword() {
    return this._password && this._password.value || '';
  }

  clearPassword() {
    const passwordInput = this._password;

    if (passwordInput) {
      passwordInput.value = '';
    }
  }

  promptChanged() {
    this._promptChanged = true;
    this.setState({
      shouldDisplayTooltipWarning: false
    });
  }

}

exports.default = ConnectionDetailsForm;