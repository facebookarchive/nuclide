'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _connectionProfileUtils;

function _load_connectionProfileUtils() {
  return _connectionProfileUtils = require('./connection-profile-utils');
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../nuclide-ui/AtomInput');
}

var _atom = require('atom');

var _RadioGroup;

function _load_RadioGroup() {
  return _RadioGroup = _interopRequireDefault(require('../../nuclide-ui/RadioGroup'));
}

var _reactForAtom = require('react-for-atom');

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SupportedMethods = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).SshHandshake.SupportedMethods;

const authMethods = [SupportedMethods.PASSWORD, SupportedMethods.SSL_AGENT, SupportedMethods.PRIVATE_KEY];

/** Component to prompt the user for connection details. */
let ConnectionDetailsForm = class ConnectionDetailsForm extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = {
      username: props.initialUsername,
      server: props.initialServer,
      cwd: props.initialCwd,
      remoteServerCommand: props.initialRemoteServerCommand,
      sshPort: props.initialSshPort,
      pathToPrivateKey: props.initialPathToPrivateKey,
      selectedAuthMethodIndex: authMethods.indexOf(props.initialAuthMethod),
      displayTitle: props.initialDisplayTitle
    };

    this._handleAuthMethodChange = this._handleAuthMethodChange.bind(this);
    this._handleInputDidChange = this._handleInputDidChange.bind(this);
    this._handleKeyFileInputClick = this._handleKeyFileInputClick.bind(this);
    this._handlePasswordInputClick = this._handlePasswordInputClick.bind(this);
  }

  _onKeyPress(e) {
    if (e.key === 'Enter') {
      this.props.onConfirm();
    }

    if (e.key === 'Escape') {
      this.props.onCancel();
    }
  }

  _handleAuthMethodChange(newIndex) {
    this.props.onDidChange();
    this.setState({
      selectedAuthMethodIndex: newIndex
    });
  }

  _handleInputDidChange() {
    this.props.onDidChange();
  }

  _handleKeyFileInputClick(event) {
    const privateKeyAuthMethodIndex = authMethods.indexOf(SupportedMethods.PRIVATE_KEY);
    this.setState({
      selectedAuthMethodIndex: privateKeyAuthMethodIndex
    }, () => {
      // when setting this immediately, Atom will unset the focus...
      setTimeout(() => {
        _reactForAtom.ReactDOM.findDOMNode(this.refs.pathToPrivateKey).focus();
      }, 0);
    });
  }

  _handlePasswordInputClick(event) {
    const passwordAuthMethodIndex = authMethods.indexOf(SupportedMethods.PASSWORD);
    this.setState({
      selectedAuthMethodIndex: passwordAuthMethodIndex
    }, () => {
      _reactForAtom.ReactDOM.findDOMNode(this.refs.password).focus();
    });
  }

  render() {
    const className = this.props.className;

    const activeAuthMethod = authMethods[this.state.selectedAuthMethodIndex];
    // We need native-key-bindings so that delete works and we need
    // _onKeyPress so that escape and enter work
    const passwordLabel = _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-auth-method' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-auth-method-label' },
        'Password:'
      ),
      _reactForAtom.React.createElement(
        'div',
        {
          className: 'nuclide-auth-method-input nuclide-auth-method-password',
          onClick: this._handlePasswordInputClick },
        _reactForAtom.React.createElement('input', { type: 'password',
          className: 'nuclide-password native-key-bindings',
          disabled: activeAuthMethod !== SupportedMethods.PASSWORD,
          onChange: this._handleInputDidChange,
          onKeyPress: this._onKeyPress.bind(this),
          ref: 'password'
        })
      )
    );
    const privateKeyLabel = _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-auth-method' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-auth-method-label' },
        'Private Key File:'
      ),
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-auth-method-input nuclide-auth-method-privatekey' },
        _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
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
    const sshAgentLabel = _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-auth-method' },
      'Use ssh-agent'
    );
    return _reactForAtom.React.createElement(
      'div',
      { className: className },
      _reactForAtom.React.createElement(
        'div',
        { className: 'form-group' },
        _reactForAtom.React.createElement(
          'label',
          null,
          'Username:'
        ),
        _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          initialValue: this.state.username,
          onDidChange: this._handleInputDidChange,
          ref: 'username',
          unstyled: true
        })
      ),
      _reactForAtom.React.createElement(
        'div',
        { className: 'form-group row' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'col-xs-9' },
          _reactForAtom.React.createElement(
            'label',
            null,
            'Server:'
          ),
          _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            initialValue: this.state.server,
            onDidChange: this._handleInputDidChange,
            ref: 'server',
            unstyled: true
          })
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'col-xs-3' },
          _reactForAtom.React.createElement(
            'label',
            null,
            'SSH Port:'
          ),
          _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            initialValue: this.state.sshPort,
            onDidChange: this._handleInputDidChange,
            ref: 'sshPort',
            unstyled: true
          })
        )
      ),
      _reactForAtom.React.createElement(
        'div',
        { className: 'form-group' },
        _reactForAtom.React.createElement(
          'label',
          null,
          'Initial Directory:'
        ),
        _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          initialValue: this.state.cwd,
          onDidChange: this._handleInputDidChange,
          ref: 'cwd',
          unstyled: true
        })
      ),
      _reactForAtom.React.createElement(
        'div',
        { className: 'form-group' },
        _reactForAtom.React.createElement(
          'label',
          null,
          'Authentication method:'
        ),
        _reactForAtom.React.createElement((_RadioGroup || _load_RadioGroup()).default, {
          optionLabels: [passwordLabel, sshAgentLabel, privateKeyLabel],
          onSelectedChange: this._handleAuthMethodChange,
          selectedIndex: this.state.selectedAuthMethodIndex
        })
      ),
      _reactForAtom.React.createElement(
        'div',
        { className: 'form-group' },
        _reactForAtom.React.createElement(
          'label',
          null,
          'Remote Server Command:'
        ),
        _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
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
    const root = _reactForAtom.ReactDOM.findDOMNode(this);

    // Hitting enter when this panel has focus should confirm the dialog.
    disposables.add(atom.commands.add(root, 'core:confirm', event => this.props.onConfirm()));

    // Hitting escape should cancel the dialog.
    disposables.add(atom.commands.add('atom-workspace', 'core:cancel', event => this.props.onCancel()));
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
    return this.refs.password && _reactForAtom.ReactDOM.findDOMNode(this.refs.password).value || '';
  }

  clearPassword() {
    const passwordInput = this.refs.password;
    if (passwordInput) {
      passwordInput.value = '';
    }
  }
};
exports.default = ConnectionDetailsForm;
module.exports = exports['default'];