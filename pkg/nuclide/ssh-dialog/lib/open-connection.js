'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  getDefaultConnectionProfile,
  getOfficialRemoteServerCommand,
  getSavedConnectionProfiles,
  onSavedConnectionProfilesDidChange,
  saveConnectionConfig,
  saveConnectionProfiles,
} from './connection-profile-utils';
import {getLogger} from '../../logging';

import type {RemoteConnection} from '../../remote-connection';
import type {NuclideRemoteConnectionProfile} from './connection-types';
import {extend, PromiseQueue} from '../../commons';

const logger = getLogger();
let dialogPromiseQueue: ?PromiseQueue = null;

/**
 * Opens the remote connection dialog flow, which includes asking the user
 * for connection parameters (e.g. username, server name, etc), and optionally
 * asking for additional (e.g. 2-fac) authentication.
 */
export function openConnectionDialog(props: Object): Promise<?RemoteConnection> {
  if (!dialogPromiseQueue) {
    dialogPromiseQueue = new PromiseQueue();
  }

  return dialogPromiseQueue.submit((resolve, reject) => {
    const {
      React,
      ReactDOM,
    } = require('react-for-atom');
    const ConnectionDialog = require('./ConnectionDialog');
    const workspaceEl = atom.views.getView(atom.workspace);
    const hostEl = document.createElement('div');
    workspaceEl.appendChild(hostEl);

    // During the lifetime of this 'openConnectionDialog' flow, the 'default'
    // connection profile should not change (even if it is reset by the user
    // connecting to a remote project from another Atom window).
    const defaultConnectionProfile: NuclideRemoteConnectionProfile = getDefaultConnectionProfile();
    // The `compositeConnectionProfiles` is the combination of the default connection
    // profile plus any user-created connection profiles. Initialize this to the
    // default connection profile. This array of profiles may change in the lifetime
    // of `openConnectionDialog` flow.
    let compositeConnectionProfiles: Array<NuclideRemoteConnectionProfile> =
        [defaultConnectionProfile];
    // Add any previously-created (saved) connection profiles.
    compositeConnectionProfiles = compositeConnectionProfiles.concat(getSavedConnectionProfiles());

    // We want to observe changes in the saved connection profiles during the
    // lifetime of this connection dialog, because the user can add/delete
    // a profile from a connection dialog.
    let connectionProfilesSubscription: ?IDisposable = null;
    function cleanupSubscriptionFunc(): void {
      if (connectionProfilesSubscription) {
        connectionProfilesSubscription.dispose();
      }
    }

    function onDeleteProfileClicked(indexToDelete: number) {
      if (indexToDelete === 0) {
        // no-op: The default connection profile can't be deleted.
        // TODO jessicalin: Show this error message in a better place.
        atom.notifications.addError('The default connection profile cannot be deleted.');
        return;
      }
      if (compositeConnectionProfiles) {
        if (indexToDelete >= compositeConnectionProfiles.length) {
          logger.fatal('Tried to delete a connection profile with an index that does not exist. ' +
              'This should never happen.');
          return;
        }
        // Remove the index of the profile to delete.
        let newConnectionProfiles = compositeConnectionProfiles.slice(0, indexToDelete).concat(
            compositeConnectionProfiles.slice(indexToDelete + 1));
        // Remove the first index, because this is the default connection profile,
        // not a user-created profile.
        newConnectionProfiles = newConnectionProfiles.slice(1);
        saveConnectionProfiles(newConnectionProfiles);
      }
    }

    let newProfileForm;
    /*
     * When the "+" button is clicked (the user intends to add a new connection profile),
     * open a new dialog with a form to create one.
     * This new dialog will be prefilled with the info from the default connection profile.
     */
    function onAddProfileClicked() {
      // If there is already an open form, don't open another one.
      if (newProfileForm) {
        return;
      }
      const hostElementForNewProfileForm = document.createElement('div');
      workspaceEl.appendChild(hostElementForNewProfileForm);

      // Props
      const closeNewProfileForm = () => {
        newProfileForm = null;
        ReactDOM.unmountComponentAtNode(hostElementForNewProfileForm);
        hostElementForNewProfileForm.parentNode.removeChild(hostElementForNewProfileForm);
      };
      const onSave = (newProfile: NuclideRemoteConnectionProfile) => {
        // Don't include the default connection profile.
        const userCreatedProfiles = compositeConnectionProfiles.slice(1).concat(newProfile);
        saveConnectionProfiles(userCreatedProfiles);
        closeNewProfileForm();
      };
      const initialDialogProps = {
        onCancel: closeNewProfileForm,
        onSave,
        initialFormFields: defaultConnectionProfile.params,
      };

      // Pop up a dialog that is pre-filled with the default params.
      const CreateConnectionProfileForm = require('./CreateConnectionProfileForm');
      newProfileForm = ReactDOM.render(
        <CreateConnectionProfileForm {...initialDialogProps} />,
        hostElementForNewProfileForm,
      );
    }

    // The connection profiles could change, but the rest of the props passed
    // to the ConnectionDialog will not.
    // Note: the `cleanupSubscriptionFunc` is called when the dialog closes:
    // `onConnect`, `onError`, or `onCancel`.
    const baseDialogProps = extend.immutableExtend({
      // Select the default connection profile, which should always be index 0.
      indexOfInitiallySelectedConnectionProfile: 0,
      onAddProfileClicked,
      onDeleteProfileClicked,
      onConnect: async (connection, config) => {
        resolve(connection);
        saveConnectionConfig(config, getOfficialRemoteServerCommand());
        cleanupSubscriptionFunc();
      },
      onError: (err, config) => { //eslint-disable-line handle-callback-err
        resolve(/*connection*/ null);
        saveConnectionConfig(config, getOfficialRemoteServerCommand());
        cleanupSubscriptionFunc();
      },
      onCancel: () => {
        resolve(/*connection*/ null);
        cleanupSubscriptionFunc();
      },
      onClosed: () => {
        // Unmount the ConnectionDialog and clean up the host element.
        if (hostEl) {
          ReactDOM.unmountComponentAtNode(hostEl);
          if (hostEl.parentNode) {
            hostEl.parentNode.removeChild(hostEl);
          }
        }
      },
    }, props);

    // If/when the saved connection profiles change, we want to re-render the dialog
    // with the new set of connection profiles.
    connectionProfilesSubscription = onSavedConnectionProfilesDidChange(
      (newProfiles: ?Array<NuclideRemoteConnectionProfile>) => {
        compositeConnectionProfiles = newProfiles ? [defaultConnectionProfile].concat(newProfiles) :
            [defaultConnectionProfile];
        const newDialogProps = extend.immutableExtend(
          baseDialogProps,
          {connectionProfiles: compositeConnectionProfiles},
        );
        ReactDOM.render(<ConnectionDialog {...newDialogProps} />, hostEl);
      }
    );

    const initialDialogProps = extend.immutableExtend(
      baseDialogProps,
      {connectionProfiles: compositeConnectionProfiles},
    );
    ReactDOM.render(<ConnectionDialog {...initialDialogProps} />, hostEl);
  });
}
