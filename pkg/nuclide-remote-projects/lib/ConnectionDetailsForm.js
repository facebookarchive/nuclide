Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideUiLibAtomInput2;

function _nuclideUiLibAtomInput() {
  return _nuclideUiLibAtomInput2 = require('../../nuclide-ui/lib/AtomInput');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideUiLibRadioGroup2;

function _nuclideUiLibRadioGroup() {
  return _nuclideUiLibRadioGroup2 = require('../../nuclide-ui/lib/RadioGroup');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var SupportedMethods = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).SshHandshake.SupportedMethods;

var authMethods = [SupportedMethods.PASSWORD, SupportedMethods.SSL_AGENT, SupportedMethods.PRIVATE_KEY];

/** Component to prompt the user for connection details. */

var ConnectionDetailsForm = (function (_React$Component) {
  _inherits(ConnectionDetailsForm, _React$Component);

  function ConnectionDetailsForm(props) {
    _classCallCheck(this, ConnectionDetailsForm);

    _get(Object.getPrototypeOf(ConnectionDetailsForm.prototype), 'constructor', this).call(this, props);
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

  _createClass(ConnectionDetailsForm, [{
    key: '_onKeyUp',
    value: function _onKeyUp(e) {
      if (e.key === 'Enter') {
        this.props.onConfirm();
      }

      if (e.key === 'Escape') {
        this.props.onCancel();
      }
    }
  }, {
    key: '_handleAuthMethodChange',
    value: function _handleAuthMethodChange(newIndex) {
      this.props.onDidChange();
      this.setState({
        selectedAuthMethodIndex: newIndex
      });
    }
  }, {
    key: '_handleInputDidChange',
    value: function _handleInputDidChange() {
      this.props.onDidChange();
    }
  }, {
    key: '_handleKeyFileInputClick',
    value: function _handleKeyFileInputClick(event) {
      var _this = this;

      var privateKeyAuthMethodIndex = authMethods.indexOf(SupportedMethods.PRIVATE_KEY);
      this.setState({
        selectedAuthMethodIndex: privateKeyAuthMethodIndex
      }, function () {
        // when setting this immediately, Atom will unset the focus...
        setTimeout(function () {
          (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(_this.refs.pathToPrivateKey).focus();
        }, 0);
      });
    }
  }, {
    key: '_handlePasswordInputClick',
    value: function _handlePasswordInputClick(event) {
      var _this2 = this;

      var passwordAuthMethodIndex = authMethods.indexOf(SupportedMethods.PASSWORD);
      this.setState({
        selectedAuthMethodIndex: passwordAuthMethodIndex
      }, function () {
        (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(_this2.refs.password).focus();
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var activeAuthMethod = authMethods[this.state.selectedAuthMethodIndex];
      // We need native-key-bindings so that delete works and we need
      // _onKeyUp so that escape and enter work
      var passwordLabel = (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-auth-method' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-auth-method-label' },
          'Password:'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-auth-method-input nuclide-auth-method-password' },
          (_reactForAtom2 || _reactForAtom()).React.createElement('input', { type: 'password',
            className: 'nuclide-password native-key-bindings',
            disabled: activeAuthMethod !== SupportedMethods.PASSWORD,
            onChange: this._handleInputDidChange,
            onClick: this._handlePasswordInputClick,
            onKeyUp: this._onKeyUp.bind(this),
            ref: 'password'
          })
        )
      );
      var privateKeyLabel = (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-auth-method' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-auth-method-label' },
          'Private Key File:'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-auth-method-input nuclide-auth-method-privatekey' },
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomInput2 || _nuclideUiLibAtomInput()).AtomInput, {
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
      var sshAgentLabel = (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-auth-method' },
        'Use ssh-agent'
      );
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'form-group' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'label',
            null,
            'Username:'
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomInput2 || _nuclideUiLibAtomInput()).AtomInput, {
            initialValue: this.state.username,
            onDidChange: this._handleInputDidChange,
            ref: 'username',
            unstyled: true
          })
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'form-group row' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'col-xs-9' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'label',
              null,
              'Server:'
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomInput2 || _nuclideUiLibAtomInput()).AtomInput, {
              initialValue: this.state.server,
              onDidChange: this._handleInputDidChange,
              ref: 'server',
              unstyled: true
            })
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'col-xs-3' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'label',
              null,
              'SSH Port:'
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomInput2 || _nuclideUiLibAtomInput()).AtomInput, {
              initialValue: this.state.sshPort,
              onDidChange: this._handleInputDidChange,
              ref: 'sshPort',
              unstyled: true
            })
          )
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'form-group' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'label',
            null,
            'Initial Directory:'
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomInput2 || _nuclideUiLibAtomInput()).AtomInput, {
            initialValue: this.state.cwd,
            onDidChange: this._handleInputDidChange,
            ref: 'cwd',
            unstyled: true
          })
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'form-group' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'label',
            null,
            'Authentication method:'
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibRadioGroup2 || _nuclideUiLibRadioGroup()).RadioGroup, {
            optionLabels: [passwordLabel, sshAgentLabel, privateKeyLabel],
            onSelectedChange: this._handleAuthMethodChange,
            selectedIndex: this.state.selectedAuthMethodIndex
          })
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'form-group' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'label',
            null,
            'Remote Server Command:'
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomInput2 || _nuclideUiLibAtomInput()).AtomInput, {
            initialValue: this.state.remoteServerCommand,
            onDidChange: this._handleInputDidChange,
            ref: 'remoteServerCommand',
            unstyled: true
          })
        )
      );
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this3 = this;

      var disposables = new (_atom2 || _atom()).CompositeDisposable();
      this._disposables = disposables;
      var root = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this);

      // Hitting enter when this panel has focus should confirm the dialog.
      disposables.add(atom.commands.add(root, 'core:confirm', function (event) {
        return _this3.props.onConfirm();
      }));

      // Hitting escape should cancel the dialog.
      disposables.add(atom.commands.add('atom-workspace', 'core:cancel', function (event) {
        return _this3.props.onCancel();
      }));
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._disposables) {
        this._disposables.dispose();
        this._disposables = null;
      }
    }
  }, {
    key: 'getFormFields',
    value: function getFormFields() {
      return {
        username: this._getText('username'),
        server: this._getText('server'),
        cwd: this._getText('cwd'),
        remoteServerCommand: this._getText('remoteServerCommand'),
        sshPort: this._getText('sshPort'),
        pathToPrivateKey: this._getText('pathToPrivateKey'),
        authMethod: this._getAuthMethod(),
        password: this._getPassword(),
        displayTitle: this.state.displayTitle
      };
    }
  }, {
    key: 'focus',
    value: function focus() {
      this.refs.username.focus();
    }

    // Note: 'password' is not settable. The only exposed method is 'clearPassword'.
  }, {
    key: 'setFormFields',
    value: function setFormFields(fields) {
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
  }, {
    key: '_getText',
    value: function _getText(fieldName) {
      return this.refs[fieldName] && this.refs[fieldName].getText().trim() || '';
    }
  }, {
    key: '_setText',
    value: function _setText(fieldName, text) {
      if (text == null) {
        return;
      }
      var atomInput = this.refs[fieldName];
      if (atomInput) {
        atomInput.setText(text);
      }
    }
  }, {
    key: '_getAuthMethod',
    value: function _getAuthMethod() {
      return authMethods[this.state.selectedAuthMethodIndex];
    }
  }, {
    key: '_setAuthMethod',
    value: function _setAuthMethod(authMethod) {
      if (authMethod == null) {
        return;
      }
      var newIndex = authMethods.indexOf(authMethod);
      if (newIndex >= 0) {
        this.setState({ selectedAuthMethodIndex: newIndex });
      }
    }
  }, {
    key: '_getPassword',
    value: function _getPassword() {
      return this.refs.password && (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this.refs.password).value || '';
    }
  }, {
    key: 'clearPassword',
    value: function clearPassword() {
      var passwordInput = this.refs.password;
      if (passwordInput) {
        passwordInput.value = '';
      }
    }
  }]);

  return ConnectionDetailsForm;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = ConnectionDetailsForm;
module.exports = exports.default;