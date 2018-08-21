/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {NuclideRemoteConnectionProfile} from './connection-types';
import type {Screen} from './RemoteProjectConnectionModal';
import type {
  SshHandshakeErrorType,
  SshConnectionConfiguration,
  SshConnectionDelegate,
} from '../../nuclide-remote-connection/lib/SshHandshake';
import type {ConnectionDialogMode} from './ConnectionDialog';

import Model from 'nuclide-commons/Model';
import showModal from 'nuclide-commons-ui/showModal';
import nullthrows from 'nullthrows';
import {
  getDefaultConnectionProfile,
  getOfficialRemoteServerCommand,
  getSavedConnectionProfiles,
  onSavedConnectionProfilesDidChange,
  saveConnectionConfig,
  saveConnectionProfiles,
} from './connection-profile-utils';
import RemoteProjectConnectionModal from './RemoteProjectConnectionModal';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import {getLogger} from 'log4js';
import * as React from 'react';
import {Observable} from 'rxjs';
import {ConnectionDialogModes} from './ConnectionDialog';
import {
  RemoteConnection,
  decorateSshConnectionDelegateWithTracking,
} from '../../nuclide-remote-connection';
import connectBigDigSshHandshake from './connectBigDigSshHandshake';
import {notifySshHandshakeError} from './notification';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

export type StartConnectFlowOptions = {
  initialServer?: string,
  initialCwd?: string,
  initialRemoteServerCommand?: string,
  project?: {|
    repo: string,
    path: string,
    originPath?: string,
  |},
};

type ConnectFlowOptions = StartConnectFlowOptions & {
  onComplete?: (?RemoteConnection) => mixed,
};

const logger = getLogger('nuclide-remote-projects');

/**
 * Opens the remote connection dialog flow, which includes asking the user
 * for connection parameters (e.g. username, server name, etc), and optionally
 * asking for additional (e.g. 2-fac) authentication.
 */
export default function startConnectFlow(
  options: StartConnectFlowOptions,
): Promise<?RemoteConnection> {
  let resolveConnectionPromise;
  let dismiss;

  const flow = new ConnectFlow({
    ...options,
    onComplete: connection => {
      nullthrows(dismiss)();
      nullthrows(resolveConnectionPromise)(connection);
    },
  });

  showModal(
    ({dismiss: dismiss_}) => {
      dismiss = dismiss_;
      const StatefulModal = getModalComponent(flow);
      return <StatefulModal />;
    },
    {
      shouldDismissOnClickOutsideModal: () => false,
      onDismiss: () => {
        flow.dispose();
      },
    },
  );

  return new Promise(resolve => {
    resolveConnectionPromise = resolve;
  });
}

type State = {|
  connectionFormDirty: boolean,
  confirmConnectionPrompt: () => void,
  connectionPromptInstructions: string,
  screen: Screen,
  connectionDialogMode: ConnectionDialogMode,
  selectedProfileIndex: number,
  connectionProfiles: Array<NuclideRemoteConnectionProfile>,
|};

class ConnectFlow {
  _disposables: IDisposable;
  _defaultConnectionProfile: NuclideRemoteConnectionProfile;
  _model: Model<State>;
  _pendingHandshake: ?IDisposable;
  _completeCallback: (?RemoteConnection) => mixed;

  constructor(options: ConnectFlowOptions) {
    // During the lifetime of this 'openConnectionDialog' flow, the 'default'
    // connection profile should not change (even if it is reset by the user
    // connecting to a remote project from another Atom window).
    this._defaultConnectionProfile = getDefaultConnectionProfile(options);

    this._completeCallback = nullthrows(options.onComplete);

    const initialConnectionProfiles = [
      this._defaultConnectionProfile,
      ...getSavedConnectionProfiles(),
    ];

    this._model = new Model({
      connectionFormDirty: false,
      confirmConnectionPrompt: () => {},
      connectionPromptInstructions: '',
      screen: 'connect',
      connectionDialogMode: ConnectionDialogModes.REQUEST_CONNECTION_DETAILS,
      selectedProfileIndex: 0,
      connectionProfiles: initialConnectionProfiles,
    });

    // If the saved profiles change, update them.
    this._disposables = onSavedConnectionProfilesDidChange(() => {
      this._updateState(
        {
          connectionProfiles: [
            this._defaultConnectionProfile,
            ...getSavedConnectionProfiles(),
          ],
        },
        // Don't write the changes to the config; that's where we got them from and we don't want
        // to cause an infinite loop.
        false,
      );
    });
  }

