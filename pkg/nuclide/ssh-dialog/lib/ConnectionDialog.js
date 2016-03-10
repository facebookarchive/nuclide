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

  /* eslint-enable react/prop-types */

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
            'div',
            { className: 'btn-group' },
            _reactForAtom.React.createElement(
              'button',
              { className: 'btn', onClick: this.cancel },
              'Cancel'
            ),
            _reactForAtom.React.createElement(
              'button',
              { className: 'btn btn-primary', onClick: this.ok, disabled: isOkDisabled },
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
        if (indexOfSelectedConnectionProfile > -1) {
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
//# sourceMappingURL=data:application/json;base64,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LG1CQUFtQix5Q0FBbkIsbUJBQW1CO1VBQ25CLE9BQU8seUNBQVAsT0FBTztVQUNQLGdCQUFnQix5Q0FBaEIsZ0JBQWdCO1VBQ2hCLFVBQVUseUNBQVYsVUFBVTs7QUFFWixhQUFPO0FBQ0wsZ0JBQVEsRUFBUixRQUFRO0FBQ1IsY0FBTSxFQUFOLE1BQU07QUFDTixXQUFHLEVBQUgsR0FBRztBQUNILDJCQUFtQixFQUFuQixtQkFBbUI7QUFDbkIsZUFBTyxFQUFQLE9BQU87QUFDUCx3QkFBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLGtCQUFVLEVBQVYsVUFBVTtPQUNYLENBQUM7S0FDSDs7O1dBRWUsMEJBQUMsZ0NBQXdDLEVBQVE7QUFDL0QsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLGdDQUFnQyxFQUFoQyxnQ0FBZ0MsRUFBQyxDQUFDLENBQUM7S0FDbkQ7OztTQS9PRyxnQkFBZ0I7R0FBUyxvQkFBTSxTQUFTOztBQW1QOUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyIsImZpbGUiOiJDb25uZWN0aW9uRGlhbG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblBhcmFtcyxcbiAgTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25Qcm9maWxlLFxufSBmcm9tICcuL2Nvbm5lY3Rpb24tdHlwZXMnO1xuXG5pbXBvcnQgdHlwZSB7XG4gIFNzaEhhbmRzaGFrZUVycm9yVHlwZSxcbiAgU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24sXG59IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uL2xpYi9Tc2hIYW5kc2hha2UnO1xuXG5pbXBvcnQgdHlwZSB7UmVtb3RlQ29ubmVjdGlvbn0gZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24vbGliL1JlbW90ZUNvbm5lY3Rpb24nO1xuXG5pbXBvcnQge25vdGlmeVNzaEhhbmRzaGFrZUVycm9yfSBmcm9tICcuL25vdGlmaWNhdGlvbic7XG5pbXBvcnQgQXV0aGVudGljYXRpb25Qcm9tcHQgZnJvbSAnLi9BdXRoZW50aWNhdGlvblByb21wdCc7XG5pbXBvcnQgQ29ubmVjdGlvbkRldGFpbHNQcm9tcHQgZnJvbSAnLi9Db25uZWN0aW9uRGV0YWlsc1Byb21wdCc7XG5pbXBvcnQgSW5kZXRlcm1pbmF0ZVByb2dyZXNzQmFyIGZyb20gJy4vSW5kZXRlcm1pbmF0ZVByb2dyZXNzQmFyJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7XG4gIFNzaEhhbmRzaGFrZSxcbiAgZGVjb3JhdGVTc2hDb25uZWN0aW9uRGVsZWdhdGVXaXRoVHJhY2tpbmcsXG59IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uJztcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcblxudHlwZSBQcm9wcyA9IHtcbiAgLy8gVGhlIGxpc3Qgb2YgY29ubmVjdGlvbiBwcm9maWxlcyB0aGF0IHdpbGwgYmUgZGlzcGxheWVkLlxuICBjb25uZWN0aW9uUHJvZmlsZXM6ID9BcnJheTxOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGU+O1xuICAvLyBJZiB0aGVyZSBpcyA+PSAxIGNvbm5lY3Rpb24gcHJvZmlsZSwgdGhpcyBpbmRleCBpbmRpY2F0ZXMgdGhlIGluaXRpYWxcbiAgLy8gcHJvZmlsZSB0byB1c2UuXG4gIGluZGV4T2ZJbml0aWFsbHlTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiBudW1iZXI7XG4gIC8vIEZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIFwiK1wiIGJ1dHRvbiBvbiB0aGUgcHJvZmlsZXMgbGlzdCBpcyBjbGlja2VkLlxuICAvLyBUaGUgdXNlcidzIGludGVudCBpcyB0byBjcmVhdGUgYSBuZXcgcHJvZmlsZS5cbiAgb25BZGRQcm9maWxlQ2xpY2tlZDogKCkgPT4gbWl4ZWQ7XG4gIC8vIEZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIFwiLVwiIGJ1dHRvbiBvbiB0aGUgcHJvZmlsZXMgbGlzdCBpcyBjbGlja2VkXG4gIC8vICoqIHdoaWxlIGEgcHJvZmlsZSBpcyBzZWxlY3RlZCAqKi5cbiAgLy8gVGhlIHVzZXIncyBpbnRlbnQgaXMgdG8gZGVsZXRlIHRoZSBjdXJyZW50bHktc2VsZWN0ZWQgcHJvZmlsZS5cbiAgb25EZWxldGVQcm9maWxlQ2xpY2tlZDogKGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiBudW1iZXIpID0+IG1peGVkO1xuICBvbkNvbm5lY3Q6ICgpID0+IG1peGVkO1xuICBvbkVycm9yOiAoKSA9PiBtaXhlZDtcbiAgb25DYW5jZWw6ICgpID0+IG1peGVkO1xuICBvbkNsb3NlZDogPygpID0+IG1peGVkO1xufTtcblxudHlwZSBTdGF0ZSA9IHtcbiAgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU6IG51bWJlcjtcbiAgaW5zdHJ1Y3Rpb25zOiBzdHJpbmc7XG4gIGZpbmlzaDogKGFuc3dlcnM6IEFycmF5PHN0cmluZz4pID0+IG1peGVkO1xuICBtb2RlOiBudW1iZXI7XG4gIHNzaEhhbmRzaGFrZTogU3NoSGFuZHNoYWtlO1xufTtcblxuY29uc3QgUkVRVUVTVF9DT05ORUNUSU9OX0RFVEFJTFMgPSAxO1xuY29uc3QgV0FJVElOR19GT1JfQ09OTkVDVElPTiA9IDI7XG5jb25zdCBSRVFVRVNUX0FVVEhFTlRJQ0FUSU9OX0RFVEFJTFMgPSAzO1xuY29uc3QgV0FJVElOR19GT1JfQVVUSEVOVElDQVRJT04gPSA0O1xuXG4vKipcbiAqIENvbXBvbmVudCB0aGF0IG1hbmFnZXMgdGhlIHN0YXRlIHRyYW5zaXRpb25zIGFzIHRoZSB1c2VyIGNvbm5lY3RzIHRvIGFcbiAqIHNlcnZlci5cbiAqL1xuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuY2xhc3MgQ29ubmVjdGlvbkRpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRlOiBTdGF0ZTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGluZGV4T2ZJbml0aWFsbHlTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiAtMSxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICBjb25zdCBzc2hIYW5kc2hha2UgPSBuZXcgU3NoSGFuZHNoYWtlKGRlY29yYXRlU3NoQ29ubmVjdGlvbkRlbGVnYXRlV2l0aFRyYWNraW5nKHtcbiAgICAgIG9uS2V5Ym9hcmRJbnRlcmFjdGl2ZTogKG5hbWUsIGluc3RydWN0aW9ucywgaW5zdHJ1Y3Rpb25zTGFuZywgcHJvbXB0cywgZmluaXNoKSAgPT4ge1xuICAgICAgICAvLyBUT0RPOiBEaXNwbGF5IGFsbCBwcm9tcHRzLCBub3QganVzdCB0aGUgZmlyc3Qgb25lLlxuICAgICAgICB0aGlzLnJlcXVlc3RBdXRoZW50aWNhdGlvbihwcm9tcHRzWzBdLCBmaW5pc2gpO1xuICAgICAgfSxcblxuICAgICAgb25XaWxsQ29ubmVjdDooKSA9PiB7fSxcblxuICAgICAgb25EaWRDb25uZWN0OiAoY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbiwgY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbikgPT4ge1xuICAgICAgICB0aGlzLmNsb3NlKCk7IC8vIENsb3NlIHRoZSBkaWFsb2cuXG4gICAgICAgIHRoaXMucHJvcHMub25Db25uZWN0KGNvbm5lY3Rpb24sIGNvbmZpZyk7XG4gICAgICB9LFxuXG4gICAgICBvbkVycm9yOiAoXG4gICAgICAgIGVycm9yVHlwZTogU3NoSGFuZHNoYWtlRXJyb3JUeXBlLFxuICAgICAgICBlcnJvcjogRXJyb3IsXG4gICAgICAgIGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24sXG4gICAgICApID0+IHtcbiAgICAgICAgdGhpcy5jbG9zZSgpOyAvLyBDbG9zZSB0aGUgZGlhbG9nLlxuICAgICAgICBub3RpZnlTc2hIYW5kc2hha2VFcnJvcihlcnJvclR5cGUsIGVycm9yLCBjb25maWcpO1xuICAgICAgICB0aGlzLnByb3BzLm9uRXJyb3IoZXJyb3IsIGNvbmZpZyk7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhlcnJvcik7XG4gICAgICB9LFxuICAgIH0pKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBmaW5pc2g6IGFuc3dlcnMgPT4ge30sXG4gICAgICBpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZTogcHJvcHMuaW5kZXhPZkluaXRpYWxseVNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGUsXG4gICAgICBpbnN0cnVjdGlvbnM6ICcnLFxuICAgICAgbW9kZTogUkVRVUVTVF9DT05ORUNUSU9OX0RFVEFJTFMsXG4gICAgICBzc2hIYW5kc2hha2U6IHNzaEhhbmRzaGFrZSxcbiAgICB9O1xuXG4gICAgKHRoaXM6IGFueSkuY2FuY2VsID0gdGhpcy5jYW5jZWwuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5vayA9IHRoaXMub2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5vblByb2ZpbGVDbGlja2VkID0gdGhpcy5vblByb2ZpbGVDbGlja2VkLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogUHJvcHMpOiB2b2lkIHtcbiAgICBsZXQgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGUgPSB0aGlzLnN0YXRlLmluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlO1xuICAgIGlmIChuZXh0UHJvcHMuY29ubmVjdGlvblByb2ZpbGVzID09IG51bGwpIHtcbiAgICAgIGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlID0gLTE7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHRoaXMucHJvcHMuY29ubmVjdGlvblByb2ZpbGVzID09IG51bGxcbiAgICAgIC8vIFRoZSBjdXJyZW50IHNlbGVjdGlvbiBpcyBvdXRzaWRlIHRoZSBib3VuZHMgb2YgdGhlIG5leHQgcHJvZmlsZXMgbGlzdFxuICAgICAgfHwgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGUgPiAobmV4dFByb3BzLmNvbm5lY3Rpb25Qcm9maWxlcy5sZW5ndGggLSAxKVxuICAgICAgLy8gVGhlIG5leHQgcHJvZmlsZXMgbGlzdCBpcyBsb25nZXIgdGhhbiBiZWZvcmUsIGEgbmV3IG9uZSB3YXMgYWRkZWRcbiAgICAgIHx8IG5leHRQcm9wcy5jb25uZWN0aW9uUHJvZmlsZXMubGVuZ3RoID4gdGhpcy5wcm9wcy5jb25uZWN0aW9uUHJvZmlsZXMubGVuZ3RoXG4gICAgKSB7XG4gICAgICAvLyBTZWxlY3QgdGhlIGZpbmFsIGNvbm5lY3Rpb24gcHJvZmlsZSBpbiB0aGUgbGlzdCBiZWNhdXNlIG9uZSBvZiB0aGUgYWJvdmUgY29uZGl0aW9ucyBtZWFuc1xuICAgICAgLy8gdGhlIGN1cnJlbnQgc2VsZWN0ZWQgaW5kZXggaXMgb3V0ZGF0ZWQuXG4gICAgICBpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZSA9IG5leHRQcm9wcy5jb25uZWN0aW9uUHJvZmlsZXMubGVuZ3RoIC0gMTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZX0pO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgbW9kZSA9IHRoaXMuc3RhdGUubW9kZTtcbiAgICBsZXQgY29udGVudDtcbiAgICBsZXQgaXNPa0Rpc2FibGVkO1xuICAgIGxldCBva0J1dHRvblRleHQ7XG5cbiAgICBpZiAobW9kZSA9PT0gUkVRVUVTVF9DT05ORUNUSU9OX0RFVEFJTFMpIHtcbiAgICAgIGNvbnRlbnQgPSAoXG4gICAgICAgIDxDb25uZWN0aW9uRGV0YWlsc1Byb21wdFxuICAgICAgICAgIHJlZj1cImNvbm5lY3Rpb24tZGV0YWlsc1wiXG4gICAgICAgICAgY29ubmVjdGlvblByb2ZpbGVzPXt0aGlzLnByb3BzLmNvbm5lY3Rpb25Qcm9maWxlc31cbiAgICAgICAgICBpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZT17dGhpcy5zdGF0ZS5pbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZX1cbiAgICAgICAgICBvbkFkZFByb2ZpbGVDbGlja2VkPXt0aGlzLnByb3BzLm9uQWRkUHJvZmlsZUNsaWNrZWR9XG4gICAgICAgICAgb25EZWxldGVQcm9maWxlQ2xpY2tlZD17dGhpcy5wcm9wcy5vbkRlbGV0ZVByb2ZpbGVDbGlja2VkfVxuICAgICAgICAgIG9uQ29uZmlybT17dGhpcy5va31cbiAgICAgICAgICBvbkNhbmNlbD17dGhpcy5jYW5jZWx9XG4gICAgICAgICAgb25Qcm9maWxlQ2xpY2tlZD17dGhpcy5vblByb2ZpbGVDbGlja2VkfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICAgIGlzT2tEaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgb2tCdXR0b25UZXh0ID0gJ0Nvbm5lY3QnO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PT0gV0FJVElOR19GT1JfQ09OTkVDVElPTiB8fCBtb2RlID09PSBXQUlUSU5HX0ZPUl9BVVRIRU5USUNBVElPTikge1xuICAgICAgY29udGVudCA9IDxJbmRldGVybWluYXRlUHJvZ3Jlc3NCYXIgLz47XG4gICAgICBpc09rRGlzYWJsZWQgPSB0cnVlO1xuICAgICAgb2tCdXR0b25UZXh0ID0gJ0Nvbm5lY3QnO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZW50ID0gKFxuICAgICAgICA8QXV0aGVudGljYXRpb25Qcm9tcHRcbiAgICAgICAgICByZWY9XCJhdXRoZW50aWNhdGlvblwiXG4gICAgICAgICAgaW5zdHJ1Y3Rpb25zPXt0aGlzLnN0YXRlLmluc3RydWN0aW9uc31cbiAgICAgICAgICBvbkNvbmZpcm09e3RoaXMub2t9XG4gICAgICAgICAgb25DYW5jZWw9e3RoaXMuY2FuY2VsfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICAgIGlzT2tEaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgb2tCdXR0b25UZXh0ID0gJ09LJztcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGF0b20tcGFuZWwgY2xhc3M9XCJtb2RhbCBtb2RhbC1sZyBmcm9tLXRvcFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZGRlZFwiPlxuICAgICAgICAgIHtjb250ZW50fVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYWRkZWQgdGV4dC1yaWdodFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwXCI+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0blwiIG9uQ2xpY2s9e3RoaXMuY2FuY2VsfT5cbiAgICAgICAgICAgICAgQ2FuY2VsXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1wcmltYXJ5XCIgb25DbGljaz17dGhpcy5va30gZGlzYWJsZWQ9e2lzT2tEaXNhYmxlZH0+XG4gICAgICAgICAgICAgIHtva0J1dHRvblRleHR9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2F0b20tcGFuZWw+XG4gICAgKTtcbiAgfVxuXG4gIGNhbmNlbCgpIHtcbiAgICBjb25zdCBtb2RlID0gdGhpcy5zdGF0ZS5tb2RlO1xuXG4gICAgLy8gSXQgaXMgc2FmZSB0byBjYWxsIGNhbmNlbCBldmVuIGlmIG5vIGNvbm5lY3Rpb24gaXMgc3RhcnRlZFxuICAgIHRoaXMuc3RhdGUuc3NoSGFuZHNoYWtlLmNhbmNlbCgpO1xuXG4gICAgaWYgKG1vZGUgPT09IFdBSVRJTkdfRk9SX0NPTk5FQ1RJT04pIHtcbiAgICAgIC8vIFRPRE8obWlrZW8pOiBUZWxsIGRlbGVnYXRlIHRvIGNhbmNlbCB0aGUgY29ubmVjdGlvbiByZXF1ZXN0LlxuICAgICAgdGhpcy5zZXRTdGF0ZSh7bW9kZTogUkVRVUVTVF9DT05ORUNUSU9OX0RFVEFJTFN9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETyhtaWtlbyk6IEFsc28gY2FuY2VsIGNvbm5lY3Rpb24gcmVxdWVzdCwgYXMgYXBwcm9wcmlhdGUgZm9yIG1vZGU/XG4gICAgICB0aGlzLnByb3BzLm9uQ2FuY2VsKCk7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25DbG9zZWQpIHtcbiAgICAgIHRoaXMucHJvcHMub25DbG9zZWQoKTtcbiAgICB9XG4gIH1cblxuICBvaygpIHtcbiAgICBjb25zdCB7XG4gICAgICBpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZSxcbiAgICAgIG1vZGUsXG4gICAgfSA9IHRoaXMuc3RhdGU7XG5cbiAgICBjb25zdCB7XG4gICAgICBjb25uZWN0aW9uUHJvZmlsZXMsXG4gICAgfSA9IHRoaXMucHJvcHM7XG5cbiAgICBpZiAobW9kZSA9PT0gUkVRVUVTVF9DT05ORUNUSU9OX0RFVEFJTFMpIHtcbiAgICAgIC8vIFVzZXIgaXMgdHJ5aW5nIHRvIHN1Ym1pdCBjb25uZWN0aW9uIGRldGFpbHMuXG4gICAgICBjb25zdCBjb25uZWN0aW9uRGV0YWlsc0Zvcm0gPSB0aGlzLnJlZnNbJ2Nvbm5lY3Rpb24tZGV0YWlscyddO1xuICAgICAgY29uc3Qge1xuICAgICAgICB1c2VybmFtZSxcbiAgICAgICAgc2VydmVyLFxuICAgICAgICBjd2QsXG4gICAgICAgIHJlbW90ZVNlcnZlckNvbW1hbmQsXG4gICAgICAgIHNzaFBvcnQsXG4gICAgICAgIHBhdGhUb1ByaXZhdGVLZXksXG4gICAgICAgIGF1dGhNZXRob2QsXG4gICAgICAgIHBhc3N3b3JkLFxuICAgICAgfSA9IGNvbm5lY3Rpb25EZXRhaWxzRm9ybS5nZXRGb3JtRmllbGRzKCk7XG5cbiAgICAgIGxldCBkaXNwbGF5VGl0bGUgPSAnJztcbiAgICAgIGlmIChpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZSA+IC0xKSB7XG4gICAgICAgICh7ZGlzcGxheVRpdGxlfSA9IGNvbm5lY3Rpb25Qcm9maWxlc1tpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZV0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodXNlcm5hbWUgJiYgc2VydmVyICYmIGN3ZCAmJiByZW1vdGVTZXJ2ZXJDb21tYW5kKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe21vZGU6IFdBSVRJTkdfRk9SX0NPTk5FQ1RJT059KTtcbiAgICAgICAgdGhpcy5zdGF0ZS5zc2hIYW5kc2hha2UuY29ubmVjdCh7XG4gICAgICAgICAgaG9zdDogc2VydmVyLFxuICAgICAgICAgIHNzaFBvcnQsXG4gICAgICAgICAgdXNlcm5hbWUsXG4gICAgICAgICAgcGF0aFRvUHJpdmF0ZUtleSxcbiAgICAgICAgICBhdXRoTWV0aG9kLFxuICAgICAgICAgIGN3ZCxcbiAgICAgICAgICByZW1vdGVTZXJ2ZXJDb21tYW5kLFxuICAgICAgICAgIHBhc3N3b3JkLFxuICAgICAgICAgIGRpc3BsYXlUaXRsZSxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUT0RPKG1ib2xpbik6IFRlbGwgdXNlciB0byBmaWxsIG91dCBhbGwgb2YgdGhlIGZpZWxkcy5cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG1vZGUgPT09IFJFUVVFU1RfQVVUSEVOVElDQVRJT05fREVUQUlMUykge1xuICAgICAgY29uc3QgYXV0aGVudGljYXRpb25Qcm9tcHQgPSB0aGlzLnJlZnNbJ2F1dGhlbnRpY2F0aW9uJ107XG4gICAgICBjb25zdCBwYXNzd29yZCA9IGF1dGhlbnRpY2F0aW9uUHJvbXB0LmdldFBhc3N3b3JkKCk7XG5cbiAgICAgIHRoaXMuc3RhdGUuZmluaXNoKFtwYXNzd29yZF0pO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHttb2RlOiBXQUlUSU5HX0ZPUl9BVVRIRU5USUNBVElPTn0pO1xuICAgIH1cbiAgfVxuXG4gIHJlcXVlc3RBdXRoZW50aWNhdGlvbihcbiAgICBpbnN0cnVjdGlvbnM6IHtlY2hvOiBib29sZWFuOyBwcm9tcHQ6IHN0cmluZ30sXG4gICAgZmluaXNoOiAoYW5zd2VyczogQXJyYXk8c3RyaW5nPikgPT4gdm9pZFxuICApIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG1vZGU6IFJFUVVFU1RfQVVUSEVOVElDQVRJT05fREVUQUlMUyxcbiAgICAgIGluc3RydWN0aW9uczogaW5zdHJ1Y3Rpb25zLnByb21wdCxcbiAgICAgIGZpbmlzaCxcbiAgICB9KTtcbiAgfVxuXG4gIGdldEZvcm1GaWVsZHMoKTogP051Y2xpZGVSZW1vdGVDb25uZWN0aW9uUGFyYW1zIHtcbiAgICBjb25zdCBjb25uZWN0aW9uRGV0YWlsc0Zvcm0gPSB0aGlzLnJlZnNbJ2Nvbm5lY3Rpb24tZGV0YWlscyddO1xuICAgIGlmICghY29ubmVjdGlvbkRldGFpbHNGb3JtKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICBzZXJ2ZXIsXG4gICAgICBjd2QsXG4gICAgICByZW1vdGVTZXJ2ZXJDb21tYW5kLFxuICAgICAgc3NoUG9ydCxcbiAgICAgIHBhdGhUb1ByaXZhdGVLZXksXG4gICAgICBhdXRoTWV0aG9kLFxuICAgIH0gPSBjb25uZWN0aW9uRGV0YWlsc0Zvcm0uZ2V0Rm9ybUZpZWxkcygpO1xuICAgIHJldHVybiB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHNlcnZlcixcbiAgICAgIGN3ZCxcbiAgICAgIHJlbW90ZVNlcnZlckNvbW1hbmQsXG4gICAgICBzc2hQb3J0LFxuICAgICAgcGF0aFRvUHJpdmF0ZUtleSxcbiAgICAgIGF1dGhNZXRob2QsXG4gICAgfTtcbiAgfVxuXG4gIG9uUHJvZmlsZUNsaWNrZWQoaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe2luZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlfSk7XG4gIH1cbn1cbi8qIGVzbGludC1lbmFibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbm5lY3Rpb25EaWFsb2c7XG4iXX0=