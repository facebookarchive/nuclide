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

var _require = require('../../nuclide-ui/lib/AtomInput');

var AtomInput = _require.AtomInput;

var _require2 = require('atom');

var CompositeDisposable = _require2.CompositeDisposable;

var _require3 = require('../../nuclide-ui/lib/RadioGroup');

var RadioGroup = _require3.RadioGroup;

var _require4 = require('react-for-atom');

var React = _require4.React;
var ReactDOM = _require4.ReactDOM;
var PropTypes = React.PropTypes;

var _require5 = require('../../nuclide-remote-connection');

var SshHandshake = _require5.SshHandshake;
var SupportedMethods = SshHandshake.SupportedMethods;

var authMethods = [SupportedMethods.PASSWORD, SupportedMethods.SSL_AGENT, SupportedMethods.PRIVATE_KEY];

/** Component to prompt the user for connection details. */

var ConnectionDetailsForm = (function (_React$Component) {
  _inherits(ConnectionDetailsForm, _React$Component);

  _createClass(ConnectionDetailsForm, null, [{
    key: 'propTypes',
    value: {
      initialUsername: PropTypes.string,
      initialServer: PropTypes.string,
      initialCwd: PropTypes.string,
      initialRemoteServerCommand: PropTypes.string,
      initialSshPort: PropTypes.string,
      initialPathToPrivateKey: PropTypes.string,
      initialAuthMethod: PropTypes.oneOf(Object.keys(SupportedMethods)),
      onConfirm: PropTypes.func.isRequired,
      onCancel: PropTypes.func.isRequired
    },
    enumerable: true
  }]);

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
      selectedAuthMethodIndex: authMethods.indexOf(props.initialAuthMethod)
    };
  }

  _createClass(ConnectionDetailsForm, [{
    key: 'handleAuthMethodChange',
    value: function handleAuthMethodChange(newIndex) {
      this.setState({
        selectedAuthMethodIndex: newIndex
      });
    }
  }, {
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
    key: '_handlePasswordInputClick',
    value: function _handlePasswordInputClick(event) {
      var _this = this;

      var passwordAuthMethodIndex = authMethods.indexOf(SupportedMethods.PASSWORD);
      this.setState({
        selectedAuthMethodIndex: passwordAuthMethodIndex
      }, function () {
        ReactDOM.findDOMNode(_this.refs['password']).focus();
      });
    }
  }, {
    key: '_handleKeyFileInputClick',
    value: function _handleKeyFileInputClick(event) {
      var _this2 = this;

      var privateKeyAuthMethodIndex = authMethods.indexOf(SupportedMethods.PRIVATE_KEY);
      this.setState({
        selectedAuthMethodIndex: privateKeyAuthMethodIndex
      }, function () {
        // when setting this immediately, Atom will unset the focus...
        setTimeout(function () {
          ReactDOM.findDOMNode(_this2.refs['pathToPrivateKey']).focus();
        }, 0);
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var activeAuthMethod = authMethods[this.state.selectedAuthMethodIndex];
      // We need native-key-bindings so that delete works and we need
      // _onKeyUp so that escape and enter work
      var passwordLabel = React.createElement(
        'div',
        { className: 'nuclide-auth-method' },
        React.createElement(
          'div',
          { className: 'nuclide-auth-method-label' },
          'Password:'
        ),
        React.createElement(
          'div',
          { className: 'nuclide-auth-method-input nuclide-auth-method-password' },
          React.createElement('input', { type: 'password',
            className: 'nuclide-password native-key-bindings',
            disabled: activeAuthMethod !== SupportedMethods.PASSWORD,
            ref: 'password',
            onClick: this._handlePasswordInputClick.bind(this),
            onKeyUp: this._onKeyUp.bind(this)
          })
        )
      );
      var privateKeyLabel = React.createElement(
        'div',
        { className: 'nuclide-auth-method' },
        React.createElement(
          'div',
          { className: 'nuclide-auth-method-label' },
          'Private Key File:'
        ),
        React.createElement(
          'div',
          { className: 'nuclide-auth-method-input nuclide-auth-method-privatekey' },
          React.createElement(AtomInput, {
            ref: 'pathToPrivateKey',
            disabled: activeAuthMethod !== SupportedMethods.PRIVATE_KEY,
            initialValue: this.state.pathToPrivateKey,
            onClick: this._handleKeyFileInputClick.bind(this),
            placeholder: 'Path to private key',
            unstyled: true
          })
        )
      );
      var sshAgentLabel = React.createElement(
        'div',
        { className: 'nuclide-auth-method' },
        'Use ssh-agent'
      );
      return React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { className: 'form-group' },
          React.createElement(
            'label',
            null,
            'Username:'
          ),
          React.createElement(AtomInput, {
            initialValue: this.state.username,
            ref: 'username',
            unstyled: true
          })
        ),
        React.createElement(
          'div',
          { className: 'form-group row' },
          React.createElement(
            'div',
            { className: 'col-xs-9' },
            React.createElement(
              'label',
              null,
              'Server:'
            ),
            React.createElement(AtomInput, {
              initialValue: this.state.server,
              ref: 'server',
              unstyled: true
            })
          ),
          React.createElement(
            'div',
            { className: 'col-xs-3' },
            React.createElement(
              'label',
              null,
              'SSH Port:'
            ),
            React.createElement(AtomInput, {
              initialValue: this.state.sshPort,
              ref: 'sshPort',
              unstyled: true
            })
          )
        ),
        React.createElement(
          'div',
          { className: 'form-group' },
          React.createElement(
            'label',
            null,
            'Initial Directory:'
          ),
          React.createElement(AtomInput, {
            initialValue: this.state.cwd,
            ref: 'cwd',
            unstyled: true
          })
        ),
        React.createElement(
          'div',
          { className: 'form-group' },
          React.createElement(
            'label',
            null,
            'Authentication method:'
          ),
          React.createElement(RadioGroup, {
            optionLabels: [passwordLabel, sshAgentLabel, privateKeyLabel],
            onSelectedChange: this.handleAuthMethodChange.bind(this),
            selectedIndex: this.state.selectedAuthMethodIndex
          })
        ),
        React.createElement(
          'div',
          { className: 'form-group' },
          React.createElement(
            'label',
            null,
            'Remote Server Command:'
          ),
          React.createElement(AtomInput, {
            initialValue: this.state.remoteServerCommand,
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

      var disposables = new CompositeDisposable();
      this._disposables = disposables;
      var root = ReactDOM.findDOMNode(this);

      // Hitting enter when this panel has focus should confirm the dialog.
      disposables.add(atom.commands.add(root, 'core:confirm', function (event) {
        return _this3.props.onConfirm();
      }));

      // Hitting escape when this panel has focus should cancel the dialog.
      disposables.add(atom.commands.add(root, 'core:cancel', function (event) {
        return _this3.props.onCancel();
      }));

      this.refs['username'].focus();
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
        password: this._getPassword()
      };
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
      return this.refs.password && ReactDOM.findDOMNode(this.refs.password).value || '';
    }
  }, {
    key: 'clearPassword',
    value: function clearPassword() {
      var passwordInput = this.refs['password'];
      if (passwordInput) {
        passwordInput.value = '';
      }
    }
  }]);

  return ConnectionDetailsForm;
})(React.Component);

exports['default'] = ConnectionDetailsForm;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb25EZXRhaWxzRm9ybS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztlQWdCb0IsT0FBTyxDQUFDLGdDQUFnQyxDQUFDOztJQUF0RCxTQUFTLFlBQVQsU0FBUzs7Z0JBQ2MsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBdEMsbUJBQW1CLGFBQW5CLG1CQUFtQjs7Z0JBQ0wsT0FBTyxDQUFDLGlDQUFpQyxDQUFDOztJQUF4RCxVQUFVLGFBQVYsVUFBVTs7Z0JBSWIsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUYzQixLQUFLLGFBQUwsS0FBSztJQUNMLFFBQVEsYUFBUixRQUFRO0lBRUgsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7Z0JBQ08sT0FBTyxDQUFDLGlDQUFpQyxDQUFDOztJQUExRCxZQUFZLGFBQVosWUFBWTtJQVlaLGdCQUFnQixHQUFJLFlBQVksQ0FBaEMsZ0JBQWdCOztBQUN2QixJQUFNLFdBQVcsR0FBRyxDQUNsQixnQkFBZ0IsQ0FBQyxRQUFRLEVBQ3pCLGdCQUFnQixDQUFDLFNBQVMsRUFDMUIsZ0JBQWdCLENBQUMsV0FBVyxDQUM3QixDQUFDOzs7O0lBR21CLHFCQUFxQjtZQUFyQixxQkFBcUI7O2VBQXJCLHFCQUFxQjs7V0FFckI7QUFDakIscUJBQWUsRUFBRSxTQUFTLENBQUMsTUFBTTtBQUNqQyxtQkFBYSxFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQy9CLGdCQUFVLEVBQUUsU0FBUyxDQUFDLE1BQU07QUFDNUIsZ0NBQTBCLEVBQUUsU0FBUyxDQUFDLE1BQU07QUFDNUMsb0JBQWMsRUFBRSxTQUFTLENBQUMsTUFBTTtBQUNoQyw2QkFBdUIsRUFBRSxTQUFTLENBQUMsTUFBTTtBQUN6Qyx1QkFBaUIsRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNqRSxlQUFTLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFV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RCxVQUFJLFFBQVEsSUFBSSxDQUFDLEVBQUU7QUFDakIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLHVCQUF1QixFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7T0FDcEQ7S0FDRjs7O1dBRVcsd0JBQVc7QUFDckIsYUFBTyxBQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLElBQUssRUFBRSxDQUFDO0tBQ3JGOzs7V0FFWSx5QkFBUztBQUNwQixVQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzVDLFVBQUksYUFBYSxFQUFFO0FBQ2pCLHFCQUFhLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztPQUMxQjtLQUNGOzs7U0E5UWtCLHFCQUFxQjtHQUFTLEtBQUssQ0FBQyxTQUFTOztxQkFBN0MscUJBQXFCIiwiZmlsZSI6IkNvbm5lY3Rpb25EZXRhaWxzRm9ybS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgTnVjbGlkZVJlbW90ZUF1dGhNZXRob2RzLFxuICBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblBhcmFtc1dpdGhQYXNzd29yZCxcbn0gZnJvbSAnLi9jb25uZWN0aW9uLXR5cGVzJztcblxuY29uc3Qge0F0b21JbnB1dH0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXVpL2xpYi9BdG9tSW5wdXQnKTtcbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHtSYWRpb0dyb3VwfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtdWkvbGliL1JhZGlvR3JvdXAnKTtcbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuY29uc3Qge1NzaEhhbmRzaGFrZX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJyk7XG5cbnR5cGUgU3RhdGUgPSB7XG4gIGN3ZDogc3RyaW5nO1xuICBwYXRoVG9Qcml2YXRlS2V5OiBzdHJpbmc7XG4gIHJlbW90ZVNlcnZlckNvbW1hbmQ6IHN0cmluZztcbiAgc2VsZWN0ZWRBdXRoTWV0aG9kSW5kZXg6IG51bWJlcjtcbiAgc2VydmVyOiBzdHJpbmc7XG4gIHNzaFBvcnQ6IHN0cmluZztcbiAgdXNlcm5hbWU6IHN0cmluZztcbn07XG5cbmNvbnN0IHtTdXBwb3J0ZWRNZXRob2RzfSA9IFNzaEhhbmRzaGFrZTtcbmNvbnN0IGF1dGhNZXRob2RzID0gW1xuICBTdXBwb3J0ZWRNZXRob2RzLlBBU1NXT1JELFxuICBTdXBwb3J0ZWRNZXRob2RzLlNTTF9BR0VOVCxcbiAgU3VwcG9ydGVkTWV0aG9kcy5QUklWQVRFX0tFWSxcbl07XG5cbi8qKiBDb21wb25lbnQgdG8gcHJvbXB0IHRoZSB1c2VyIGZvciBjb25uZWN0aW9uIGRldGFpbHMuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25uZWN0aW9uRGV0YWlsc0Zvcm0gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0ZTogU3RhdGU7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgaW5pdGlhbFVzZXJuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGluaXRpYWxTZXJ2ZXI6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgaW5pdGlhbEN3ZDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBpbml0aWFsUmVtb3RlU2VydmVyQ29tbWFuZDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBpbml0aWFsU3NoUG9ydDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBpbml0aWFsUGF0aFRvUHJpdmF0ZUtleTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBpbml0aWFsQXV0aE1ldGhvZDogUHJvcFR5cGVzLm9uZU9mKE9iamVjdC5rZXlzKFN1cHBvcnRlZE1ldGhvZHMpKSxcbiAgICBvbkNvbmZpcm06IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25DYW5jZWw6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgX2Rpc3Bvc2FibGVzOiA/Q29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogYW55KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB1c2VybmFtZTogcHJvcHMuaW5pdGlhbFVzZXJuYW1lLFxuICAgICAgc2VydmVyOiBwcm9wcy5pbml0aWFsU2VydmVyLFxuICAgICAgY3dkOiBwcm9wcy5pbml0aWFsQ3dkLFxuICAgICAgcmVtb3RlU2VydmVyQ29tbWFuZDogcHJvcHMuaW5pdGlhbFJlbW90ZVNlcnZlckNvbW1hbmQsXG4gICAgICBzc2hQb3J0OiBwcm9wcy5pbml0aWFsU3NoUG9ydCxcbiAgICAgIHBhdGhUb1ByaXZhdGVLZXk6IHByb3BzLmluaXRpYWxQYXRoVG9Qcml2YXRlS2V5LFxuICAgICAgc2VsZWN0ZWRBdXRoTWV0aG9kSW5kZXg6IGF1dGhNZXRob2RzLmluZGV4T2YocHJvcHMuaW5pdGlhbEF1dGhNZXRob2QpLFxuICAgIH07XG4gIH1cblxuICBoYW5kbGVBdXRoTWV0aG9kQ2hhbmdlKG5ld0luZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGVkQXV0aE1ldGhvZEluZGV4OiBuZXdJbmRleCxcbiAgICB9KTtcbiAgfVxuXG4gIF9vbktleVVwKGU6IFN5bnRoZXRpY0tleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgIHRoaXMucHJvcHMub25Db25maXJtKCk7XG4gICAgfVxuXG4gICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgdGhpcy5wcm9wcy5vbkNhbmNlbCgpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVQYXNzd29yZElucHV0Q2xpY2soZXZlbnQ6IFN5bnRoZXRpY0V2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgcGFzc3dvcmRBdXRoTWV0aG9kSW5kZXggPSBhdXRoTWV0aG9kcy5pbmRleE9mKFN1cHBvcnRlZE1ldGhvZHMuUEFTU1dPUkQpO1xuICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICB7XG4gICAgICAgIHNlbGVjdGVkQXV0aE1ldGhvZEluZGV4OiBwYXNzd29yZEF1dGhNZXRob2RJbmRleCxcbiAgICAgIH0sXG4gICAgICAoKSA9PiB7XG4gICAgICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1sncGFzc3dvcmQnXSkuZm9jdXMoKTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUtleUZpbGVJbnB1dENsaWNrKGV2ZW50OiBTeW50aGV0aWNFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IHByaXZhdGVLZXlBdXRoTWV0aG9kSW5kZXggPSBhdXRoTWV0aG9kcy5pbmRleE9mKFN1cHBvcnRlZE1ldGhvZHMuUFJJVkFURV9LRVkpO1xuICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICB7XG4gICAgICAgIHNlbGVjdGVkQXV0aE1ldGhvZEluZGV4OiBwcml2YXRlS2V5QXV0aE1ldGhvZEluZGV4LFxuICAgICAgfSxcbiAgICAgICgpID0+IHtcbiAgICAgICAgLy8gd2hlbiBzZXR0aW5nIHRoaXMgaW1tZWRpYXRlbHksIEF0b20gd2lsbCB1bnNldCB0aGUgZm9jdXMuLi5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydwYXRoVG9Qcml2YXRlS2V5J10pLmZvY3VzKCk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBhY3RpdmVBdXRoTWV0aG9kID0gYXV0aE1ldGhvZHNbdGhpcy5zdGF0ZS5zZWxlY3RlZEF1dGhNZXRob2RJbmRleF07XG4gICAgLy8gV2UgbmVlZCBuYXRpdmUta2V5LWJpbmRpbmdzIHNvIHRoYXQgZGVsZXRlIHdvcmtzIGFuZCB3ZSBuZWVkXG4gICAgLy8gX29uS2V5VXAgc28gdGhhdCBlc2NhcGUgYW5kIGVudGVyIHdvcmtcbiAgICBjb25zdCBwYXNzd29yZExhYmVsID0gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWF1dGgtbWV0aG9kXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1hdXRoLW1ldGhvZC1sYWJlbFwiPlxuICAgICAgICAgIFBhc3N3b3JkOlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWF1dGgtbWV0aG9kLWlucHV0IG51Y2xpZGUtYXV0aC1tZXRob2QtcGFzc3dvcmRcIj5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm51Y2xpZGUtcGFzc3dvcmQgbmF0aXZlLWtleS1iaW5kaW5nc1wiXG4gICAgICAgICAgICBkaXNhYmxlZD17YWN0aXZlQXV0aE1ldGhvZCAhPT0gU3VwcG9ydGVkTWV0aG9kcy5QQVNTV09SRH1cbiAgICAgICAgICAgIHJlZj1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZVBhc3N3b3JkSW5wdXRDbGljay5iaW5kKHRoaXMpfVxuICAgICAgICAgICAgb25LZXlVcD17dGhpcy5fb25LZXlVcC5iaW5kKHRoaXMpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgICBjb25zdCBwcml2YXRlS2V5TGFiZWwgPSAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtYXV0aC1tZXRob2RcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWF1dGgtbWV0aG9kLWxhYmVsXCI+XG4gICAgICAgICAgUHJpdmF0ZSBLZXkgRmlsZTpcbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1hdXRoLW1ldGhvZC1pbnB1dCBudWNsaWRlLWF1dGgtbWV0aG9kLXByaXZhdGVrZXlcIj5cbiAgICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgICByZWY9XCJwYXRoVG9Qcml2YXRlS2V5XCJcbiAgICAgICAgICAgIGRpc2FibGVkPXthY3RpdmVBdXRoTWV0aG9kICE9PSBTdXBwb3J0ZWRNZXRob2RzLlBSSVZBVEVfS0VZfVxuICAgICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnN0YXRlLnBhdGhUb1ByaXZhdGVLZXl9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9oYW5kbGVLZXlGaWxlSW5wdXRDbGljay5iaW5kKHRoaXMpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJQYXRoIHRvIHByaXZhdGUga2V5XCJcbiAgICAgICAgICAgIHVuc3R5bGVkPXt0cnVlfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgICBjb25zdCBzc2hBZ2VudExhYmVsID0gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWF1dGgtbWV0aG9kXCI+XG4gICAgICAgIFVzZSBzc2gtYWdlbnRcbiAgICAgIDwvZGl2PlxuICAgICk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgIDxsYWJlbD5Vc2VybmFtZTo8L2xhYmVsPlxuICAgICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5zdGF0ZS51c2VybmFtZX1cbiAgICAgICAgICAgIHJlZj1cInVzZXJuYW1lXCJcbiAgICAgICAgICAgIHVuc3R5bGVkPXt0cnVlfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXAgcm93XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wteHMtOVwiPlxuICAgICAgICAgICAgPGxhYmVsPlNlcnZlcjo8L2xhYmVsPlxuICAgICAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgICAgICBpbml0aWFsVmFsdWU9e3RoaXMuc3RhdGUuc2VydmVyfVxuICAgICAgICAgICAgICByZWY9XCJzZXJ2ZXJcIlxuICAgICAgICAgICAgICB1bnN0eWxlZD17dHJ1ZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wteHMtM1wiPlxuICAgICAgICAgICAgPGxhYmVsPlNTSCBQb3J0OjwvbGFiZWw+XG4gICAgICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5zdGF0ZS5zc2hQb3J0fVxuICAgICAgICAgICAgICByZWY9XCJzc2hQb3J0XCJcbiAgICAgICAgICAgICAgdW5zdHlsZWQ9e3RydWV9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgPGxhYmVsPkluaXRpYWwgRGlyZWN0b3J5OjwvbGFiZWw+XG4gICAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnN0YXRlLmN3ZH1cbiAgICAgICAgICAgIHJlZj1cImN3ZFwiXG4gICAgICAgICAgICB1bnN0eWxlZD17dHJ1ZX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgPGxhYmVsPkF1dGhlbnRpY2F0aW9uIG1ldGhvZDo8L2xhYmVsPlxuICAgICAgICAgIDxSYWRpb0dyb3VwXG4gICAgICAgICAgICBvcHRpb25MYWJlbHM9e1tcbiAgICAgICAgICAgICAgcGFzc3dvcmRMYWJlbCxcbiAgICAgICAgICAgICAgc3NoQWdlbnRMYWJlbCxcbiAgICAgICAgICAgICAgcHJpdmF0ZUtleUxhYmVsLFxuICAgICAgICAgICAgXX1cbiAgICAgICAgICAgIG9uU2VsZWN0ZWRDaGFuZ2U9e3RoaXMuaGFuZGxlQXV0aE1ldGhvZENoYW5nZS5iaW5kKHRoaXMpfVxuICAgICAgICAgICAgc2VsZWN0ZWRJbmRleD17dGhpcy5zdGF0ZS5zZWxlY3RlZEF1dGhNZXRob2RJbmRleH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgPGxhYmVsPlJlbW90ZSBTZXJ2ZXIgQ29tbWFuZDo8L2xhYmVsPlxuICAgICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5zdGF0ZS5yZW1vdGVTZXJ2ZXJDb21tYW5kfVxuICAgICAgICAgICAgcmVmPVwicmVtb3RlU2VydmVyQ29tbWFuZFwiXG4gICAgICAgICAgICB1bnN0eWxlZD17dHJ1ZX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBkaXNwb3NhYmxlcztcbiAgICBjb25zdCByb290ID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcyk7XG5cbiAgICAvLyBIaXR0aW5nIGVudGVyIHdoZW4gdGhpcyBwYW5lbCBoYXMgZm9jdXMgc2hvdWxkIGNvbmZpcm0gdGhlIGRpYWxvZy5cbiAgICBkaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgIHJvb3QsXG4gICAgICAgICdjb3JlOmNvbmZpcm0nLFxuICAgICAgICBldmVudCA9PiB0aGlzLnByb3BzLm9uQ29uZmlybSgpKSk7XG5cbiAgICAvLyBIaXR0aW5nIGVzY2FwZSB3aGVuIHRoaXMgcGFuZWwgaGFzIGZvY3VzIHNob3VsZCBjYW5jZWwgdGhlIGRpYWxvZy5cbiAgICBkaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgIHJvb3QsXG4gICAgICAgICdjb3JlOmNhbmNlbCcsXG4gICAgICAgIGV2ZW50ID0+IHRoaXMucHJvcHMub25DYW5jZWwoKSkpO1xuXG4gICAgdGhpcy5yZWZzWyd1c2VybmFtZSddLmZvY3VzKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBpZiAodGhpcy5fZGlzcG9zYWJsZXMpIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXRGb3JtRmllbGRzKCk6IE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUGFyYW1zV2l0aFBhc3N3b3JkIHtcbiAgICByZXR1cm4ge1xuICAgICAgdXNlcm5hbWU6IHRoaXMuX2dldFRleHQoJ3VzZXJuYW1lJyksXG4gICAgICBzZXJ2ZXI6IHRoaXMuX2dldFRleHQoJ3NlcnZlcicpLFxuICAgICAgY3dkOiB0aGlzLl9nZXRUZXh0KCdjd2QnKSxcbiAgICAgIHJlbW90ZVNlcnZlckNvbW1hbmQ6IHRoaXMuX2dldFRleHQoJ3JlbW90ZVNlcnZlckNvbW1hbmQnKSxcbiAgICAgIHNzaFBvcnQ6IHRoaXMuX2dldFRleHQoJ3NzaFBvcnQnKSxcbiAgICAgIHBhdGhUb1ByaXZhdGVLZXk6IHRoaXMuX2dldFRleHQoJ3BhdGhUb1ByaXZhdGVLZXknKSxcbiAgICAgIGF1dGhNZXRob2Q6IHRoaXMuX2dldEF1dGhNZXRob2QoKSxcbiAgICAgIHBhc3N3b3JkOiB0aGlzLl9nZXRQYXNzd29yZCgpLFxuICAgIH07XG4gIH1cblxuICAvLyBOb3RlOiAncGFzc3dvcmQnIGlzIG5vdCBzZXR0YWJsZS4gVGhlIG9ubHkgZXhwb3NlZCBtZXRob2QgaXMgJ2NsZWFyUGFzc3dvcmQnLlxuICBzZXRGb3JtRmllbGRzKGZpZWxkczoge1xuICAgIHVzZXJuYW1lPzogc3RyaW5nO1xuICAgIHNlcnZlcj86IHN0cmluZztcbiAgICBjd2Q/OiBzdHJpbmc7XG4gICAgcmVtb3RlU2VydmVyQ29tbWFuZD86IHN0cmluZztcbiAgICBzc2hQb3J0Pzogc3RyaW5nO1xuICAgIHBhdGhUb1ByaXZhdGVLZXk/OiBzdHJpbmc7XG4gICAgYXV0aE1ldGhvZD86IE51Y2xpZGVSZW1vdGVBdXRoTWV0aG9kcztcbiAgfSk6IHZvaWQge1xuICAgIHRoaXMuX3NldFRleHQoJ3VzZXJuYW1lJywgZmllbGRzLnVzZXJuYW1lKTtcbiAgICB0aGlzLl9zZXRUZXh0KCdzZXJ2ZXInLCBmaWVsZHMuc2VydmVyKTtcbiAgICB0aGlzLl9zZXRUZXh0KCdjd2QnLCBmaWVsZHMuY3dkKTtcbiAgICB0aGlzLl9zZXRUZXh0KCdyZW1vdGVTZXJ2ZXJDb21tYW5kJywgZmllbGRzLnJlbW90ZVNlcnZlckNvbW1hbmQpO1xuICAgIHRoaXMuX3NldFRleHQoJ3NzaFBvcnQnLCBmaWVsZHMuc3NoUG9ydCk7XG4gICAgdGhpcy5fc2V0VGV4dCgncGF0aFRvUHJpdmF0ZUtleScsIGZpZWxkcy5wYXRoVG9Qcml2YXRlS2V5KTtcbiAgICB0aGlzLl9zZXRBdXRoTWV0aG9kKGZpZWxkcy5hdXRoTWV0aG9kKTtcbiAgfVxuXG4gIF9nZXRUZXh0KGZpZWxkTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKHRoaXMucmVmc1tmaWVsZE5hbWVdICYmIHRoaXMucmVmc1tmaWVsZE5hbWVdLmdldFRleHQoKS50cmltKCkpIHx8ICcnO1xuICB9XG5cbiAgX3NldFRleHQoZmllbGROYW1lOiBzdHJpbmcsIHRleHQ6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAodGV4dCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGF0b21JbnB1dCA9IHRoaXMucmVmc1tmaWVsZE5hbWVdO1xuICAgIGlmIChhdG9tSW5wdXQpIHtcbiAgICAgIGF0b21JbnB1dC5zZXRUZXh0KHRleHQpO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRBdXRoTWV0aG9kKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGF1dGhNZXRob2RzW3RoaXMuc3RhdGUuc2VsZWN0ZWRBdXRoTWV0aG9kSW5kZXhdO1xuICB9XG5cbiAgX3NldEF1dGhNZXRob2QoYXV0aE1ldGhvZDogP051Y2xpZGVSZW1vdGVBdXRoTWV0aG9kcyk6IHZvaWQge1xuICAgIGlmIChhdXRoTWV0aG9kID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbmV3SW5kZXggPSBhdXRoTWV0aG9kcy5pbmRleE9mKGF1dGhNZXRob2QpO1xuICAgIGlmIChuZXdJbmRleCA+PSAwKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEF1dGhNZXRob2RJbmRleDogbmV3SW5kZXh9KTtcbiAgICB9XG4gIH1cblxuICBfZ2V0UGFzc3dvcmQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKHRoaXMucmVmcy5wYXNzd29yZCAmJiBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnMucGFzc3dvcmQpLnZhbHVlKSB8fCAnJztcbiAgfVxuXG4gIGNsZWFyUGFzc3dvcmQoKTogdm9pZCB7XG4gICAgY29uc3QgcGFzc3dvcmRJbnB1dCA9IHRoaXMucmVmc1sncGFzc3dvcmQnXTtcbiAgICBpZiAocGFzc3dvcmRJbnB1dCkge1xuICAgICAgcGFzc3dvcmRJbnB1dC52YWx1ZSA9ICcnO1xuICAgIH1cbiAgfVxufVxuIl19