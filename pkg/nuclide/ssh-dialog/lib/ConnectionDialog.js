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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _notification = require('./notification');

var _AuthenticationPrompt = require('./AuthenticationPrompt');

var _AuthenticationPrompt2 = _interopRequireDefault(_AuthenticationPrompt);

var _ConnectionDetailsPrompt = require('./ConnectionDetailsPrompt');

var _ConnectionDetailsPrompt2 = _interopRequireDefault(_ConnectionDetailsPrompt);

var _IndeterminateProgressBar = require('./IndeterminateProgressBar');

var _IndeterminateProgressBar2 = _interopRequireDefault(_IndeterminateProgressBar);

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

var _remoteConnection = require('../../remote-connection');

var logger = require('../../logging').getLogger();

var REQUEST_CONNECTION_DETAILS = 1;
var WAITING_FOR_CONNECTION = 2;
var REQUEST_AUTHENTICATION_DETAILS = 3;
var WAITING_FOR_AUTHENTICATION = 4;

/**
 * Component that manages the state transitions as the user connects to a
 * server.
 */
/* eslint-disable react/prop-types */

var ConnectionDialog = (function (_React$Component) {
  _inherits(ConnectionDialog, _React$Component);

  function ConnectionDialog(props) {
    _classCallCheck(this, ConnectionDialog);

    _get(Object.getPrototypeOf(ConnectionDialog.prototype), 'constructor', this).call(this, props);
    this.state = this._createInitialState();
    this._boundOk = this.ok.bind(this);
    this._boundCancel = this.cancel.bind(this);
  }

  /* eslint-enable react/prop-types */

  _createClass(ConnectionDialog, [{
    key: '_createInitialState',
    value: function _createInitialState() {
      var _this = this;

      var sshHandshake = new _remoteConnection.SshHandshake((0, _remoteConnection.decorateSshConnectionDelegateWithTracking)({
        onKeyboardInteractive: function onKeyboardInteractive(name, instructions, instructionsLang, prompts, finish) {
          // TODO: Display all prompts, not just the first one.
          _this.requestAuthentication(prompts[0], finish);
        },

        onWillConnect: function onWillConnect() {},

        onDidConnect: function onDidConnect(connection, config) {
          _this.close(); // Close the dialog.
          _this.props.onConnect(connection, config);
        },

        onError: function onError(errorType, error, config) {
          _this.close(); // Close the dialog.
          (0, _notification.notifySshHandshakeError)(errorType, error, config);
          _this.props.onError(error, config);
          logger.debug(error);
        }
      }));

      return {
        mode: REQUEST_CONNECTION_DETAILS,
        instructions: '',
        sshHandshake: sshHandshake,
        finish: function finish(answers) {}
      };
    }
  }, {
    key: 'render',
    value: function render() {
      var mode = this.state.mode;
      var content = undefined;
      var isOkDisabled = undefined;
      var okButtonText = undefined;

      if (mode === REQUEST_CONNECTION_DETAILS) {
        content = _reactForAtom2['default'].createElement(_ConnectionDetailsPrompt2['default'], {
          ref: 'connection-details',
          connectionProfiles: this.props.connectionProfiles,
          indexOfInitiallySelectedConnectionProfile: this.props.indexOfInitiallySelectedConnectionProfile,
          onAddProfileClicked: this.props.onAddProfileClicked,
          onDeleteProfileClicked: this.props.onDeleteProfileClicked,
          onConfirm: this._boundOk,
          onCancel: this._boundCancel
        });
        isOkDisabled = false;
        okButtonText = 'Connect';
      } else if (mode === WAITING_FOR_CONNECTION || mode === WAITING_FOR_AUTHENTICATION) {
        content = _reactForAtom2['default'].createElement(_IndeterminateProgressBar2['default'], null);
        isOkDisabled = true;
        okButtonText = 'Connect';
      } else {
        content = _reactForAtom2['default'].createElement(_AuthenticationPrompt2['default'], {
          ref: 'authentication',
          instructions: this.state.instructions,
          onConfirm: this._boundOk,
          onCancel: this._boundCancel
        });
        isOkDisabled = false;
        okButtonText = 'OK';
      }

      return _reactForAtom2['default'].createElement(
        'atom-panel',
        { 'class': 'modal modal-lg from-top' },
        _reactForAtom2['default'].createElement(
          'div',
          { className: 'padded' },
          content
        ),
        _reactForAtom2['default'].createElement(
          'div',
          { className: 'padded text-right' },
          _reactForAtom2['default'].createElement(
            'div',
            { className: 'btn-group' },
            _reactForAtom2['default'].createElement(
              'button',
              { className: 'btn', onClick: this._boundCancel },
              'Cancel'
            ),
            _reactForAtom2['default'].createElement(
              'button',
              { className: 'btn btn-primary', onClick: this._boundOk, disabled: isOkDisabled },
              okButtonText
            )
          )
        )
      );
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      var mode = this.state.mode;

      // It is safe to call cancel even if no connection is started
      this.state.sshHandshake.cancel();

      if (mode === WAITING_FOR_CONNECTION) {
        // TODO(mikeo): Tell delegate to cancel the connection request.
        this.setState({ mode: REQUEST_CONNECTION_DETAILS });
      } else {
        // TODO(mikeo): Also cancel connection request, as appropriate for mode?
        this.props.onCancel();
        this.close();
      }
    }
  }, {
    key: 'close',
    value: function close() {
      if (this.props.onClosed) {
        this.props.onClosed();
      }
    }
  }, {
    key: 'ok',
    value: function ok() {
      var mode = this.state.mode;

      if (mode === REQUEST_CONNECTION_DETAILS) {
        // User is trying to submit connection details.
        var connectionDetailsForm = this.refs['connection-details'];

        var _connectionDetailsForm$getFormFields = connectionDetailsForm.getFormFields();

        var username = _connectionDetailsForm$getFormFields.username;
        var server = _connectionDetailsForm$getFormFields.server;
        var cwd = _connectionDetailsForm$getFormFields.cwd;
        var remoteServerCommand = _connectionDetailsForm$getFormFields.remoteServerCommand;
        var sshPort = _connectionDetailsForm$getFormFields.sshPort;
        var pathToPrivateKey = _connectionDetailsForm$getFormFields.pathToPrivateKey;
        var authMethod = _connectionDetailsForm$getFormFields.authMethod;
        var password = _connectionDetailsForm$getFormFields.password;

        if (username && server && cwd && remoteServerCommand) {
          this.setState({ mode: WAITING_FOR_CONNECTION });
          this.state.sshHandshake.connect({
            host: server,
            sshPort: sshPort,
            username: username,
            pathToPrivateKey: pathToPrivateKey,
            authMethod: authMethod,
            cwd: cwd,
            remoteServerCommand: remoteServerCommand,
            password: password
          });
        } else {
          // TODO(mbolin): Tell user to fill out all of the fields.
        }
      } else if (mode === REQUEST_AUTHENTICATION_DETAILS) {
          var authenticationPrompt = this.refs['authentication'];
          var password = authenticationPrompt.getPassword();

          this.state.finish([password]);

          this.setState({ mode: WAITING_FOR_AUTHENTICATION });
        }
    }
  }, {
    key: 'requestAuthentication',
    value: function requestAuthentication(instructions, finish) {
      this.setState({
        mode: REQUEST_AUTHENTICATION_DETAILS,
        instructions: instructions.prompt,
        finish: finish
      });
    }
  }, {
    key: 'getFormFields',
    value: function getFormFields() {
      var connectionDetailsForm = this.refs['connection-details'];
      if (!connectionDetailsForm) {
        return null;
      }

      var _connectionDetailsForm$getFormFields2 = connectionDetailsForm.getFormFields();

      var username = _connectionDetailsForm$getFormFields2.username;
      var server = _connectionDetailsForm$getFormFields2.server;
      var cwd = _connectionDetailsForm$getFormFields2.cwd;
      var remoteServerCommand = _connectionDetailsForm$getFormFields2.remoteServerCommand;
      var sshPort = _connectionDetailsForm$getFormFields2.sshPort;
      var pathToPrivateKey = _connectionDetailsForm$getFormFields2.pathToPrivateKey;
      var authMethod = _connectionDetailsForm$getFormFields2.authMethod;

      return {
        username: username,
        server: server,
        cwd: cwd,
        remoteServerCommand: remoteServerCommand,
        sshPort: sshPort,
        pathToPrivateKey: pathToPrivateKey,
        authMethod: authMethod
      };
    }
  }]);

  return ConnectionDialog;
})(_reactForAtom2['default'].Component);

exports['default'] = ConnectionDialog;
module.exports = exports['default'];

// The list of connection profiles that will be displayed.

// If there is >= 1 connection profile, this index indicates the initial
// profile to use.

// Function that is called when the "+" button on the profiles list is clicked.
// The user's intent is to create a new profile.

// Function that is called when the "-" button on the profiles list is clicked
// ** while a profile is selected **.
// The user's intent is to delete the currently-selected profile.
//# sourceMappingURL=data:application/json;base64,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UUFBUTtVQUNSLE1BQU0seUNBQU4sTUFBTTtVQUNOLEdBQUcseUNBQUgsR0FBRztVQUNILG1CQUFtQix5Q0FBbkIsbUJBQW1CO1VBQ25CLE9BQU8seUNBQVAsT0FBTztVQUNQLGdCQUFnQix5Q0FBaEIsZ0JBQWdCO1VBQ2hCLFVBQVUseUNBQVYsVUFBVTs7QUFFWixhQUFPO0FBQ0wsZ0JBQVEsRUFBUixRQUFRO0FBQ1IsY0FBTSxFQUFOLE1BQU07QUFDTixXQUFHLEVBQUgsR0FBRztBQUNILDJCQUFtQixFQUFuQixtQkFBbUI7QUFDbkIsZUFBTyxFQUFQLE9BQU87QUFDUCx3QkFBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLGtCQUFVLEVBQVYsVUFBVTtPQUNYLENBQUM7S0FDSDs7O1NBdk1rQixnQkFBZ0I7R0FBUywwQkFBTSxTQUFTOztxQkFBeEMsZ0JBQWdCIiwiZmlsZSI6IkNvbm5lY3Rpb25EaWFsb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUGFyYW1zLFxuICBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGUsXG59IGZyb20gJy4vY29ubmVjdGlvbi10eXBlcyc7XG5cbmltcG9ydCB0eXBlIHtcbiAgU3NoSGFuZHNoYWtlRXJyb3JUeXBlLFxuICBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbixcbn0gZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24vbGliL1NzaEhhbmRzaGFrZSc7XG5cbmltcG9ydCB0eXBlIHtSZW1vdGVDb25uZWN0aW9ufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbi9saWIvUmVtb3RlQ29ubmVjdGlvbic7XG5cbmltcG9ydCB7bm90aWZ5U3NoSGFuZHNoYWtlRXJyb3J9IGZyb20gJy4vbm90aWZpY2F0aW9uJztcbmltcG9ydCBBdXRoZW50aWNhdGlvblByb21wdCBmcm9tICcuL0F1dGhlbnRpY2F0aW9uUHJvbXB0JztcbmltcG9ydCBDb25uZWN0aW9uRGV0YWlsc1Byb21wdCBmcm9tICcuL0Nvbm5lY3Rpb25EZXRhaWxzUHJvbXB0JztcbmltcG9ydCBJbmRldGVybWluYXRlUHJvZ3Jlc3NCYXIgZnJvbSAnLi9JbmRldGVybWluYXRlUHJvZ3Jlc3NCYXInO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7XG4gIFNzaEhhbmRzaGFrZSxcbiAgZGVjb3JhdGVTc2hDb25uZWN0aW9uRGVsZWdhdGVXaXRoVHJhY2tpbmcsXG59IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uJztcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcblxudHlwZSBQcm9wcyA9IHtcbiAgLy8gVGhlIGxpc3Qgb2YgY29ubmVjdGlvbiBwcm9maWxlcyB0aGF0IHdpbGwgYmUgZGlzcGxheWVkLlxuICBjb25uZWN0aW9uUHJvZmlsZXM6ID9BcnJheTxOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGU+O1xuICAvLyBJZiB0aGVyZSBpcyA+PSAxIGNvbm5lY3Rpb24gcHJvZmlsZSwgdGhpcyBpbmRleCBpbmRpY2F0ZXMgdGhlIGluaXRpYWxcbiAgLy8gcHJvZmlsZSB0byB1c2UuXG4gIGluZGV4T2ZJbml0aWFsbHlTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiA/bnVtYmVyO1xuICAvLyBGdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBcIitcIiBidXR0b24gb24gdGhlIHByb2ZpbGVzIGxpc3QgaXMgY2xpY2tlZC5cbiAgLy8gVGhlIHVzZXIncyBpbnRlbnQgaXMgdG8gY3JlYXRlIGEgbmV3IHByb2ZpbGUuXG4gIG9uQWRkUHJvZmlsZUNsaWNrZWQ6ICgpID0+IG1peGVkO1xuICAvLyBGdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBcIi1cIiBidXR0b24gb24gdGhlIHByb2ZpbGVzIGxpc3QgaXMgY2xpY2tlZFxuICAvLyAqKiB3aGlsZSBhIHByb2ZpbGUgaXMgc2VsZWN0ZWQgKiouXG4gIC8vIFRoZSB1c2VyJ3MgaW50ZW50IGlzIHRvIGRlbGV0ZSB0aGUgY3VycmVudGx5LXNlbGVjdGVkIHByb2ZpbGUuXG4gIG9uRGVsZXRlUHJvZmlsZUNsaWNrZWQ6IChpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZTogbnVtYmVyKSA9PiBtaXhlZDtcbiAgb25Db25uZWN0OiAoKSA9PiBtaXhlZDtcbiAgb25FcnJvcjogKCkgPT4gbWl4ZWQ7XG4gIG9uQ2FuY2VsOiAoKSA9PiBtaXhlZDtcbiAgb25DbG9zZWQ6ID8oKSA9PiBtaXhlZDtcbn07XG5cbnR5cGUgU3RhdGUgPSB7XG4gIG1vZGU6IG51bWJlcjtcbiAgaW5zdHJ1Y3Rpb25zOiBzdHJpbmc7XG4gIHNzaEhhbmRzaGFrZTogU3NoSGFuZHNoYWtlO1xuICBmaW5pc2g6IChhbnN3ZXJzOiBBcnJheTxzdHJpbmc+KSA9PiBtaXhlZDtcbn07XG5cbmNvbnN0IFJFUVVFU1RfQ09OTkVDVElPTl9ERVRBSUxTID0gMTtcbmNvbnN0IFdBSVRJTkdfRk9SX0NPTk5FQ1RJT04gPSAyO1xuY29uc3QgUkVRVUVTVF9BVVRIRU5USUNBVElPTl9ERVRBSUxTID0gMztcbmNvbnN0IFdBSVRJTkdfRk9SX0FVVEhFTlRJQ0FUSU9OID0gNDtcblxuLyoqXG4gKiBDb21wb25lbnQgdGhhdCBtYW5hZ2VzIHRoZSBzdGF0ZSB0cmFuc2l0aW9ucyBhcyB0aGUgdXNlciBjb25uZWN0cyB0byBhXG4gKiBzZXJ2ZXIuXG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbm5lY3Rpb25EaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHMsIFN0YXRlPiB7XG4gIF9ib3VuZE9rOiAoKSA9PiB2b2lkO1xuICBfYm91bmRDYW5jZWw6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB0aGlzLl9jcmVhdGVJbml0aWFsU3RhdGUoKTtcbiAgICB0aGlzLl9ib3VuZE9rID0gdGhpcy5vay5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2JvdW5kQ2FuY2VsID0gdGhpcy5jYW5jZWwuYmluZCh0aGlzKTtcbiAgfVxuXG4gIF9jcmVhdGVJbml0aWFsU3RhdGUoKTogU3RhdGUge1xuICAgIGNvbnN0IHNzaEhhbmRzaGFrZSA9IG5ldyBTc2hIYW5kc2hha2UoZGVjb3JhdGVTc2hDb25uZWN0aW9uRGVsZWdhdGVXaXRoVHJhY2tpbmcoe1xuICAgICAgb25LZXlib2FyZEludGVyYWN0aXZlOiAobmFtZSwgaW5zdHJ1Y3Rpb25zLCBpbnN0cnVjdGlvbnNMYW5nLCBwcm9tcHRzLCBmaW5pc2gpICA9PiB7XG4gICAgICAgIC8vIFRPRE86IERpc3BsYXkgYWxsIHByb21wdHMsIG5vdCBqdXN0IHRoZSBmaXJzdCBvbmUuXG4gICAgICAgIHRoaXMucmVxdWVzdEF1dGhlbnRpY2F0aW9uKHByb21wdHNbMF0sIGZpbmlzaCk7XG4gICAgICB9LFxuXG4gICAgICBvbldpbGxDb25uZWN0OigpID0+IHt9LFxuXG4gICAgICBvbkRpZENvbm5lY3Q6IChjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uLCBjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uKSA9PiB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTsgLy8gQ2xvc2UgdGhlIGRpYWxvZy5cbiAgICAgICAgdGhpcy5wcm9wcy5vbkNvbm5lY3QoY29ubmVjdGlvbiwgY29uZmlnKTtcbiAgICAgIH0sXG5cbiAgICAgIG9uRXJyb3I6IChcbiAgICAgICAgZXJyb3JUeXBlOiBTc2hIYW5kc2hha2VFcnJvclR5cGUsXG4gICAgICAgIGVycm9yOiBFcnJvcixcbiAgICAgICAgY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbixcbiAgICAgICkgPT4ge1xuICAgICAgICB0aGlzLmNsb3NlKCk7IC8vIENsb3NlIHRoZSBkaWFsb2cuXG4gICAgICAgIG5vdGlmeVNzaEhhbmRzaGFrZUVycm9yKGVycm9yVHlwZSwgZXJyb3IsIGNvbmZpZyk7XG4gICAgICAgIHRoaXMucHJvcHMub25FcnJvcihlcnJvciwgY29uZmlnKTtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKGVycm9yKTtcbiAgICAgIH0sXG4gICAgfSkpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1vZGU6IFJFUVVFU1RfQ09OTkVDVElPTl9ERVRBSUxTLFxuICAgICAgaW5zdHJ1Y3Rpb25zOiAnJyxcbiAgICAgIHNzaEhhbmRzaGFrZTogc3NoSGFuZHNoYWtlLFxuICAgICAgZmluaXNoOiAoYW5zd2VycykgPT4ge30sXG4gICAgfTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IG1vZGUgPSB0aGlzLnN0YXRlLm1vZGU7XG4gICAgbGV0IGNvbnRlbnQ7XG4gICAgbGV0IGlzT2tEaXNhYmxlZDtcbiAgICBsZXQgb2tCdXR0b25UZXh0O1xuXG4gICAgaWYgKG1vZGUgPT09IFJFUVVFU1RfQ09OTkVDVElPTl9ERVRBSUxTKSB7XG4gICAgICBjb250ZW50ID0gKFxuICAgICAgICA8Q29ubmVjdGlvbkRldGFpbHNQcm9tcHRcbiAgICAgICAgICByZWY9XCJjb25uZWN0aW9uLWRldGFpbHNcIlxuICAgICAgICAgIGNvbm5lY3Rpb25Qcm9maWxlcz17dGhpcy5wcm9wcy5jb25uZWN0aW9uUHJvZmlsZXN9XG4gICAgICAgICAgaW5kZXhPZkluaXRpYWxseVNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU9XG4gICAgICAgICAgICB7dGhpcy5wcm9wcy5pbmRleE9mSW5pdGlhbGx5U2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZX1cbiAgICAgICAgICBvbkFkZFByb2ZpbGVDbGlja2VkPXt0aGlzLnByb3BzLm9uQWRkUHJvZmlsZUNsaWNrZWR9XG4gICAgICAgICAgb25EZWxldGVQcm9maWxlQ2xpY2tlZD17dGhpcy5wcm9wcy5vbkRlbGV0ZVByb2ZpbGVDbGlja2VkfVxuICAgICAgICAgIG9uQ29uZmlybT17dGhpcy5fYm91bmRPa31cbiAgICAgICAgICBvbkNhbmNlbD17dGhpcy5fYm91bmRDYW5jZWx9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgICAgaXNPa0Rpc2FibGVkID0gZmFsc2U7XG4gICAgICBva0J1dHRvblRleHQgPSAnQ29ubmVjdCc7XG4gICAgfSBlbHNlIGlmIChtb2RlID09PSBXQUlUSU5HX0ZPUl9DT05ORUNUSU9OIHx8IG1vZGUgPT09IFdBSVRJTkdfRk9SX0FVVEhFTlRJQ0FUSU9OKSB7XG4gICAgICBjb250ZW50ID0gPEluZGV0ZXJtaW5hdGVQcm9ncmVzc0JhciAvPjtcbiAgICAgIGlzT2tEaXNhYmxlZCA9IHRydWU7XG4gICAgICBva0J1dHRvblRleHQgPSAnQ29ubmVjdCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRlbnQgPSAoXG4gICAgICAgIDxBdXRoZW50aWNhdGlvblByb21wdFxuICAgICAgICAgIHJlZj1cImF1dGhlbnRpY2F0aW9uXCJcbiAgICAgICAgICBpbnN0cnVjdGlvbnM9e3RoaXMuc3RhdGUuaW5zdHJ1Y3Rpb25zfVxuICAgICAgICAgIG9uQ29uZmlybT17dGhpcy5fYm91bmRPa31cbiAgICAgICAgICBvbkNhbmNlbD17dGhpcy5fYm91bmRDYW5jZWx9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgICAgaXNPa0Rpc2FibGVkID0gZmFsc2U7XG4gICAgICBva0J1dHRvblRleHQgPSAnT0snO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8YXRvbS1wYW5lbCBjbGFzcz1cIm1vZGFsIG1vZGFsLWxnIGZyb20tdG9wXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFkZGVkXCI+XG4gICAgICAgICAge2NvbnRlbnR9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZGRlZCB0ZXh0LXJpZ2h0XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXBcIj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuXCIgb25DbGljaz17dGhpcy5fYm91bmRDYW5jZWx9PlxuICAgICAgICAgICAgICBDYW5jZWxcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLl9ib3VuZE9rfSBkaXNhYmxlZD17aXNPa0Rpc2FibGVkfT5cbiAgICAgICAgICAgICAge29rQnV0dG9uVGV4dH1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvYXRvbS1wYW5lbD5cbiAgICApO1xuICB9XG5cbiAgY2FuY2VsKCkge1xuICAgIGNvbnN0IG1vZGUgPSB0aGlzLnN0YXRlLm1vZGU7XG5cbiAgICAvLyBJdCBpcyBzYWZlIHRvIGNhbGwgY2FuY2VsIGV2ZW4gaWYgbm8gY29ubmVjdGlvbiBpcyBzdGFydGVkXG4gICAgdGhpcy5zdGF0ZS5zc2hIYW5kc2hha2UuY2FuY2VsKCk7XG5cbiAgICBpZiAobW9kZSA9PT0gV0FJVElOR19GT1JfQ09OTkVDVElPTikge1xuICAgICAgLy8gVE9ETyhtaWtlbyk6IFRlbGwgZGVsZWdhdGUgdG8gY2FuY2VsIHRoZSBjb25uZWN0aW9uIHJlcXVlc3QuXG4gICAgICB0aGlzLnNldFN0YXRlKHttb2RlOiBSRVFVRVNUX0NPTk5FQ1RJT05fREVUQUlMU30pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUT0RPKG1pa2VvKTogQWxzbyBjYW5jZWwgY29ubmVjdGlvbiByZXF1ZXN0LCBhcyBhcHByb3ByaWF0ZSBmb3IgbW9kZT9cbiAgICAgIHRoaXMucHJvcHMub25DYW5jZWwoKTtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkNsb3NlZCkge1xuICAgICAgdGhpcy5wcm9wcy5vbkNsb3NlZCgpO1xuICAgIH1cbiAgfVxuXG4gIG9rKCkge1xuICAgIGNvbnN0IG1vZGUgPSB0aGlzLnN0YXRlLm1vZGU7XG5cbiAgICBpZiAobW9kZSA9PT0gUkVRVUVTVF9DT05ORUNUSU9OX0RFVEFJTFMpIHtcbiAgICAgIC8vIFVzZXIgaXMgdHJ5aW5nIHRvIHN1Ym1pdCBjb25uZWN0aW9uIGRldGFpbHMuXG4gICAgICBjb25zdCBjb25uZWN0aW9uRGV0YWlsc0Zvcm0gPSB0aGlzLnJlZnNbJ2Nvbm5lY3Rpb24tZGV0YWlscyddO1xuICAgICAgY29uc3Qge1xuICAgICAgICB1c2VybmFtZSxcbiAgICAgICAgc2VydmVyLFxuICAgICAgICBjd2QsXG4gICAgICAgIHJlbW90ZVNlcnZlckNvbW1hbmQsXG4gICAgICAgIHNzaFBvcnQsXG4gICAgICAgIHBhdGhUb1ByaXZhdGVLZXksXG4gICAgICAgIGF1dGhNZXRob2QsXG4gICAgICAgIHBhc3N3b3JkLFxuICAgICAgfSA9IGNvbm5lY3Rpb25EZXRhaWxzRm9ybS5nZXRGb3JtRmllbGRzKCk7XG4gICAgICBpZiAodXNlcm5hbWUgJiYgc2VydmVyICYmIGN3ZCAmJiByZW1vdGVTZXJ2ZXJDb21tYW5kKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe21vZGU6IFdBSVRJTkdfRk9SX0NPTk5FQ1RJT059KTtcbiAgICAgICAgdGhpcy5zdGF0ZS5zc2hIYW5kc2hha2UuY29ubmVjdCh7XG4gICAgICAgICAgaG9zdDogc2VydmVyLFxuICAgICAgICAgIHNzaFBvcnQsXG4gICAgICAgICAgdXNlcm5hbWUsXG4gICAgICAgICAgcGF0aFRvUHJpdmF0ZUtleSxcbiAgICAgICAgICBhdXRoTWV0aG9kLFxuICAgICAgICAgIGN3ZCxcbiAgICAgICAgICByZW1vdGVTZXJ2ZXJDb21tYW5kLFxuICAgICAgICAgIHBhc3N3b3JkLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRPRE8obWJvbGluKTogVGVsbCB1c2VyIHRvIGZpbGwgb3V0IGFsbCBvZiB0aGUgZmllbGRzLlxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobW9kZSA9PT0gUkVRVUVTVF9BVVRIRU5USUNBVElPTl9ERVRBSUxTKSB7XG4gICAgICBjb25zdCBhdXRoZW50aWNhdGlvblByb21wdCA9IHRoaXMucmVmc1snYXV0aGVudGljYXRpb24nXTtcbiAgICAgIGNvbnN0IHBhc3N3b3JkID0gYXV0aGVudGljYXRpb25Qcm9tcHQuZ2V0UGFzc3dvcmQoKTtcblxuICAgICAgdGhpcy5zdGF0ZS5maW5pc2goW3Bhc3N3b3JkXSk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe21vZGU6IFdBSVRJTkdfRk9SX0FVVEhFTlRJQ0FUSU9OfSk7XG4gICAgfVxuICB9XG5cbiAgcmVxdWVzdEF1dGhlbnRpY2F0aW9uKFxuICAgIGluc3RydWN0aW9uczoge2VjaG86IGJvb2xlYW47IHByb21wdDogc3RyaW5nfSxcbiAgICBmaW5pc2g6IChhbnN3ZXJzOiBBcnJheTxzdHJpbmc+KSA9PiB2b2lkXG4gICkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbW9kZTogUkVRVUVTVF9BVVRIRU5USUNBVElPTl9ERVRBSUxTLFxuICAgICAgaW5zdHJ1Y3Rpb25zOiBpbnN0cnVjdGlvbnMucHJvbXB0LFxuICAgICAgZmluaXNoLFxuICAgIH0pO1xuICB9XG5cbiAgZ2V0Rm9ybUZpZWxkcygpOiA/TnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25QYXJhbXMge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25EZXRhaWxzRm9ybSA9IHRoaXMucmVmc1snY29ubmVjdGlvbi1kZXRhaWxzJ107XG4gICAgaWYgKCFjb25uZWN0aW9uRGV0YWlsc0Zvcm0pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHNlcnZlcixcbiAgICAgIGN3ZCxcbiAgICAgIHJlbW90ZVNlcnZlckNvbW1hbmQsXG4gICAgICBzc2hQb3J0LFxuICAgICAgcGF0aFRvUHJpdmF0ZUtleSxcbiAgICAgIGF1dGhNZXRob2QsXG4gICAgfSA9IGNvbm5lY3Rpb25EZXRhaWxzRm9ybS5nZXRGb3JtRmllbGRzKCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgc2VydmVyLFxuICAgICAgY3dkLFxuICAgICAgcmVtb3RlU2VydmVyQ29tbWFuZCxcbiAgICAgIHNzaFBvcnQsXG4gICAgICBwYXRoVG9Qcml2YXRlS2V5LFxuICAgICAgYXV0aE1ldGhvZCxcbiAgICB9O1xuICB9XG59XG4vKiBlc2xpbnQtZW5hYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbiJdfQ==