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

var _require2 = require('react-for-atom');

var React = _require2.React;
var PropTypes = React.PropTypes;

var _require3 = require('../../remote-connection');

var SshHandshake = _require3.SshHandshake;
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
//# sourceMappingURL=data:application/json;base64,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QixZQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsdUJBQXVCLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztPQUNwRDtLQUNGOzs7V0FFVyx3QkFBVztBQUNyQixhQUFPLEFBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssSUFBSyxFQUFFLENBQUM7S0FDbEY7OztXQUVZLHlCQUFTO0FBQ3BCLFVBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDNUMsVUFBSSxhQUFhLEVBQUU7QUFDakIscUJBQWEsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO09BQzFCO0tBQ0Y7OztTQTdRa0IscUJBQXFCO0dBQVMsS0FBSyxDQUFDLFNBQVM7O3FCQUE3QyxxQkFBcUIiLCJmaWxlIjoiQ29ubmVjdGlvbkRldGFpbHNGb3JtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgQXRvbUlucHV0ID0gcmVxdWlyZSgnLi4vLi4vdWkvYXRvbS1pbnB1dCcpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgUmFkaW9Hcm91cCA9IHJlcXVpcmUoJy4uLy4uL3VpL3JhZGlvZ3JvdXAnKTtcbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcbmNvbnN0IHtTc2hIYW5kc2hha2V9ID0gcmVxdWlyZSgnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24nKTtcblxuY29uc3Qge1N1cHBvcnRlZE1ldGhvZHN9ID0gU3NoSGFuZHNoYWtlO1xuY29uc3QgYXV0aE1ldGhvZHMgPSBbXG4gIFN1cHBvcnRlZE1ldGhvZHMuUEFTU1dPUkQsXG4gIFN1cHBvcnRlZE1ldGhvZHMuU1NMX0FHRU5ULFxuICBTdXBwb3J0ZWRNZXRob2RzLlBSSVZBVEVfS0VZLFxuXTtcblxuaW1wb3J0IHR5cGUge1xuICBOdWNsaWRlUmVtb3RlQXV0aE1ldGhvZHMsXG4gIE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUGFyYW1zV2l0aFBhc3N3b3JkLFxufSBmcm9tICcuL2Nvbm5lY3Rpb24tdHlwZXMnO1xuXG5cbi8qKiBDb21wb25lbnQgdG8gcHJvbXB0IHRoZSB1c2VyIGZvciBjb25uZWN0aW9uIGRldGFpbHMuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25uZWN0aW9uRGV0YWlsc0Zvcm0gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGluaXRpYWxVc2VybmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBpbml0aWFsU2VydmVyOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGluaXRpYWxDd2Q6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgaW5pdGlhbFJlbW90ZVNlcnZlckNvbW1hbmQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgaW5pdGlhbFNzaFBvcnQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgaW5pdGlhbFBhdGhUb1ByaXZhdGVLZXk6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgaW5pdGlhbEF1dGhNZXRob2Q6IFByb3BUeXBlcy5vbmVPZihPYmplY3Qua2V5cyhTdXBwb3J0ZWRNZXRob2RzKSksXG4gICAgb25Db25maXJtOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uQ2FuY2VsOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIF9kaXNwb3NhYmxlczogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IGFueSkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgdXNlcm5hbWU6IHByb3BzLmluaXRpYWxVc2VybmFtZSxcbiAgICAgIHNlcnZlcjogcHJvcHMuaW5pdGlhbFNlcnZlcixcbiAgICAgIGN3ZDogcHJvcHMuaW5pdGlhbEN3ZCxcbiAgICAgIHJlbW90ZVNlcnZlckNvbW1hbmQ6IHByb3BzLmluaXRpYWxSZW1vdGVTZXJ2ZXJDb21tYW5kLFxuICAgICAgc3NoUG9ydDogcHJvcHMuaW5pdGlhbFNzaFBvcnQsXG4gICAgICBwYXRoVG9Qcml2YXRlS2V5OiBwcm9wcy5pbml0aWFsUGF0aFRvUHJpdmF0ZUtleSxcbiAgICAgIHNlbGVjdGVkQXV0aE1ldGhvZEluZGV4OiBhdXRoTWV0aG9kcy5pbmRleE9mKHByb3BzLmluaXRpYWxBdXRoTWV0aG9kKSxcbiAgICB9O1xuICB9XG5cbiAgaGFuZGxlQXV0aE1ldGhvZENoYW5nZShuZXdJbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZEF1dGhNZXRob2RJbmRleDogbmV3SW5kZXgsXG4gICAgfSk7XG4gIH1cblxuICBfb25LZXlVcChlOiBTeW50aGV0aWNFdmVudCk6IHZvaWQge1xuICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykge1xuICAgICAgdGhpcy5wcm9wcy5vbkNvbmZpcm0oKTtcbiAgICB9XG5cbiAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQ2FuY2VsKCk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZVBhc3N3b3JkSW5wdXRDbGljayhldmVudDogU3ludGhldGljRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBwYXNzd29yZEF1dGhNZXRob2RJbmRleCA9IGF1dGhNZXRob2RzLmluZGV4T2YoU3VwcG9ydGVkTWV0aG9kcy5QQVNTV09SRCk7XG4gICAgdGhpcy5zZXRTdGF0ZShcbiAgICAgIHtcbiAgICAgICAgc2VsZWN0ZWRBdXRoTWV0aG9kSW5kZXg6IHBhc3N3b3JkQXV0aE1ldGhvZEluZGV4LFxuICAgICAgfSxcbiAgICAgICgpID0+IHtcbiAgICAgICAgUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzWydwYXNzd29yZCddKS5mb2N1cygpO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlS2V5RmlsZUlucHV0Q2xpY2soZXZlbnQ6IFN5bnRoZXRpY0V2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgcHJpdmF0ZUtleUF1dGhNZXRob2RJbmRleCA9IGF1dGhNZXRob2RzLmluZGV4T2YoU3VwcG9ydGVkTWV0aG9kcy5QUklWQVRFX0tFWSk7XG4gICAgdGhpcy5zZXRTdGF0ZShcbiAgICAgIHtcbiAgICAgICAgc2VsZWN0ZWRBdXRoTWV0aG9kSW5kZXg6IHByaXZhdGVLZXlBdXRoTWV0aG9kSW5kZXgsXG4gICAgICB9LFxuICAgICAgKCkgPT4ge1xuICAgICAgICAvLyB3aGVuIHNldHRpbmcgdGhpcyBpbW1lZGlhdGVseSwgQXRvbSB3aWxsIHVuc2V0IHRoZSBmb2N1cy4uLlxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ3BhdGhUb1ByaXZhdGVLZXknXSkuZm9jdXMoKTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGFjdGl2ZUF1dGhNZXRob2QgPSBhdXRoTWV0aG9kc1t0aGlzLnN0YXRlLnNlbGVjdGVkQXV0aE1ldGhvZEluZGV4XTtcbiAgICAvLyBXZSBuZWVkIG5hdGl2ZS1rZXktYmluZGluZ3Mgc28gdGhhdCBkZWxldGUgd29ya3MgYW5kIHdlIG5lZWRcbiAgICAvLyBfb25LZXlVcCBzbyB0aGF0IGVzY2FwZSBhbmQgZW50ZXIgd29ya1xuICAgIGNvbnN0IHBhc3N3b3JkTGFiZWwgPSAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtYXV0aC1tZXRob2RcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWF1dGgtbWV0aG9kLWxhYmVsXCI+XG4gICAgICAgICAgUGFzc3dvcmQ6XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtYXV0aC1tZXRob2QtaW5wdXQgbnVjbGlkZS1hdXRoLW1ldGhvZC1wYXNzd29yZFwiPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibnVjbGlkZS1wYXNzd29yZCBuYXRpdmUta2V5LWJpbmRpbmdzXCJcbiAgICAgICAgICAgIGRpc2FibGVkPXthY3RpdmVBdXRoTWV0aG9kICE9PSBTdXBwb3J0ZWRNZXRob2RzLlBBU1NXT1JEfVxuICAgICAgICAgICAgcmVmPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlUGFzc3dvcmRJbnB1dENsaWNrLmJpbmQodGhpcyl9XG4gICAgICAgICAgICBvbktleVVwPXt0aGlzLl9vbktleVVwLmJpbmQodGhpcyl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICAgIGNvbnN0IHByaXZhdGVLZXlMYWJlbCA9IChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1hdXRoLW1ldGhvZFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtYXV0aC1tZXRob2QtbGFiZWxcIj5cbiAgICAgICAgICBQcml2YXRlIEtleSBGaWxlOlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWF1dGgtbWV0aG9kLWlucHV0IG51Y2xpZGUtYXV0aC1tZXRob2QtcHJpdmF0ZWtleVwiPlxuICAgICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICAgIHJlZj1cInBhdGhUb1ByaXZhdGVLZXlcIlxuICAgICAgICAgICAgZGlzYWJsZWQ9e2FjdGl2ZUF1dGhNZXRob2QgIT09IFN1cHBvcnRlZE1ldGhvZHMuUFJJVkFURV9LRVl9XG4gICAgICAgICAgICBpbml0aWFsVmFsdWU9e3RoaXMuc3RhdGUucGF0aFRvUHJpdmF0ZUtleX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUtleUZpbGVJbnB1dENsaWNrLmJpbmQodGhpcyl9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlBhdGggdG8gcHJpdmF0ZSBrZXlcIlxuICAgICAgICAgICAgdW5zdHlsZWQ9e3RydWV9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICAgIGNvbnN0IHNzaEFnZW50TGFiZWwgPSAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtYXV0aC1tZXRob2RcIj5cbiAgICAgICAgVXNlIHNzaC1hZ2VudFxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgPGxhYmVsPlVzZXJuYW1lOjwvbGFiZWw+XG4gICAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnN0YXRlLnVzZXJuYW1lfVxuICAgICAgICAgICAgcmVmPVwidXNlcm5hbWVcIlxuICAgICAgICAgICAgdW5zdHlsZWQ9e3RydWV9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cCByb3dcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy05XCI+XG4gICAgICAgICAgICA8bGFiZWw+U2VydmVyOjwvbGFiZWw+XG4gICAgICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5zdGF0ZS5zZXJ2ZXJ9XG4gICAgICAgICAgICAgIHJlZj1cInNlcnZlclwiXG4gICAgICAgICAgICAgIHVuc3R5bGVkPXt0cnVlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy0zXCI+XG4gICAgICAgICAgICA8bGFiZWw+U1NIIFBvcnQ6PC9sYWJlbD5cbiAgICAgICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnN0YXRlLnNzaFBvcnR9XG4gICAgICAgICAgICAgIHJlZj1cInNzaFBvcnRcIlxuICAgICAgICAgICAgICB1bnN0eWxlZD17dHJ1ZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICA8bGFiZWw+SW5pdGlhbCBEaXJlY3Rvcnk6PC9sYWJlbD5cbiAgICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgICBpbml0aWFsVmFsdWU9e3RoaXMuc3RhdGUuY3dkfVxuICAgICAgICAgICAgcmVmPVwiY3dkXCJcbiAgICAgICAgICAgIHVuc3R5bGVkPXt0cnVlfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICA8bGFiZWw+QXV0aGVudGljYXRpb24gbWV0aG9kOjwvbGFiZWw+XG4gICAgICAgICAgPFJhZGlvR3JvdXBcbiAgICAgICAgICAgIG9wdGlvbkxhYmVscz17W1xuICAgICAgICAgICAgICBwYXNzd29yZExhYmVsLFxuICAgICAgICAgICAgICBzc2hBZ2VudExhYmVsLFxuICAgICAgICAgICAgICBwcml2YXRlS2V5TGFiZWwsXG4gICAgICAgICAgICBdfVxuICAgICAgICAgICAgb25TZWxlY3RlZENoYW5nZT17dGhpcy5oYW5kbGVBdXRoTWV0aG9kQ2hhbmdlLmJpbmQodGhpcyl9XG4gICAgICAgICAgICBzZWxlY3RlZEluZGV4PXt0aGlzLnN0YXRlLnNlbGVjdGVkQXV0aE1ldGhvZEluZGV4fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICA8bGFiZWw+UmVtb3RlIFNlcnZlciBDb21tYW5kOjwvbGFiZWw+XG4gICAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnN0YXRlLnJlbW90ZVNlcnZlckNvbW1hbmR9XG4gICAgICAgICAgICByZWY9XCJyZW1vdGVTZXJ2ZXJDb21tYW5kXCJcbiAgICAgICAgICAgIHVuc3R5bGVkPXt0cnVlfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IGRpc3Bvc2FibGVzO1xuICAgIGNvbnN0IHJvb3QgPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzKTtcblxuICAgIC8vIEhpdHRpbmcgZW50ZXIgd2hlbiB0aGlzIHBhbmVsIGhhcyBmb2N1cyBzaG91bGQgY29uZmlybSB0aGUgZGlhbG9nLlxuICAgIGRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgcm9vdCxcbiAgICAgICAgJ2NvcmU6Y29uZmlybScsXG4gICAgICAgIChldmVudCkgPT4gdGhpcy5wcm9wcy5vbkNvbmZpcm0oKSkpO1xuXG4gICAgLy8gSGl0dGluZyBlc2NhcGUgd2hlbiB0aGlzIHBhbmVsIGhhcyBmb2N1cyBzaG91bGQgY2FuY2VsIHRoZSBkaWFsb2cuXG4gICAgZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICByb290LFxuICAgICAgICAnY29yZTpjYW5jZWwnLFxuICAgICAgICAoZXZlbnQpID0+IHRoaXMucHJvcHMub25DYW5jZWwoKSkpO1xuXG4gICAgdGhpcy5yZWZzWyd1c2VybmFtZSddLmZvY3VzKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBpZiAodGhpcy5fZGlzcG9zYWJsZXMpIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXRGb3JtRmllbGRzKCk6IE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUGFyYW1zV2l0aFBhc3N3b3JkIHtcbiAgICByZXR1cm4ge1xuICAgICAgdXNlcm5hbWU6IHRoaXMuX2dldFRleHQoJ3VzZXJuYW1lJyksXG4gICAgICBzZXJ2ZXI6IHRoaXMuX2dldFRleHQoJ3NlcnZlcicpLFxuICAgICAgY3dkOiB0aGlzLl9nZXRUZXh0KCdjd2QnKSxcbiAgICAgIHJlbW90ZVNlcnZlckNvbW1hbmQ6IHRoaXMuX2dldFRleHQoJ3JlbW90ZVNlcnZlckNvbW1hbmQnKSxcbiAgICAgIHNzaFBvcnQ6IHRoaXMuX2dldFRleHQoJ3NzaFBvcnQnKSxcbiAgICAgIHBhdGhUb1ByaXZhdGVLZXk6IHRoaXMuX2dldFRleHQoJ3BhdGhUb1ByaXZhdGVLZXknKSxcbiAgICAgIGF1dGhNZXRob2Q6IHRoaXMuX2dldEF1dGhNZXRob2QoKSxcbiAgICAgIHBhc3N3b3JkOiB0aGlzLl9nZXRQYXNzd29yZCgpLFxuICAgIH07XG4gIH1cblxuICAvLyBOb3RlOiAncGFzc3dvcmQnIGlzIG5vdCBzZXR0YWJsZS4gVGhlIG9ubHkgZXhwb3NlZCBtZXRob2QgaXMgJ2NsZWFyUGFzc3dvcmQnLlxuICBzZXRGb3JtRmllbGRzKGZpZWxkczoge1xuICAgIHVzZXJuYW1lPzogc3RyaW5nLFxuICAgIHNlcnZlcj86IHN0cmluZyxcbiAgICBjd2Q/OiBzdHJpbmcsXG4gICAgcmVtb3RlU2VydmVyQ29tbWFuZD86IHN0cmluZyxcbiAgICBzc2hQb3J0Pzogc3RyaW5nLFxuICAgIHBhdGhUb1ByaXZhdGVLZXk/OiBzdHJpbmcsXG4gICAgYXV0aE1ldGhvZD86IE51Y2xpZGVSZW1vdGVBdXRoTWV0aG9kcyxcbiAgfSk6IHZvaWQge1xuICAgIHRoaXMuX3NldFRleHQoJ3VzZXJuYW1lJywgZmllbGRzLnVzZXJuYW1lKTtcbiAgICB0aGlzLl9zZXRUZXh0KCdzZXJ2ZXInLCBmaWVsZHMuc2VydmVyKTtcbiAgICB0aGlzLl9zZXRUZXh0KCdjd2QnLCBmaWVsZHMuY3dkKTtcbiAgICB0aGlzLl9zZXRUZXh0KCdyZW1vdGVTZXJ2ZXJDb21tYW5kJywgZmllbGRzLnJlbW90ZVNlcnZlckNvbW1hbmQpO1xuICAgIHRoaXMuX3NldFRleHQoJ3NzaFBvcnQnLCBmaWVsZHMuc3NoUG9ydCk7XG4gICAgdGhpcy5fc2V0VGV4dCgncGF0aFRvUHJpdmF0ZUtleScsIGZpZWxkcy5wYXRoVG9Qcml2YXRlS2V5KTtcbiAgICB0aGlzLl9zZXRBdXRoTWV0aG9kKGZpZWxkcy5hdXRoTWV0aG9kKTtcbiAgfVxuXG4gIF9nZXRUZXh0KGZpZWxkTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKHRoaXMucmVmc1tmaWVsZE5hbWVdICYmIHRoaXMucmVmc1tmaWVsZE5hbWVdLmdldFRleHQoKS50cmltKCkpIHx8ICcnO1xuICB9XG5cbiAgX3NldFRleHQoZmllbGROYW1lOiBzdHJpbmcsIHRleHQ6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAodGV4dCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGF0b21JbnB1dCA9IHRoaXMucmVmc1tmaWVsZE5hbWVdO1xuICAgIGlmIChhdG9tSW5wdXQpIHtcbiAgICAgIGF0b21JbnB1dC5zZXRUZXh0KHRleHQpO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRBdXRoTWV0aG9kKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGF1dGhNZXRob2RzW3RoaXMuc3RhdGUuc2VsZWN0ZWRBdXRoTWV0aG9kSW5kZXhdO1xuICB9XG5cbiAgX3NldEF1dGhNZXRob2QoYXV0aE1ldGhvZDogP051Y2xpZGVSZW1vdGVBdXRoTWV0aG9kcyk6IHZvaWQge1xuICAgIGlmIChhdXRoTWV0aG9kID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbmV3SW5kZXggPSBhdXRoTWV0aG9kcy5pbmRleE9mKGF1dGhNZXRob2QpO1xuICAgIGlmIChuZXdJbmRleCA+PSAwKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEF1dGhNZXRob2RJbmRleDogbmV3SW5kZXh9KTtcbiAgICB9XG4gIH1cblxuICBfZ2V0UGFzc3dvcmQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKHRoaXMucmVmcy5wYXNzd29yZCAmJiBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMucGFzc3dvcmQpLnZhbHVlKSB8fCAnJztcbiAgfVxuXG4gIGNsZWFyUGFzc3dvcmQoKTogdm9pZCB7XG4gICAgY29uc3QgcGFzc3dvcmRJbnB1dCA9IHRoaXMucmVmc1sncGFzc3dvcmQnXTtcbiAgICBpZiAocGFzc3dvcmRJbnB1dCkge1xuICAgICAgcGFzc3dvcmRJbnB1dC52YWx1ZSA9ICcnO1xuICAgIH1cbiAgfVxufVxuIl19