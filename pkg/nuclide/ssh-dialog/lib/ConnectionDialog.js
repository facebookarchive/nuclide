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

    this._boundCancel = this.cancel.bind(this);
    this._boundOk = this.ok.bind(this);
    this._boundOnProfileClicked = this.onProfileClicked.bind(this);
  }

  /* eslint-enable react/prop-types */

  _createClass(ConnectionDialog, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var indexOfSelectedConnectionProfile = this.state.indexOfSelectedConnectionProfile;
      if (nextProps.connectionProfiles == null) {
        indexOfSelectedConnectionProfile = -1;
      } else if (
      // The current selection is outside the bounds of the next profiles list
      indexOfSelectedConnectionProfile > nextProps.connectionProfiles.length - 1
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
          onConfirm: this._boundOk,
          onCancel: this._boundCancel,
          onProfileClicked: this._boundOnProfileClicked
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
          onConfirm: this._boundOk,
          onCancel: this._boundCancel
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
              { className: 'btn', onClick: this._boundCancel },
              'Cancel'
            ),
            _reactForAtom.React.createElement(
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
  }, {
    key: 'onProfileClicked',
    value: function onProfileClicked(indexOfSelectedConnectionProfile) {
      this.setState({ indexOfSelectedConnectionProfile: indexOfSelectedConnectionProfile });
    }
  }]);

  return ConnectionDialog;
})(_reactForAtom.React.Component);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb25EaWFsb2cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkF1QnNDLGdCQUFnQjs7b0NBQ3JCLHdCQUF3Qjs7Ozt1Q0FDckIsMkJBQTJCOzs7O3dDQUMxQiw0QkFBNEI7Ozs7NEJBQzdDLGdCQUFnQjs7Z0NBSTdCLHlCQUF5Qjs7QUFDaEMsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDOztBQWlDcEQsSUFBTSwwQkFBMEIsR0FBRyxDQUFDLENBQUM7QUFDckMsSUFBTSxzQkFBc0IsR0FBRyxDQUFDLENBQUM7QUFDakMsSUFBTSw4QkFBOEIsR0FBRyxDQUFDLENBQUM7QUFDekMsSUFBTSwwQkFBMEIsR0FBRyxDQUFDLENBQUM7Ozs7Ozs7O0lBT2hCLGdCQUFnQjtZQUFoQixnQkFBZ0I7O2VBQWhCLGdCQUFnQjs7V0FJYjtBQUNwQiwrQ0FBeUMsRUFBRSxDQUFDLENBQUM7S0FDOUM7Ozs7QUFFVSxXQVJRLGdCQUFnQixDQVF2QixLQUFZLEVBQUU7OzswQkFSUCxnQkFBZ0I7O0FBU2pDLCtCQVRpQixnQkFBZ0IsNkNBUzNCLEtBQUssRUFBRTs7QUFFYixRQUFNLFlBQVksR0FBRyxtQ0FBaUIsaUVBQTBDO0FBQzlFLDJCQUFxQixFQUFFLCtCQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBTTs7QUFFakYsY0FBSyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7T0FDaEQ7O0FBRUQsbUJBQWEsRUFBQyx5QkFBTSxFQUFFOztBQUV0QixrQkFBWSxFQUFFLHNCQUFDLFVBQVUsRUFBb0IsTUFBTSxFQUFpQztBQUNsRixjQUFLLEtBQUssRUFBRSxDQUFDO0FBQ2IsY0FBSyxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztPQUMx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WCxDQUFDO0tBQ0g7OztXQUVlLDBCQUFDLGdDQUF3QyxFQUFRO0FBQy9ELFVBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxnQ0FBZ0MsRUFBaEMsZ0NBQWdDLEVBQUMsQ0FBQyxDQUFDO0tBQ25EOzs7U0FqT2tCLGdCQUFnQjtHQUFTLG9CQUFNLFNBQVM7O3FCQUF4QyxnQkFBZ0IiLCJmaWxlIjoiQ29ubmVjdGlvbkRpYWxvZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25QYXJhbXMsXG4gIE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZSxcbn0gZnJvbSAnLi9jb25uZWN0aW9uLXR5cGVzJztcblxuaW1wb3J0IHR5cGUge1xuICBTc2hIYW5kc2hha2VFcnJvclR5cGUsXG4gIFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uLFxufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbi9saWIvU3NoSGFuZHNoYWtlJztcblxuaW1wb3J0IHR5cGUge1JlbW90ZUNvbm5lY3Rpb259IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uL2xpYi9SZW1vdGVDb25uZWN0aW9uJztcblxuaW1wb3J0IHtub3RpZnlTc2hIYW5kc2hha2VFcnJvcn0gZnJvbSAnLi9ub3RpZmljYXRpb24nO1xuaW1wb3J0IEF1dGhlbnRpY2F0aW9uUHJvbXB0IGZyb20gJy4vQXV0aGVudGljYXRpb25Qcm9tcHQnO1xuaW1wb3J0IENvbm5lY3Rpb25EZXRhaWxzUHJvbXB0IGZyb20gJy4vQ29ubmVjdGlvbkRldGFpbHNQcm9tcHQnO1xuaW1wb3J0IEluZGV0ZXJtaW5hdGVQcm9ncmVzc0JhciBmcm9tICcuL0luZGV0ZXJtaW5hdGVQcm9ncmVzc0Jhcic7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge1xuICBTc2hIYW5kc2hha2UsXG4gIGRlY29yYXRlU3NoQ29ubmVjdGlvbkRlbGVnYXRlV2l0aFRyYWNraW5nLFxufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5cbnR5cGUgRGVmYXVsdFByb3BzID0ge1xuICBpbmRleE9mSW5pdGlhbGx5U2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZTogbnVtYmVyO1xufTtcblxudHlwZSBQcm9wcyA9IHtcbiAgLy8gVGhlIGxpc3Qgb2YgY29ubmVjdGlvbiBwcm9maWxlcyB0aGF0IHdpbGwgYmUgZGlzcGxheWVkLlxuICBjb25uZWN0aW9uUHJvZmlsZXM6ID9BcnJheTxOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGU+O1xuICAvLyBJZiB0aGVyZSBpcyA+PSAxIGNvbm5lY3Rpb24gcHJvZmlsZSwgdGhpcyBpbmRleCBpbmRpY2F0ZXMgdGhlIGluaXRpYWxcbiAgLy8gcHJvZmlsZSB0byB1c2UuXG4gIGluZGV4T2ZJbml0aWFsbHlTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiBudW1iZXI7XG4gIC8vIEZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIFwiK1wiIGJ1dHRvbiBvbiB0aGUgcHJvZmlsZXMgbGlzdCBpcyBjbGlja2VkLlxuICAvLyBUaGUgdXNlcidzIGludGVudCBpcyB0byBjcmVhdGUgYSBuZXcgcHJvZmlsZS5cbiAgb25BZGRQcm9maWxlQ2xpY2tlZDogKCkgPT4gbWl4ZWQ7XG4gIC8vIEZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIFwiLVwiIGJ1dHRvbiBvbiB0aGUgcHJvZmlsZXMgbGlzdCBpcyBjbGlja2VkXG4gIC8vICoqIHdoaWxlIGEgcHJvZmlsZSBpcyBzZWxlY3RlZCAqKi5cbiAgLy8gVGhlIHVzZXIncyBpbnRlbnQgaXMgdG8gZGVsZXRlIHRoZSBjdXJyZW50bHktc2VsZWN0ZWQgcHJvZmlsZS5cbiAgb25EZWxldGVQcm9maWxlQ2xpY2tlZDogKGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiBudW1iZXIpID0+IG1peGVkO1xuICBvbkNvbm5lY3Q6ICgpID0+IG1peGVkO1xuICBvbkVycm9yOiAoKSA9PiBtaXhlZDtcbiAgb25DYW5jZWw6ICgpID0+IG1peGVkO1xuICBvbkNsb3NlZDogPygpID0+IG1peGVkO1xufTtcblxudHlwZSBTdGF0ZSA9IHtcbiAgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU6IG51bWJlcjtcbiAgaW5zdHJ1Y3Rpb25zOiBzdHJpbmc7XG4gIGZpbmlzaDogKGFuc3dlcnM6IEFycmF5PHN0cmluZz4pID0+IG1peGVkO1xuICBtb2RlOiBudW1iZXI7XG4gIHNzaEhhbmRzaGFrZTogU3NoSGFuZHNoYWtlO1xufTtcblxuY29uc3QgUkVRVUVTVF9DT05ORUNUSU9OX0RFVEFJTFMgPSAxO1xuY29uc3QgV0FJVElOR19GT1JfQ09OTkVDVElPTiA9IDI7XG5jb25zdCBSRVFVRVNUX0FVVEhFTlRJQ0FUSU9OX0RFVEFJTFMgPSAzO1xuY29uc3QgV0FJVElOR19GT1JfQVVUSEVOVElDQVRJT04gPSA0O1xuXG4vKipcbiAqIENvbXBvbmVudCB0aGF0IG1hbmFnZXMgdGhlIHN0YXRlIHRyYW5zaXRpb25zIGFzIHRoZSB1c2VyIGNvbm5lY3RzIHRvIGFcbiAqIHNlcnZlci5cbiAqL1xuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29ubmVjdGlvbkRpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxEZWZhdWx0UHJvcHMsIFByb3BzLCBTdGF0ZT4ge1xuICBfYm91bmRPazogKCkgPT4gdm9pZDtcbiAgX2JvdW5kQ2FuY2VsOiAoKSA9PiB2b2lkO1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgaW5kZXhPZkluaXRpYWxseVNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU6IC0xLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIGNvbnN0IHNzaEhhbmRzaGFrZSA9IG5ldyBTc2hIYW5kc2hha2UoZGVjb3JhdGVTc2hDb25uZWN0aW9uRGVsZWdhdGVXaXRoVHJhY2tpbmcoe1xuICAgICAgb25LZXlib2FyZEludGVyYWN0aXZlOiAobmFtZSwgaW5zdHJ1Y3Rpb25zLCBpbnN0cnVjdGlvbnNMYW5nLCBwcm9tcHRzLCBmaW5pc2gpICA9PiB7XG4gICAgICAgIC8vIFRPRE86IERpc3BsYXkgYWxsIHByb21wdHMsIG5vdCBqdXN0IHRoZSBmaXJzdCBvbmUuXG4gICAgICAgIHRoaXMucmVxdWVzdEF1dGhlbnRpY2F0aW9uKHByb21wdHNbMF0sIGZpbmlzaCk7XG4gICAgICB9LFxuXG4gICAgICBvbldpbGxDb25uZWN0OigpID0+IHt9LFxuXG4gICAgICBvbkRpZENvbm5lY3Q6IChjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uLCBjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uKSA9PiB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTsgLy8gQ2xvc2UgdGhlIGRpYWxvZy5cbiAgICAgICAgdGhpcy5wcm9wcy5vbkNvbm5lY3QoY29ubmVjdGlvbiwgY29uZmlnKTtcbiAgICAgIH0sXG5cbiAgICAgIG9uRXJyb3I6IChcbiAgICAgICAgZXJyb3JUeXBlOiBTc2hIYW5kc2hha2VFcnJvclR5cGUsXG4gICAgICAgIGVycm9yOiBFcnJvcixcbiAgICAgICAgY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbixcbiAgICAgICkgPT4ge1xuICAgICAgICB0aGlzLmNsb3NlKCk7IC8vIENsb3NlIHRoZSBkaWFsb2cuXG4gICAgICAgIG5vdGlmeVNzaEhhbmRzaGFrZUVycm9yKGVycm9yVHlwZSwgZXJyb3IsIGNvbmZpZyk7XG4gICAgICAgIHRoaXMucHJvcHMub25FcnJvcihlcnJvciwgY29uZmlnKTtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKGVycm9yKTtcbiAgICAgIH0sXG4gICAgfSkpO1xuXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGZpbmlzaDogKGFuc3dlcnMpID0+IHt9LFxuICAgICAgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU6IHByb3BzLmluZGV4T2ZJbml0aWFsbHlTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlLFxuICAgICAgaW5zdHJ1Y3Rpb25zOiAnJyxcbiAgICAgIG1vZGU6IFJFUVVFU1RfQ09OTkVDVElPTl9ERVRBSUxTLFxuICAgICAgc3NoSGFuZHNoYWtlOiBzc2hIYW5kc2hha2UsXG4gICAgfTtcblxuICAgIHRoaXMuX2JvdW5kQ2FuY2VsID0gdGhpcy5jYW5jZWwuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZE9rID0gdGhpcy5vay5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2JvdW5kT25Qcm9maWxlQ2xpY2tlZCA9IHRoaXMub25Qcm9maWxlQ2xpY2tlZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6IFByb3BzKTogdm9pZCB7XG4gICAgbGV0IGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlID0gdGhpcy5zdGF0ZS5pbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZTtcbiAgICBpZiAobmV4dFByb3BzLmNvbm5lY3Rpb25Qcm9maWxlcyA9PSBudWxsKSB7XG4gICAgICBpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZSA9IC0xO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAvLyBUaGUgY3VycmVudCBzZWxlY3Rpb24gaXMgb3V0c2lkZSB0aGUgYm91bmRzIG9mIHRoZSBuZXh0IHByb2ZpbGVzIGxpc3RcbiAgICAgIGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlID4gKG5leHRQcm9wcy5jb25uZWN0aW9uUHJvZmlsZXMubGVuZ3RoIC0gMSlcbiAgICAgIC8vIFRoZSBuZXh0IHByb2ZpbGVzIGxpc3QgaXMgbG9uZ2VyIHRoYW4gYmVmb3JlLCBhIG5ldyBvbmUgd2FzIGFkZGVkXG4gICAgICB8fCBuZXh0UHJvcHMuY29ubmVjdGlvblByb2ZpbGVzLmxlbmd0aCA+IHRoaXMucHJvcHMuY29ubmVjdGlvblByb2ZpbGVzLmxlbmd0aFxuICAgICkge1xuICAgICAgLy8gU2VsZWN0IHRoZSBmaW5hbCBjb25uZWN0aW9uIHByb2ZpbGUgaW4gdGhlIGxpc3QgYmVjYXVzZSBvbmUgb2YgdGhlIGFib3ZlIGNvbmRpdGlvbnMgbWVhbnNcbiAgICAgIC8vIHRoZSBjdXJyZW50IHNlbGVjdGVkIGluZGV4IGlzIG91dGRhdGVkLlxuICAgICAgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGUgPSBuZXh0UHJvcHMuY29ubmVjdGlvblByb2ZpbGVzLmxlbmd0aCAtIDE7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7aW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGV9KTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IG1vZGUgPSB0aGlzLnN0YXRlLm1vZGU7XG4gICAgbGV0IGNvbnRlbnQ7XG4gICAgbGV0IGlzT2tEaXNhYmxlZDtcbiAgICBsZXQgb2tCdXR0b25UZXh0O1xuXG4gICAgaWYgKG1vZGUgPT09IFJFUVVFU1RfQ09OTkVDVElPTl9ERVRBSUxTKSB7XG4gICAgICBjb250ZW50ID0gKFxuICAgICAgICA8Q29ubmVjdGlvbkRldGFpbHNQcm9tcHRcbiAgICAgICAgICByZWY9XCJjb25uZWN0aW9uLWRldGFpbHNcIlxuICAgICAgICAgIGNvbm5lY3Rpb25Qcm9maWxlcz17dGhpcy5wcm9wcy5jb25uZWN0aW9uUHJvZmlsZXN9XG4gICAgICAgICAgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU9e3RoaXMuc3RhdGUuaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGV9XG4gICAgICAgICAgb25BZGRQcm9maWxlQ2xpY2tlZD17dGhpcy5wcm9wcy5vbkFkZFByb2ZpbGVDbGlja2VkfVxuICAgICAgICAgIG9uRGVsZXRlUHJvZmlsZUNsaWNrZWQ9e3RoaXMucHJvcHMub25EZWxldGVQcm9maWxlQ2xpY2tlZH1cbiAgICAgICAgICBvbkNvbmZpcm09e3RoaXMuX2JvdW5kT2t9XG4gICAgICAgICAgb25DYW5jZWw9e3RoaXMuX2JvdW5kQ2FuY2VsfVxuICAgICAgICAgIG9uUHJvZmlsZUNsaWNrZWQ9e3RoaXMuX2JvdW5kT25Qcm9maWxlQ2xpY2tlZH1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgICBpc09rRGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgIG9rQnV0dG9uVGV4dCA9ICdDb25uZWN0JztcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT09IFdBSVRJTkdfRk9SX0NPTk5FQ1RJT04gfHwgbW9kZSA9PT0gV0FJVElOR19GT1JfQVVUSEVOVElDQVRJT04pIHtcbiAgICAgIGNvbnRlbnQgPSA8SW5kZXRlcm1pbmF0ZVByb2dyZXNzQmFyIC8+O1xuICAgICAgaXNPa0Rpc2FibGVkID0gdHJ1ZTtcbiAgICAgIG9rQnV0dG9uVGV4dCA9ICdDb25uZWN0JztcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGVudCA9IChcbiAgICAgICAgPEF1dGhlbnRpY2F0aW9uUHJvbXB0XG4gICAgICAgICAgcmVmPVwiYXV0aGVudGljYXRpb25cIlxuICAgICAgICAgIGluc3RydWN0aW9ucz17dGhpcy5zdGF0ZS5pbnN0cnVjdGlvbnN9XG4gICAgICAgICAgb25Db25maXJtPXt0aGlzLl9ib3VuZE9rfVxuICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLl9ib3VuZENhbmNlbH1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgICBpc09rRGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgIG9rQnV0dG9uVGV4dCA9ICdPSyc7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxhdG9tLXBhbmVsIGNsYXNzPVwibW9kYWwgbW9kYWwtbGcgZnJvbS10b3BcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYWRkZWRcIj5cbiAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFkZGVkIHRleHQtcmlnaHRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ0bi1ncm91cFwiPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG5cIiBvbkNsaWNrPXt0aGlzLl9ib3VuZENhbmNlbH0+XG4gICAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeVwiIG9uQ2xpY2s9e3RoaXMuX2JvdW5kT2t9IGRpc2FibGVkPXtpc09rRGlzYWJsZWR9PlxuICAgICAgICAgICAgICB7b2tCdXR0b25UZXh0fVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9hdG9tLXBhbmVsPlxuICAgICk7XG4gIH1cblxuICBjYW5jZWwoKSB7XG4gICAgY29uc3QgbW9kZSA9IHRoaXMuc3RhdGUubW9kZTtcblxuICAgIC8vIEl0IGlzIHNhZmUgdG8gY2FsbCBjYW5jZWwgZXZlbiBpZiBubyBjb25uZWN0aW9uIGlzIHN0YXJ0ZWRcbiAgICB0aGlzLnN0YXRlLnNzaEhhbmRzaGFrZS5jYW5jZWwoKTtcblxuICAgIGlmIChtb2RlID09PSBXQUlUSU5HX0ZPUl9DT05ORUNUSU9OKSB7XG4gICAgICAvLyBUT0RPKG1pa2VvKTogVGVsbCBkZWxlZ2F0ZSB0byBjYW5jZWwgdGhlIGNvbm5lY3Rpb24gcmVxdWVzdC5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe21vZGU6IFJFUVVFU1RfQ09OTkVDVElPTl9ERVRBSUxTfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRPRE8obWlrZW8pOiBBbHNvIGNhbmNlbCBjb25uZWN0aW9uIHJlcXVlc3QsIGFzIGFwcHJvcHJpYXRlIGZvciBtb2RlP1xuICAgICAgdGhpcy5wcm9wcy5vbkNhbmNlbCgpO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uQ2xvc2VkKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQ2xvc2VkKCk7XG4gICAgfVxuICB9XG5cbiAgb2soKSB7XG4gICAgY29uc3QgbW9kZSA9IHRoaXMuc3RhdGUubW9kZTtcblxuICAgIGlmIChtb2RlID09PSBSRVFVRVNUX0NPTk5FQ1RJT05fREVUQUlMUykge1xuICAgICAgLy8gVXNlciBpcyB0cnlpbmcgdG8gc3VibWl0IGNvbm5lY3Rpb24gZGV0YWlscy5cbiAgICAgIGNvbnN0IGNvbm5lY3Rpb25EZXRhaWxzRm9ybSA9IHRoaXMucmVmc1snY29ubmVjdGlvbi1kZXRhaWxzJ107XG4gICAgICBjb25zdCB7XG4gICAgICAgIHVzZXJuYW1lLFxuICAgICAgICBzZXJ2ZXIsXG4gICAgICAgIGN3ZCxcbiAgICAgICAgcmVtb3RlU2VydmVyQ29tbWFuZCxcbiAgICAgICAgc3NoUG9ydCxcbiAgICAgICAgcGF0aFRvUHJpdmF0ZUtleSxcbiAgICAgICAgYXV0aE1ldGhvZCxcbiAgICAgICAgcGFzc3dvcmQsXG4gICAgICB9ID0gY29ubmVjdGlvbkRldGFpbHNGb3JtLmdldEZvcm1GaWVsZHMoKTtcbiAgICAgIGlmICh1c2VybmFtZSAmJiBzZXJ2ZXIgJiYgY3dkICYmIHJlbW90ZVNlcnZlckNvbW1hbmQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bW9kZTogV0FJVElOR19GT1JfQ09OTkVDVElPTn0pO1xuICAgICAgICB0aGlzLnN0YXRlLnNzaEhhbmRzaGFrZS5jb25uZWN0KHtcbiAgICAgICAgICBob3N0OiBzZXJ2ZXIsXG4gICAgICAgICAgc3NoUG9ydCxcbiAgICAgICAgICB1c2VybmFtZSxcbiAgICAgICAgICBwYXRoVG9Qcml2YXRlS2V5LFxuICAgICAgICAgIGF1dGhNZXRob2QsXG4gICAgICAgICAgY3dkLFxuICAgICAgICAgIHJlbW90ZVNlcnZlckNvbW1hbmQsXG4gICAgICAgICAgcGFzc3dvcmQsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVE9ETyhtYm9saW4pOiBUZWxsIHVzZXIgdG8gZmlsbCBvdXQgYWxsIG9mIHRoZSBmaWVsZHMuXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChtb2RlID09PSBSRVFVRVNUX0FVVEhFTlRJQ0FUSU9OX0RFVEFJTFMpIHtcbiAgICAgIGNvbnN0IGF1dGhlbnRpY2F0aW9uUHJvbXB0ID0gdGhpcy5yZWZzWydhdXRoZW50aWNhdGlvbiddO1xuICAgICAgY29uc3QgcGFzc3dvcmQgPSBhdXRoZW50aWNhdGlvblByb21wdC5nZXRQYXNzd29yZCgpO1xuXG4gICAgICB0aGlzLnN0YXRlLmZpbmlzaChbcGFzc3dvcmRdKTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7bW9kZTogV0FJVElOR19GT1JfQVVUSEVOVElDQVRJT059KTtcbiAgICB9XG4gIH1cblxuICByZXF1ZXN0QXV0aGVudGljYXRpb24oXG4gICAgaW5zdHJ1Y3Rpb25zOiB7ZWNobzogYm9vbGVhbjsgcHJvbXB0OiBzdHJpbmd9LFxuICAgIGZpbmlzaDogKGFuc3dlcnM6IEFycmF5PHN0cmluZz4pID0+IHZvaWRcbiAgKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBtb2RlOiBSRVFVRVNUX0FVVEhFTlRJQ0FUSU9OX0RFVEFJTFMsXG4gICAgICBpbnN0cnVjdGlvbnM6IGluc3RydWN0aW9ucy5wcm9tcHQsXG4gICAgICBmaW5pc2gsXG4gICAgfSk7XG4gIH1cblxuICBnZXRGb3JtRmllbGRzKCk6ID9OdWNsaWRlUmVtb3RlQ29ubmVjdGlvblBhcmFtcyB7XG4gICAgY29uc3QgY29ubmVjdGlvbkRldGFpbHNGb3JtID0gdGhpcy5yZWZzWydjb25uZWN0aW9uLWRldGFpbHMnXTtcbiAgICBpZiAoIWNvbm5lY3Rpb25EZXRhaWxzRm9ybSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgc2VydmVyLFxuICAgICAgY3dkLFxuICAgICAgcmVtb3RlU2VydmVyQ29tbWFuZCxcbiAgICAgIHNzaFBvcnQsXG4gICAgICBwYXRoVG9Qcml2YXRlS2V5LFxuICAgICAgYXV0aE1ldGhvZCxcbiAgICB9ID0gY29ubmVjdGlvbkRldGFpbHNGb3JtLmdldEZvcm1GaWVsZHMoKTtcbiAgICByZXR1cm4ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICBzZXJ2ZXIsXG4gICAgICBjd2QsXG4gICAgICByZW1vdGVTZXJ2ZXJDb21tYW5kLFxuICAgICAgc3NoUG9ydCxcbiAgICAgIHBhdGhUb1ByaXZhdGVLZXksXG4gICAgICBhdXRoTWV0aG9kLFxuICAgIH07XG4gIH1cblxuICBvblByb2ZpbGVDbGlja2VkKGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZX0pO1xuICB9XG59XG4vKiBlc2xpbnQtZW5hYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbiJdfQ==