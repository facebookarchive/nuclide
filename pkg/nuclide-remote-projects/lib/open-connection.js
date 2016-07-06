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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.openConnectionDialog = openConnectionDialog;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _connectionProfileUtils2;

function _connectionProfileUtils() {
  return _connectionProfileUtils2 = require('./connection-profile-utils');
}

var _ConnectionDialog2;

function _ConnectionDialog() {
  return _ConnectionDialog2 = _interopRequireDefault(require('./ConnectionDialog'));
}

var _CreateConnectionProfileForm2;

function _CreateConnectionProfileForm() {
  return _CreateConnectionProfileForm2 = _interopRequireDefault(require('./CreateConnectionProfileForm'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _commonsNodePromiseExecutors2;

function _commonsNodePromiseExecutors() {
  return _commonsNodePromiseExecutors2 = require('../../commons-node/promise-executors');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();
var dialogPromiseQueue = null;

/**
 * Opens the remote connection dialog flow, which includes asking the user
 * for connection parameters (e.g. username, server name, etc), and optionally
 * asking for additional (e.g. 2-fac) authentication.
 */

function openConnectionDialog(props) {
  if (!dialogPromiseQueue) {
    dialogPromiseQueue = new (_commonsNodePromiseExecutors2 || _commonsNodePromiseExecutors()).PromiseQueue();
  }

  return dialogPromiseQueue.submit(function (resolve, reject) {
    // During the lifetime of this 'openConnectionDialog' flow, the 'default'
    // connection profile should not change (even if it is reset by the user

    var defaultConnectionProfile = (0, (_connectionProfileUtils2 || _connectionProfileUtils()).getDefaultConnectionProfile)();
    // The `compositeConnectionProfiles` is the combination of the default connection
    // profile plus any user-created connection profiles. Initialize this to the
    // default connection profile. This array of profiles may change in the lifetime
    // of `openConnectionDialog` flow.
    var compositeConnectionProfiles = [defaultConnectionProfile];
    // Add any previously-created (saved) connection profiles.
    compositeConnectionProfiles = compositeConnectionProfiles.concat((0, (_connectionProfileUtils2 || _connectionProfileUtils()).getSavedConnectionProfiles)());

    // We want to observe changes in the saved connection profiles during the
    // lifetime of this connection dialog, because the user can add/delete
    // a profile from a connection dialog.
    var connectionProfilesSubscription = null;
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
        var newConnectionProfiles = compositeConnectionProfiles.slice(0, indexToDelete).concat(compositeConnectionProfiles.slice(indexToDelete + 1));
        // Remove the first index, because this is the default connection profile,
        // not a user-created profile.
        newConnectionProfiles = newConnectionProfiles.slice(1);
        (0, (_connectionProfileUtils2 || _connectionProfileUtils()).saveConnectionProfiles)(newConnectionProfiles);
      }
    }

    var basePanel = undefined;
    var newProfileForm = undefined;

    function saveProfile(index, profile) {
      var profiles = compositeConnectionProfiles.slice();
      profiles.splice(index, 1, profile);

      // Don't include the default connection profile.
      (0, (_connectionProfileUtils2 || _connectionProfileUtils()).saveConnectionProfiles)(profiles.slice(1));
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

      var hostElementForNewProfileForm = document.createElement('div');
      var newProfilePanel = null;

      // Props
      function closeNewProfileForm(newProfile) {
        newProfileForm = null;
        (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(hostElementForNewProfileForm);
        if (newProfilePanel != null) {
          newProfilePanel.destroy();
          newProfilePanel = null;
        }
        openBaseDialog(newProfile);
      }

      function onSave(newProfile) {
        // Don't include the default connection profile.
        var userCreatedProfiles = compositeConnectionProfiles.slice(1).concat(newProfile);
        (0, (_connectionProfileUtils2 || _connectionProfileUtils()).saveConnectionProfiles)(userCreatedProfiles);
        closeNewProfileForm(newProfile);
      }

      var initialDialogProps = {
        onCancel: closeNewProfileForm,
        onSave: onSave,
        initialFormFields: defaultConnectionProfile.params
      };

      newProfilePanel = atom.workspace.addModalPanel({ item: hostElementForNewProfileForm });

      // Pop up a dialog that is pre-filled with the default params.
      newProfileForm = (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement((_CreateConnectionProfileForm2 || _CreateConnectionProfileForm()).default, initialDialogProps), hostElementForNewProfileForm);
    }

    function openBaseDialog(selectedProfile) {
      var hostEl = document.createElement('div');
      var indexOfInitiallySelectedConnectionProfile = undefined;
      if (selectedProfile == null) {
        // Select the default connection profile, which is always index 0.
        indexOfInitiallySelectedConnectionProfile = 0;
      } else {
        (function () {
          var selectedDisplayTitle = selectedProfile.displayTitle;
          indexOfInitiallySelectedConnectionProfile = compositeConnectionProfiles.findIndex(function (profile) {
            return profile.displayTitle === selectedDisplayTitle;
          });
        })();
      }

      // The connection profiles could change, but the rest of the props passed
      // to the ConnectionDialog will not.
      // Note: the `cleanupSubscriptionFunc` is called when the dialog closes:
      // `onConnect`, `onError`, or `onCancel`.
      var baseDialogProps = _extends({
        indexOfInitiallySelectedConnectionProfile: indexOfInitiallySelectedConnectionProfile,
        onAddProfileClicked: onAddProfileClicked,
        onCancel: function onCancel() {
          resolve( /*connection*/null);
          cleanupSubscriptionFunc();
        },
        onClosed: function onClosed() {
          // Unmount the ConnectionDialog and clean up the host element.
          (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(hostEl);
          if (basePanel != null) {
            basePanel.destroy();
          }
        },
        onConnect: _asyncToGenerator(function* (connection, config) {
          resolve(connection);
          (0, (_connectionProfileUtils2 || _connectionProfileUtils()).saveConnectionConfig)(config, (0, (_connectionProfileUtils2 || _connectionProfileUtils()).getOfficialRemoteServerCommand)());
          cleanupSubscriptionFunc();
        }),
        onError: function onError(err_, config) {
          resolve( /*connection*/null);
          (0, (_connectionProfileUtils2 || _connectionProfileUtils()).saveConnectionConfig)(config, (0, (_connectionProfileUtils2 || _connectionProfileUtils()).getOfficialRemoteServerCommand)());
          cleanupSubscriptionFunc();
        },
        onDeleteProfileClicked: onDeleteProfileClicked,
        onSaveProfile: saveProfile
      }, props);

      // If/when the saved connection profiles change, we want to re-render the dialog
      // with the new set of connection profiles.
      connectionProfilesSubscription = (0, (_connectionProfileUtils2 || _connectionProfileUtils()).onSavedConnectionProfilesDidChange)(function (newProfiles) {
        compositeConnectionProfiles = newProfiles ? [defaultConnectionProfile].concat(newProfiles) : [defaultConnectionProfile];

        var newDialogProps = _extends({}, baseDialogProps, {
          connectionProfiles: compositeConnectionProfiles
        });
        (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement((_ConnectionDialog2 || _ConnectionDialog()).default, newDialogProps), hostEl);
      });

      basePanel = atom.workspace.addModalPanel({ item: hostEl });

      // Center the parent in both Atom v1.6 and in Atom v1.8.
      // TODO(ssorallen): Remove all but `maxWidth` once Nuclide is Atom v1.8+
      var parentEl = hostEl.parentElement;
      if (parentEl != null) {
        parentEl.style.left = '50%';
        parentEl.style.margin = '0 0 0 -40em';
        parentEl.style.maxWidth = '80em';
        parentEl.style.width = '80em';
      }

      var initialDialogProps = _extends({}, baseDialogProps, {
        connectionProfiles: compositeConnectionProfiles
      });
      (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement((_ConnectionDialog2 || _ConnectionDialog()).default, initialDialogProps), hostEl);
    }

    openBaseDialog();
  });
}

// connecting to a remote project from another Atom window).