'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _connectionProfileUtils;

function _load_connectionProfileUtils() {
  return _connectionProfileUtils = require('./connection-profile-utils');
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('nuclide-commons-ui/addTooltip'));
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _atom = require('atom');

var _lookupPreferIpV;

function _load_lookupPreferIpV() {
  return _lookupPreferIpV = _interopRequireDefault(require('../../nuclide-remote-connection/lib/lookup-prefer-ip-v6'));
}

var _RadioGroup;

function _load_RadioGroup() {
  return _RadioGroup = _interopRequireDefault(require('../../nuclide-ui/RadioGroup'));
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const { SupportedMethods } = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).SshHandshake;
const authMethods = [SupportedMethods.PASSWORD, SupportedMethods.SSL_AGENT, SupportedMethods.PRIVATE_KEY];

/** Component to prompt the user for connection details. */
class ConnectionDetailsForm extends _react.Component {

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
        this._checkForHostCollisions(this._getText('server'));
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
          _reactDom.default.findDOMNode(this.refs.pathToPrivateKey).focus();
        }, 0);
      });
    };

    this._handlePasswordInputClick = event => {
      const passwordAuthMethodIndex = authMethods.indexOf(SupportedMethods.PASSWORD);
      this.setState({
        selectedAuthMethodIndex: passwordAuthMethodIndex
      }, () => {
        // $FlowFixMe
        _reactDom.default.findDOMNode(this.refs.password).focus();
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

  _checkForHostCollisions(hostName) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const uniqueHosts = _this.props.profileHosts;
      if (uniqueHosts == null || _this.state.IPs == null) {
        return;
      }
      const IPs = yield _this.state.IPs;
      const ip = yield (0, (_lookupPreferIpV || _load_lookupPreferIpV()).default)(hostName).catch(function () {
        return;
      });
      let shouldDisplayWarning = false;
      if (ip == null) {
        if (_this.state.shouldDisplayTooltipWarning) {
          _this.setState({ shouldDisplayTooltipWarning: false });
        }
      } else {
        for (let i = 0; i < uniqueHosts.length; i++) {
          if (hostName !== uniqueHosts[i]) {
            if (ip === IPs[i]) {
              shouldDisplayWarning = true;
            }
          }
        }
        if (_this.state.shouldDisplayTooltipWarning !== shouldDisplayWarning) {
          _this.setState({ shouldDisplayTooltipWarning: shouldDisplayWarning });
        }
      }
    })();
  }

  render() {
    const { className } = this.props;
    const activeAuthMethod = authMethods[this.state.selectedAuthMethodIndex];
    // We need native-key-bindings so that delete works and we need
    // _onKeyPress so that escape and enter work
    const passwordLabel = _react.createElement(
      'div',
      { className: 'nuclide-auth-method' },
      _react.createElement(
        'div',
        { className: 'nuclide-auth-method-label' },
        'Password:'
      ),
      _react.createElement(
        'div',
        {
          className: 'nuclide-auth-method-input nuclide-auth-method-password',
          onClick: this._handlePasswordInputClick },
        _react.createElement('input', {
          type: 'password',
          className: 'nuclide-password native-key-bindings',
          disabled: activeAuthMethod !== SupportedMethods.PASSWORD,
          onChange: this._handleInputDidChange,
          onKeyPress: this._onKeyPress.bind(this),
          ref: 'password'
        })
      )
    );
    const privateKeyLabel = _react.createElement(
      'div',
      { className: 'nuclide-auth-method' },
      _react.createElement(
        'div',
        { className: 'nuclide-auth-method-label' },
        'Private Key File:'
      ),
      _react.createElement(
        'div',
        { className: 'nuclide-auth-method-input nuclide-auth-method-privatekey' },
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          disabled: activeAuthMethod !== SupportedMethods.PRIVATE_KEY,
          initialValue: this.state.pathToPrivateKey,
          onClick: this._handleKeyFileInputClick,
          onDidChange: this._handleInputDidChange,
          placeholder: 'Path to private key',
          ref: 'pathToPrivateKey',
          unstyled: true
        })
      )
    );
    const sshAgentLabel = _react.createElement(
      'div',
      { className: 'nuclide-auth-method' },
      'Use ssh-agent'
    );
    let toolTipWarning;
    if (this.state.shouldDisplayTooltipWarning) {
      toolTipWarning = _react.createElement('span', {
        style: { paddingLeft: 10 },
        className: 'icon icon-info pull-right nuclide-remote-projects-tooltip-warning'
        // $FlowFixMe(>=0.53.0) Flow suppress
        , ref: (0, (_addTooltip || _load_addTooltip()).default)({
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

    return _react.createElement(
      'div',
      { className: className },
      _react.createElement(
        'div',
        { className: 'form-group' },
        _react.createElement(
          'label',
          null,
          'Username:'
        ),
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          initialValue: this.state.username,
          onDidChange: this._handleInputDidChange,
          ref: 'username',
          unstyled: true
        })
      ),
      _react.createElement(
        'div',
        { className: 'form-group nuclide-auth-server-group' },
        _react.createElement(
          'div',
          { className: 'nuclide-auth-server' },
          _react.createElement(
            'label',
            null,
            'Server:',
            toolTipWarning
          ),
          _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            initialValue: this.state.server,
            onDidChange: this._handleInputDidChangeForServer,
            ref: 'server',
            unstyled: true
          })
        ),
        _react.createElement(
          'div',
          { className: 'col-xs-3' },
          _react.createElement(
            'label',
            null,
            'SSH Port:'
          ),
          _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            initialValue: this.state.sshPort,
            onDidChange: this._handleInputDidChange,
            ref: 'sshPort',
            unstyled: true
          })
        )
      ),
      _react.createElement(
        'div',
        { className: 'form-group' },
        _react.createElement(
          'label',
          null,
          'Initial Directory:'
        ),
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          initialValue: this.state.cwd,
          onDidChange: this._handleInputDidChange,
          ref: 'cwd',
          unstyled: true
        })
      ),
      _react.createElement(
        'div',
        { className: 'form-group' },
        _react.createElement(
          'label',
          null,
          'Authentication method:'
        ),
        _react.createElement((_RadioGroup || _load_RadioGroup()).default, {
          optionLabels: [passwordLabel, sshAgentLabel, privateKeyLabel],
          onSelectedChange: this._handleAuthMethodChange,
          selectedIndex: this.state.selectedAuthMethodIndex
        })
      ),
      _react.createElement(
        'div',
        { className: 'form-group' },
        _react.createElement(
          'label',
          null,
          'Remote Server Command:'
        ),
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          initialValue: this.state.remoteServerCommand,
          onDidChange: this._handleInputDidChange,
          ref: 'remoteServerCommand',
          unstyled: true
        })
      )
    );
  }

  componentDidMount() {
    const disposables = new _atom.CompositeDisposable();
    this._disposables = disposables;
    const root = _reactDom.default.findDOMNode(this);

    // Hitting enter when this panel has focus should confirm the dialog.
    disposables.add(atom.commands.add(
    // $FlowFixMe
    root, 'core:confirm', event => this.props.onConfirm()));

    // Hitting escape should cancel the dialog.
    disposables.add(atom.commands.add('atom-workspace', 'core:cancel', event => this.props.onCancel()));
    if (this.props.profileHosts) {
      this.setState({ IPs: (0, (_connectionProfileUtils || _load_connectionProfileUtils()).getIPsForHosts)(this.props.profileHosts) });
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
      username: this._getText('username'),
      server: this._getText('server'),
      cwd: this._getText('cwd'),
      remoteServerCommand: this._getText('remoteServerCommand') || (0, (_connectionProfileUtils || _load_connectionProfileUtils()).getOfficialRemoteServerCommand)(),
      sshPort: this._getText('sshPort'),
      pathToPrivateKey: this._getText('pathToPrivateKey'),
      authMethod: this._getAuthMethod(),
      password: this._getPassword(),
      displayTitle: this.state.displayTitle
    };
  }

  focus() {
    this.refs.username.focus();
  }

  // Note: 'password' is not settable. The only exposed method is 'clearPassword'.
  setFormFields(fields) {
    this._setText('username', fields.username);
    this._setText('server', fields.server);
    this._setText('cwd', fields.cwd);
    this._setText('remoteServerCommand', fields.remoteServerCommand);
    this._setText('sshPort', fields.sshPort);
    this._setText('pathToPrivateKey', fields.pathToPrivateKey);
    this._setAuthMethod(fields.authMethod);
    // `displayTitle` is not editable and therefore has no `<atom-text-editor mini>`. Its value is
    // stored only in local state.
    this.setState({ displayTitle: fields.displayTitle });
  }

  _getText(fieldName) {
    return this.refs[fieldName] && this.refs[fieldName].getText().trim() || '';
  }

  _setText(fieldName, text) {
    if (text == null) {
      return;
    }
    const atomInput = this.refs[fieldName];
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
      this.setState({ selectedAuthMethodIndex: newIndex });
    }
  }

  _getPassword() {
    return (
      // $FlowFixMe
      this.refs.password && _reactDom.default.findDOMNode(this.refs.password).value || ''
    );
  }

  clearPassword() {
    const passwordInput = this.refs.password;
    if (passwordInput) {
      passwordInput.value = '';
    }
  }

  promptChanged() {
    this._promptChanged = true;
    this.setState({ shouldDisplayTooltipWarning: false });
  }
}
exports.default = ConnectionDetailsForm;