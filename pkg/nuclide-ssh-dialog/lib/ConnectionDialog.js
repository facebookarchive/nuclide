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
//# sourceMappingURL=data:application/json;base64,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LEdBQUcseUNBQUgsR0FBRztVQUNILG1CQUFtQix5Q0FBbkIsbUJBQW1CO1VBQ25CLE9BQU8seUNBQVAsT0FBTztVQUNQLGdCQUFnQix5Q0FBaEIsZ0JBQWdCO1VBQ2hCLFVBQVUseUNBQVYsVUFBVTs7QUFFWixhQUFPO0FBQ0wsZ0JBQVEsRUFBUixRQUFRO0FBQ1IsY0FBTSxFQUFOLE1BQU07QUFDTixXQUFHLEVBQUgsR0FBRztBQUNILDJCQUFtQixFQUFuQixtQkFBbUI7QUFDbkIsZUFBTyxFQUFQLE9BQU87QUFDUCx3QkFBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLGtCQUFVLEVBQVYsVUFBVTtPQUNYLENBQUM7S0FDSDs7O1dBRWUsMEJBQUMsZ0NBQXdDLEVBQVE7QUFDL0QsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLGdDQUFnQyxFQUFoQyxnQ0FBZ0MsRUFBQyxDQUFDLENBQUM7S0FDbkQ7OztTQWhQRyxnQkFBZ0I7R0FBUyxvQkFBTSxTQUFTOztBQW1QOUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyIsImZpbGUiOiJDb25uZWN0aW9uRGlhbG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblBhcmFtcyxcbiAgTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25Qcm9maWxlLFxufSBmcm9tICcuL2Nvbm5lY3Rpb24tdHlwZXMnO1xuXG5pbXBvcnQgdHlwZSB7XG4gIFNzaEhhbmRzaGFrZUVycm9yVHlwZSxcbiAgU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24sXG59IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLWNvbm5lY3Rpb24vbGliL1NzaEhhbmRzaGFrZSc7XG5cbmltcG9ydCB0eXBlIHtSZW1vdGVDb25uZWN0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uL2xpYi9SZW1vdGVDb25uZWN0aW9uJztcblxuaW1wb3J0IHtub3RpZnlTc2hIYW5kc2hha2VFcnJvcn0gZnJvbSAnLi9ub3RpZmljYXRpb24nO1xuaW1wb3J0IEF1dGhlbnRpY2F0aW9uUHJvbXB0IGZyb20gJy4vQXV0aGVudGljYXRpb25Qcm9tcHQnO1xuaW1wb3J0IENvbm5lY3Rpb25EZXRhaWxzUHJvbXB0IGZyb20gJy4vQ29ubmVjdGlvbkRldGFpbHNQcm9tcHQnO1xuaW1wb3J0IEluZGV0ZXJtaW5hdGVQcm9ncmVzc0JhciBmcm9tICcuL0luZGV0ZXJtaW5hdGVQcm9ncmVzc0Jhcic7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge1xuICBTc2hIYW5kc2hha2UsXG4gIGRlY29yYXRlU3NoQ29ubmVjdGlvbkRlbGVnYXRlV2l0aFRyYWNraW5nLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJztcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpO1xuXG50eXBlIFByb3BzID0ge1xuICAvLyBUaGUgbGlzdCBvZiBjb25uZWN0aW9uIHByb2ZpbGVzIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQuXG4gIGNvbm5lY3Rpb25Qcm9maWxlczogP0FycmF5PE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZT47XG4gIC8vIElmIHRoZXJlIGlzID49IDEgY29ubmVjdGlvbiBwcm9maWxlLCB0aGlzIGluZGV4IGluZGljYXRlcyB0aGUgaW5pdGlhbFxuICAvLyBwcm9maWxlIHRvIHVzZS5cbiAgaW5kZXhPZkluaXRpYWxseVNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU6IG51bWJlcjtcbiAgLy8gRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgXCIrXCIgYnV0dG9uIG9uIHRoZSBwcm9maWxlcyBsaXN0IGlzIGNsaWNrZWQuXG4gIC8vIFRoZSB1c2VyJ3MgaW50ZW50IGlzIHRvIGNyZWF0ZSBhIG5ldyBwcm9maWxlLlxuICBvbkFkZFByb2ZpbGVDbGlja2VkOiAoKSA9PiBtaXhlZDtcbiAgLy8gRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgXCItXCIgYnV0dG9uIG9uIHRoZSBwcm9maWxlcyBsaXN0IGlzIGNsaWNrZWRcbiAgLy8gKiogd2hpbGUgYSBwcm9maWxlIGlzIHNlbGVjdGVkICoqLlxuICAvLyBUaGUgdXNlcidzIGludGVudCBpcyB0byBkZWxldGUgdGhlIGN1cnJlbnRseS1zZWxlY3RlZCBwcm9maWxlLlxuICBvbkRlbGV0ZVByb2ZpbGVDbGlja2VkOiAoaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU6IG51bWJlcikgPT4gbWl4ZWQ7XG4gIG9uQ29ubmVjdDogKCkgPT4gbWl4ZWQ7XG4gIG9uRXJyb3I6ICgpID0+IG1peGVkO1xuICBvbkNhbmNlbDogKCkgPT4gbWl4ZWQ7XG4gIG9uQ2xvc2VkOiA/KCkgPT4gbWl4ZWQ7XG59O1xuXG50eXBlIFN0YXRlID0ge1xuICBpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZTogbnVtYmVyO1xuICBpbnN0cnVjdGlvbnM6IHN0cmluZztcbiAgZmluaXNoOiAoYW5zd2VyczogQXJyYXk8c3RyaW5nPikgPT4gbWl4ZWQ7XG4gIG1vZGU6IG51bWJlcjtcbiAgc3NoSGFuZHNoYWtlOiBTc2hIYW5kc2hha2U7XG59O1xuXG5jb25zdCBSRVFVRVNUX0NPTk5FQ1RJT05fREVUQUlMUyA9IDE7XG5jb25zdCBXQUlUSU5HX0ZPUl9DT05ORUNUSU9OID0gMjtcbmNvbnN0IFJFUVVFU1RfQVVUSEVOVElDQVRJT05fREVUQUlMUyA9IDM7XG5jb25zdCBXQUlUSU5HX0ZPUl9BVVRIRU5USUNBVElPTiA9IDQ7XG5cbi8qKlxuICogQ29tcG9uZW50IHRoYXQgbWFuYWdlcyB0aGUgc3RhdGUgdHJhbnNpdGlvbnMgYXMgdGhlIHVzZXIgY29ubmVjdHMgdG8gYVxuICogc2VydmVyLlxuICovXG5jbGFzcyBDb25uZWN0aW9uRGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuICBzdGF0ZTogU3RhdGU7XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBpbmRleE9mSW5pdGlhbGx5U2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZTogLTEsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgY29uc3Qgc3NoSGFuZHNoYWtlID0gbmV3IFNzaEhhbmRzaGFrZShkZWNvcmF0ZVNzaENvbm5lY3Rpb25EZWxlZ2F0ZVdpdGhUcmFja2luZyh7XG4gICAgICBvbktleWJvYXJkSW50ZXJhY3RpdmU6IChuYW1lLCBpbnN0cnVjdGlvbnMsIGluc3RydWN0aW9uc0xhbmcsIHByb21wdHMsIGZpbmlzaCkgID0+IHtcbiAgICAgICAgLy8gVE9ETzogRGlzcGxheSBhbGwgcHJvbXB0cywgbm90IGp1c3QgdGhlIGZpcnN0IG9uZS5cbiAgICAgICAgdGhpcy5yZXF1ZXN0QXV0aGVudGljYXRpb24ocHJvbXB0c1swXSwgZmluaXNoKTtcbiAgICAgIH0sXG5cbiAgICAgIG9uV2lsbENvbm5lY3Q6KCkgPT4ge30sXG5cbiAgICAgIG9uRGlkQ29ubmVjdDogKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24sIGNvbmZpZzogU3NoQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pID0+IHtcbiAgICAgICAgdGhpcy5jbG9zZSgpOyAvLyBDbG9zZSB0aGUgZGlhbG9nLlxuICAgICAgICB0aGlzLnByb3BzLm9uQ29ubmVjdChjb25uZWN0aW9uLCBjb25maWcpO1xuICAgICAgfSxcblxuICAgICAgb25FcnJvcjogKFxuICAgICAgICBlcnJvclR5cGU6IFNzaEhhbmRzaGFrZUVycm9yVHlwZSxcbiAgICAgICAgZXJyb3I6IEVycm9yLFxuICAgICAgICBjb25maWc6IFNzaENvbm5lY3Rpb25Db25maWd1cmF0aW9uLFxuICAgICAgKSA9PiB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTsgLy8gQ2xvc2UgdGhlIGRpYWxvZy5cbiAgICAgICAgbm90aWZ5U3NoSGFuZHNoYWtlRXJyb3IoZXJyb3JUeXBlLCBlcnJvciwgY29uZmlnKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkVycm9yKGVycm9yLCBjb25maWcpO1xuICAgICAgICBsb2dnZXIuZGVidWcoZXJyb3IpO1xuICAgICAgfSxcbiAgICB9KSk7XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZmluaXNoOiBhbnN3ZXJzID0+IHt9LFxuICAgICAgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU6IHByb3BzLmluZGV4T2ZJbml0aWFsbHlTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlLFxuICAgICAgaW5zdHJ1Y3Rpb25zOiAnJyxcbiAgICAgIG1vZGU6IFJFUVVFU1RfQ09OTkVDVElPTl9ERVRBSUxTLFxuICAgICAgc3NoSGFuZHNoYWtlOiBzc2hIYW5kc2hha2UsXG4gICAgfTtcblxuICAgICh0aGlzOiBhbnkpLmNhbmNlbCA9IHRoaXMuY2FuY2VsLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkub2sgPSB0aGlzLm9rLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkub25Qcm9maWxlQ2xpY2tlZCA9IHRoaXMub25Qcm9maWxlQ2xpY2tlZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6IFByb3BzKTogdm9pZCB7XG4gICAgbGV0IGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlID0gdGhpcy5zdGF0ZS5pbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZTtcbiAgICBpZiAobmV4dFByb3BzLmNvbm5lY3Rpb25Qcm9maWxlcyA9PSBudWxsKSB7XG4gICAgICBpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZSA9IC0xO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0aGlzLnByb3BzLmNvbm5lY3Rpb25Qcm9maWxlcyA9PSBudWxsXG4gICAgICAvLyBUaGUgY3VycmVudCBzZWxlY3Rpb24gaXMgb3V0c2lkZSB0aGUgYm91bmRzIG9mIHRoZSBuZXh0IHByb2ZpbGVzIGxpc3RcbiAgICAgIHx8IGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlID4gKG5leHRQcm9wcy5jb25uZWN0aW9uUHJvZmlsZXMubGVuZ3RoIC0gMSlcbiAgICAgIC8vIFRoZSBuZXh0IHByb2ZpbGVzIGxpc3QgaXMgbG9uZ2VyIHRoYW4gYmVmb3JlLCBhIG5ldyBvbmUgd2FzIGFkZGVkXG4gICAgICB8fCBuZXh0UHJvcHMuY29ubmVjdGlvblByb2ZpbGVzLmxlbmd0aCA+IHRoaXMucHJvcHMuY29ubmVjdGlvblByb2ZpbGVzLmxlbmd0aFxuICAgICkge1xuICAgICAgLy8gU2VsZWN0IHRoZSBmaW5hbCBjb25uZWN0aW9uIHByb2ZpbGUgaW4gdGhlIGxpc3QgYmVjYXVzZSBvbmUgb2YgdGhlIGFib3ZlIGNvbmRpdGlvbnMgbWVhbnNcbiAgICAgIC8vIHRoZSBjdXJyZW50IHNlbGVjdGVkIGluZGV4IGlzIG91dGRhdGVkLlxuICAgICAgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGUgPSBuZXh0UHJvcHMuY29ubmVjdGlvblByb2ZpbGVzLmxlbmd0aCAtIDE7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7aW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGV9KTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IG1vZGUgPSB0aGlzLnN0YXRlLm1vZGU7XG4gICAgbGV0IGNvbnRlbnQ7XG4gICAgbGV0IGlzT2tEaXNhYmxlZDtcbiAgICBsZXQgb2tCdXR0b25UZXh0O1xuXG4gICAgaWYgKG1vZGUgPT09IFJFUVVFU1RfQ09OTkVDVElPTl9ERVRBSUxTKSB7XG4gICAgICBjb250ZW50ID0gKFxuICAgICAgICA8Q29ubmVjdGlvbkRldGFpbHNQcm9tcHRcbiAgICAgICAgICByZWY9XCJjb25uZWN0aW9uLWRldGFpbHNcIlxuICAgICAgICAgIGNvbm5lY3Rpb25Qcm9maWxlcz17dGhpcy5wcm9wcy5jb25uZWN0aW9uUHJvZmlsZXN9XG4gICAgICAgICAgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU9e3RoaXMuc3RhdGUuaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGV9XG4gICAgICAgICAgb25BZGRQcm9maWxlQ2xpY2tlZD17dGhpcy5wcm9wcy5vbkFkZFByb2ZpbGVDbGlja2VkfVxuICAgICAgICAgIG9uRGVsZXRlUHJvZmlsZUNsaWNrZWQ9e3RoaXMucHJvcHMub25EZWxldGVQcm9maWxlQ2xpY2tlZH1cbiAgICAgICAgICBvbkNvbmZpcm09e3RoaXMub2t9XG4gICAgICAgICAgb25DYW5jZWw9e3RoaXMuY2FuY2VsfVxuICAgICAgICAgIG9uUHJvZmlsZUNsaWNrZWQ9e3RoaXMub25Qcm9maWxlQ2xpY2tlZH1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgICBpc09rRGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgIG9rQnV0dG9uVGV4dCA9ICdDb25uZWN0JztcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT09IFdBSVRJTkdfRk9SX0NPTk5FQ1RJT04gfHwgbW9kZSA9PT0gV0FJVElOR19GT1JfQVVUSEVOVElDQVRJT04pIHtcbiAgICAgIGNvbnRlbnQgPSA8SW5kZXRlcm1pbmF0ZVByb2dyZXNzQmFyIC8+O1xuICAgICAgaXNPa0Rpc2FibGVkID0gdHJ1ZTtcbiAgICAgIG9rQnV0dG9uVGV4dCA9ICdDb25uZWN0JztcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGVudCA9IChcbiAgICAgICAgPEF1dGhlbnRpY2F0aW9uUHJvbXB0XG4gICAgICAgICAgcmVmPVwiYXV0aGVudGljYXRpb25cIlxuICAgICAgICAgIGluc3RydWN0aW9ucz17dGhpcy5zdGF0ZS5pbnN0cnVjdGlvbnN9XG4gICAgICAgICAgb25Db25maXJtPXt0aGlzLm9rfVxuICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLmNhbmNlbH1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgICBpc09rRGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgIG9rQnV0dG9uVGV4dCA9ICdPSyc7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxhdG9tLXBhbmVsIGNsYXNzPVwibW9kYWwgbW9kYWwtbGcgZnJvbS10b3BcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYWRkZWRcIj5cbiAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFkZGVkIHRleHQtcmlnaHRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ0bi1ncm91cFwiPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG5cIiBvbkNsaWNrPXt0aGlzLmNhbmNlbH0+XG4gICAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeVwiIG9uQ2xpY2s9e3RoaXMub2t9IGRpc2FibGVkPXtpc09rRGlzYWJsZWR9PlxuICAgICAgICAgICAgICB7b2tCdXR0b25UZXh0fVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9hdG9tLXBhbmVsPlxuICAgICk7XG4gIH1cblxuICBjYW5jZWwoKSB7XG4gICAgY29uc3QgbW9kZSA9IHRoaXMuc3RhdGUubW9kZTtcblxuICAgIC8vIEl0IGlzIHNhZmUgdG8gY2FsbCBjYW5jZWwgZXZlbiBpZiBubyBjb25uZWN0aW9uIGlzIHN0YXJ0ZWRcbiAgICB0aGlzLnN0YXRlLnNzaEhhbmRzaGFrZS5jYW5jZWwoKTtcblxuICAgIGlmIChtb2RlID09PSBXQUlUSU5HX0ZPUl9DT05ORUNUSU9OKSB7XG4gICAgICAvLyBUT0RPKG1pa2VvKTogVGVsbCBkZWxlZ2F0ZSB0byBjYW5jZWwgdGhlIGNvbm5lY3Rpb24gcmVxdWVzdC5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe21vZGU6IFJFUVVFU1RfQ09OTkVDVElPTl9ERVRBSUxTfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRPRE8obWlrZW8pOiBBbHNvIGNhbmNlbCBjb25uZWN0aW9uIHJlcXVlc3QsIGFzIGFwcHJvcHJpYXRlIGZvciBtb2RlP1xuICAgICAgdGhpcy5wcm9wcy5vbkNhbmNlbCgpO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uQ2xvc2VkKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQ2xvc2VkKCk7XG4gICAgfVxuICB9XG5cbiAgb2soKSB7XG4gICAgY29uc3Qge1xuICAgICAgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGUsXG4gICAgICBtb2RlLFxuICAgIH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgY29uc3Qge1xuICAgICAgY29ubmVjdGlvblByb2ZpbGVzLFxuICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgaWYgKG1vZGUgPT09IFJFUVVFU1RfQ09OTkVDVElPTl9ERVRBSUxTKSB7XG4gICAgICAvLyBVc2VyIGlzIHRyeWluZyB0byBzdWJtaXQgY29ubmVjdGlvbiBkZXRhaWxzLlxuICAgICAgY29uc3QgY29ubmVjdGlvbkRldGFpbHNGb3JtID0gdGhpcy5yZWZzWydjb25uZWN0aW9uLWRldGFpbHMnXTtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgdXNlcm5hbWUsXG4gICAgICAgIHNlcnZlcixcbiAgICAgICAgY3dkLFxuICAgICAgICByZW1vdGVTZXJ2ZXJDb21tYW5kLFxuICAgICAgICBzc2hQb3J0LFxuICAgICAgICBwYXRoVG9Qcml2YXRlS2V5LFxuICAgICAgICBhdXRoTWV0aG9kLFxuICAgICAgICBwYXNzd29yZCxcbiAgICAgIH0gPSBjb25uZWN0aW9uRGV0YWlsc0Zvcm0uZ2V0Rm9ybUZpZWxkcygpO1xuXG4gICAgICBsZXQgZGlzcGxheVRpdGxlID0gJyc7XG4gICAgICBpZiAoY29ubmVjdGlvblByb2ZpbGVzICE9IG51bGwgJiYgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGUgPiAtMSkge1xuICAgICAgICAoe2Rpc3BsYXlUaXRsZX0gPSBjb25uZWN0aW9uUHJvZmlsZXNbaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGVdKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHVzZXJuYW1lICYmIHNlcnZlciAmJiBjd2QgJiYgcmVtb3RlU2VydmVyQ29tbWFuZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHttb2RlOiBXQUlUSU5HX0ZPUl9DT05ORUNUSU9OfSk7XG4gICAgICAgIHRoaXMuc3RhdGUuc3NoSGFuZHNoYWtlLmNvbm5lY3Qoe1xuICAgICAgICAgIGhvc3Q6IHNlcnZlcixcbiAgICAgICAgICBzc2hQb3J0LFxuICAgICAgICAgIHVzZXJuYW1lLFxuICAgICAgICAgIHBhdGhUb1ByaXZhdGVLZXksXG4gICAgICAgICAgYXV0aE1ldGhvZCxcbiAgICAgICAgICBjd2QsXG4gICAgICAgICAgcmVtb3RlU2VydmVyQ29tbWFuZCxcbiAgICAgICAgICBwYXNzd29yZCxcbiAgICAgICAgICBkaXNwbGF5VGl0bGUsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVE9ETyhtYm9saW4pOiBUZWxsIHVzZXIgdG8gZmlsbCBvdXQgYWxsIG9mIHRoZSBmaWVsZHMuXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChtb2RlID09PSBSRVFVRVNUX0FVVEhFTlRJQ0FUSU9OX0RFVEFJTFMpIHtcbiAgICAgIGNvbnN0IGF1dGhlbnRpY2F0aW9uUHJvbXB0ID0gdGhpcy5yZWZzWydhdXRoZW50aWNhdGlvbiddO1xuICAgICAgY29uc3QgcGFzc3dvcmQgPSBhdXRoZW50aWNhdGlvblByb21wdC5nZXRQYXNzd29yZCgpO1xuXG4gICAgICB0aGlzLnN0YXRlLmZpbmlzaChbcGFzc3dvcmRdKTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7bW9kZTogV0FJVElOR19GT1JfQVVUSEVOVElDQVRJT059KTtcbiAgICB9XG4gIH1cblxuICByZXF1ZXN0QXV0aGVudGljYXRpb24oXG4gICAgaW5zdHJ1Y3Rpb25zOiB7ZWNobzogYm9vbGVhbjsgcHJvbXB0OiBzdHJpbmd9LFxuICAgIGZpbmlzaDogKGFuc3dlcnM6IEFycmF5PHN0cmluZz4pID0+IHZvaWRcbiAgKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBtb2RlOiBSRVFVRVNUX0FVVEhFTlRJQ0FUSU9OX0RFVEFJTFMsXG4gICAgICBpbnN0cnVjdGlvbnM6IGluc3RydWN0aW9ucy5wcm9tcHQsXG4gICAgICBmaW5pc2gsXG4gICAgfSk7XG4gIH1cblxuICBnZXRGb3JtRmllbGRzKCk6ID9OdWNsaWRlUmVtb3RlQ29ubmVjdGlvblBhcmFtcyB7XG4gICAgY29uc3QgY29ubmVjdGlvbkRldGFpbHNGb3JtID0gdGhpcy5yZWZzWydjb25uZWN0aW9uLWRldGFpbHMnXTtcbiAgICBpZiAoIWNvbm5lY3Rpb25EZXRhaWxzRm9ybSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgc2VydmVyLFxuICAgICAgY3dkLFxuICAgICAgcmVtb3RlU2VydmVyQ29tbWFuZCxcbiAgICAgIHNzaFBvcnQsXG4gICAgICBwYXRoVG9Qcml2YXRlS2V5LFxuICAgICAgYXV0aE1ldGhvZCxcbiAgICB9ID0gY29ubmVjdGlvbkRldGFpbHNGb3JtLmdldEZvcm1GaWVsZHMoKTtcbiAgICByZXR1cm4ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICBzZXJ2ZXIsXG4gICAgICBjd2QsXG4gICAgICByZW1vdGVTZXJ2ZXJDb21tYW5kLFxuICAgICAgc3NoUG9ydCxcbiAgICAgIHBhdGhUb1ByaXZhdGVLZXksXG4gICAgICBhdXRoTWV0aG9kLFxuICAgIH07XG4gIH1cblxuICBvblByb2ZpbGVDbGlja2VkKGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZX0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29ubmVjdGlvbkRpYWxvZztcbiJdfQ==