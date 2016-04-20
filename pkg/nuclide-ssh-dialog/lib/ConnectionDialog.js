var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

var _nuclideRemoteConnection = require('../../nuclide-remote-connection');

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

var _nuclideUiLibButtonGroup = require('../../nuclide-ui/lib/ButtonGroup');

var logger = require('../../nuclide-logging').getLogger();

var REQUEST_CONNECTION_DETAILS = 1;
var WAITING_FOR_CONNECTION = 2;
var REQUEST_AUTHENTICATION_DETAILS = 3;
var WAITING_FOR_AUTHENTICATION = 4;

/**
 * Component that manages the state transitions as the user connects to a
 * server.
 */

var ConnectionDialog = (function (_React$Component) {
  _inherits(ConnectionDialog, _React$Component);

  _createClass(ConnectionDialog, null, [{
    key: 'defaultProps',
    value: {
      indexOfInitiallySelectedConnectionProfile: -1
    },
    enumerable: true
  }]);

  function ConnectionDialog(props) {
    var _this = this;

    _classCallCheck(this, ConnectionDialog);

    _get(Object.getPrototypeOf(ConnectionDialog.prototype), 'constructor', this).call(this, props);

    var sshHandshake = new _nuclideRemoteConnection.SshHandshake((0, _nuclideRemoteConnection.decorateSshConnectionDelegateWithTracking)({
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

    this.state = {
      finish: function finish(answers) {},
      indexOfSelectedConnectionProfile: props.indexOfInitiallySelectedConnectionProfile,
      instructions: '',
      mode: REQUEST_CONNECTION_DETAILS,
      sshHandshake: sshHandshake
    };

    this.cancel = this.cancel.bind(this);
    this.ok = this.ok.bind(this);
    this.onProfileClicked = this.onProfileClicked.bind(this);
  }

  _createClass(ConnectionDialog, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var indexOfSelectedConnectionProfile = this.state.indexOfSelectedConnectionProfile;
      if (nextProps.connectionProfiles == null) {
        indexOfSelectedConnectionProfile = -1;
      } else if (this.props.connectionProfiles == null
      // The current selection is outside the bounds of the next profiles list
       || indexOfSelectedConnectionProfile > nextProps.connectionProfiles.length - 1
      // The next profiles list is longer than before, a new one was added
       || nextProps.connectionProfiles.length > this.props.connectionProfiles.length) {
        // Select the final connection profile in the list because one of the above conditions means
        // the current selected index is outdated.
        indexOfSelectedConnectionProfile = nextProps.connectionProfiles.length - 1;
      }

      this.setState({ indexOfSelectedConnectionProfile: indexOfSelectedConnectionProfile });
    }
  }, {
    key: 'render',
    value: function render() {
      var mode = this.state.mode;
      var content = undefined;
      var isOkDisabled = undefined;
      var okButtonText = undefined;

      if (mode === REQUEST_CONNECTION_DETAILS) {
        content = _reactForAtom.React.createElement(_ConnectionDetailsPrompt2['default'], {
          ref: 'connection-details',
          connectionProfiles: this.props.connectionProfiles,
          indexOfSelectedConnectionProfile: this.state.indexOfSelectedConnectionProfile,
          onAddProfileClicked: this.props.onAddProfileClicked,
          onDeleteProfileClicked: this.props.onDeleteProfileClicked,
          onConfirm: this.ok,
          onCancel: this.cancel,
          onProfileClicked: this.onProfileClicked
        });
        isOkDisabled = false;
        okButtonText = 'Connect';
      } else if (mode === WAITING_FOR_CONNECTION || mode === WAITING_FOR_AUTHENTICATION) {
        content = _reactForAtom.React.createElement(_IndeterminateProgressBar2['default'], null);
        isOkDisabled = true;
        okButtonText = 'Connect';
      } else {
        content = _reactForAtom.React.createElement(_AuthenticationPrompt2['default'], {
          ref: 'authentication',
          instructions: this.state.instructions,
          onConfirm: this.ok,
          onCancel: this.cancel
        });
        isOkDisabled = false;
        okButtonText = 'OK';
      }

      return _reactForAtom.React.createElement(
        'atom-panel',
        { 'class': 'modal modal-lg from-top' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'padded' },
          content
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'padded text-right' },
          _reactForAtom.React.createElement(
            _nuclideUiLibButtonGroup.ButtonGroup,
            null,
            _reactForAtom.React.createElement(
              _nuclideUiLibButton.Button,
              { onClick: this.cancel },
              'Cancel'
            ),
            _reactForAtom.React.createElement(
              _nuclideUiLibButton.Button,
              { buttonType: _nuclideUiLibButton.ButtonTypes.PRIMARY, onClick: this.ok, disabled: isOkDisabled },
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
      var _state = this.state;
      var indexOfSelectedConnectionProfile = _state.indexOfSelectedConnectionProfile;
      var mode = _state.mode;
      var connectionProfiles = this.props.connectionProfiles;

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

        var displayTitle = '';
        if (connectionProfiles != null && indexOfSelectedConnectionProfile > -1) {
          displayTitle = connectionProfiles[indexOfSelectedConnectionProfile].displayTitle;
        }

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
            password: password,
            displayTitle: displayTitle
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
  }, {
    key: 'onProfileClicked',
    value: function onProfileClicked(indexOfSelectedConnectionProfile) {
      this.setState({ indexOfSelectedConnectionProfile: indexOfSelectedConnectionProfile });
    }
  }]);

  return ConnectionDialog;
})(_reactForAtom.React.Component);

module.exports = ConnectionDialog;

// The list of connection profiles that will be displayed.

// If there is >= 1 connection profile, this index indicates the initial
// profile to use.

// Function that is called when the "+" button on the profiles list is clicked.
// The user's intent is to create a new profile.

// Function that is called when the "-" button on the profiles list is clicked
// ** while a profile is selected **.
// The user's intent is to delete the currently-selected profile.
//# sourceMappingURL=data:application/json;base64,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R0FBRyx5Q0FBSCxHQUFHO1VBQ0gsbUJBQW1CLHlDQUFuQixtQkFBbUI7VUFDbkIsT0FBTyx5Q0FBUCxPQUFPO1VBQ1AsZ0JBQWdCLHlDQUFoQixnQkFBZ0I7VUFDaEIsVUFBVSx5Q0FBVixVQUFVOztBQUVaLGFBQU87QUFDTCxnQkFBUSxFQUFSLFFBQVE7QUFDUixjQUFNLEVBQU4sTUFBTTtBQUNOLFdBQUcsRUFBSCxHQUFHO0FBQ0gsMkJBQW1CLEVBQW5CLG1CQUFtQjtBQUNuQixlQUFPLEVBQVAsT0FBTztBQUNQLHdCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsa0JBQVUsRUFBVixVQUFVO09BQ1gsQ0FBQztLQUNIOzs7V0FFZSwwQkFBQyxnQ0FBd0MsRUFBUTtBQUMvRCxVQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsZ0NBQWdDLEVBQWhDLGdDQUFnQyxFQUFDLENBQUMsQ0FBQztLQUNuRDs7O1NBaFBHLGdCQUFnQjtHQUFTLG9CQUFNLFNBQVM7O0FBbVA5QyxNQUFNLENBQUMsT0FBTyxHQUFHLGdCQUFnQixDQUFDIiwiZmlsZSI6IkNvbm5lY3Rpb25EaWFsb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUGFyYW1zLFxuICBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGUsXG59IGZyb20gJy4vY29ubmVjdGlvbi10eXBlcyc7XG5cbmltcG9ydCB0eXBlIHtcbiAgU3NoSGFuZHNoYWtlRXJyb3JUeXBlLFxuICBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbixcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY29ubmVjdGlvbi9saWIvU3NoSGFuZHNoYWtlJztcblxuaW1wb3J0IHR5cGUge1JlbW90ZUNvbm5lY3Rpb259IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLWNvbm5lY3Rpb24vbGliL1JlbW90ZUNvbm5lY3Rpb24nO1xuXG5pbXBvcnQge25vdGlmeVNzaEhhbmRzaGFrZUVycm9yfSBmcm9tICcuL25vdGlmaWNhdGlvbic7XG5pbXBvcnQgQXV0aGVudGljYXRpb25Qcm9tcHQgZnJvbSAnLi9BdXRoZW50aWNhdGlvblByb21wdCc7XG5pbXBvcnQgQ29ubmVjdGlvbkRldGFpbHNQcm9tcHQgZnJvbSAnLi9Db25uZWN0aW9uRGV0YWlsc1Byb21wdCc7XG5pbXBvcnQgSW5kZXRlcm1pbmF0ZVByb2dyZXNzQmFyIGZyb20gJy4vSW5kZXRlcm1pbmF0ZVByb2dyZXNzQmFyJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7XG4gIFNzaEhhbmRzaGFrZSxcbiAgZGVjb3JhdGVTc2hDb25uZWN0aW9uRGVsZWdhdGVXaXRoVHJhY2tpbmcsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLWNvbm5lY3Rpb24nO1xuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5pbXBvcnQge1xuICBCdXR0b24sXG4gIEJ1dHRvblR5cGVzLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9CdXR0b24nO1xuaW1wb3J0IHtcbiAgQnV0dG9uR3JvdXAsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0J1dHRvbkdyb3VwJztcblxudHlwZSBQcm9wcyA9IHtcbiAgLy8gVGhlIGxpc3Qgb2YgY29ubmVjdGlvbiBwcm9maWxlcyB0aGF0IHdpbGwgYmUgZGlzcGxheWVkLlxuICBjb25uZWN0aW9uUHJvZmlsZXM6ID9BcnJheTxOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGU+O1xuICAvLyBJZiB0aGVyZSBpcyA+PSAxIGNvbm5lY3Rpb24gcHJvZmlsZSwgdGhpcyBpbmRleCBpbmRpY2F0ZXMgdGhlIGluaXRpYWxcbiAgLy8gcHJvZmlsZSB0byB1c2UuXG4gIGluZGV4T2ZJbml0aWFsbHlTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiBudW1iZXI7XG4gIC8vIEZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIFwiK1wiIGJ1dHRvbiBvbiB0aGUgcHJvZmlsZXMgbGlzdCBpcyBjbGlja2VkLlxuICAvLyBUaGUgdXNlcidzIGludGVudCBpcyB0byBjcmVhdGUgYSBuZXcgcHJvZmlsZS5cbiAgb25BZGRQcm9maWxlQ2xpY2tlZDogKCkgPT4gbWl4ZWQ7XG4gIC8vIEZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIFwiLVwiIGJ1dHRvbiBvbiB0aGUgcHJvZmlsZXMgbGlzdCBpcyBjbGlja2VkXG4gIC8vICoqIHdoaWxlIGEgcHJvZmlsZSBpcyBzZWxlY3RlZCAqKi5cbiAgLy8gVGhlIHVzZXIncyBpbnRlbnQgaXMgdG8gZGVsZXRlIHRoZSBjdXJyZW50bHktc2VsZWN0ZWQgcHJvZmlsZS5cbiAgb25EZWxldGVQcm9maWxlQ2xpY2tlZDogKGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiBudW1iZXIpID0+IG1peGVkO1xuICBvbkNvbm5lY3Q6ICgpID0+IG1peGVkO1xuICBvbkVycm9yOiAoKSA9PiBtaXhlZDtcbiAgb25DYW5jZWw6ICgpID0+IG1peGVkO1xuICBvbkNsb3NlZDogPygpID0+IG1peGVkO1xufTtcblxudHlwZSBTdGF0ZSA9IHtcbiAgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU6IG51bWJlcjtcbiAgaW5zdHJ1Y3Rpb25zOiBzdHJpbmc7XG4gIGZpbmlzaDogKGFuc3dlcnM6IEFycmF5PHN0cmluZz4pID0+IG1peGVkO1xuICBtb2RlOiBudW1iZXI7XG4gIHNzaEhhbmRzaGFrZTogU3NoSGFuZHNoYWtlO1xufTtcblxuY29uc3QgUkVRVUVTVF9DT05ORUNUSU9OX0RFVEFJTFMgPSAxO1xuY29uc3QgV0FJVElOR19GT1JfQ09OTkVDVElPTiA9IDI7XG5jb25zdCBSRVFVRVNUX0FVVEhFTlRJQ0FUSU9OX0RFVEFJTFMgPSAzO1xuY29uc3QgV0FJVElOR19GT1JfQVVUSEVOVElDQVRJT04gPSA0O1xuXG4vKipcbiAqIENvbXBvbmVudCB0aGF0IG1hbmFnZXMgdGhlIHN0YXRlIHRyYW5zaXRpb25zIGFzIHRoZSB1c2VyIGNvbm5lY3RzIHRvIGFcbiAqIHNlcnZlci5cbiAqL1xuY2xhc3MgQ29ubmVjdGlvbkRpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcbiAgc3RhdGU6IFN0YXRlO1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgaW5kZXhPZkluaXRpYWxseVNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU6IC0xLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIGNvbnN0IHNzaEhhbmRzaGFrZSA9IG5ldyBTc2hIYW5kc2hha2UoZGVjb3JhdGVTc2hDb25uZWN0aW9uRGVsZWdhdGVXaXRoVHJhY2tpbmcoe1xuICAgICAgb25LZXlib2FyZEludGVyYWN0aXZlOiAobmFtZSwgaW5zdHJ1Y3Rpb25zLCBpbnN0cnVjdGlvbnNMYW5nLCBwcm9tcHRzLCBmaW5pc2gpICA9PiB7XG4gICAgICAgIC8vIFRPRE86IERpc3BsYXkgYWxsIHByb21wdHMsIG5vdCBqdXN0IHRoZSBmaXJzdCBvbmUuXG4gICAgICAgIHRoaXMucmVxdWVzdEF1dGhlbnRpY2F0aW9uKHByb21wdHNbMF0sIGZpbmlzaCk7XG4gICAgICB9LFxuXG4gICAgICBvbldpbGxDb25uZWN0OigpID0+IHt9LFxuXG4gICAgICBvbkRpZENvbm5lY3Q6IChjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uLCBjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uKSA9PiB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTsgLy8gQ2xvc2UgdGhlIGRpYWxvZy5cbiAgICAgICAgdGhpcy5wcm9wcy5vbkNvbm5lY3QoY29ubmVjdGlvbiwgY29uZmlnKTtcbiAgICAgIH0sXG5cbiAgICAgIG9uRXJyb3I6IChcbiAgICAgICAgZXJyb3JUeXBlOiBTc2hIYW5kc2hha2VFcnJvclR5cGUsXG4gICAgICAgIGVycm9yOiBFcnJvcixcbiAgICAgICAgY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbixcbiAgICAgICkgPT4ge1xuICAgICAgICB0aGlzLmNsb3NlKCk7IC8vIENsb3NlIHRoZSBkaWFsb2cuXG4gICAgICAgIG5vdGlmeVNzaEhhbmRzaGFrZUVycm9yKGVycm9yVHlwZSwgZXJyb3IsIGNvbmZpZyk7XG4gICAgICAgIHRoaXMucHJvcHMub25FcnJvcihlcnJvciwgY29uZmlnKTtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKGVycm9yKTtcbiAgICAgIH0sXG4gICAgfSkpO1xuXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGZpbmlzaDogYW5zd2VycyA9PiB7fSxcbiAgICAgIGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiBwcm9wcy5pbmRleE9mSW5pdGlhbGx5U2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZSxcbiAgICAgIGluc3RydWN0aW9uczogJycsXG4gICAgICBtb2RlOiBSRVFVRVNUX0NPTk5FQ1RJT05fREVUQUlMUyxcbiAgICAgIHNzaEhhbmRzaGFrZTogc3NoSGFuZHNoYWtlLFxuICAgIH07XG5cbiAgICAodGhpczogYW55KS5jYW5jZWwgPSB0aGlzLmNhbmNlbC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLm9rID0gdGhpcy5vay5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLm9uUHJvZmlsZUNsaWNrZWQgPSB0aGlzLm9uUHJvZmlsZUNsaWNrZWQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzOiBQcm9wcyk6IHZvaWQge1xuICAgIGxldCBpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZSA9IHRoaXMuc3RhdGUuaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU7XG4gICAgaWYgKG5leHRQcm9wcy5jb25uZWN0aW9uUHJvZmlsZXMgPT0gbnVsbCkge1xuICAgICAgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGUgPSAtMTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdGhpcy5wcm9wcy5jb25uZWN0aW9uUHJvZmlsZXMgPT0gbnVsbFxuICAgICAgLy8gVGhlIGN1cnJlbnQgc2VsZWN0aW9uIGlzIG91dHNpZGUgdGhlIGJvdW5kcyBvZiB0aGUgbmV4dCBwcm9maWxlcyBsaXN0XG4gICAgICB8fCBpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZSA+IChuZXh0UHJvcHMuY29ubmVjdGlvblByb2ZpbGVzLmxlbmd0aCAtIDEpXG4gICAgICAvLyBUaGUgbmV4dCBwcm9maWxlcyBsaXN0IGlzIGxvbmdlciB0aGFuIGJlZm9yZSwgYSBuZXcgb25lIHdhcyBhZGRlZFxuICAgICAgfHwgbmV4dFByb3BzLmNvbm5lY3Rpb25Qcm9maWxlcy5sZW5ndGggPiB0aGlzLnByb3BzLmNvbm5lY3Rpb25Qcm9maWxlcy5sZW5ndGhcbiAgICApIHtcbiAgICAgIC8vIFNlbGVjdCB0aGUgZmluYWwgY29ubmVjdGlvbiBwcm9maWxlIGluIHRoZSBsaXN0IGJlY2F1c2Ugb25lIG9mIHRoZSBhYm92ZSBjb25kaXRpb25zIG1lYW5zXG4gICAgICAvLyB0aGUgY3VycmVudCBzZWxlY3RlZCBpbmRleCBpcyBvdXRkYXRlZC5cbiAgICAgIGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlID0gbmV4dFByb3BzLmNvbm5lY3Rpb25Qcm9maWxlcy5sZW5ndGggLSAxO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe2luZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlfSk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgY29uc3QgbW9kZSA9IHRoaXMuc3RhdGUubW9kZTtcbiAgICBsZXQgY29udGVudDtcbiAgICBsZXQgaXNPa0Rpc2FibGVkO1xuICAgIGxldCBva0J1dHRvblRleHQ7XG5cbiAgICBpZiAobW9kZSA9PT0gUkVRVUVTVF9DT05ORUNUSU9OX0RFVEFJTFMpIHtcbiAgICAgIGNvbnRlbnQgPSAoXG4gICAgICAgIDxDb25uZWN0aW9uRGV0YWlsc1Byb21wdFxuICAgICAgICAgIHJlZj1cImNvbm5lY3Rpb24tZGV0YWlsc1wiXG4gICAgICAgICAgY29ubmVjdGlvblByb2ZpbGVzPXt0aGlzLnByb3BzLmNvbm5lY3Rpb25Qcm9maWxlc31cbiAgICAgICAgICBpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZT17dGhpcy5zdGF0ZS5pbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZX1cbiAgICAgICAgICBvbkFkZFByb2ZpbGVDbGlja2VkPXt0aGlzLnByb3BzLm9uQWRkUHJvZmlsZUNsaWNrZWR9XG4gICAgICAgICAgb25EZWxldGVQcm9maWxlQ2xpY2tlZD17dGhpcy5wcm9wcy5vbkRlbGV0ZVByb2ZpbGVDbGlja2VkfVxuICAgICAgICAgIG9uQ29uZmlybT17dGhpcy5va31cbiAgICAgICAgICBvbkNhbmNlbD17dGhpcy5jYW5jZWx9XG4gICAgICAgICAgb25Qcm9maWxlQ2xpY2tlZD17dGhpcy5vblByb2ZpbGVDbGlja2VkfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICAgIGlzT2tEaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgb2tCdXR0b25UZXh0ID0gJ0Nvbm5lY3QnO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PT0gV0FJVElOR19GT1JfQ09OTkVDVElPTiB8fCBtb2RlID09PSBXQUlUSU5HX0ZPUl9BVVRIRU5USUNBVElPTikge1xuICAgICAgY29udGVudCA9IDxJbmRldGVybWluYXRlUHJvZ3Jlc3NCYXIgLz47XG4gICAgICBpc09rRGlzYWJsZWQgPSB0cnVlO1xuICAgICAgb2tCdXR0b25UZXh0ID0gJ0Nvbm5lY3QnO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZW50ID0gKFxuICAgICAgICA8QXV0aGVudGljYXRpb25Qcm9tcHRcbiAgICAgICAgICByZWY9XCJhdXRoZW50aWNhdGlvblwiXG4gICAgICAgICAgaW5zdHJ1Y3Rpb25zPXt0aGlzLnN0YXRlLmluc3RydWN0aW9uc31cbiAgICAgICAgICBvbkNvbmZpcm09e3RoaXMub2t9XG4gICAgICAgICAgb25DYW5jZWw9e3RoaXMuY2FuY2VsfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICAgIGlzT2tEaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgb2tCdXR0b25UZXh0ID0gJ09LJztcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGF0b20tcGFuZWwgY2xhc3M9XCJtb2RhbCBtb2RhbC1sZyBmcm9tLXRvcFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZGRlZFwiPlxuICAgICAgICAgIHtjb250ZW50fVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYWRkZWQgdGV4dC1yaWdodFwiPlxuICAgICAgICAgIDxCdXR0b25Hcm91cD5cbiAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17dGhpcy5jYW5jZWx9PlxuICAgICAgICAgICAgICBDYW5jZWxcbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgPEJ1dHRvbiBidXR0b25UeXBlPXtCdXR0b25UeXBlcy5QUklNQVJZfSBvbkNsaWNrPXt0aGlzLm9rfSBkaXNhYmxlZD17aXNPa0Rpc2FibGVkfT5cbiAgICAgICAgICAgICAge29rQnV0dG9uVGV4dH1cbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvQnV0dG9uR3JvdXA+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9hdG9tLXBhbmVsPlxuICAgICk7XG4gIH1cblxuICBjYW5jZWwoKSB7XG4gICAgY29uc3QgbW9kZSA9IHRoaXMuc3RhdGUubW9kZTtcblxuICAgIC8vIEl0IGlzIHNhZmUgdG8gY2FsbCBjYW5jZWwgZXZlbiBpZiBubyBjb25uZWN0aW9uIGlzIHN0YXJ0ZWRcbiAgICB0aGlzLnN0YXRlLnNzaEhhbmRzaGFrZS5jYW5jZWwoKTtcblxuICAgIGlmIChtb2RlID09PSBXQUlUSU5HX0ZPUl9DT05ORUNUSU9OKSB7XG4gICAgICAvLyBUT0RPKG1pa2VvKTogVGVsbCBkZWxlZ2F0ZSB0byBjYW5jZWwgdGhlIGNvbm5lY3Rpb24gcmVxdWVzdC5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe21vZGU6IFJFUVVFU1RfQ09OTkVDVElPTl9ERVRBSUxTfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRPRE8obWlrZW8pOiBBbHNvIGNhbmNlbCBjb25uZWN0aW9uIHJlcXVlc3QsIGFzIGFwcHJvcHJpYXRlIGZvciBtb2RlP1xuICAgICAgdGhpcy5wcm9wcy5vbkNhbmNlbCgpO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uQ2xvc2VkKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQ2xvc2VkKCk7XG4gICAgfVxuICB9XG5cbiAgb2soKSB7XG4gICAgY29uc3Qge1xuICAgICAgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGUsXG4gICAgICBtb2RlLFxuICAgIH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgY29uc3Qge1xuICAgICAgY29ubmVjdGlvblByb2ZpbGVzLFxuICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgaWYgKG1vZGUgPT09IFJFUVVFU1RfQ09OTkVDVElPTl9ERVRBSUxTKSB7XG4gICAgICAvLyBVc2VyIGlzIHRyeWluZyB0byBzdWJtaXQgY29ubmVjdGlvbiBkZXRhaWxzLlxuICAgICAgY29uc3QgY29ubmVjdGlvbkRldGFpbHNGb3JtID0gdGhpcy5yZWZzWydjb25uZWN0aW9uLWRldGFpbHMnXTtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgdXNlcm5hbWUsXG4gICAgICAgIHNlcnZlcixcbiAgICAgICAgY3dkLFxuICAgICAgICByZW1vdGVTZXJ2ZXJDb21tYW5kLFxuICAgICAgICBzc2hQb3J0LFxuICAgICAgICBwYXRoVG9Qcml2YXRlS2V5LFxuICAgICAgICBhdXRoTWV0aG9kLFxuICAgICAgICBwYXNzd29yZCxcbiAgICAgIH0gPSBjb25uZWN0aW9uRGV0YWlsc0Zvcm0uZ2V0Rm9ybUZpZWxkcygpO1xuXG4gICAgICBsZXQgZGlzcGxheVRpdGxlID0gJyc7XG4gICAgICBpZiAoY29ubmVjdGlvblByb2ZpbGVzICE9IG51bGwgJiYgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGUgPiAtMSkge1xuICAgICAgICAoe2Rpc3BsYXlUaXRsZX0gPSBjb25uZWN0aW9uUHJvZmlsZXNbaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGVdKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHVzZXJuYW1lICYmIHNlcnZlciAmJiBjd2QgJiYgcmVtb3RlU2VydmVyQ29tbWFuZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHttb2RlOiBXQUlUSU5HX0ZPUl9DT05ORUNUSU9OfSk7XG4gICAgICAgIHRoaXMuc3RhdGUuc3NoSGFuZHNoYWtlLmNvbm5lY3Qoe1xuICAgICAgICAgIGhvc3Q6IHNlcnZlcixcbiAgICAgICAgICBzc2hQb3J0LFxuICAgICAgICAgIHVzZXJuYW1lLFxuICAgICAgICAgIHBhdGhUb1ByaXZhdGVLZXksXG4gICAgICAgICAgYXV0aE1ldGhvZCxcbiAgICAgICAgICBjd2QsXG4gICAgICAgICAgcmVtb3RlU2VydmVyQ29tbWFuZCxcbiAgICAgICAgICBwYXNzd29yZCxcbiAgICAgICAgICBkaXNwbGF5VGl0bGUsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVE9ETyhtYm9saW4pOiBUZWxsIHVzZXIgdG8gZmlsbCBvdXQgYWxsIG9mIHRoZSBmaWVsZHMuXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChtb2RlID09PSBSRVFVRVNUX0FVVEhFTlRJQ0FUSU9OX0RFVEFJTFMpIHtcbiAgICAgIGNvbnN0IGF1dGhlbnRpY2F0aW9uUHJvbXB0ID0gdGhpcy5yZWZzWydhdXRoZW50aWNhdGlvbiddO1xuICAgICAgY29uc3QgcGFzc3dvcmQgPSBhdXRoZW50aWNhdGlvblByb21wdC5nZXRQYXNzd29yZCgpO1xuXG4gICAgICB0aGlzLnN0YXRlLmZpbmlzaChbcGFzc3dvcmRdKTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7bW9kZTogV0FJVElOR19GT1JfQVVUSEVOVElDQVRJT059KTtcbiAgICB9XG4gIH1cblxuICByZXF1ZXN0QXV0aGVudGljYXRpb24oXG4gICAgaW5zdHJ1Y3Rpb25zOiB7ZWNobzogYm9vbGVhbjsgcHJvbXB0OiBzdHJpbmd9LFxuICAgIGZpbmlzaDogKGFuc3dlcnM6IEFycmF5PHN0cmluZz4pID0+IHZvaWRcbiAgKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBtb2RlOiBSRVFVRVNUX0FVVEhFTlRJQ0FUSU9OX0RFVEFJTFMsXG4gICAgICBpbnN0cnVjdGlvbnM6IGluc3RydWN0aW9ucy5wcm9tcHQsXG4gICAgICBmaW5pc2gsXG4gICAgfSk7XG4gIH1cblxuICBnZXRGb3JtRmllbGRzKCk6ID9OdWNsaWRlUmVtb3RlQ29ubmVjdGlvblBhcmFtcyB7XG4gICAgY29uc3QgY29ubmVjdGlvbkRldGFpbHNGb3JtID0gdGhpcy5yZWZzWydjb25uZWN0aW9uLWRldGFpbHMnXTtcbiAgICBpZiAoIWNvbm5lY3Rpb25EZXRhaWxzRm9ybSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgc2VydmVyLFxuICAgICAgY3dkLFxuICAgICAgcmVtb3RlU2VydmVyQ29tbWFuZCxcbiAgICAgIHNzaFBvcnQsXG4gICAgICBwYXRoVG9Qcml2YXRlS2V5LFxuICAgICAgYXV0aE1ldGhvZCxcbiAgICB9ID0gY29ubmVjdGlvbkRldGFpbHNGb3JtLmdldEZvcm1GaWVsZHMoKTtcbiAgICByZXR1cm4ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICBzZXJ2ZXIsXG4gICAgICBjd2QsXG4gICAgICByZW1vdGVTZXJ2ZXJDb21tYW5kLFxuICAgICAgc3NoUG9ydCxcbiAgICAgIHBhdGhUb1ByaXZhdGVLZXksXG4gICAgICBhdXRoTWV0aG9kLFxuICAgIH07XG4gIH1cblxuICBvblByb2ZpbGVDbGlja2VkKGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZX0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29ubmVjdGlvbkRpYWxvZztcbiJdfQ==