Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/** Component to prompt the user for connection details. */
var AtomInput = require('../../ui/atom-input');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var RadioGroup = require('../../ui/radiogroup');
var React = require('react-for-atom');
var PropTypes = React.PropTypes;

var _require2 = require('../../remote-connection');

var SshHandshake = _require2.SshHandshake;
var SupportedMethods = SshHandshake.SupportedMethods;

var authMethods = [SupportedMethods.PASSWORD, SupportedMethods.SSL_AGENT, SupportedMethods.PRIVATE_KEY];

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
        React.findDOMNode(_this.refs['password']).focus();
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
          React.findDOMNode(_this2.refs['pathToPrivateKey']).focus();
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
      var root = React.findDOMNode(this);

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
      return this.refs.password && React.findDOMNode(this.refs.password).value || '';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb25EZXRhaWxzRm9ybS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7ZUFDbkIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBdEMsbUJBQW1CLFlBQW5CLG1CQUFtQjs7QUFDMUIsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDbEQsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDakMsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7Z0JBQ08sT0FBTyxDQUFDLHlCQUF5QixDQUFDOztJQUFsRCxZQUFZLGFBQVosWUFBWTtJQUVaLGdCQUFnQixHQUFJLFlBQVksQ0FBaEMsZ0JBQWdCOztBQUN2QixJQUFNLFdBQVcsR0FBRyxDQUNsQixnQkFBZ0IsQ0FBQyxRQUFRLEVBQ3pCLGdCQUFnQixDQUFDLFNBQVMsRUFDMUIsZ0JBQWdCLENBQUMsV0FBVyxDQUM3QixDQUFDOztJQVNtQixxQkFBcUI7WUFBckIscUJBQXFCOztlQUFyQixxQkFBcUI7O1dBQ3JCO0FBQ2pCLHFCQUFlLEVBQUUsU0FBUyxDQUFDLE1BQU07QUFDakMsbUJBQWEsRUFBRSxTQUFTLENBQUMsTUFBTTtBQUMvQixnQkFBVSxFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQzVCLGdDQUEwQixFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQzVDLG9CQUFjLEVBQUUsU0FBUyxDQUFDLE1BQU07QUFDaEMsNkJBQXVCLEVBQUUsU0FBUyxDQUFDLE1BQU07QUFDekMsdUJBQWlCLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDakUsZUFBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUNwQyxjQUFRLEVBQUUsU0FBUyxDQUFDLElB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QUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsdUJBQXVCLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztPQUNwRDtLQUNGOzs7V0FFVyx3QkFBVztBQUNyQixhQUFPLEFBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssSUFBSyxFQUFFLENBQUM7S0FDbEY7OztXQUVZLHlCQUFTO0FBQ3BCLFVBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDNUMsVUFBSSxhQUFhLEVBQUU7QUFDakIscUJBQWEsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO09BQzFCO0tBQ0Y7OztTQTdRa0IscUJBQXFCO0dBQVMsS0FBSyxDQUFDLFNBQVM7O3FCQUE3QyxxQkFBcUIiLCJmaWxlIjoiQ29ubmVjdGlvbkRldGFpbHNGb3JtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgQXRvbUlucHV0ID0gcmVxdWlyZSgnLi4vLi4vdWkvYXRvbS1pbnB1dCcpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgUmFkaW9Hcm91cCA9IHJlcXVpcmUoJy4uLy4uL3VpL3JhZGlvZ3JvdXAnKTtcbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5jb25zdCB7U3NoSGFuZHNoYWtlfSA9IHJlcXVpcmUoJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uJyk7XG5cbmNvbnN0IHtTdXBwb3J0ZWRNZXRob2RzfSA9IFNzaEhhbmRzaGFrZTtcbmNvbnN0IGF1dGhNZXRob2RzID0gW1xuICBTdXBwb3J0ZWRNZXRob2RzLlBBU1NXT1JELFxuICBTdXBwb3J0ZWRNZXRob2RzLlNTTF9BR0VOVCxcbiAgU3VwcG9ydGVkTWV0aG9kcy5QUklWQVRFX0tFWSxcbl07XG5cbmltcG9ydCB0eXBlIHtcbiAgTnVjbGlkZVJlbW90ZUF1dGhNZXRob2RzLFxuICBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblBhcmFtc1dpdGhQYXNzd29yZCxcbn0gZnJvbSAnLi9jb25uZWN0aW9uLXR5cGVzJztcblxuXG4vKiogQ29tcG9uZW50IHRvIHByb21wdCB0aGUgdXNlciBmb3IgY29ubmVjdGlvbiBkZXRhaWxzLiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29ubmVjdGlvbkRldGFpbHNGb3JtIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBpbml0aWFsVXNlcm5hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgaW5pdGlhbFNlcnZlcjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBpbml0aWFsQ3dkOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGluaXRpYWxSZW1vdGVTZXJ2ZXJDb21tYW5kOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGluaXRpYWxTc2hQb3J0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGluaXRpYWxQYXRoVG9Qcml2YXRlS2V5OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGluaXRpYWxBdXRoTWV0aG9kOiBQcm9wVHlwZXMub25lT2YoT2JqZWN0LmtleXMoU3VwcG9ydGVkTWV0aG9kcykpLFxuICAgIG9uQ29uZmlybTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvbkNhbmNlbDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgfTtcblxuICBfZGlzcG9zYWJsZXM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBhbnkpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHVzZXJuYW1lOiBwcm9wcy5pbml0aWFsVXNlcm5hbWUsXG4gICAgICBzZXJ2ZXI6IHByb3BzLmluaXRpYWxTZXJ2ZXIsXG4gICAgICBjd2Q6IHByb3BzLmluaXRpYWxDd2QsXG4gICAgICByZW1vdGVTZXJ2ZXJDb21tYW5kOiBwcm9wcy5pbml0aWFsUmVtb3RlU2VydmVyQ29tbWFuZCxcbiAgICAgIHNzaFBvcnQ6IHByb3BzLmluaXRpYWxTc2hQb3J0LFxuICAgICAgcGF0aFRvUHJpdmF0ZUtleTogcHJvcHMuaW5pdGlhbFBhdGhUb1ByaXZhdGVLZXksXG4gICAgICBzZWxlY3RlZEF1dGhNZXRob2RJbmRleDogYXV0aE1ldGhvZHMuaW5kZXhPZihwcm9wcy5pbml0aWFsQXV0aE1ldGhvZCksXG4gICAgfTtcbiAgfVxuXG4gIGhhbmRsZUF1dGhNZXRob2RDaGFuZ2UobmV3SW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VsZWN0ZWRBdXRoTWV0aG9kSW5kZXg6IG5ld0luZGV4LFxuICAgIH0pO1xuICB9XG5cbiAgX29uS2V5VXAoZTogU3ludGhldGljRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgIHRoaXMucHJvcHMub25Db25maXJtKCk7XG4gICAgfVxuXG4gICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgdGhpcy5wcm9wcy5vbkNhbmNlbCgpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVQYXNzd29yZElucHV0Q2xpY2soZXZlbnQ6IFN5bnRoZXRpY0V2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgcGFzc3dvcmRBdXRoTWV0aG9kSW5kZXggPSBhdXRoTWV0aG9kcy5pbmRleE9mKFN1cHBvcnRlZE1ldGhvZHMuUEFTU1dPUkQpO1xuICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICB7XG4gICAgICAgIHNlbGVjdGVkQXV0aE1ldGhvZEluZGV4OiBwYXNzd29yZEF1dGhNZXRob2RJbmRleCxcbiAgICAgIH0sXG4gICAgICAoKSA9PiB7XG4gICAgICAgIFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1sncGFzc3dvcmQnXSkuZm9jdXMoKTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUtleUZpbGVJbnB1dENsaWNrKGV2ZW50OiBTeW50aGV0aWNFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IHByaXZhdGVLZXlBdXRoTWV0aG9kSW5kZXggPSBhdXRoTWV0aG9kcy5pbmRleE9mKFN1cHBvcnRlZE1ldGhvZHMuUFJJVkFURV9LRVkpO1xuICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICB7XG4gICAgICAgIHNlbGVjdGVkQXV0aE1ldGhvZEluZGV4OiBwcml2YXRlS2V5QXV0aE1ldGhvZEluZGV4LFxuICAgICAgfSxcbiAgICAgICgpID0+IHtcbiAgICAgICAgLy8gd2hlbiBzZXR0aW5nIHRoaXMgaW1tZWRpYXRlbHksIEF0b20gd2lsbCB1bnNldCB0aGUgZm9jdXMuLi5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzWydwYXRoVG9Qcml2YXRlS2V5J10pLmZvY3VzKCk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBhY3RpdmVBdXRoTWV0aG9kID0gYXV0aE1ldGhvZHNbdGhpcy5zdGF0ZS5zZWxlY3RlZEF1dGhNZXRob2RJbmRleF07XG4gICAgLy8gV2UgbmVlZCBuYXRpdmUta2V5LWJpbmRpbmdzIHNvIHRoYXQgZGVsZXRlIHdvcmtzIGFuZCB3ZSBuZWVkXG4gICAgLy8gX29uS2V5VXAgc28gdGhhdCBlc2NhcGUgYW5kIGVudGVyIHdvcmtcbiAgICBjb25zdCBwYXNzd29yZExhYmVsID0gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWF1dGgtbWV0aG9kXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1hdXRoLW1ldGhvZC1sYWJlbFwiPlxuICAgICAgICAgIFBhc3N3b3JkOlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWF1dGgtbWV0aG9kLWlucHV0IG51Y2xpZGUtYXV0aC1tZXRob2QtcGFzc3dvcmRcIj5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm51Y2xpZGUtcGFzc3dvcmQgbmF0aXZlLWtleS1iaW5kaW5nc1wiXG4gICAgICAgICAgICBkaXNhYmxlZD17YWN0aXZlQXV0aE1ldGhvZCAhPT0gU3VwcG9ydGVkTWV0aG9kcy5QQVNTV09SRH1cbiAgICAgICAgICAgIHJlZj1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZVBhc3N3b3JkSW5wdXRDbGljay5iaW5kKHRoaXMpfVxuICAgICAgICAgICAgb25LZXlVcD17dGhpcy5fb25LZXlVcC5iaW5kKHRoaXMpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgICBjb25zdCBwcml2YXRlS2V5TGFiZWwgPSAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtYXV0aC1tZXRob2RcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWF1dGgtbWV0aG9kLWxhYmVsXCI+XG4gICAgICAgICAgUHJpdmF0ZSBLZXkgRmlsZTpcbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1hdXRoLW1ldGhvZC1pbnB1dCBudWNsaWRlLWF1dGgtbWV0aG9kLXByaXZhdGVrZXlcIj5cbiAgICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgICByZWY9XCJwYXRoVG9Qcml2YXRlS2V5XCJcbiAgICAgICAgICAgIGRpc2FibGVkPXthY3RpdmVBdXRoTWV0aG9kICE9PSBTdXBwb3J0ZWRNZXRob2RzLlBSSVZBVEVfS0VZfVxuICAgICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnN0YXRlLnBhdGhUb1ByaXZhdGVLZXl9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9oYW5kbGVLZXlGaWxlSW5wdXRDbGljay5iaW5kKHRoaXMpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJQYXRoIHRvIHByaXZhdGUga2V5XCJcbiAgICAgICAgICAgIHVuc3R5bGVkPXt0cnVlfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgICBjb25zdCBzc2hBZ2VudExhYmVsID0gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWF1dGgtbWV0aG9kXCI+XG4gICAgICAgIFVzZSBzc2gtYWdlbnRcbiAgICAgIDwvZGl2PlxuICAgICk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgIDxsYWJlbD5Vc2VybmFtZTo8L2xhYmVsPlxuICAgICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5zdGF0ZS51c2VybmFtZX1cbiAgICAgICAgICAgIHJlZj1cInVzZXJuYW1lXCJcbiAgICAgICAgICAgIHVuc3R5bGVkPXt0cnVlfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXAgcm93XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wteHMtOVwiPlxuICAgICAgICAgICAgPGxhYmVsPlNlcnZlcjo8L2xhYmVsPlxuICAgICAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgICAgICBpbml0aWFsVmFsdWU9e3RoaXMuc3RhdGUuc2VydmVyfVxuICAgICAgICAgICAgICByZWY9XCJzZXJ2ZXJcIlxuICAgICAgICAgICAgICB1bnN0eWxlZD17dHJ1ZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wteHMtM1wiPlxuICAgICAgICAgICAgPGxhYmVsPlNTSCBQb3J0OjwvbGFiZWw+XG4gICAgICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5zdGF0ZS5zc2hQb3J0fVxuICAgICAgICAgICAgICByZWY9XCJzc2hQb3J0XCJcbiAgICAgICAgICAgICAgdW5zdHlsZWQ9e3RydWV9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgPGxhYmVsPkluaXRpYWwgRGlyZWN0b3J5OjwvbGFiZWw+XG4gICAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnN0YXRlLmN3ZH1cbiAgICAgICAgICAgIHJlZj1cImN3ZFwiXG4gICAgICAgICAgICB1bnN0eWxlZD17dHJ1ZX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgPGxhYmVsPkF1dGhlbnRpY2F0aW9uIG1ldGhvZDo8L2xhYmVsPlxuICAgICAgICAgIDxSYWRpb0dyb3VwXG4gICAgICAgICAgICBvcHRpb25MYWJlbHM9e1tcbiAgICAgICAgICAgICAgcGFzc3dvcmRMYWJlbCxcbiAgICAgICAgICAgICAgc3NoQWdlbnRMYWJlbCxcbiAgICAgICAgICAgICAgcHJpdmF0ZUtleUxhYmVsLFxuICAgICAgICAgICAgXX1cbiAgICAgICAgICAgIG9uU2VsZWN0ZWRDaGFuZ2U9e3RoaXMuaGFuZGxlQXV0aE1ldGhvZENoYW5nZS5iaW5kKHRoaXMpfVxuICAgICAgICAgICAgc2VsZWN0ZWRJbmRleD17dGhpcy5zdGF0ZS5zZWxlY3RlZEF1dGhNZXRob2RJbmRleH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgPGxhYmVsPlJlbW90ZSBTZXJ2ZXIgQ29tbWFuZDo8L2xhYmVsPlxuICAgICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5zdGF0ZS5yZW1vdGVTZXJ2ZXJDb21tYW5kfVxuICAgICAgICAgICAgcmVmPVwicmVtb3RlU2VydmVyQ29tbWFuZFwiXG4gICAgICAgICAgICB1bnN0eWxlZD17dHJ1ZX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBkaXNwb3NhYmxlcztcbiAgICBjb25zdCByb290ID0gUmVhY3QuZmluZERPTU5vZGUodGhpcyk7XG5cbiAgICAvLyBIaXR0aW5nIGVudGVyIHdoZW4gdGhpcyBwYW5lbCBoYXMgZm9jdXMgc2hvdWxkIGNvbmZpcm0gdGhlIGRpYWxvZy5cbiAgICBkaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgIHJvb3QsXG4gICAgICAgICdjb3JlOmNvbmZpcm0nLFxuICAgICAgICAoZXZlbnQpID0+IHRoaXMucHJvcHMub25Db25maXJtKCkpKTtcblxuICAgIC8vIEhpdHRpbmcgZXNjYXBlIHdoZW4gdGhpcyBwYW5lbCBoYXMgZm9jdXMgc2hvdWxkIGNhbmNlbCB0aGUgZGlhbG9nLlxuICAgIGRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgcm9vdCxcbiAgICAgICAgJ2NvcmU6Y2FuY2VsJyxcbiAgICAgICAgKGV2ZW50KSA9PiB0aGlzLnByb3BzLm9uQ2FuY2VsKCkpKTtcblxuICAgIHRoaXMucmVmc1sndXNlcm5hbWUnXS5mb2N1cygpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgaWYgKHRoaXMuX2Rpc3Bvc2FibGVzKSB7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgZ2V0Rm9ybUZpZWxkcygpOiBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblBhcmFtc1dpdGhQYXNzd29yZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVzZXJuYW1lOiB0aGlzLl9nZXRUZXh0KCd1c2VybmFtZScpLFxuICAgICAgc2VydmVyOiB0aGlzLl9nZXRUZXh0KCdzZXJ2ZXInKSxcbiAgICAgIGN3ZDogdGhpcy5fZ2V0VGV4dCgnY3dkJyksXG4gICAgICByZW1vdGVTZXJ2ZXJDb21tYW5kOiB0aGlzLl9nZXRUZXh0KCdyZW1vdGVTZXJ2ZXJDb21tYW5kJyksXG4gICAgICBzc2hQb3J0OiB0aGlzLl9nZXRUZXh0KCdzc2hQb3J0JyksXG4gICAgICBwYXRoVG9Qcml2YXRlS2V5OiB0aGlzLl9nZXRUZXh0KCdwYXRoVG9Qcml2YXRlS2V5JyksXG4gICAgICBhdXRoTWV0aG9kOiB0aGlzLl9nZXRBdXRoTWV0aG9kKCksXG4gICAgICBwYXNzd29yZDogdGhpcy5fZ2V0UGFzc3dvcmQoKSxcbiAgICB9O1xuICB9XG5cbiAgLy8gTm90ZTogJ3Bhc3N3b3JkJyBpcyBub3Qgc2V0dGFibGUuIFRoZSBvbmx5IGV4cG9zZWQgbWV0aG9kIGlzICdjbGVhclBhc3N3b3JkJy5cbiAgc2V0Rm9ybUZpZWxkcyhmaWVsZHM6IHtcbiAgICB1c2VybmFtZT86IHN0cmluZyxcbiAgICBzZXJ2ZXI/OiBzdHJpbmcsXG4gICAgY3dkPzogc3RyaW5nLFxuICAgIHJlbW90ZVNlcnZlckNvbW1hbmQ/OiBzdHJpbmcsXG4gICAgc3NoUG9ydD86IHN0cmluZyxcbiAgICBwYXRoVG9Qcml2YXRlS2V5Pzogc3RyaW5nLFxuICAgIGF1dGhNZXRob2Q/OiBOdWNsaWRlUmVtb3RlQXV0aE1ldGhvZHMsXG4gIH0pOiB2b2lkIHtcbiAgICB0aGlzLl9zZXRUZXh0KCd1c2VybmFtZScsIGZpZWxkcy51c2VybmFtZSk7XG4gICAgdGhpcy5fc2V0VGV4dCgnc2VydmVyJywgZmllbGRzLnNlcnZlcik7XG4gICAgdGhpcy5fc2V0VGV4dCgnY3dkJywgZmllbGRzLmN3ZCk7XG4gICAgdGhpcy5fc2V0VGV4dCgncmVtb3RlU2VydmVyQ29tbWFuZCcsIGZpZWxkcy5yZW1vdGVTZXJ2ZXJDb21tYW5kKTtcbiAgICB0aGlzLl9zZXRUZXh0KCdzc2hQb3J0JywgZmllbGRzLnNzaFBvcnQpO1xuICAgIHRoaXMuX3NldFRleHQoJ3BhdGhUb1ByaXZhdGVLZXknLCBmaWVsZHMucGF0aFRvUHJpdmF0ZUtleSk7XG4gICAgdGhpcy5fc2V0QXV0aE1ldGhvZChmaWVsZHMuYXV0aE1ldGhvZCk7XG4gIH1cblxuICBfZ2V0VGV4dChmaWVsZE5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuICh0aGlzLnJlZnNbZmllbGROYW1lXSAmJiB0aGlzLnJlZnNbZmllbGROYW1lXS5nZXRUZXh0KCkudHJpbSgpKSB8fCAnJztcbiAgfVxuXG4gIF9zZXRUZXh0KGZpZWxkTmFtZTogc3RyaW5nLCB0ZXh0OiA/c3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHRleHQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBhdG9tSW5wdXQgPSB0aGlzLnJlZnNbZmllbGROYW1lXTtcbiAgICBpZiAoYXRvbUlucHV0KSB7XG4gICAgICBhdG9tSW5wdXQuc2V0VGV4dCh0ZXh0KTtcbiAgICB9XG4gIH1cblxuICBfZ2V0QXV0aE1ldGhvZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBhdXRoTWV0aG9kc1t0aGlzLnN0YXRlLnNlbGVjdGVkQXV0aE1ldGhvZEluZGV4XTtcbiAgfVxuXG4gIF9zZXRBdXRoTWV0aG9kKGF1dGhNZXRob2Q6ID9OdWNsaWRlUmVtb3RlQXV0aE1ldGhvZHMpOiB2b2lkIHtcbiAgICBpZiAoYXV0aE1ldGhvZCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG5ld0luZGV4ID0gYXV0aE1ldGhvZHMuaW5kZXhPZihhdXRoTWV0aG9kKTtcbiAgICBpZiAobmV3SW5kZXggPj0gMCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRBdXRoTWV0aG9kSW5kZXg6IG5ld0luZGV4fSk7XG4gICAgfVxuICB9XG5cbiAgX2dldFBhc3N3b3JkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICh0aGlzLnJlZnMucGFzc3dvcmQgJiYgUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLnBhc3N3b3JkKS52YWx1ZSkgfHwgJyc7XG4gIH1cblxuICBjbGVhclBhc3N3b3JkKCk6IHZvaWQge1xuICAgIGNvbnN0IHBhc3N3b3JkSW5wdXQgPSB0aGlzLnJlZnNbJ3Bhc3N3b3JkJ107XG4gICAgaWYgKHBhc3N3b3JkSW5wdXQpIHtcbiAgICAgIHBhc3N3b3JkSW5wdXQudmFsdWUgPSAnJztcbiAgICB9XG4gIH1cbn1cbiJdfQ==