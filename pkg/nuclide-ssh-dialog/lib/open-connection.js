'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {RemoteConnection} from '../../nuclide-remote-connection';
import type {NuclideRemoteConnectionProfile} from './connection-types';

import {
  getDefaultConnectionProfile,
  getOfficialRemoteServerCommand,
  getSavedConnectionProfiles,
  onSavedConnectionProfilesDidChange,
  saveConnectionConfig,
  saveConnectionProfiles,
} from './connection-profile-utils';
import ConnectionDialog from './ConnectionDialog';
import CreateConnectionProfileForm from './CreateConnectionProfileForm';
import {getLogger} from '../../nuclide-logging';
import {PromiseQueue} from '../../nuclide-commons';
import {React, ReactDOM} from 'react-for-atom';

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

    let basePanel;
    let newProfileForm;

    /*
     * When the "+" button is clicked (the user intends to add a new connection profile),
     * open a new dialog with a form to create one.
     * This new dialog will be prefilled with the info from the default connection profile.
     */
    function onAddProfileClicked() {
      if (basePanel != null) {
        basePanel.destroy();
        basePanel = null;
      }

      // If there is already an open form, don't open another one.
      if (newProfileForm) {
        return;
      }

      const hostElementForNewProfileForm = document.createElement('div');
      let newProfilePanel = null;

      // Props
      const closeNewProfileForm = () => {
        newProfileForm = null;
        ReactDOM.unmountComponentAtNode(hostElementForNewProfileForm);
        if (newProfilePanel != null) {
          newProfilePanel.destroy();
          newProfilePanel = null;
        }
        openBaseDialog();
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

      newProfilePanel = atom.workspace.addModalPanel({item: hostElementForNewProfileForm});

      // Pop up a dialog that is pre-filled with the default params.
      newProfileForm = ReactDOM.render(
        <CreateConnectionProfileForm {...initialDialogProps} />,
        hostElementForNewProfileForm,
      );
    }

    function openBaseDialog() {
      const hostEl = document.createElement('div');

      // The connection profiles could change, but the rest of the props passed
      // to the ConnectionDialog will not.
      // Note: the `cleanupSubscriptionFunc` is called when the dialog closes:
      // `onConnect`, `onError`, or `onCancel`.
      const baseDialogProps = {
        // Select the default connection profile, which should always be index 0.
        indexOfInitiallySelectedConnectionProfile: 0,
        onAddProfileClicked,
        onDeleteProfileClicked,
        onConnect: async (connection, config) => {
          resolve(connection);
          saveConnectionConfig(config, getOfficialRemoteServerCommand());
          cleanupSubscriptionFunc();
        },
        onError: (err_, config) => {
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
          ReactDOM.unmountComponentAtNode(hostEl);
          if (basePanel != null) {
            basePanel.destroy();
          }
        },
        ...props,
      };

      // If/when the saved connection profiles change, we want to re-render the dialog
      // with the new set of connection profiles.
      connectionProfilesSubscription = onSavedConnectionProfilesDidChange(
        (newProfiles: ?Array<NuclideRemoteConnectionProfile>) => {
          compositeConnectionProfiles = newProfiles
            ? [defaultConnectionProfile].concat(newProfiles)
            : [defaultConnectionProfile];

          const newDialogProps = {
            ...baseDialogProps,
            connectionProfiles: compositeConnectionProfiles,
          };
          ReactDOM.render(<ConnectionDialog {...newDialogProps} />, hostEl);
        }
      );

      basePanel = atom.workspace.addModalPanel({item: hostEl});

      // Center the parent in both Atom v1.6 and in Atom v1.8.
      // TODO(ssorallen): Remove all but `maxWidth` once Nuclide is Atom v1.8+
      const parentEl = hostEl.parentElement;
      if (parentEl != null) {
        parentEl.style.left = '50%';
        parentEl.style.margin = '0 0 0 -40em';
        parentEl.style.maxWidth = '80em';
        parentEl.style.width = '80em';
      }

      const initialDialogProps = {
        ...baseDialogProps,
        connectionProfiles: compositeConnectionProfiles,
      };
      ReactDOM.render(<ConnectionDialog {...initialDialogProps} />, hostEl);
    }

    openBaseDialog();
  });
}
