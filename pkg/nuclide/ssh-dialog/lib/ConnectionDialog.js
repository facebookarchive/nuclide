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
      } else if (mode === WAITING_FOR_CONNECTION || mode === WAITING_FOR_AUTHENTICATION) {
        content = _reactForAtom2['default'].createElement(_IndeterminateProgressBar2['default'], null);
        isOkDisabled = true;
      } else {
        content = _reactForAtom2['default'].createElement(_AuthenticationPrompt2['default'], { ref: 'authentication',
          instructions: this.state.instructions,
          onConfirm: this._boundOk,
          onCancel: this._boundCancel
        });
        isOkDisabled = false;
      }

      // The root element cannot have a 'key' property, so we use a dummy
      // <div> as the root. Ideally, the <atom-panel> would be the root.
      return _reactForAtom2['default'].createElement(
        'div',
        null,
        _reactForAtom2['default'].createElement(
          'atom-panel',
          { 'class': 'modal from-top', key: 'connect-dialog' },
          content,
          _reactForAtom2['default'].createElement(
            'div',
            { className: 'block nuclide-ok-cancel' },
            _reactForAtom2['default'].createElement(
              'button',
              { className: 'btn', onClick: this._boundCancel },
              'Cancel'
            ),
            _reactForAtom2['default'].createElement(
              'button',
              { className: 'btn btn-primary', onClick: this._boundOk, disabled: isOkDisabled },
              'OK'
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
//# sourceMappingURL=data:application/json;base64,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O0FBRVosYUFBTztBQUNMLGdCQUFRLEVBQVIsUUFBUTtBQUNSLGNBQU0sRUFBTixNQUFNO0FBQ04sV0FBRyxFQUFILEdBQUc7QUFDSCwyQkFBbUIsRUFBbkIsbUJBQW1CO0FBQ25CLGVBQU8sRUFBUCxPQUFPO0FBQ1Asd0JBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQixrQkFBVSxFQUFWLFVBQVU7T0FDWCxDQUFDO0tBQ0g7OztTQWhNa0IsZ0JBQWdCO0dBQVMsMEJBQU0sU0FBUzs7cUJBQXhDLGdCQUFnQiIsImZpbGUiOiJDb25uZWN0aW9uRGlhbG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblBhcmFtcyxcbiAgTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25Qcm9maWxlLFxufSBmcm9tICcuL2Nvbm5lY3Rpb24tdHlwZXMnO1xuXG5pbXBvcnQgdHlwZSB7XG4gIFNzaEhhbmRzaGFrZUVycm9yVHlwZSxcbiAgU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24sXG59IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uL2xpYi9Tc2hIYW5kc2hha2UnO1xuXG5pbXBvcnQgdHlwZSB7UmVtb3RlQ29ubmVjdGlvbn0gZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24vbGliL1JlbW90ZUNvbm5lY3Rpb24nO1xuXG5pbXBvcnQge25vdGlmeVNzaEhhbmRzaGFrZUVycm9yfSBmcm9tICcuL25vdGlmaWNhdGlvbic7XG5pbXBvcnQgQXV0aGVudGljYXRpb25Qcm9tcHQgZnJvbSAnLi9BdXRoZW50aWNhdGlvblByb21wdCc7XG5pbXBvcnQgQ29ubmVjdGlvbkRldGFpbHNQcm9tcHQgZnJvbSAnLi9Db25uZWN0aW9uRGV0YWlsc1Byb21wdCc7XG5pbXBvcnQgSW5kZXRlcm1pbmF0ZVByb2dyZXNzQmFyIGZyb20gJy4vSW5kZXRlcm1pbmF0ZVByb2dyZXNzQmFyJztcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge1xuICBTc2hIYW5kc2hha2UsXG4gIGRlY29yYXRlU3NoQ29ubmVjdGlvbkRlbGVnYXRlV2l0aFRyYWNraW5nLFxufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5cbnR5cGUgRGVmYXVsdFByb3BzID0ge307XG50eXBlIFByb3BzID0ge1xuICAvLyBUaGUgbGlzdCBvZiBjb25uZWN0aW9uIHByb2ZpbGVzIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQuXG4gIGNvbm5lY3Rpb25Qcm9maWxlczogP0FycmF5PE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZT47XG4gIC8vIElmIHRoZXJlIGlzID49IDEgY29ubmVjdGlvbiBwcm9maWxlLCB0aGlzIGluZGV4IGluZGljYXRlcyB0aGUgaW5pdGlhbFxuICAvLyBwcm9maWxlIHRvIHVzZS5cbiAgaW5kZXhPZkluaXRpYWxseVNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU6ID9udW1iZXI7XG4gIC8vIEZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIFwiK1wiIGJ1dHRvbiBvbiB0aGUgcHJvZmlsZXMgbGlzdCBpcyBjbGlja2VkLlxuICAvLyBUaGUgdXNlcidzIGludGVudCBpcyB0byBjcmVhdGUgYSBuZXcgcHJvZmlsZS5cbiAgb25BZGRQcm9maWxlQ2xpY2tlZDogKCkgPT4gbWl4ZWQ7XG4gIC8vIEZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIFwiLVwiIGJ1dHRvbiBvbiB0aGUgcHJvZmlsZXMgbGlzdCBpcyBjbGlja2VkXG4gIC8vICoqIHdoaWxlIGEgcHJvZmlsZSBpcyBzZWxlY3RlZCAqKi5cbiAgLy8gVGhlIHVzZXIncyBpbnRlbnQgaXMgdG8gZGVsZXRlIHRoZSBjdXJyZW50bHktc2VsZWN0ZWQgcHJvZmlsZS5cbiAgb25EZWxldGVQcm9maWxlQ2xpY2tlZDogKGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiBudW1iZXIpID0+IG1peGVkO1xuICBvbkNvbm5lY3Q6ICgpID0+IG1peGVkO1xuICBvbkVycm9yOiAoKSA9PiBtaXhlZDtcbiAgb25DYW5jZWw6ICgpID0+IG1peGVkO1xuICBvbkNsb3NlZDogPygpID0+IG1peGVkO1xufTtcbnR5cGUgU3RhdGUgPSB7XG4gIG1vZGU6IG51bWJlcjtcbiAgaW5zdHJ1Y3Rpb25zOiBzdHJpbmc7XG4gIHNzaEhhbmRzaGFrZTogU3NoSGFuZHNoYWtlO1xuICBmaW5pc2g6IChhbnN3ZXJzOiBBcnJheTxzdHJpbmc+KSA9PiBtaXhlZDtcbn07XG5cbmNvbnN0IFJFUVVFU1RfQ09OTkVDVElPTl9ERVRBSUxTID0gMTtcbmNvbnN0IFdBSVRJTkdfRk9SX0NPTk5FQ1RJT04gPSAyO1xuY29uc3QgUkVRVUVTVF9BVVRIRU5USUNBVElPTl9ERVRBSUxTID0gMztcbmNvbnN0IFdBSVRJTkdfRk9SX0FVVEhFTlRJQ0FUSU9OID0gNDtcblxuLyoqXG4gKiBDb21wb25lbnQgdGhhdCBtYW5hZ2VzIHRoZSBzdGF0ZSB0cmFuc2l0aW9ucyBhcyB0aGUgdXNlciBjb25uZWN0cyB0byBhXG4gKiBzZXJ2ZXIuXG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbm5lY3Rpb25EaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8RGVmYXVsdFByb3BzLCBQcm9wcywgU3RhdGU+IHtcbiAgX2JvdW5kT2s6ICgpID0+IHZvaWQ7XG4gIF9ib3VuZENhbmNlbDogKCkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHRoaXMuX2NyZWF0ZUluaXRpYWxTdGF0ZSgpO1xuICAgIHRoaXMuX2JvdW5kT2sgPSB0aGlzLm9rLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYm91bmRDYW5jZWwgPSB0aGlzLmNhbmNlbC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgX2NyZWF0ZUluaXRpYWxTdGF0ZSgpOiBTdGF0ZSB7XG4gICAgY29uc3Qgc3NoSGFuZHNoYWtlID0gbmV3IFNzaEhhbmRzaGFrZShkZWNvcmF0ZVNzaENvbm5lY3Rpb25EZWxlZ2F0ZVdpdGhUcmFja2luZyh7XG4gICAgICBvbktleWJvYXJkSW50ZXJhY3RpdmU6IChuYW1lLCBpbnN0cnVjdGlvbnMsIGluc3RydWN0aW9uc0xhbmcsIHByb21wdHMsIGZpbmlzaCkgID0+IHtcbiAgICAgICAgLy8gVE9ETzogRGlzcGxheSBhbGwgcHJvbXB0cywgbm90IGp1c3QgdGhlIGZpcnN0IG9uZS5cbiAgICAgICAgdGhpcy5yZXF1ZXN0QXV0aGVudGljYXRpb24ocHJvbXB0c1swXSwgZmluaXNoKTtcbiAgICAgIH0sXG5cbiAgICAgIG9uV2lsbENvbm5lY3Q6KCkgPT4ge30sXG5cbiAgICAgIG9uRGlkQ29ubmVjdDogKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24sIGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pID0+IHtcbiAgICAgICAgdGhpcy5jbG9zZSgpOyAvLyBDbG9zZSB0aGUgZGlhbG9nLlxuICAgICAgICB0aGlzLnByb3BzLm9uQ29ubmVjdChjb25uZWN0aW9uLCBjb25maWcpO1xuICAgICAgfSxcblxuICAgICAgb25FcnJvcjogKFxuICAgICAgICBlcnJvclR5cGU6IFNzaEhhbmRzaGFrZUVycm9yVHlwZSxcbiAgICAgICAgZXJyb3I6IEVycm9yLFxuICAgICAgICBjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uLFxuICAgICAgKSA9PiB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTsgLy8gQ2xvc2UgdGhlIGRpYWxvZy5cbiAgICAgICAgbm90aWZ5U3NoSGFuZHNoYWtlRXJyb3IoZXJyb3JUeXBlLCBlcnJvciwgY29uZmlnKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkVycm9yKGVycm9yLCBjb25maWcpO1xuICAgICAgICBsb2dnZXIuZGVidWcoZXJyb3IpO1xuICAgICAgfSxcbiAgICB9KSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbW9kZTogUkVRVUVTVF9DT05ORUNUSU9OX0RFVEFJTFMsXG4gICAgICBpbnN0cnVjdGlvbnM6ICcnLFxuICAgICAgc3NoSGFuZHNoYWtlOiBzc2hIYW5kc2hha2UsXG4gICAgICBmaW5pc2g6IChhbnN3ZXJzKSA9PiB7fSxcbiAgICB9O1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgbW9kZSA9IHRoaXMuc3RhdGUubW9kZTtcbiAgICBsZXQgY29udGVudDtcbiAgICBsZXQgaXNPa0Rpc2FibGVkO1xuICAgIGlmIChtb2RlID09PSBSRVFVRVNUX0NPTk5FQ1RJT05fREVUQUlMUykge1xuICAgICAgY29udGVudCA9IChcbiAgICAgICAgPENvbm5lY3Rpb25EZXRhaWxzUHJvbXB0XG4gICAgICAgICAgcmVmPVwiY29ubmVjdGlvbi1kZXRhaWxzXCJcbiAgICAgICAgICBjb25uZWN0aW9uUHJvZmlsZXM9e3RoaXMucHJvcHMuY29ubmVjdGlvblByb2ZpbGVzfVxuICAgICAgICAgIGluZGV4T2ZJbml0aWFsbHlTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlPVxuICAgICAgICAgICAge3RoaXMucHJvcHMuaW5kZXhPZkluaXRpYWxseVNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGV9XG4gICAgICAgICAgb25BZGRQcm9maWxlQ2xpY2tlZD17dGhpcy5wcm9wcy5vbkFkZFByb2ZpbGVDbGlja2VkfVxuICAgICAgICAgIG9uRGVsZXRlUHJvZmlsZUNsaWNrZWQ9e3RoaXMucHJvcHMub25EZWxldGVQcm9maWxlQ2xpY2tlZH1cbiAgICAgICAgICBvbkNvbmZpcm09e3RoaXMuX2JvdW5kT2t9XG4gICAgICAgICAgb25DYW5jZWw9e3RoaXMuX2JvdW5kQ2FuY2VsfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICAgIGlzT2tEaXNhYmxlZCA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PT0gV0FJVElOR19GT1JfQ09OTkVDVElPTiB8fCBtb2RlID09PSBXQUlUSU5HX0ZPUl9BVVRIRU5USUNBVElPTikge1xuICAgICAgY29udGVudCA9IDxJbmRldGVybWluYXRlUHJvZ3Jlc3NCYXIgLz47XG4gICAgICBpc09rRGlzYWJsZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZW50ID0gKFxuICAgICAgICA8QXV0aGVudGljYXRpb25Qcm9tcHQgcmVmPVwiYXV0aGVudGljYXRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb25zPXt0aGlzLnN0YXRlLmluc3RydWN0aW9uc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ29uZmlybT17dGhpcy5fYm91bmRPa31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLl9ib3VuZENhbmNlbH1cbiAgICAgIC8+KTtcbiAgICAgIGlzT2tEaXNhYmxlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFRoZSByb290IGVsZW1lbnQgY2Fubm90IGhhdmUgYSAna2V5JyBwcm9wZXJ0eSwgc28gd2UgdXNlIGEgZHVtbXlcbiAgICAvLyA8ZGl2PiBhcyB0aGUgcm9vdC4gSWRlYWxseSwgdGhlIDxhdG9tLXBhbmVsPiB3b3VsZCBiZSB0aGUgcm9vdC5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGF0b20tcGFuZWwgY2xhc3M9XCJtb2RhbCBmcm9tLXRvcFwiIGtleT1cImNvbm5lY3QtZGlhbG9nXCI+XG4gICAgICAgICAge2NvbnRlbnR9XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJibG9jayBudWNsaWRlLW9rLWNhbmNlbFwiPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG5cIiBvbkNsaWNrPXt0aGlzLl9ib3VuZENhbmNlbH0+XG4gICAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeVwiIG9uQ2xpY2s9e3RoaXMuX2JvdW5kT2t9IGRpc2FibGVkPXtpc09rRGlzYWJsZWR9PlxuICAgICAgICAgICAgICBPS1xuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvYXRvbS1wYW5lbD5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBjYW5jZWwoKSB7XG4gICAgY29uc3QgbW9kZSA9IHRoaXMuc3RhdGUubW9kZTtcblxuICAgIC8vIEl0IGlzIHNhZmUgdG8gY2FsbCBjYW5jZWwgZXZlbiBpZiBubyBjb25uZWN0aW9uIGlzIHN0YXJ0ZWRcbiAgICB0aGlzLnN0YXRlLnNzaEhhbmRzaGFrZS5jYW5jZWwoKTtcblxuICAgIGlmIChtb2RlID09PSBXQUlUSU5HX0ZPUl9DT05ORUNUSU9OKSB7XG4gICAgICAvLyBUT0RPKG1pa2VvKTogVGVsbCBkZWxlZ2F0ZSB0byBjYW5jZWwgdGhlIGNvbm5lY3Rpb24gcmVxdWVzdC5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe21vZGU6IFJFUVVFU1RfQ09OTkVDVElPTl9ERVRBSUxTfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRPRE8obWlrZW8pOiBBbHNvIGNhbmNlbCBjb25uZWN0aW9uIHJlcXVlc3QsIGFzIGFwcHJvcHJpYXRlIGZvciBtb2RlP1xuICAgICAgdGhpcy5wcm9wcy5vbkNhbmNlbCgpO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uQ2xvc2VkKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQ2xvc2VkKCk7XG4gICAgfVxuICB9XG5cbiAgb2soKSB7XG4gICAgY29uc3QgbW9kZSA9IHRoaXMuc3RhdGUubW9kZTtcblxuICAgIGlmIChtb2RlID09PSBSRVFVRVNUX0NPTk5FQ1RJT05fREVUQUlMUykge1xuICAgICAgLy8gVXNlciBpcyB0cnlpbmcgdG8gc3VibWl0IGNvbm5lY3Rpb24gZGV0YWlscy5cbiAgICAgIGNvbnN0IGNvbm5lY3Rpb25EZXRhaWxzRm9ybSA9IHRoaXMucmVmc1snY29ubmVjdGlvbi1kZXRhaWxzJ107XG4gICAgICBjb25zdCB7XG4gICAgICAgIHVzZXJuYW1lLFxuICAgICAgICBzZXJ2ZXIsXG4gICAgICAgIGN3ZCxcbiAgICAgICAgcmVtb3RlU2VydmVyQ29tbWFuZCxcbiAgICAgICAgc3NoUG9ydCxcbiAgICAgICAgcGF0aFRvUHJpdmF0ZUtleSxcbiAgICAgICAgYXV0aE1ldGhvZCxcbiAgICAgICAgcGFzc3dvcmQsXG4gICAgICB9ID0gY29ubmVjdGlvbkRldGFpbHNGb3JtLmdldEZvcm1GaWVsZHMoKTtcbiAgICAgIGlmICh1c2VybmFtZSAmJiBzZXJ2ZXIgJiYgY3dkICYmIHJlbW90ZVNlcnZlckNvbW1hbmQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bW9kZTogV0FJVElOR19GT1JfQ09OTkVDVElPTn0pO1xuICAgICAgICB0aGlzLnN0YXRlLnNzaEhhbmRzaGFrZS5jb25uZWN0KHtcbiAgICAgICAgICBob3N0OiBzZXJ2ZXIsXG4gICAgICAgICAgc3NoUG9ydCxcbiAgICAgICAgICB1c2VybmFtZSxcbiAgICAgICAgICBwYXRoVG9Qcml2YXRlS2V5LFxuICAgICAgICAgIGF1dGhNZXRob2QsXG4gICAgICAgICAgY3dkLFxuICAgICAgICAgIHJlbW90ZVNlcnZlckNvbW1hbmQsXG4gICAgICAgICAgcGFzc3dvcmQsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVE9ETyhtYm9saW4pOiBUZWxsIHVzZXIgdG8gZmlsbCBvdXQgYWxsIG9mIHRoZSBmaWVsZHMuXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChtb2RlID09PSBSRVFVRVNUX0FVVEhFTlRJQ0FUSU9OX0RFVEFJTFMpIHtcbiAgICAgIGNvbnN0IGF1dGhlbnRpY2F0aW9uUHJvbXB0ID0gdGhpcy5yZWZzWydhdXRoZW50aWNhdGlvbiddO1xuICAgICAgY29uc3QgcGFzc3dvcmQgPSBhdXRoZW50aWNhdGlvblByb21wdC5nZXRQYXNzd29yZCgpO1xuXG4gICAgICB0aGlzLnN0YXRlLmZpbmlzaChbcGFzc3dvcmRdKTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7bW9kZTogV0FJVElOR19GT1JfQVVUSEVOVElDQVRJT059KTtcbiAgICB9XG4gIH1cblxuICByZXF1ZXN0QXV0aGVudGljYXRpb24oXG4gICAgaW5zdHJ1Y3Rpb25zOiB7ZWNobzogYm9vbGVhbjsgcHJvbXB0OiBzdHJpbmd9LFxuICAgIGZpbmlzaDogKGFuc3dlcnM6IEFycmF5PHN0cmluZz4pID0+IHZvaWRcbiAgKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBtb2RlOiBSRVFVRVNUX0FVVEhFTlRJQ0FUSU9OX0RFVEFJTFMsXG4gICAgICBpbnN0cnVjdGlvbnM6IGluc3RydWN0aW9ucy5wcm9tcHQsXG4gICAgICBmaW5pc2gsXG4gICAgfSk7XG4gIH1cblxuICBnZXRGb3JtRmllbGRzKCk6ID9OdWNsaWRlUmVtb3RlQ29ubmVjdGlvblBhcmFtcyB7XG4gICAgY29uc3QgY29ubmVjdGlvbkRldGFpbHNGb3JtID0gdGhpcy5yZWZzWydjb25uZWN0aW9uLWRldGFpbHMnXTtcbiAgICBpZiAoIWNvbm5lY3Rpb25EZXRhaWxzRm9ybSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgc2VydmVyLFxuICAgICAgY3dkLFxuICAgICAgcmVtb3RlU2VydmVyQ29tbWFuZCxcbiAgICAgIHNzaFBvcnQsXG4gICAgICBwYXRoVG9Qcml2YXRlS2V5LFxuICAgICAgYXV0aE1ldGhvZCxcbiAgICB9ID0gY29ubmVjdGlvbkRldGFpbHNGb3JtLmdldEZvcm1GaWVsZHMoKTtcbiAgICByZXR1cm4ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICBzZXJ2ZXIsXG4gICAgICBjd2QsXG4gICAgICByZW1vdGVTZXJ2ZXJDb21tYW5kLFxuICAgICAgc3NoUG9ydCxcbiAgICAgIHBhdGhUb1ByaXZhdGVLZXksXG4gICAgICBhdXRoTWV0aG9kLFxuICAgIH07XG4gIH1cbn1cbi8qIGVzbGludC1lbmFibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuIl19