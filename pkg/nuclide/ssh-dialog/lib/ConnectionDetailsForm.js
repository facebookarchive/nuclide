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
      initialAuthMethod: PropTypes.shape(Object.keys(SupportedMethods)),
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
            onClick: this._handleKeyFileInputClick.bind(this),
            placeholder: 'Path to private key',
            initialValue: this.state.pathToPrivateKey
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
        { ref: 'root' },
        React.createElement(
          'div',
          { className: 'block' },
          'Username:',
          React.createElement(AtomInput, { ref: 'username', initialValue: this.state.username })
        ),
        React.createElement(
          'div',
          { className: 'block' },
          'Server:',
          React.createElement(AtomInput, { mini: true, ref: 'server', initialValue: this.state.server })
        ),
        React.createElement(
          'div',
          { className: 'block' },
          'Initial Directory:',
          React.createElement(AtomInput, { ref: 'cwd', initialValue: this.state.cwd })
        ),
        React.createElement(
          'div',
          { className: 'block' },
          'Authentication method:'
        ),
        React.createElement(
          'div',
          { className: 'nuclide-auth-selector' },
          React.createElement(RadioGroup, {
            optionLabels: [passwordLabel, sshAgentLabel, privateKeyLabel],
            onSelectedChange: this.handleAuthMethodChange.bind(this),
            selectedIndex: this.state.selectedAuthMethodIndex
          })
        ),
        React.createElement(
          'div',
          { className: 'block' },
          'Advanced Settings'
        ),
        React.createElement(
          'div',
          { className: 'block' },
          'SSH Port:',
          React.createElement(AtomInput, { ref: 'sshPort', initialValue: this.state.sshPort })
        ),
        React.createElement(
          'div',
          { className: 'block' },
          'Remote Server Command:',
          React.createElement(AtomInput, { ref: 'remoteServerCommand', initialValue: this.state.remoteServerCommand })
        )
      );
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this3 = this;

      var disposables = new CompositeDisposable();
      this._disposables = disposables;
      var root = React.findDOMNode(this.refs['root']);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb25EZXRhaWxzRm9ybS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7ZUFDbkIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBdEMsbUJBQW1CLFlBQW5CLG1CQUFtQjs7QUFDMUIsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDbEQsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDakMsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7Z0JBQ08sT0FBTyxDQUFDLHlCQUF5QixDQUFDOztJQUFsRCxZQUFZLGFBQVosWUFBWTtJQUVaLGdCQUFnQixHQUFJLFlBQVksQ0FBaEMsZ0JBQWdCOztBQUN2QixJQUFNLFdBQVcsR0FBRyxDQUNsQixnQkFBZ0IsQ0FBQyxRQUFRLEVBQ3pCLGdCQUFnQixDQUFDLFNBQVMsRUFDMUIsZ0JBQWdCLENBQUMsV0FBVyxDQUM3QixDQUFDOztJQVNtQixxQkFBcUI7WUFBckIscUJBQXFCOztlQUFyQixxQkFBcUI7O1dBQ3JCO0FBQ2pCLHFCQUFlLEVBQUUsU0FBUyxDQUFDLE1BQU07QUFDakMsbUJBQWEsRUFBRSxTQUFTLENBQUMsTUFBTTtBQUMvQixnQkFBVSxFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQzVCLGdDQUEwQixFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQzVDLG9CQUFjLEVBQUUsU0FBUyxDQUFDLE1BQU07QUFDaEMsNkJBQXVCLEVBQUUsU0FBUyxDQUFDLE1BQU07QUFDekMsdUJBQWlCLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDakUsZUFBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUNwQyxjQUFRLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0tBQ3BDOzs7O0FBSVUsV0FmUSxxQkFBcUIsQ0FlNUIsS0FBVSxFQUFFOzBCQWZMLHFCQUFxQjs7QUFnQnRDLCtCQWhCaUIscUJBQXFCLDZDQWdCaEMsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLGNBQVEsRUFBRSxLQUFLLENBQUMsZUFBZTtBQUMvQixZQUFNLEVBQUUsS0FBSyxDQUFDLGFBQWE7QUFDM0IsU0FBRyxFQUFFLEtBQUssQ0FBQyxVQUFVO0FBQ3JCLHlCQUFtQixFQUFFLEtBQUssQ0FBQywwQkFBMEI7QUFDckQsYUFBTyxFQUFFLEtBQUssQ0FBQyxjQUFjO0FBQzdCLHNCQUFnQixFQUFFLEtBQUssQ0FBQyx1QkFBdUI7QUFDL0MsNkJBQXVCLEVBQUUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUM7S0FDdEUsQ0FBQztHQUNIOztlQTFCa0IscUJBQXFCOztXQTRCbEIsZ0NBQUMsUUFBZ0IsRUFBRTtBQUN2QyxVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osK0JBQXVCLEVBQUUsUUFBUTtPQUNsQyxDQUFDLENBQUM7S0FDSjs7O1dBRU8sa0JBQUMsQ0FBaUIsRUFBUTtBQUNoQyxVQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssT0FBTyxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7T0FDeEI7O0FBRUQsVUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBRTtBQUN0QixZQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO09BQ3ZCO0tBQ0Y7OztXQUV3QixtQ0FBQyxLQUFxQixFQUFROzs7QUFDckQsVUFBTSx1QkFBdUIsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9FLFVBQUksQ0FBQyxRQUFRLENBQ1g7QUFDRSwrQkFBdUIsRUFBRSx1QkFBdUI7T0FDakQsRUFDRCxZQUFNO0FBQ0osYUFBSyxDQUFDLFdBQVcsQ0FBQyxNQUFLLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO09BQ2xELENBQ0YsQ0FBQztLQUNIOzs7V0FFdUIsa0NBQUMsS0FBcUIsRUFBUTs7O0FBQ3BELFVBQU0seUJBQXlCLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNwRixVQUFJLENBQUMsUUFBUSxDQUNYO0FBQ0UsK0JBQXVCLEVBQUUseUJBQXlCO09BQ25ELEVBQ0QsWUFBTTs7QUFFSixrQkFBVSxDQUFDLFlBQU07QUFDZixlQUFLLENBQUMsV0FBVyxDQUFDLE9BQUssSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUMxRCxFQUFFLENBQUMsQ0FBQyxDQUFDO09BQ1AsQ0FDRixDQUFDO0tBQ0g7OztXQUVLLGtCQUFpQjtBQUNyQixVQUFNLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7OztBQUd6RSxVQUFNLGFBQWEsR0FDakI7O1VBQUssU0FBUyxFQUFDLHFCQUFxQjtRQUNsQzs7WUFBSyxTQUFTLEVBQUMsMkJBQTJCOztTQUVwQztRQUNOOztZQUFLLFNBQVMsRUFBQyx3REFBd0Q7VUFDckUsK0JBQU8sSUFBSSxFQUFDLFVBQVU7QUFDcEIscUJBQVMsRUFBQyxzQ0FBc0M7QUFDaEQsb0JBQVEsRUFBRSxnQkFBZ0IsS0FBSyxnQkFBZ0IsQ0FBQyxRQUFRLEFBQUM7QUFDekQsZUFBRyxFQUFDLFVBQVU7QUFDZCxtQkFBTyxFQUFFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEFBQUM7QUFDbkQsbUJBQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQUFBQztZQUNsQztTQUNFO09BQ0YsQUFDUCxDQUFDO0FBQ0YsVUFBTSxlQUFlLEdBQ25COztVQUFLLFNBQVMsRUFBQyxxQkFBcUI7UUFDbEM7O1lBQUssU0FBUyxFQUFDLDJCQUEyQjs7U0FFcEM7UUFDTjs7WUFBSyxTQUFTLEVBQUMsMERBQTBEO1VBQ3ZFLG9CQUFDLFNBQVM7QUFDUixlQUFHLEVBQUMsa0JBQWtCO0FBQ3RCLG9CQUFRLEVBQUUsZ0JBQWdCLEtBQUssZ0JBQWdCLENBQUMsV0FBVyxBQUFDO0FBQzVELG1CQUFPLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQUFBQztBQUNsRCx1QkFBVyxFQUFDLHFCQUFxQjtBQUNqQyx3QkFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEFBQUM7WUFDMUM7U0FDRTtPQUNGLEFBQ1AsQ0FBQztBQUNGLFVBQU0sYUFBYSxHQUNqQjs7VUFBSyxTQUFTLEVBQUMscUJBQXFCOztPQUU5QixBQUNQLENBQUM7QUFDRixhQUNFOztVQUFLLEdBQUcsRUFBQyxNQUFNO1FBQ2I7O1lBQUssU0FBUyxFQUFDLE9BQU87O1VBRXBCLG9CQUFDLFNBQVMsSUFBQyxHQUFHLEVBQUMsVUFBVSxFQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQUFBQyxHQUFHO1NBQzNEO1FBQ047O1lBQUssU0FBUyxFQUFDLE9BQU87O1VBRXBCLG9CQUFDLFNBQVMsSUFBQyxJQUFJLE1BQUEsRUFBQyxHQUFHLEVBQUMsUUFBUSxFQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQUFBQyxHQUFHO1NBQzVEO1FBQ047O1lBQUssU0FBUyxFQUFDLE9BQU87O1VBRXBCLG9CQUFDLFNBQVMsSUFBQyxHQUFHLEVBQUMsS0FBSyxFQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQUFBQyxHQUFHO1NBQ2pEO1FBQ047O1lBQUssU0FBUyxFQUFDLE9BQU87O1NBRWhCO1FBQ047O1lBQUssU0FBUyxFQUFDLHVCQUF1QjtVQUNwQyxvQkFBQyxVQUFVO0FBQ1Qsd0JBQVksRUFBRSxDQUNaLGFBQWEsRUFDYixhQUFhLEVBQ2IsZUFBZSxDQUNoQixBQUFDO0FBQ0YsNEJBQWdCLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQUFBQztBQUN6RCx5QkFBYSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEFBQUM7WUFDbEQ7U0FDRTtRQUNOOztZQUFLLFNBQVMsRUFBQyxPQUFPOztTQUVoQjtRQUNOOztZQUFLLFNBQVMsRUFBQyxPQUFPOztVQUVwQixvQkFBQyxTQUFTLElBQUMsR0FBRyxFQUFDLFNBQVMsRUFBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEFBQUMsR0FBRztTQUN6RDtRQUNOOztZQUFLLFNBQVMsRUFBQyxPQUFPOztVQUVwQixvQkFBQyxTQUFTLElBQUMsR0FBRyxFQUFDLHFCQUFxQixFQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixBQUFDLEdBQUc7U0FDakY7T0FDRixDQUNOO0tBQ0g7OztXQUVnQiw2QkFBRzs7O0FBQ2xCLFVBQU0sV0FBVyxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztBQUM5QyxVQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztBQUNoQyxVQUFNLElBQUksR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs7O0FBR2xELGlCQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUM3QixJQUFJLEVBQ0osY0FBYyxFQUNkLFVBQUMsS0FBSztlQUFLLE9BQUssS0FBSyxDQUFDLFNBQVMsRUFBRTtPQUFBLENBQUMsQ0FBQyxDQUFDOzs7QUFHeEMsaUJBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQzdCLElBQUksRUFDSixhQUFhLEVBQ2IsVUFBQyxLQUFLO2VBQUssT0FBSyxLQUFLLENBQUMsUUFBUSxFQUFFO09BQUEsQ0FBQyxDQUFDLENBQUM7O0FBRXZDLFVBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDL0I7OztXQUVtQixnQ0FBRztBQUNyQixVQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDckIsWUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM1QixZQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztPQUMxQjtLQUNGOzs7V0FFWSx5QkFBOEM7QUFDekQsYUFBTztBQUNMLGdCQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7QUFDbkMsY0FBTSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO0FBQy9CLFdBQUcsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztBQUN6QiwyQkFBbUIsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDO0FBQ3pELGVBQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztBQUNqQyx3QkFBZ0IsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDO0FBQ25ELGtCQUFVLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUNqQyxnQkFBUSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUU7T0FDOUIsQ0FBQztLQUNIOzs7OztXQUdZLHVCQUFDLE1BUWIsRUFBUTtBQUNQLFVBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMzQyxVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdkMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pDLFVBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDakUsVUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3pDLFVBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDM0QsVUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDeEM7OztXQUVPLGtCQUFDLFNBQWlCLEVBQVU7QUFDbEMsYUFBTyxBQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSyxFQUFFLENBQUM7S0FDOUU7OztXQUVPLGtCQUFDLFNBQWlCLEVBQUUsSUFBYSxFQUFRO0FBQy9DLFVBQUksSUFBSSxJQUFJLElBQUksRUFBRTtBQUNoQixlQUFPO09BQ1I7QUFDRCxVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3ZDLFVBQUksU0FBUyxFQUFFO0FBQ2IsaUJBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDekI7S0FDRjs7O1dBRWEsMEJBQVc7QUFDdkIsYUFBTyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0tBQ3hEOzs7V0FFYSx3QkFBQyxVQUFxQyxFQUFRO0FBQzFELFVBQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixlQUFPO09BQ1I7QUFDRCxVQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pELFVBQUksUUFBUSxJQUFJLENBQUMsRUFBRTtBQUNqQixZQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsdUJBQXVCLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztPQUNwRDtLQUNGOzs7V0FFVyx3QkFBVztBQUNyQixhQUFPLEFBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssSUFBSyxFQUFFLENBQUM7S0FDbEY7OztXQUVZLHlCQUFTO0FBQ3BCLFVBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDNUMsVUFBSSxhQUFhLEVBQUU7QUFDakIscUJBQWEsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO09BQzFCO0tBQ0Y7OztTQTNQa0IscUJBQXFCO0dBQVMsS0FBSyxDQUFDLFNBQVM7O3FCQUE3QyxxQkFBcUIiLCJmaWxlIjoiQ29ubmVjdGlvbkRldGFpbHNGb3JtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgQXRvbUlucHV0ID0gcmVxdWlyZSgnLi4vLi4vdWkvYXRvbS1pbnB1dCcpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgUmFkaW9Hcm91cCA9IHJlcXVpcmUoJy4uLy4uL3VpL3JhZGlvZ3JvdXAnKTtcbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5jb25zdCB7U3NoSGFuZHNoYWtlfSA9IHJlcXVpcmUoJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uJyk7XG5cbmNvbnN0IHtTdXBwb3J0ZWRNZXRob2RzfSA9IFNzaEhhbmRzaGFrZTtcbmNvbnN0IGF1dGhNZXRob2RzID0gW1xuICBTdXBwb3J0ZWRNZXRob2RzLlBBU1NXT1JELFxuICBTdXBwb3J0ZWRNZXRob2RzLlNTTF9BR0VOVCxcbiAgU3VwcG9ydGVkTWV0aG9kcy5QUklWQVRFX0tFWSxcbl07XG5cbmltcG9ydCB0eXBlIHtcbiAgTnVjbGlkZVJlbW90ZUF1dGhNZXRob2RzLFxuICBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblBhcmFtc1dpdGhQYXNzd29yZCxcbn0gZnJvbSAnLi9jb25uZWN0aW9uLXR5cGVzJztcblxuXG4vKiogQ29tcG9uZW50IHRvIHByb21wdCB0aGUgdXNlciBmb3IgY29ubmVjdGlvbiBkZXRhaWxzLiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29ubmVjdGlvbkRldGFpbHNGb3JtIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBpbml0aWFsVXNlcm5hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgaW5pdGlhbFNlcnZlcjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBpbml0aWFsQ3dkOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGluaXRpYWxSZW1vdGVTZXJ2ZXJDb21tYW5kOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGluaXRpYWxTc2hQb3J0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGluaXRpYWxQYXRoVG9Qcml2YXRlS2V5OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGluaXRpYWxBdXRoTWV0aG9kOiBQcm9wVHlwZXMuc2hhcGUoT2JqZWN0LmtleXMoU3VwcG9ydGVkTWV0aG9kcykpLFxuICAgIG9uQ29uZmlybTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvbkNhbmNlbDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgfTtcblxuICBfZGlzcG9zYWJsZXM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBhbnkpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHVzZXJuYW1lOiBwcm9wcy5pbml0aWFsVXNlcm5hbWUsXG4gICAgICBzZXJ2ZXI6IHByb3BzLmluaXRpYWxTZXJ2ZXIsXG4gICAgICBjd2Q6IHByb3BzLmluaXRpYWxDd2QsXG4gICAgICByZW1vdGVTZXJ2ZXJDb21tYW5kOiBwcm9wcy5pbml0aWFsUmVtb3RlU2VydmVyQ29tbWFuZCxcbiAgICAgIHNzaFBvcnQ6IHByb3BzLmluaXRpYWxTc2hQb3J0LFxuICAgICAgcGF0aFRvUHJpdmF0ZUtleTogcHJvcHMuaW5pdGlhbFBhdGhUb1ByaXZhdGVLZXksXG4gICAgICBzZWxlY3RlZEF1dGhNZXRob2RJbmRleDogYXV0aE1ldGhvZHMuaW5kZXhPZihwcm9wcy5pbml0aWFsQXV0aE1ldGhvZCksXG4gICAgfTtcbiAgfVxuXG4gIGhhbmRsZUF1dGhNZXRob2RDaGFuZ2UobmV3SW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VsZWN0ZWRBdXRoTWV0aG9kSW5kZXg6IG5ld0luZGV4LFxuICAgIH0pO1xuICB9XG5cbiAgX29uS2V5VXAoZTogU3ludGhldGljRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgIHRoaXMucHJvcHMub25Db25maXJtKCk7XG4gICAgfVxuXG4gICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgdGhpcy5wcm9wcy5vbkNhbmNlbCgpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVQYXNzd29yZElucHV0Q2xpY2soZXZlbnQ6IFN5bnRoZXRpY0V2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgcGFzc3dvcmRBdXRoTWV0aG9kSW5kZXggPSBhdXRoTWV0aG9kcy5pbmRleE9mKFN1cHBvcnRlZE1ldGhvZHMuUEFTU1dPUkQpO1xuICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICB7XG4gICAgICAgIHNlbGVjdGVkQXV0aE1ldGhvZEluZGV4OiBwYXNzd29yZEF1dGhNZXRob2RJbmRleCxcbiAgICAgIH0sXG4gICAgICAoKSA9PiB7XG4gICAgICAgIFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1sncGFzc3dvcmQnXSkuZm9jdXMoKTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUtleUZpbGVJbnB1dENsaWNrKGV2ZW50OiBTeW50aGV0aWNFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IHByaXZhdGVLZXlBdXRoTWV0aG9kSW5kZXggPSBhdXRoTWV0aG9kcy5pbmRleE9mKFN1cHBvcnRlZE1ldGhvZHMuUFJJVkFURV9LRVkpO1xuICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICB7XG4gICAgICAgIHNlbGVjdGVkQXV0aE1ldGhvZEluZGV4OiBwcml2YXRlS2V5QXV0aE1ldGhvZEluZGV4LFxuICAgICAgfSxcbiAgICAgICgpID0+IHtcbiAgICAgICAgLy8gd2hlbiBzZXR0aW5nIHRoaXMgaW1tZWRpYXRlbHksIEF0b20gd2lsbCB1bnNldCB0aGUgZm9jdXMuLi5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzWydwYXRoVG9Qcml2YXRlS2V5J10pLmZvY3VzKCk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBhY3RpdmVBdXRoTWV0aG9kID0gYXV0aE1ldGhvZHNbdGhpcy5zdGF0ZS5zZWxlY3RlZEF1dGhNZXRob2RJbmRleF07XG4gICAgLy8gV2UgbmVlZCBuYXRpdmUta2V5LWJpbmRpbmdzIHNvIHRoYXQgZGVsZXRlIHdvcmtzIGFuZCB3ZSBuZWVkXG4gICAgLy8gX29uS2V5VXAgc28gdGhhdCBlc2NhcGUgYW5kIGVudGVyIHdvcmtcbiAgICBjb25zdCBwYXNzd29yZExhYmVsID0gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWF1dGgtbWV0aG9kXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1hdXRoLW1ldGhvZC1sYWJlbFwiPlxuICAgICAgICAgIFBhc3N3b3JkOlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWF1dGgtbWV0aG9kLWlucHV0IG51Y2xpZGUtYXV0aC1tZXRob2QtcGFzc3dvcmRcIj5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm51Y2xpZGUtcGFzc3dvcmQgbmF0aXZlLWtleS1iaW5kaW5nc1wiXG4gICAgICAgICAgICBkaXNhYmxlZD17YWN0aXZlQXV0aE1ldGhvZCAhPT0gU3VwcG9ydGVkTWV0aG9kcy5QQVNTV09SRH1cbiAgICAgICAgICAgIHJlZj1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZVBhc3N3b3JkSW5wdXRDbGljay5iaW5kKHRoaXMpfVxuICAgICAgICAgICAgb25LZXlVcD17dGhpcy5fb25LZXlVcC5iaW5kKHRoaXMpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgICBjb25zdCBwcml2YXRlS2V5TGFiZWwgPSAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtYXV0aC1tZXRob2RcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWF1dGgtbWV0aG9kLWxhYmVsXCI+XG4gICAgICAgICAgUHJpdmF0ZSBLZXkgRmlsZTpcbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1hdXRoLW1ldGhvZC1pbnB1dCBudWNsaWRlLWF1dGgtbWV0aG9kLXByaXZhdGVrZXlcIj5cbiAgICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgICByZWY9XCJwYXRoVG9Qcml2YXRlS2V5XCJcbiAgICAgICAgICAgIGRpc2FibGVkPXthY3RpdmVBdXRoTWV0aG9kICE9PSBTdXBwb3J0ZWRNZXRob2RzLlBSSVZBVEVfS0VZfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlS2V5RmlsZUlucHV0Q2xpY2suYmluZCh0aGlzKX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiUGF0aCB0byBwcml2YXRlIGtleVwiXG4gICAgICAgICAgICBpbml0aWFsVmFsdWU9e3RoaXMuc3RhdGUucGF0aFRvUHJpdmF0ZUtleX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gICAgY29uc3Qgc3NoQWdlbnRMYWJlbCA9IChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1hdXRoLW1ldGhvZFwiPlxuICAgICAgICBVc2Ugc3NoLWFnZW50XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IHJlZj1cInJvb3RcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJibG9ja1wiPlxuICAgICAgICAgIFVzZXJuYW1lOlxuICAgICAgICAgIDxBdG9tSW5wdXQgcmVmPVwidXNlcm5hbWVcIiBpbml0aWFsVmFsdWU9e3RoaXMuc3RhdGUudXNlcm5hbWV9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJsb2NrXCI+XG4gICAgICAgICAgU2VydmVyOlxuICAgICAgICAgIDxBdG9tSW5wdXQgbWluaSByZWY9XCJzZXJ2ZXJcIiBpbml0aWFsVmFsdWU9e3RoaXMuc3RhdGUuc2VydmVyfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJibG9ja1wiPlxuICAgICAgICAgIEluaXRpYWwgRGlyZWN0b3J5OlxuICAgICAgICAgIDxBdG9tSW5wdXQgcmVmPVwiY3dkXCIgaW5pdGlhbFZhbHVlPXt0aGlzLnN0YXRlLmN3ZH0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmxvY2tcIj5cbiAgICAgICAgICBBdXRoZW50aWNhdGlvbiBtZXRob2Q6XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtYXV0aC1zZWxlY3RvclwiPlxuICAgICAgICAgIDxSYWRpb0dyb3VwXG4gICAgICAgICAgICBvcHRpb25MYWJlbHM9e1tcbiAgICAgICAgICAgICAgcGFzc3dvcmRMYWJlbCxcbiAgICAgICAgICAgICAgc3NoQWdlbnRMYWJlbCxcbiAgICAgICAgICAgICAgcHJpdmF0ZUtleUxhYmVsLFxuICAgICAgICAgICAgXX1cbiAgICAgICAgICAgIG9uU2VsZWN0ZWRDaGFuZ2U9e3RoaXMuaGFuZGxlQXV0aE1ldGhvZENoYW5nZS5iaW5kKHRoaXMpfVxuICAgICAgICAgICAgc2VsZWN0ZWRJbmRleD17dGhpcy5zdGF0ZS5zZWxlY3RlZEF1dGhNZXRob2RJbmRleH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJibG9ja1wiPlxuICAgICAgICAgIEFkdmFuY2VkIFNldHRpbmdzXG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJsb2NrXCI+XG4gICAgICAgICAgU1NIIFBvcnQ6XG4gICAgICAgICAgPEF0b21JbnB1dCByZWY9XCJzc2hQb3J0XCIgaW5pdGlhbFZhbHVlPXt0aGlzLnN0YXRlLnNzaFBvcnR9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJsb2NrXCI+XG4gICAgICAgICAgUmVtb3RlIFNlcnZlciBDb21tYW5kOlxuICAgICAgICAgIDxBdG9tSW5wdXQgcmVmPVwicmVtb3RlU2VydmVyQ29tbWFuZFwiIGluaXRpYWxWYWx1ZT17dGhpcy5zdGF0ZS5yZW1vdGVTZXJ2ZXJDb21tYW5kfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBkaXNwb3NhYmxlcztcbiAgICBjb25zdCByb290ID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzWydyb290J10pO1xuXG4gICAgLy8gSGl0dGluZyBlbnRlciB3aGVuIHRoaXMgcGFuZWwgaGFzIGZvY3VzIHNob3VsZCBjb25maXJtIHRoZSBkaWFsb2cuXG4gICAgZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICByb290LFxuICAgICAgICAnY29yZTpjb25maXJtJyxcbiAgICAgICAgKGV2ZW50KSA9PiB0aGlzLnByb3BzLm9uQ29uZmlybSgpKSk7XG5cbiAgICAvLyBIaXR0aW5nIGVzY2FwZSB3aGVuIHRoaXMgcGFuZWwgaGFzIGZvY3VzIHNob3VsZCBjYW5jZWwgdGhlIGRpYWxvZy5cbiAgICBkaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgIHJvb3QsXG4gICAgICAgICdjb3JlOmNhbmNlbCcsXG4gICAgICAgIChldmVudCkgPT4gdGhpcy5wcm9wcy5vbkNhbmNlbCgpKSk7XG5cbiAgICB0aGlzLnJlZnNbJ3VzZXJuYW1lJ10uZm9jdXMoKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIGlmICh0aGlzLl9kaXNwb3NhYmxlcykge1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGdldEZvcm1GaWVsZHMoKTogTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25QYXJhbXNXaXRoUGFzc3dvcmQge1xuICAgIHJldHVybiB7XG4gICAgICB1c2VybmFtZTogdGhpcy5fZ2V0VGV4dCgndXNlcm5hbWUnKSxcbiAgICAgIHNlcnZlcjogdGhpcy5fZ2V0VGV4dCgnc2VydmVyJyksXG4gICAgICBjd2Q6IHRoaXMuX2dldFRleHQoJ2N3ZCcpLFxuICAgICAgcmVtb3RlU2VydmVyQ29tbWFuZDogdGhpcy5fZ2V0VGV4dCgncmVtb3RlU2VydmVyQ29tbWFuZCcpLFxuICAgICAgc3NoUG9ydDogdGhpcy5fZ2V0VGV4dCgnc3NoUG9ydCcpLFxuICAgICAgcGF0aFRvUHJpdmF0ZUtleTogdGhpcy5fZ2V0VGV4dCgncGF0aFRvUHJpdmF0ZUtleScpLFxuICAgICAgYXV0aE1ldGhvZDogdGhpcy5fZ2V0QXV0aE1ldGhvZCgpLFxuICAgICAgcGFzc3dvcmQ6IHRoaXMuX2dldFBhc3N3b3JkKCksXG4gICAgfTtcbiAgfVxuXG4gIC8vIE5vdGU6ICdwYXNzd29yZCcgaXMgbm90IHNldHRhYmxlLiBUaGUgb25seSBleHBvc2VkIG1ldGhvZCBpcyAnY2xlYXJQYXNzd29yZCcuXG4gIHNldEZvcm1GaWVsZHMoZmllbGRzOiB7XG4gICAgdXNlcm5hbWU/OiBzdHJpbmcsXG4gICAgc2VydmVyPzogc3RyaW5nLFxuICAgIGN3ZD86IHN0cmluZyxcbiAgICByZW1vdGVTZXJ2ZXJDb21tYW5kPzogc3RyaW5nLFxuICAgIHNzaFBvcnQ/OiBzdHJpbmcsXG4gICAgcGF0aFRvUHJpdmF0ZUtleT86IHN0cmluZyxcbiAgICBhdXRoTWV0aG9kPzogTnVjbGlkZVJlbW90ZUF1dGhNZXRob2RzLFxuICB9KTogdm9pZCB7XG4gICAgdGhpcy5fc2V0VGV4dCgndXNlcm5hbWUnLCBmaWVsZHMudXNlcm5hbWUpO1xuICAgIHRoaXMuX3NldFRleHQoJ3NlcnZlcicsIGZpZWxkcy5zZXJ2ZXIpO1xuICAgIHRoaXMuX3NldFRleHQoJ2N3ZCcsIGZpZWxkcy5jd2QpO1xuICAgIHRoaXMuX3NldFRleHQoJ3JlbW90ZVNlcnZlckNvbW1hbmQnLCBmaWVsZHMucmVtb3RlU2VydmVyQ29tbWFuZCk7XG4gICAgdGhpcy5fc2V0VGV4dCgnc3NoUG9ydCcsIGZpZWxkcy5zc2hQb3J0KTtcbiAgICB0aGlzLl9zZXRUZXh0KCdwYXRoVG9Qcml2YXRlS2V5JywgZmllbGRzLnBhdGhUb1ByaXZhdGVLZXkpO1xuICAgIHRoaXMuX3NldEF1dGhNZXRob2QoZmllbGRzLmF1dGhNZXRob2QpO1xuICB9XG5cbiAgX2dldFRleHQoZmllbGROYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiAodGhpcy5yZWZzW2ZpZWxkTmFtZV0gJiYgdGhpcy5yZWZzW2ZpZWxkTmFtZV0uZ2V0VGV4dCgpLnRyaW0oKSkgfHwgJyc7XG4gIH1cblxuICBfc2V0VGV4dChmaWVsZE5hbWU6IHN0cmluZywgdGV4dDogP3N0cmluZyk6IHZvaWQge1xuICAgIGlmICh0ZXh0ID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgYXRvbUlucHV0ID0gdGhpcy5yZWZzW2ZpZWxkTmFtZV07XG4gICAgaWYgKGF0b21JbnB1dCkge1xuICAgICAgYXRvbUlucHV0LnNldFRleHQodGV4dCk7XG4gICAgfVxuICB9XG5cbiAgX2dldEF1dGhNZXRob2QoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYXV0aE1ldGhvZHNbdGhpcy5zdGF0ZS5zZWxlY3RlZEF1dGhNZXRob2RJbmRleF07XG4gIH1cblxuICBfc2V0QXV0aE1ldGhvZChhdXRoTWV0aG9kOiA/TnVjbGlkZVJlbW90ZUF1dGhNZXRob2RzKTogdm9pZCB7XG4gICAgaWYgKGF1dGhNZXRob2QgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBuZXdJbmRleCA9IGF1dGhNZXRob2RzLmluZGV4T2YoYXV0aE1ldGhvZCk7XG4gICAgaWYgKG5ld0luZGV4ID49IDApIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkQXV0aE1ldGhvZEluZGV4OiBuZXdJbmRleH0pO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRQYXNzd29yZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAodGhpcy5yZWZzLnBhc3N3b3JkICYmIFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmcy5wYXNzd29yZCkudmFsdWUpIHx8ICcnO1xuICB9XG5cbiAgY2xlYXJQYXNzd29yZCgpOiB2b2lkIHtcbiAgICBjb25zdCBwYXNzd29yZElucHV0ID0gdGhpcy5yZWZzWydwYXNzd29yZCddO1xuICAgIGlmIChwYXNzd29yZElucHV0KSB7XG4gICAgICBwYXNzd29yZElucHV0LnZhbHVlID0gJyc7XG4gICAgfVxuICB9XG59XG4iXX0=