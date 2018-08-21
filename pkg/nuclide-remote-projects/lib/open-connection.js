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
// eslint-disable-next-line nuclide-internal/import-type-style
import type {Props as RemoteProjectConnectionModalProps} from './RemoteProjectConnectionModal';
import type {
  SshHandshakeErrorType,
  SshConnectionConfiguration,
  SshConnectionDelegate,
} from '../../nuclide-remote-connection/lib/SshHandshake';

import Model from 'nuclide-commons/Model';
import showModal from 'nuclide-commons-ui/showModal';
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
import {
  REQUEST_CONNECTION_DETAILS,
  REQUEST_AUTHENTICATION_DETAILS,
  WAITING_FOR_CONNECTION,
} from './ConnectionDialog';
import {
  RemoteConnection,
  decorateSshConnectionDelegateWithTracking,
} from '../../nuclide-remote-connection';
import connectBigDigSshHandshake from './connectBigDigSshHandshake';
import {notifySshHandshakeError} from './notification';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

export type OpenConnectionDialogOptions = {
  initialServer?: string,
  initialCwd?: string,
  initialRemoteServerCommand?: string,
  project?: {|
    repo: string,
    path: string,
    originPath?: string,
  |},
};

const logger = getLogger('nuclide-remote-projects');

/**
 * Opens the remote connection dialog flow, which includes asking the user
 * for connection parameters (e.g. username, server name, etc), and optionally
 * asking for additional (e.g. 2-fac) authentication.
 */
export function openConnectionDialog(
  dialogOptions?: OpenConnectionDialogOptions,
): Promise<?RemoteConnection> {
  return new Promise(resolve => {
    showModal(
      ({dismiss}) => {
        const StatefulModal = bindObservableAsProps(
          createPropsStream({dismiss, onConnected: resolve, dialogOptions}),
          RemoteProjectConnectionModal,
        );
        return <StatefulModal />;
      },
      {shouldDismissOnClickOutsideModal: () => false},
    );
  });
}

/**
 * Creates an observable that contains the props of the wizard component. When the state changes,
 * the observable emits new props and (thanks to `bindObservableAsProps`), we re-render the
 * component.
 */
function createPropsStream({dismiss, onConnected, dialogOptions}) {
  let pendingHandshake: ?IDisposable = null;

  // During the lifetime of this 'openConnectionDialog' flow, the 'default'
  // connection profile should not change (even if it is reset by the user
  // connecting to a remote project from another Atom window).
  const defaultConnectionProfile = getDefaultConnectionProfile(dialogOptions);

  const initialConnectionProfiles = [
    defaultConnectionProfile,
    ...getSavedConnectionProfiles(),
  ];

  const delegate = decorateSshConnectionDelegateWithTracking({
    onKeyboardInteractive: (
      name,
      instructions,
      instructionsLang,
      prompts,
      confirm,
    ) => {
      updateState({
        connectionFormDirty: false,
        confirmConnectionPrompt: confirm,
        // TODO: Display all prompts, not just the first one.
        connectionPromptInstructions: prompts[0].prompt,
        connectionDialogMode: REQUEST_AUTHENTICATION_DETAILS,
      });
    },

    onWillConnect: () => {},

    onDidConnect: (
      connection: RemoteConnection,
      config: SshConnectionConfiguration,
    ) => {
      dismiss(); // Close the dialog.
      onConnected(connection);
      saveConnectionConfig(config, getOfficialRemoteServerCommand());
    },

    onError: (
      errorType: SshHandshakeErrorType,
      error: Error,
      config: SshConnectionConfiguration,
    ) => {
      dismiss(); // Close the dialog.
      notifySshHandshakeError(errorType, error, config);
      onConnected(/* connection */ null);
      logger.debug(error);
      saveConnectionConfig(config, getOfficialRemoteServerCommand());
    },
  });

  // These props don't change over the lifetime of the modal.
  const staticProps = {
    initialFormFields: defaultConnectionProfile.params,

    setConnectionFormDirty(dirty: boolean): void {
      updateState({connectionFormDirty: dirty});
    },
    setConnectionDialogMode: (connectionDialogMode: number): void => {
      updateState({connectionDialogMode});
    },

    onScreenChange: screen => {
      updateState({screen});
    },
    onSaveProfile(
      index: number,
      profile: NuclideRemoteConnectionProfile,
    ): void {
      const connectionProfiles = model.state.connectionProfiles.slice();
      // Override the existing version.
      connectionProfiles.splice(index, 1, profile);
      updateState({connectionProfiles});
    },
    onDeleteProfileClicked(indexToDelete: number): void {
      if (indexToDelete === 0) {
        // no-op: The default connection profile can't be deleted.
        // TODO jessicalin: Show this error message in a better place.
        atom.notifications.addError(
          'The default connection profile cannot be deleted.',
        );
        return;
      }
      const {connectionProfiles, selectedProfileIndex} = model.state;
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
        updateState({
          selectedProfileIndex: nextSelectedProfileIndex,
          connectionProfiles: nextConnectionProfiles,
        });
      }
    },
    onProfileCreated(newProfile: NuclideRemoteConnectionProfile) {
      const connectionProfiles = [
        ...model.state.connectionProfiles,
        newProfile,
      ];
      updateState({
        connectionProfiles,
        selectedProfileIndex: connectionProfiles.length - 1,
        screen: 'connect',
      });
    },
    onProfileSelected(selectedProfileIndex: number): void {
      updateState({selectedProfileIndex});
    },

    connect(config: SshConnectionConfiguration): void {
      updateState({
        connectionFormDirty: false,
        connectionDialogMode: WAITING_FOR_CONNECTION,
      });
      if (pendingHandshake != null) {
        pendingHandshake.dispose();
      }
      pendingHandshake = connect(
        delegate,
        config,
      );
    },
    cancelConnection(): void {
      if (pendingHandshake != null) {
        pendingHandshake.dispose();
        pendingHandshake = null;
      }

      if (model.state.connectionDialogMode === WAITING_FOR_CONNECTION) {
        updateState({
          connectionFormDirty: false,
          connectionDialogMode: REQUEST_CONNECTION_DETAILS,
        });
      } else {
        onConnected(null);
        dismiss();
      }
    },
  };

  function updateState(nextState: Object, saveProfiles: boolean = true): void {
    const prevState = model.state;
    model.setState(nextState);

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

  const model = new Model({
    connectionFormDirty: false,
    confirmConnectionPrompt: () => {},
    connectionPromptInstructions: '',
    screen: 'connect',
    connectionDialogMode: REQUEST_CONNECTION_DETAILS,
    selectedProfileIndex: 0,
    connectionProfiles: initialConnectionProfiles,
  });

  const props: Observable<
    RemoteProjectConnectionModalProps,
  > = model.toObservable().map(state => ({...state, ...staticProps}));

  const savedProfilesStream = observableFromSubscribeFunction(
    onSavedConnectionProfilesDidChange,
  ).map(() => getSavedConnectionProfiles());

  return Observable.using(
    () =>
      // If something else changes the saved profiles, we want to update our state to reflect those
      // changes.
      savedProfilesStream.subscribe(savedProfiles => {
        updateState(
          {connectionProfiles: [defaultConnectionProfile, ...savedProfiles]},
          // Don't write the changes to the config; that's where we got them from and we don't want
          // to cause an infinite loop.
          false,
        );
      }),
    () => props,
  );
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
