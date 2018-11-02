"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = startConnectFlow;

function _Model() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/Model"));

  _Model = function () {
    return data;
  };

  return data;
}

function _showModal() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/showModal"));

  _showModal = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _connectionProfileUtils() {
  const data = require("./connection-profile-utils");

  _connectionProfileUtils = function () {
    return data;
  };

  return data;
}

function _RemoteProjectConnectionModal() {
  const data = _interopRequireDefault(require("./RemoteProjectConnectionModal"));

  _RemoteProjectConnectionModal = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _bindObservableAsProps() {
  const data = require("../../../modules/nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _ConnectionDialog() {
  const data = require("./ConnectionDialog");

  _ConnectionDialog = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _connectBigDigSshHandshake() {
  const data = _interopRequireDefault(require("./connectBigDigSshHandshake"));

  _connectBigDigSshHandshake = function () {
    return data;
  };

  return data;
}

function _notification() {
  const data = require("./notification");

  _notification = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('nuclide-remote-projects');
/**
 * Opens the remote connection dialog flow, which includes asking the user
 * for connection parameters (e.g. username, server name, etc), and optionally
 * asking for additional (e.g. 2-fac) authentication.
 */

function startConnectFlow(options) {
  let resolveConnectionPromise;
  let dismiss;
  const flow = new ConnectFlow(Object.assign({}, options, {
    onComplete: connection => {
      (0, _nullthrows().default)(dismiss)();
      (0, _nullthrows().default)(resolveConnectionPromise)(connection);
    }
  }));

  if (options === null || options === void 0 ? void 0 : options.attemptImmediateConnection) {
    flow.connect();
  }

  (0, _showModal().default)(({
    dismiss: dismiss_
  }) => {
    dismiss = dismiss_;
    const StatefulModal = getModalComponent(flow);
    return React.createElement(StatefulModal, null);
  }, {
    shouldDismissOnClickOutsideModal: () => false,
    onDismiss: () => {
      flow.dispose();
    }
  });
  return new Promise(resolve => {
    resolveConnectionPromise = resolve;
  });
}

class ConnectFlow {
  constructor(options) {
    this.getInitialFormFields = () => this._defaultConnectionProfile.params;

    this.getConnectionError = () => this._model.state.connectionError;

    this.getConnectionFormDirty = () => this._model.state.connectionFormDirty;

    this.getConfirmConnectionPrompt = () => this._model.state.confirmConnectionPrompt;

    this.getConnectionPromptInstructions = () => this._model.state.connectionPromptInstructions;

    this.getScreen = () => this._model.state.screen;

    this.getConnectionDialogMode = () => this._model.state.connectionDialogMode;

    this.getSelectedProfileIndex = () => this._model.state.selectedProfileIndex;

    this.getConnectionProfiles = () => this._model.state.connectionProfiles;

    this.setConnectionFormDirty = dirty => {
      this._updateState({
        connectionFormDirty: dirty
      });
    };

    this.setConnectionDialogMode = connectionDialogMode => {
      this._updateState({
        connectionDialogMode
      });
    };

    this.changeScreen = screen => {
      this._updateState({
        screen
      });
    };

    this.saveProfile = (index, profile) => {
      const connectionProfiles = this._model.state.connectionProfiles.slice(); // Override the existing version.


      connectionProfiles.splice(index, 1, profile);

      this._updateState({
        connectionProfiles
      });
    };

    this.deleteProfile = indexToDelete => {
      if (indexToDelete === 0) {
        // no-op: The default connection profile can't be deleted.
        // TODO jessicalin: Show this error message in a better place.
        atom.notifications.addError('The default connection profile cannot be deleted.');
        return;
      }

      const {
        connectionProfiles,
        selectedProfileIndex
      } = this._model.state;

      if (connectionProfiles) {
        if (indexToDelete >= connectionProfiles.length) {
          logger.fatal('Tried to delete a connection profile with an index that does not exist. ' + 'This should never happen.');
          return;
        }

        const nextConnectionProfiles = connectionProfiles.slice();
        nextConnectionProfiles.splice(indexToDelete, 1);
        const nextSelectedProfileIndex = selectedProfileIndex >= indexToDelete ? selectedProfileIndex - 1 : selectedProfileIndex;

        this._updateState({
          selectedProfileIndex: nextSelectedProfileIndex,
          connectionProfiles: nextConnectionProfiles
        });
      }
    };

    this.addProfile = newProfile => {
      const connectionProfiles = [...this._model.state.connectionProfiles, newProfile];

      this._updateState({
        connectionProfiles,
        selectedProfileIndex: connectionProfiles.length - 1,
        screen: 'connect'
      });
    };

    this.selectProfile = selectedProfileIndex => {
      this._updateState({
        selectedProfileIndex
      });
    };

    this.connect = config_ => {
      let config = config_;

      if (config == null) {
        const connectionParams = this._defaultConnectionProfile.params; // There are some slight differences between the connection profile params type and the
        // SshConnectionConfiguration so we need to convert.

        config = {
          host: connectionParams.server,
          sshPort: parseInt(connectionParams.sshPort, 10),
          username: connectionParams.username,
          pathToPrivateKey: connectionParams.pathToPrivateKey,
          remoteServerCommand: connectionParams.remoteServerCommand,
          cwd: connectionParams.cwd,
          authMethod: connectionParams.authMethod,
          password: '',
          // This needs to be provided. ¯\_(ツ)_/¯
          displayTitle: connectionParams.displayTitle
        };
      }

      this._updateState({
        connectionFormDirty: false,
        connectionDialogMode: _ConnectionDialog().ConnectionDialogModes.WAITING_FOR_CONNECTION
      });

      if (this._pendingHandshake != null) {
        this._pendingHandshake.dispose();
      }

      this._pendingHandshake = connect(this._createRemoteConnectionDelegate(), config);
    };

    this.cancelConnection = () => {
      if (this._pendingHandshake != null) {
        this._pendingHandshake.dispose();

        this._pendingHandshake = null;
      }

      if (this._model.state.connectionDialogMode === _ConnectionDialog().ConnectionDialogModes.WAITING_FOR_CONNECTION) {
        this._updateState({
          connectionFormDirty: false,
          connectionDialogMode: _ConnectionDialog().ConnectionDialogModes.REQUEST_CONNECTION_DETAILS
        });
      } else {
        this._complete(null);
      }
    };

    // During the lifetime of this 'openConnectionDialog' flow, the 'default'
    // connection profile should not change (even if it is reset by the user
    // connecting to a remote project from another Atom window).
    this._defaultConnectionProfile = (0, _connectionProfileUtils().getDefaultConnectionProfile)(options);
    this._completeCallback = (0, _nullthrows().default)(options.onComplete);
    const initialConnectionProfiles = [this._defaultConnectionProfile, ...(0, _connectionProfileUtils().getSavedConnectionProfiles)()];
    this._model = new (_Model().default)({
      connectionError: null,
      connectionFormDirty: false,
      confirmConnectionPrompt: () => {},
      connectionPromptInstructions: '',
      screen: 'connect',
      connectionDialogMode: _ConnectionDialog().ConnectionDialogModes.REQUEST_CONNECTION_DETAILS,
      selectedProfileIndex: 0,
      connectionProfiles: initialConnectionProfiles
    }); // If the saved profiles change, update them.

    this._disposables = (0, _connectionProfileUtils().onSavedConnectionProfilesDidChange)(() => {
      this._updateState({
        connectionProfiles: [this._defaultConnectionProfile, ...(0, _connectionProfileUtils().getSavedConnectionProfiles)()]
      }, // Don't write the changes to the config; that's where we got them from and we don't want
      // to cause an infinite loop.
      false);
    });
  }

  dispose() {
    this._disposables.dispose();
  } //
  // Getters. If this were Redux, these would correspond to selectors. Note that none of them are
  // async!
  //


  //
  // Subscription methods
  //
  onDidChange(cb) {
    return new (_UniversalDisposable().default)(this._model.toObservable().subscribe(() => {
      cb();
    }));
  } //
  // Utilities
  //


  _updateState(nextState_, saveProfiles = true) {
    const prevState = this._model.state;
    const nextState = Object.assign({}, prevState, nextState_); // If the connection profiles changed, save them to the config. The `saveProfiles` option allows
    // us to opt out because this is a bi-directional sync and we don't want to cause an infinite
    // loop!

    if (saveProfiles && nextState.connectionProfiles != null && nextState.connectionProfiles !== prevState.connectionProfiles) {
      // Don't include the first profile when saving since that's the default.
      (0, _connectionProfileUtils().saveConnectionProfiles)(nextState.connectionProfiles.slice(1));
    } // Reset the connection error when the screen changes.


    if (nextState.screen !== prevState.screen && nextState.screen !== 'connect' || nextState.connectionDialogMode !== prevState.connectionDialogMode && nextState.mode !== _ConnectionDialog().ConnectionDialogModes.REQUEST_CONNECTION_DETAILS || nextState.selectedProfileIndex !== prevState.selectedProfileIndex) {
      nextState.connectionError = null;
    }

    this._model.setState(nextState);
  }

  _createRemoteConnectionDelegate() {
    return (0, _nuclideRemoteConnection().decorateSshConnectionDelegateWithTracking)({
      onKeyboardInteractive: (name, instructions, instructionsLang, prompts, confirm) => {
        this._updateState({
          connectionFormDirty: false,
          confirmConnectionPrompt: confirm,
          // TODO: Display all prompts, not just the first one.
          connectionPromptInstructions: prompts[0].prompt,
          connectionDialogMode: _ConnectionDialog().ConnectionDialogModes.REQUEST_AUTHENTICATION_DETAILS
        });
      },
      onWillConnect: () => {},
      onDidConnect: (connection, config) => {
        this._complete(connection);

        (0, _connectionProfileUtils().saveConnectionConfig)(config, (0, _connectionProfileUtils().getOfficialRemoteServerCommand)());
      },
      onError: (errorType, error, config) => {
        // Give the user a chance to correct the issue, if possible.
        if (getCanUserFixError(errorType)) {
          this._model.setState({
            connectionError: (0, _notification().humanizeErrorMessage)(errorType, error, config),
            confirmConnectionPrompt: () => {},
            connectionPromptInstructions: '',
            screen: 'connect',
            connectionDialogMode: _ConnectionDialog().ConnectionDialogModes.REQUEST_CONNECTION_DETAILS
          });
        } else {
          this._complete(
          /* connection */
          null);

          (0, _notification().notifySshHandshakeError)(errorType, error, config);
          (0, _connectionProfileUtils().saveConnectionConfig)(config, (0, _connectionProfileUtils().getOfficialRemoteServerCommand)());
        }

        logger.debug(error);
      }
    });
  }

  _complete(connection) {
    this.dispose();

    this._completeCallback(connection);
  }

}

function connect(delegate, connectionConfig) {
  return new (_UniversalDisposable().default)(_rxjsCompatUmdMin.Observable.defer(() => _nuclideRemoteConnection().RemoteConnection.reconnect(connectionConfig.host, connectionConfig.cwd, connectionConfig.displayTitle)).switchMap(existingConnection => {
    if (existingConnection != null) {
      delegate.onWillConnect(connectionConfig); // required for the API

      delegate.onDidConnect(existingConnection, connectionConfig);
      return _rxjsCompatUmdMin.Observable.empty();
    }

    const sshHandshake = (0, _connectBigDigSshHandshake().default)(connectionConfig, delegate);
    return _rxjsCompatUmdMin.Observable.create(() => {
      return () => sshHandshake.cancel();
    });
  }).subscribe(next => {}, err => delegate.onError(err.sshHandshakeErrorType || 'UNKNOWN', err, connectionConfig)));
}

function getModalComponent(flow) {
  // These props don't change over the lifetime of the modal.
  const staticProps = {
    initialFormFields: flow.getInitialFormFields(),
    setConnectionFormDirty: flow.setConnectionFormDirty,
    setConnectionDialogMode: flow.setConnectionDialogMode,
    onScreenChange: flow.changeScreen,
    onSaveProfile: flow.saveProfile,
    onDeleteProfileClicked: flow.deleteProfile,
    onProfileCreated: flow.addProfile,
    onProfileSelected: flow.selectProfile,
    connect: flow.connect,
    cancelConnection: flow.cancelConnection
  };
  const flowStates = (0, _event().observableFromSubscribeFunction)(cb => flow.onDidChange(cb)).map(() => ({
    connectionError: flow.getConnectionError(),
    connectionFormDirty: flow.getConnectionFormDirty(),
    confirmConnectionPrompt: flow.getConfirmConnectionPrompt(),
    connectionPromptInstructions: flow.getConnectionPromptInstructions(),
    screen: flow.getScreen(),
    connectionDialogMode: flow.getConnectionDialogMode(),
    selectedProfileIndex: flow.getSelectedProfileIndex(),
    connectionProfiles: flow.getConnectionProfiles()
  }));
  const props = flowStates.map(state => Object.assign({}, state, staticProps));
  return (0, _bindObservableAsProps().bindObservableAsProps)(props, _RemoteProjectConnectionModal().default);
}
/**
 * Is this an error that the user can fix by tweaking their connection profile?
 */


function getCanUserFixError(errorType) {
  switch (errorType) {
    case 'HOST_NOT_FOUND':
    case 'CANT_READ_PRIVATE_KEY':
    case 'SSH_AUTHENTICATION':
    case 'DIRECTORY_NOT_FOUND':
      return true;

    default:
      return false;
  }
}