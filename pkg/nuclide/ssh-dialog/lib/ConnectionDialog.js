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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb25EaWFsb2cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkF1QnNDLGdCQUFnQjs7b0NBQ3JCLHdCQUF3Qjs7Ozt1Q0FDckIsMkJBQTJCOzs7O3dDQUMxQiw0QkFBNEI7Ozs7NEJBQzdDLGdCQUFnQjs7Z0NBSTdCLHlCQUF5Qjs7QUFDaEMsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDOztBQWlDcEQsSUFBTSwwQkFBMEIsR0FBRyxDQUFDLENBQUM7QUFDckMsSUFBTSxzQkFBc0IsR0FBRyxDQUFDLENBQUM7QUFDakMsSUFBTSw4QkFBOEIsR0FBRyxDQUFDLENBQUM7QUFDekMsSUFBTSwwQkFBMEIsR0FBRyxDQUFDLENBQUM7Ozs7Ozs7O0lBT2hCLGdCQUFnQjtZQUFoQixnQkFBZ0I7O2VBQWhCLGdCQUFnQjs7V0FJYjtBQUNwQiwrQ0FBeUMsRUFBRSxDQUFDLENBQUM7S0FDOUM7Ozs7QUFFVSxXQVJRLGdCQUFnQixDQVF2QixLQUFZLEVBQUU7OzswQkFSUCxnQkFBZ0I7O0FBU2pDLCtCQVRpQixnQkFBZ0IsNkNBUzNCLEtBQUssRUFBRTs7QUFFYixRQUFNLFlBQVksR0FBRyxtQ0FBaUIsaUVBQTBDO0FBQzlFLDJCQUFxQixFQUFFLCtCQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBTTs7QUFFakYsY0FBSyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7T0FDaEQ7O0FBRUQsbUJBQWEsRUFBQyx5QkFBTSxFQUFFOztBQUV0QixrQkFBWSxFQUFFLHNCQUFDLFVBQVUsRUFBb0IsTUFBTSxFQUFpQztBQUNsRixjQUFLLEtBQUssRUFBRSxDQUFDO0FBQ2IsY0FBSyxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztPQUMx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WCxDQUFDO0tBQ0g7OztXQUVlLDBCQUFDLGdDQUF3QyxFQUFRO0FBQy9ELFVBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxnQ0FBZ0MsRUFBaEMsZ0NBQWdDLEVBQUMsQ0FBQyxDQUFDO0tBQ25EOzs7U0FqT2tCLGdCQUFnQjtHQUFTLG9CQUFNLFNBQVM7O3FCQUF4QyxnQkFBZ0IiLCJmaWxlIjoiQ29ubmVjdGlvbkRpYWxvZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25QYXJhbXMsXG4gIE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZSxcbn0gZnJvbSAnLi9jb25uZWN0aW9uLXR5cGVzJztcblxuaW1wb3J0IHR5cGUge1xuICBTc2hIYW5kc2hha2VFcnJvclR5cGUsXG4gIFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uLFxufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbi9saWIvU3NoSGFuZHNoYWtlJztcblxuaW1wb3J0IHR5cGUge1JlbW90ZUNvbm5lY3Rpb259IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uL2xpYi9SZW1vdGVDb25uZWN0aW9uJztcblxuaW1wb3J0IHtub3RpZnlTc2hIYW5kc2hha2VFcnJvcn0gZnJvbSAnLi9ub3RpZmljYXRpb24nO1xuaW1wb3J0IEF1dGhlbnRpY2F0aW9uUHJvbXB0IGZyb20gJy4vQXV0aGVudGljYXRpb25Qcm9tcHQnO1xuaW1wb3J0IENvbm5lY3Rpb25EZXRhaWxzUHJvbXB0IGZyb20gJy4vQ29ubmVjdGlvbkRldGFpbHNQcm9tcHQnO1xuaW1wb3J0IEluZGV0ZXJtaW5hdGVQcm9ncmVzc0JhciBmcm9tICcuL0luZGV0ZXJtaW5hdGVQcm9ncmVzc0Jhcic7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge1xuICBTc2hIYW5kc2hha2UsXG4gIGRlY29yYXRlU3NoQ29ubmVjdGlvbkRlbGVnYXRlV2l0aFRyYWNraW5nLFxufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5cbnR5cGUgRGVmYXVsdFByb3BzID0ge1xuICBpbmRleE9mSW5pdGlhbGx5U2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZTogbnVtYmVyLFxufTtcblxudHlwZSBQcm9wcyA9IHtcbiAgLy8gVGhlIGxpc3Qgb2YgY29ubmVjdGlvbiBwcm9maWxlcyB0aGF0IHdpbGwgYmUgZGlzcGxheWVkLlxuICBjb25uZWN0aW9uUHJvZmlsZXM6ID9BcnJheTxOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGU+LFxuICAvLyBJZiB0aGVyZSBpcyA+PSAxIGNvbm5lY3Rpb24gcHJvZmlsZSwgdGhpcyBpbmRleCBpbmRpY2F0ZXMgdGhlIGluaXRpYWxcbiAgLy8gcHJvZmlsZSB0byB1c2UuXG4gIGluZGV4T2ZJbml0aWFsbHlTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiBudW1iZXIsXG4gIC8vIEZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIFwiK1wiIGJ1dHRvbiBvbiB0aGUgcHJvZmlsZXMgbGlzdCBpcyBjbGlja2VkLlxuICAvLyBUaGUgdXNlcidzIGludGVudCBpcyB0byBjcmVhdGUgYSBuZXcgcHJvZmlsZS5cbiAgb25BZGRQcm9maWxlQ2xpY2tlZDogKCkgPT4gbWl4ZWQsXG4gIC8vIEZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIFwiLVwiIGJ1dHRvbiBvbiB0aGUgcHJvZmlsZXMgbGlzdCBpcyBjbGlja2VkXG4gIC8vICoqIHdoaWxlIGEgcHJvZmlsZSBpcyBzZWxlY3RlZCAqKi5cbiAgLy8gVGhlIHVzZXIncyBpbnRlbnQgaXMgdG8gZGVsZXRlIHRoZSBjdXJyZW50bHktc2VsZWN0ZWQgcHJvZmlsZS5cbiAgb25EZWxldGVQcm9maWxlQ2xpY2tlZDogKGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiBudW1iZXIpID0+IG1peGVkLFxuICBvbkNvbm5lY3Q6ICgpID0+IG1peGVkLFxuICBvbkVycm9yOiAoKSA9PiBtaXhlZCxcbiAgb25DYW5jZWw6ICgpID0+IG1peGVkLFxuICBvbkNsb3NlZDogPygpID0+IG1peGVkLFxufTtcblxudHlwZSBTdGF0ZSA9IHtcbiAgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU6IG51bWJlcixcbiAgaW5zdHJ1Y3Rpb25zOiBzdHJpbmcsXG4gIGZpbmlzaDogKGFuc3dlcnM6IEFycmF5PHN0cmluZz4pID0+IG1peGVkLFxuICBtb2RlOiBudW1iZXIsXG4gIHNzaEhhbmRzaGFrZTogU3NoSGFuZHNoYWtlLFxufTtcblxuY29uc3QgUkVRVUVTVF9DT05ORUNUSU9OX0RFVEFJTFMgPSAxO1xuY29uc3QgV0FJVElOR19GT1JfQ09OTkVDVElPTiA9IDI7XG5jb25zdCBSRVFVRVNUX0FVVEhFTlRJQ0FUSU9OX0RFVEFJTFMgPSAzO1xuY29uc3QgV0FJVElOR19GT1JfQVVUSEVOVElDQVRJT04gPSA0O1xuXG4vKipcbiAqIENvbXBvbmVudCB0aGF0IG1hbmFnZXMgdGhlIHN0YXRlIHRyYW5zaXRpb25zIGFzIHRoZSB1c2VyIGNvbm5lY3RzIHRvIGFcbiAqIHNlcnZlci5cbiAqL1xuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29ubmVjdGlvbkRpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxEZWZhdWx0UHJvcHMsIFByb3BzLCBTdGF0ZT4ge1xuICBfYm91bmRPazogKCkgPT4gdm9pZDtcbiAgX2JvdW5kQ2FuY2VsOiAoKSA9PiB2b2lkO1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgaW5kZXhPZkluaXRpYWxseVNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU6IC0xLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIGNvbnN0IHNzaEhhbmRzaGFrZSA9IG5ldyBTc2hIYW5kc2hha2UoZGVjb3JhdGVTc2hDb25uZWN0aW9uRGVsZWdhdGVXaXRoVHJhY2tpbmcoe1xuICAgICAgb25LZXlib2FyZEludGVyYWN0aXZlOiAobmFtZSwgaW5zdHJ1Y3Rpb25zLCBpbnN0cnVjdGlvbnNMYW5nLCBwcm9tcHRzLCBmaW5pc2gpICA9PiB7XG4gICAgICAgIC8vIFRPRE86IERpc3BsYXkgYWxsIHByb21wdHMsIG5vdCBqdXN0IHRoZSBmaXJzdCBvbmUuXG4gICAgICAgIHRoaXMucmVxdWVzdEF1dGhlbnRpY2F0aW9uKHByb21wdHNbMF0sIGZpbmlzaCk7XG4gICAgICB9LFxuXG4gICAgICBvbldpbGxDb25uZWN0OigpID0+IHt9LFxuXG4gICAgICBvbkRpZENvbm5lY3Q6IChjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uLCBjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uKSA9PiB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTsgLy8gQ2xvc2UgdGhlIGRpYWxvZy5cbiAgICAgICAgdGhpcy5wcm9wcy5vbkNvbm5lY3QoY29ubmVjdGlvbiwgY29uZmlnKTtcbiAgICAgIH0sXG5cbiAgICAgIG9uRXJyb3I6IChcbiAgICAgICAgZXJyb3JUeXBlOiBTc2hIYW5kc2hha2VFcnJvclR5cGUsXG4gICAgICAgIGVycm9yOiBFcnJvcixcbiAgICAgICAgY29uZmlnOiBTc2hDb25uZWN0aW9uQ29uZmlndXJhdGlvbixcbiAgICAgICkgPT4ge1xuICAgICAgICB0aGlzLmNsb3NlKCk7IC8vIENsb3NlIHRoZSBkaWFsb2cuXG4gICAgICAgIG5vdGlmeVNzaEhhbmRzaGFrZUVycm9yKGVycm9yVHlwZSwgZXJyb3IsIGNvbmZpZyk7XG4gICAgICAgIHRoaXMucHJvcHMub25FcnJvcihlcnJvciwgY29uZmlnKTtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKGVycm9yKTtcbiAgICAgIH0sXG4gICAgfSkpO1xuXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGZpbmlzaDogYW5zd2VycyA9PiB7fSxcbiAgICAgIGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiBwcm9wcy5pbmRleE9mSW5pdGlhbGx5U2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZSxcbiAgICAgIGluc3RydWN0aW9uczogJycsXG4gICAgICBtb2RlOiBSRVFVRVNUX0NPTk5FQ1RJT05fREVUQUlMUyxcbiAgICAgIHNzaEhhbmRzaGFrZTogc3NoSGFuZHNoYWtlLFxuICAgIH07XG5cbiAgICB0aGlzLl9ib3VuZENhbmNlbCA9IHRoaXMuY2FuY2VsLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYm91bmRPayA9IHRoaXMub2suYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZE9uUHJvZmlsZUNsaWNrZWQgPSB0aGlzLm9uUHJvZmlsZUNsaWNrZWQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzOiBQcm9wcyk6IHZvaWQge1xuICAgIGxldCBpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZSA9IHRoaXMuc3RhdGUuaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU7XG4gICAgaWYgKG5leHRQcm9wcy5jb25uZWN0aW9uUHJvZmlsZXMgPT0gbnVsbCkge1xuICAgICAgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGUgPSAtMTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgLy8gVGhlIGN1cnJlbnQgc2VsZWN0aW9uIGlzIG91dHNpZGUgdGhlIGJvdW5kcyBvZiB0aGUgbmV4dCBwcm9maWxlcyBsaXN0XG4gICAgICBpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZSA+IChuZXh0UHJvcHMuY29ubmVjdGlvblByb2ZpbGVzLmxlbmd0aCAtIDEpXG4gICAgICAvLyBUaGUgbmV4dCBwcm9maWxlcyBsaXN0IGlzIGxvbmdlciB0aGFuIGJlZm9yZSwgYSBuZXcgb25lIHdhcyBhZGRlZFxuICAgICAgfHwgbmV4dFByb3BzLmNvbm5lY3Rpb25Qcm9maWxlcy5sZW5ndGggPiB0aGlzLnByb3BzLmNvbm5lY3Rpb25Qcm9maWxlcy5sZW5ndGhcbiAgICApIHtcbiAgICAgIC8vIFNlbGVjdCB0aGUgZmluYWwgY29ubmVjdGlvbiBwcm9maWxlIGluIHRoZSBsaXN0IGJlY2F1c2Ugb25lIG9mIHRoZSBhYm92ZSBjb25kaXRpb25zIG1lYW5zXG4gICAgICAvLyB0aGUgY3VycmVudCBzZWxlY3RlZCBpbmRleCBpcyBvdXRkYXRlZC5cbiAgICAgIGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlID0gbmV4dFByb3BzLmNvbm5lY3Rpb25Qcm9maWxlcy5sZW5ndGggLSAxO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe2luZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlfSk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBtb2RlID0gdGhpcy5zdGF0ZS5tb2RlO1xuICAgIGxldCBjb250ZW50O1xuICAgIGxldCBpc09rRGlzYWJsZWQ7XG4gICAgbGV0IG9rQnV0dG9uVGV4dDtcblxuICAgIGlmIChtb2RlID09PSBSRVFVRVNUX0NPTk5FQ1RJT05fREVUQUlMUykge1xuICAgICAgY29udGVudCA9IChcbiAgICAgICAgPENvbm5lY3Rpb25EZXRhaWxzUHJvbXB0XG4gICAgICAgICAgcmVmPVwiY29ubmVjdGlvbi1kZXRhaWxzXCJcbiAgICAgICAgICBjb25uZWN0aW9uUHJvZmlsZXM9e3RoaXMucHJvcHMuY29ubmVjdGlvblByb2ZpbGVzfVxuICAgICAgICAgIGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlPXt0aGlzLnN0YXRlLmluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlfVxuICAgICAgICAgIG9uQWRkUHJvZmlsZUNsaWNrZWQ9e3RoaXMucHJvcHMub25BZGRQcm9maWxlQ2xpY2tlZH1cbiAgICAgICAgICBvbkRlbGV0ZVByb2ZpbGVDbGlja2VkPXt0aGlzLnByb3BzLm9uRGVsZXRlUHJvZmlsZUNsaWNrZWR9XG4gICAgICAgICAgb25Db25maXJtPXt0aGlzLl9ib3VuZE9rfVxuICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLl9ib3VuZENhbmNlbH1cbiAgICAgICAgICBvblByb2ZpbGVDbGlja2VkPXt0aGlzLl9ib3VuZE9uUHJvZmlsZUNsaWNrZWR9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgICAgaXNPa0Rpc2FibGVkID0gZmFsc2U7XG4gICAgICBva0J1dHRvblRleHQgPSAnQ29ubmVjdCc7XG4gICAgfSBlbHNlIGlmIChtb2RlID09PSBXQUlUSU5HX0ZPUl9DT05ORUNUSU9OIHx8IG1vZGUgPT09IFdBSVRJTkdfRk9SX0FVVEhFTlRJQ0FUSU9OKSB7XG4gICAgICBjb250ZW50ID0gPEluZGV0ZXJtaW5hdGVQcm9ncmVzc0JhciAvPjtcbiAgICAgIGlzT2tEaXNhYmxlZCA9IHRydWU7XG4gICAgICBva0J1dHRvblRleHQgPSAnQ29ubmVjdCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRlbnQgPSAoXG4gICAgICAgIDxBdXRoZW50aWNhdGlvblByb21wdFxuICAgICAgICAgIHJlZj1cImF1dGhlbnRpY2F0aW9uXCJcbiAgICAgICAgICBpbnN0cnVjdGlvbnM9e3RoaXMuc3RhdGUuaW5zdHJ1Y3Rpb25zfVxuICAgICAgICAgIG9uQ29uZmlybT17dGhpcy5fYm91bmRPa31cbiAgICAgICAgICBvbkNhbmNlbD17dGhpcy5fYm91bmRDYW5jZWx9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgICAgaXNPa0Rpc2FibGVkID0gZmFsc2U7XG4gICAgICBva0J1dHRvblRleHQgPSAnT0snO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8YXRvbS1wYW5lbCBjbGFzcz1cIm1vZGFsIG1vZGFsLWxnIGZyb20tdG9wXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFkZGVkXCI+XG4gICAgICAgICAge2NvbnRlbnR9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZGRlZCB0ZXh0LXJpZ2h0XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXBcIj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuXCIgb25DbGljaz17dGhpcy5fYm91bmRDYW5jZWx9PlxuICAgICAgICAgICAgICBDYW5jZWxcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLl9ib3VuZE9rfSBkaXNhYmxlZD17aXNPa0Rpc2FibGVkfT5cbiAgICAgICAgICAgICAge29rQnV0dG9uVGV4dH1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvYXRvbS1wYW5lbD5cbiAgICApO1xuICB9XG5cbiAgY2FuY2VsKCkge1xuICAgIGNvbnN0IG1vZGUgPSB0aGlzLnN0YXRlLm1vZGU7XG5cbiAgICAvLyBJdCBpcyBzYWZlIHRvIGNhbGwgY2FuY2VsIGV2ZW4gaWYgbm8gY29ubmVjdGlvbiBpcyBzdGFydGVkXG4gICAgdGhpcy5zdGF0ZS5zc2hIYW5kc2hha2UuY2FuY2VsKCk7XG5cbiAgICBpZiAobW9kZSA9PT0gV0FJVElOR19GT1JfQ09OTkVDVElPTikge1xuICAgICAgLy8gVE9ETyhtaWtlbyk6IFRlbGwgZGVsZWdhdGUgdG8gY2FuY2VsIHRoZSBjb25uZWN0aW9uIHJlcXVlc3QuXG4gICAgICB0aGlzLnNldFN0YXRlKHttb2RlOiBSRVFVRVNUX0NPTk5FQ1RJT05fREVUQUlMU30pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUT0RPKG1pa2VvKTogQWxzbyBjYW5jZWwgY29ubmVjdGlvbiByZXF1ZXN0LCBhcyBhcHByb3ByaWF0ZSBmb3IgbW9kZT9cbiAgICAgIHRoaXMucHJvcHMub25DYW5jZWwoKTtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkNsb3NlZCkge1xuICAgICAgdGhpcy5wcm9wcy5vbkNsb3NlZCgpO1xuICAgIH1cbiAgfVxuXG4gIG9rKCkge1xuICAgIGNvbnN0IG1vZGUgPSB0aGlzLnN0YXRlLm1vZGU7XG5cbiAgICBpZiAobW9kZSA9PT0gUkVRVUVTVF9DT05ORUNUSU9OX0RFVEFJTFMpIHtcbiAgICAgIC8vIFVzZXIgaXMgdHJ5aW5nIHRvIHN1Ym1pdCBjb25uZWN0aW9uIGRldGFpbHMuXG4gICAgICBjb25zdCBjb25uZWN0aW9uRGV0YWlsc0Zvcm0gPSB0aGlzLnJlZnNbJ2Nvbm5lY3Rpb24tZGV0YWlscyddO1xuICAgICAgY29uc3Qge1xuICAgICAgICB1c2VybmFtZSxcbiAgICAgICAgc2VydmVyLFxuICAgICAgICBjd2QsXG4gICAgICAgIHJlbW90ZVNlcnZlckNvbW1hbmQsXG4gICAgICAgIHNzaFBvcnQsXG4gICAgICAgIHBhdGhUb1ByaXZhdGVLZXksXG4gICAgICAgIGF1dGhNZXRob2QsXG4gICAgICAgIHBhc3N3b3JkLFxuICAgICAgfSA9IGNvbm5lY3Rpb25EZXRhaWxzRm9ybS5nZXRGb3JtRmllbGRzKCk7XG4gICAgICBpZiAodXNlcm5hbWUgJiYgc2VydmVyICYmIGN3ZCAmJiByZW1vdGVTZXJ2ZXJDb21tYW5kKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe21vZGU6IFdBSVRJTkdfRk9SX0NPTk5FQ1RJT059KTtcbiAgICAgICAgdGhpcy5zdGF0ZS5zc2hIYW5kc2hha2UuY29ubmVjdCh7XG4gICAgICAgICAgaG9zdDogc2VydmVyLFxuICAgICAgICAgIHNzaFBvcnQsXG4gICAgICAgICAgdXNlcm5hbWUsXG4gICAgICAgICAgcGF0aFRvUHJpdmF0ZUtleSxcbiAgICAgICAgICBhdXRoTWV0aG9kLFxuICAgICAgICAgIGN3ZCxcbiAgICAgICAgICByZW1vdGVTZXJ2ZXJDb21tYW5kLFxuICAgICAgICAgIHBhc3N3b3JkLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRPRE8obWJvbGluKTogVGVsbCB1c2VyIHRvIGZpbGwgb3V0IGFsbCBvZiB0aGUgZmllbGRzLlxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobW9kZSA9PT0gUkVRVUVTVF9BVVRIRU5USUNBVElPTl9ERVRBSUxTKSB7XG4gICAgICBjb25zdCBhdXRoZW50aWNhdGlvblByb21wdCA9IHRoaXMucmVmc1snYXV0aGVudGljYXRpb24nXTtcbiAgICAgIGNvbnN0IHBhc3N3b3JkID0gYXV0aGVudGljYXRpb25Qcm9tcHQuZ2V0UGFzc3dvcmQoKTtcblxuICAgICAgdGhpcy5zdGF0ZS5maW5pc2goW3Bhc3N3b3JkXSk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe21vZGU6IFdBSVRJTkdfRk9SX0FVVEhFTlRJQ0FUSU9OfSk7XG4gICAgfVxuICB9XG5cbiAgcmVxdWVzdEF1dGhlbnRpY2F0aW9uKFxuICAgIGluc3RydWN0aW9uczoge2VjaG86IGJvb2xlYW4sIHByb21wdDogc3RyaW5nfSxcbiAgICBmaW5pc2g6IChhbnN3ZXJzOiBBcnJheTxzdHJpbmc+KSA9PiB2b2lkXG4gICkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbW9kZTogUkVRVUVTVF9BVVRIRU5USUNBVElPTl9ERVRBSUxTLFxuICAgICAgaW5zdHJ1Y3Rpb25zOiBpbnN0cnVjdGlvbnMucHJvbXB0LFxuICAgICAgZmluaXNoLFxuICAgIH0pO1xuICB9XG5cbiAgZ2V0Rm9ybUZpZWxkcygpOiA/TnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25QYXJhbXMge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25EZXRhaWxzRm9ybSA9IHRoaXMucmVmc1snY29ubmVjdGlvbi1kZXRhaWxzJ107XG4gICAgaWYgKCFjb25uZWN0aW9uRGV0YWlsc0Zvcm0pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHNlcnZlcixcbiAgICAgIGN3ZCxcbiAgICAgIHJlbW90ZVNlcnZlckNvbW1hbmQsXG4gICAgICBzc2hQb3J0LFxuICAgICAgcGF0aFRvUHJpdmF0ZUtleSxcbiAgICAgIGF1dGhNZXRob2QsXG4gICAgfSA9IGNvbm5lY3Rpb25EZXRhaWxzRm9ybS5nZXRGb3JtRmllbGRzKCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgc2VydmVyLFxuICAgICAgY3dkLFxuICAgICAgcmVtb3RlU2VydmVyQ29tbWFuZCxcbiAgICAgIHNzaFBvcnQsXG4gICAgICBwYXRoVG9Qcml2YXRlS2V5LFxuICAgICAgYXV0aE1ldGhvZCxcbiAgICB9O1xuICB9XG5cbiAgb25Qcm9maWxlQ2xpY2tlZChpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7aW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGV9KTtcbiAgfVxufVxuLyogZXNsaW50LWVuYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG4iXX0=