  dispose(): void {
    this._disposables.dispose();
  }

  //
  // Getters. If this were Redux, these would correspond to selectors. Note that none of them are
  // async!
  //

  getInitialFormFields = () => this._defaultConnectionProfile.params;
  getConnectionFormDirty = () => this._model.state.connectionFormDirty;
  getConfirmConnectionPrompt = () => this._model.state.confirmConnectionPrompt;
  getConnectionPromptInstructions = () =>
    this._model.state.connectionPromptInstructions;
  getScreen = () => this._model.state.screen;
  getConnectionDialogMode = () => this._model.state.connectionDialogMode;
  getSelectedProfileIndex = () => this._model.state.selectedProfileIndex;
  getConnectionProfiles = () => this._model.state.connectionProfiles;

  //
  // Mutations. If this were Redux, these would correspond to actions. Note that every one has a
  // return type of `void`!
  //

  setConnectionFormDirty = (dirty: boolean): void => {
    this._updateState({connectionFormDirty: dirty});
  };

  setConnectionDialogMode = (
    connectionDialogMode: ConnectionDialogMode,
  ): void => {
    this._updateState({connectionDialogMode});
  };

  changeScreen = screen => {
    this._updateState({screen});
  };

  saveProfile = (
    index: number,
    profile: NuclideRemoteConnectionProfile,
  ): void => {
    const connectionProfiles = this._model.state.connectionProfiles.slice();
    // Override the existing version.
    connectionProfiles.splice(index, 1, profile);
    this._updateState({connectionProfiles});
  };

  deleteProfile = (indexToDelete: number): void => {
    if (indexToDelete === 0) {
      // no-op: The default connection profile can't be deleted.
      // TODO jessicalin: Show this error message in a better place.
      atom.notifications.addError(
        'The default connection profile cannot be deleted.',
      );
      return;
    }
    const {connectionProfiles, selectedProfileIndex} = this._model.state;
    if (connectionProfiles) {
      if (indexToDelete >= connectionProfiles.length) {
        logger.fatal(
          'Tried to delete a connection profile with an index that does not exist. ' +
            'This should never happen.',
        );
        return;
      }
      const nextConnectionProfiles = connectionProfiles.slice();
      nextConnectionProfiles.splice(indexToDelete, 1);
      const nextSelectedProfileIndex =
        selectedProfileIndex >= indexToDelete
          ? selectedProfileIndex - 1
          : selectedProfileIndex;
      this._updateState({
        selectedProfileIndex: nextSelectedProfileIndex,
        connectionProfiles: nextConnectionProfiles,
      });
    }
  };

  addProfile = (newProfile: NuclideRemoteConnectionProfile) => {
    const connectionProfiles = [
      ...this._model.state.connectionProfiles,
      newProfile,
    ];
    this._updateState({
      connectionProfiles,
      selectedProfileIndex: connectionProfiles.length - 1,
      screen: 'connect',
    });
  };

  selectProfile = (selectedProfileIndex: number): void => {
    this._updateState({selectedProfileIndex});
  };

  connect = (config: SshConnectionConfiguration): void => {
    this._updateState({
      connectionFormDirty: false,
      connectionDialogMode: ConnectionDialogModes.WAITING_FOR_CONNECTION,
    });
    if (this._pendingHandshake != null) {
      this._pendingHandshake.dispose();
    }
    this._pendingHandshake = connect(
      this._createRemoteConnectionDelegate(),
      config,
    );
  };

  cancelConnection = (): void => {
    if (this._pendingHandshake != null) {
      this._pendingHandshake.dispose();
      this._pendingHandshake = null;
    }

    if (
      this._model.state.connectionDialogMode ===
      ConnectionDialogModes.WAITING_FOR_CONNECTION
    ) {
      this._updateState({
        connectionFormDirty: false,
        connectionDialogMode: ConnectionDialogModes.REQUEST_CONNECTION_DETAILS,
      });
    } else {
      this._complete(null);
    }
  };

