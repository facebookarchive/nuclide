'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.openConnectionDialog = openConnectionDialog;

var _connectionProfileUtils;

function _load_connectionProfileUtils() {
  return _connectionProfileUtils = require('./connection-profile-utils');
}

var _ConnectionDialog;

function _load_ConnectionDialog() {
  return _ConnectionDialog = _interopRequireDefault(require('./ConnectionDialog'));
}

var _CreateConnectionProfileForm;

function _load_CreateConnectionProfileForm() {
  return _CreateConnectionProfileForm = _interopRequireDefault(require('./CreateConnectionProfileForm'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _promiseExecutors;

function _load_promiseExecutors() {
  return _promiseExecutors = require('../../commons-node/promise-executors');
}

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

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

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-remote-projects');
let dialogPromiseQueue = null;

/**
 * Opens the remote connection dialog flow, which includes asking the user
 * for connection parameters (e.g. username, server name, etc), and optionally
 * asking for additional (e.g. 2-fac) authentication.
 */
function openConnectionDialog(options) {
  if (!dialogPromiseQueue) {
    dialogPromiseQueue = new (_promiseExecutors || _load_promiseExecutors()).PromiseQueue();
  }

  return dialogPromiseQueue.submit(() => new Promise((resolve, reject) => {
    // During the lifetime of this 'openConnectionDialog' flow, the 'default'
    // connection profile should not change (even if it is reset by the user
    const defaultConnectionProfile = (0, (_connectionProfileUtils || _load_connectionProfileUtils()).getDefaultConnectionProfile)(options);
    // The `compositeConnectionProfiles` is the combination of the default connection
    // profile plus any user-created connection profiles. Initialize this to the
    // default connection profile. This array of profiles may change in the lifetime
    // of `openConnectionDialog` flow.
    let compositeConnectionProfiles = [defaultConnectionProfile];
    // Add any previously-created (saved) connection profiles.
    compositeConnectionProfiles = compositeConnectionProfiles.concat((0, (_connectionProfileUtils || _load_connectionProfileUtils()).getSavedConnectionProfiles)());

    // We want to observe changes in the saved connection profiles during the
    // lifetime of this connection dialog, because the user can add/delete
    // a profile from a connection dialog.
    let connectionProfilesSubscription = null;
    function cleanupSubscriptionFunc() {
      if (connectionProfilesSubscription) {
        connectionProfilesSubscription.dispose();
      }
    }

    function onDeleteProfileClicked(indexToDelete) {
      if (indexToDelete === 0) {
        // no-op: The default connection profile can't be deleted.
        // TODO jessicalin: Show this error message in a better place.
        atom.notifications.addError('The default connection profile cannot be deleted.');
        return;
      }
      if (compositeConnectionProfiles) {
        if (indexToDelete >= compositeConnectionProfiles.length) {
          logger.fatal('Tried to delete a connection profile with an index that does not exist. ' + 'This should never happen.');
          return;
        }
        // Remove the index of the profile to delete.
        let newConnectionProfiles = compositeConnectionProfiles.slice(0, indexToDelete).concat(compositeConnectionProfiles.slice(indexToDelete + 1));
        // Remove the first index, because this is the default connection profile,
        // not a user-created profile.
        newConnectionProfiles = newConnectionProfiles.slice(1);
        (0, (_connectionProfileUtils || _load_connectionProfileUtils()).saveConnectionProfiles)(newConnectionProfiles);
      }
    }

    let basePanel;
    let newProfileForm;

    function saveProfile(index, profile) {
      const profiles = compositeConnectionProfiles.slice();
      profiles.splice(index, 1, profile);

      // Don't include the default connection profile.
      (0, (_connectionProfileUtils || _load_connectionProfileUtils()).saveConnectionProfiles)(profiles.slice(1));
    }

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
      function closeNewProfileForm(newProfile) {
        newProfileForm = null;
        _reactDom.default.unmountComponentAtNode(hostElementForNewProfileForm);
        if (newProfilePanel != null) {
          newProfilePanel.destroy();
          newProfilePanel = null;
        }
        openBaseDialog(newProfile);
      }

      function onSave(newProfile) {
        // Don't include the default connection profile.
        const userCreatedProfiles = compositeConnectionProfiles.slice(1).concat(newProfile);
        (0, (_connectionProfileUtils || _load_connectionProfileUtils()).saveConnectionProfiles)(userCreatedProfiles);
        closeNewProfileForm(newProfile);
      }

      const initialDialogProps = {
        onCancel: closeNewProfileForm,
        onSave,
        initialFormFields: defaultConnectionProfile.params,
        profileHosts: (0, (_connectionProfileUtils || _load_connectionProfileUtils()).getUniqueHostsForProfiles)(compositeConnectionProfiles)
      };

      newProfilePanel = atom.workspace.addModalPanel({
        item: hostElementForNewProfileForm
      });

      // Pop up a dialog that is pre-filled with the default params.
      newProfileForm = _reactDom.default.render(_react.default.createElement((_CreateConnectionProfileForm || _load_CreateConnectionProfileForm()).default, initialDialogProps), hostElementForNewProfileForm);
    }

    function openBaseDialog(selectedProfile) {
      const hostEl = document.createElement('div');
      let indexOfInitiallySelectedConnectionProfile;
      if (selectedProfile == null) {
        // Select the default connection profile, which is always index 0.
        indexOfInitiallySelectedConnectionProfile = 0;
      } else {
        const selectedDisplayTitle = selectedProfile.displayTitle;
        indexOfInitiallySelectedConnectionProfile = compositeConnectionProfiles.findIndex(profile => profile.displayTitle === selectedDisplayTitle);
      }

      // The connection profiles could change, but the rest of the props passed
      // to the ConnectionDialog will not.
      // Note: the `cleanupSubscriptionFunc` is called when the dialog closes:
      // `onConnect`, `onError`, or `onCancel`.
      const baseDialogProps = {
        indexOfInitiallySelectedConnectionProfile,
        onAddProfileClicked,
        onCancel: () => {
          resolve( /* connection */null);
          cleanupSubscriptionFunc();
        },
        onClosed: () => {
          // Unmount the ConnectionDialog and clean up the host element.
          _reactDom.default.unmountComponentAtNode(hostEl);
          if (basePanel != null) {
            basePanel.destroy();
          }
        },
        onConnect: (() => {
          var _ref = (0, _asyncToGenerator.default)(function* (connection, config) {
            resolve(connection);
            (0, (_connectionProfileUtils || _load_connectionProfileUtils()).saveConnectionConfig)(config, (0, (_connectionProfileUtils || _load_connectionProfileUtils()).getOfficialRemoteServerCommand)());
            cleanupSubscriptionFunc();
          });

          return function onConnect(_x, _x2) {
            return _ref.apply(this, arguments);
          };
        })(),
        onError: (err_, config) => {
          resolve( /* connection */null);
          (0, (_connectionProfileUtils || _load_connectionProfileUtils()).saveConnectionConfig)(config, (0, (_connectionProfileUtils || _load_connectionProfileUtils()).getOfficialRemoteServerCommand)());
          cleanupSubscriptionFunc();
        },
        onDeleteProfileClicked,
        onSaveProfile: saveProfile
      };

      // If/when the saved connection profiles change, we want to re-render the dialog
      // with the new set of connection profiles.
      connectionProfilesSubscription = (0, (_connectionProfileUtils || _load_connectionProfileUtils()).onSavedConnectionProfilesDidChange)(newProfiles => {
        compositeConnectionProfiles = newProfiles ? [defaultConnectionProfile].concat(newProfiles) : [defaultConnectionProfile];

        const newDialogProps = Object.assign({}, baseDialogProps, {
          connectionProfiles: compositeConnectionProfiles
        });
        _reactDom.default.render(_react.default.createElement((_ConnectionDialog || _load_ConnectionDialog()).default, newDialogProps), hostEl);
      });

      basePanel = atom.workspace.addModalPanel({ item: hostEl });

      // $FlowFixMe
      const parentEl = hostEl.parentElement;
      if (parentEl != null) {
        // Atom sets the width of all modals, but the connection dialog
        // is best with more width, so reach out to the parent (an atom-panel.modal)
        // and increase the fixed width
        parentEl.style.width = '650px';

        // responsive behavior for this dialog. Aim for 650px as above,
        // but not larger than the width of the window.
        parentEl.style.maxWidth = '100%';
        parentEl.style.minWidth = '550px';
      }

      const initialDialogProps = Object.assign({}, baseDialogProps, {
        connectionProfiles: compositeConnectionProfiles
      });
      _reactDom.default.render(_react.default.createElement((_ConnectionDialog || _load_ConnectionDialog()).default, initialDialogProps), hostEl);
    }

    // Select the last profile that was used. It's possible the config changed since the last time
    // this was opened and the profile no longer exists. If the profile is not found,
    // `openBaseDialog` will select the "default" / "Most Recent" option.
    openBaseDialog(compositeConnectionProfiles.find(profile => profile.displayTitle === defaultConnectionProfile.params.displayTitle));
  }));
}