  //
  // Subscription methods
  //

  onDidChange(cb: (?RemoteConnection) => mixed): IDisposable {
    return new UniversalDisposable(
      this._model.toObservable().subscribe(() => {
        cb();
      }),
    );
  }

  //
  // Utilities
  //

  _updateState(nextState: Object, saveProfiles: boolean = true): void {
    const prevState = this._model.state;
    this._model.setState(nextState);

    // If the connection profiles changed, save them to the config. The `saveProfiles` option allows
    // us to opt out because this is a bi-directional sync and we don't want to cause an infinite
    // loop!
    if (
      saveProfiles &&
      nextState.connectionProfiles != null &&
      nextState.connectionProfiles !== prevState.connectionProfiles
    ) {
      // Don't include the first profile when saving since that's the default.
      saveConnectionProfiles(nextState.connectionProfiles.slice(1));
    }
  }

  _createRemoteConnectionDelegate() {
    return decorateSshConnectionDelegateWithTracking({
      onKeyboardInteractive: (
        name,
        instructions,
        instructionsLang,
        prompts,
        confirm,
      ) => {
        this._updateState({
          connectionFormDirty: false,
          confirmConnectionPrompt: confirm,
          // TODO: Display all prompts, not just the first one.
          connectionPromptInstructions: prompts[0].prompt,
          connectionDialogMode:
            ConnectionDialogModes.REQUEST_AUTHENTICATION_DETAILS,
        });
      },
      onWillConnect: () => {},
      onDidConnect: (
        connection: RemoteConnection,
        config: SshConnectionConfiguration,
      ) => {
        this._complete(connection);
        saveConnectionConfig(config, getOfficialRemoteServerCommand());
      },
      onError: (
        errorType: SshHandshakeErrorType,
        error: Error,
        config: SshConnectionConfiguration,
      ) => {
        this._complete(/* connection */ null);
        notifySshHandshakeError(errorType, error, config);
        logger.debug(error);
        saveConnectionConfig(config, getOfficialRemoteServerCommand());
      },
    });
  }

  _complete(connection: ?RemoteConnection): void {
    this.dispose();
    this._completeCallback(connection);
  }
}

function connect(
  delegate: SshConnectionDelegate,
  connectionConfig: SshConnectionConfiguration,
): IDisposable {
  return new UniversalDisposable(
    Observable.defer(() =>
      RemoteConnection.reconnect(
        connectionConfig.host,
        connectionConfig.cwd,
        connectionConfig.displayTitle,
      ),
    )
      .switchMap(existingConnection => {
        if (existingConnection != null) {
          delegate.onWillConnect(connectionConfig); // required for the API
          delegate.onDidConnect(existingConnection, connectionConfig);
          return Observable.empty();
        }
        const sshHandshake = connectBigDigSshHandshake(
          connectionConfig,
          delegate,
        );
        return Observable.create(() => {
          return () => sshHandshake.cancel();
        });
      })
      .subscribe(
        next => {},
        err =>
          delegate.onError(
            err.sshHandshakeErrorType || 'UNKNOWN',
            err,
            connectionConfig,
          ),
      ),
  );
}

function getModalComponent(flow: ConnectFlow): React.ComponentType<*> {
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
    cancelConnection: flow.cancelConnection,
  };

  const flowStates = observableFromSubscribeFunction(cb =>
    flow.onDidChange(cb),
  ).map(() => ({
    connectionFormDirty: flow.getConnectionFormDirty(),
    confirmConnectionPrompt: flow.getConfirmConnectionPrompt(),
    connectionPromptInstructions: flow.getConnectionPromptInstructions(),
    screen: flow.getScreen(),
    connectionDialogMode: flow.getConnectionDialogMode(),
    selectedProfileIndex: flow.getSelectedProfileIndex(),
    connectionProfiles: flow.getConnectionProfiles(),
  }));

  const props = flowStates.map(state => ({...state, ...staticProps}));

  return bindObservableAsProps(props, RemoteProjectConnectionModal);
}
