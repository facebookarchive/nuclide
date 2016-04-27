Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.openConnectionDialog = openConnectionDialog;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _connectionProfileUtils = require('./connection-profile-utils');

var _nuclideLogging = require('../../nuclide-logging');

var _nuclideCommons = require('../../nuclide-commons');

var logger = (0, _nuclideLogging.getLogger)();
var dialogPromiseQueue = null;

/**
 * Opens the remote connection dialog flow, which includes asking the user
 * for connection parameters (e.g. username, server name, etc), and optionally
 * asking for additional (e.g. 2-fac) authentication.
 */

function openConnectionDialog(props) {
  if (!dialogPromiseQueue) {
    dialogPromiseQueue = new _nuclideCommons.PromiseQueue();
  }

  return dialogPromiseQueue.submit(function (resolve, reject) {
    var _require = require('react-for-atom');

    var React = _require.React;
    var ReactDOM = _require.ReactDOM;

    var ConnectionDialog = require('./ConnectionDialog');
    var workspaceEl = atom.views.getView(atom.workspace);
    var hostEl = document.createElement('div');
    workspaceEl.appendChild(hostEl);

    // During the lifetime of this 'openConnectionDialog' flow, the 'default'
    // connection profile should not change (even if it is reset by the user
    // connecting to a remote project from another Atom window).
    var defaultConnectionProfile = (0, _connectionProfileUtils.getDefaultConnectionProfile)();
    // The `compositeConnectionProfiles` is the combination of the default connection
    // profile plus any user-created connection profiles. Initialize this to the
    // default connection profile. This array of profiles may change in the lifetime
    // of `openConnectionDialog` flow.
    var compositeConnectionProfiles = [defaultConnectionProfile];
    // Add any previously-created (saved) connection profiles.
    compositeConnectionProfiles = compositeConnectionProfiles.concat((0, _connectionProfileUtils.getSavedConnectionProfiles)());

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
        (0, _connectionProfileUtils.saveConnectionProfiles)(newConnectionProfiles);
      }
    }

    var newProfileForm = undefined;
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
      var hostElementForNewProfileForm = document.createElement('div');
      workspaceEl.appendChild(hostElementForNewProfileForm);

      // Props
      var closeNewProfileForm = function closeNewProfileForm() {
        newProfileForm = null;
        ReactDOM.unmountComponentAtNode(hostElementForNewProfileForm);
        hostElementForNewProfileForm.parentNode.removeChild(hostElementForNewProfileForm);
      };
      var onSave = function onSave(newProfile) {
        // Don't include the default connection profile.
        var userCreatedProfiles = compositeConnectionProfiles.slice(1).concat(newProfile);
        (0, _connectionProfileUtils.saveConnectionProfiles)(userCreatedProfiles);
        closeNewProfileForm();
      };
      var initialDialogProps = {
        onCancel: closeNewProfileForm,
        onSave: onSave,
        initialFormFields: defaultConnectionProfile.params
      };

      // Pop up a dialog that is pre-filled with the default params.
      var CreateConnectionProfileForm = require('./CreateConnectionProfileForm');
      newProfileForm = ReactDOM.render(React.createElement(CreateConnectionProfileForm, initialDialogProps), hostElementForNewProfileForm);
    }

    // The connection profiles could change, but the rest of the props passed
    // to the ConnectionDialog will not.
    // Note: the `cleanupSubscriptionFunc` is called when the dialog closes:
    // `onConnect`, `onError`, or `onCancel`.
    var baseDialogProps = _extends({
      // Select the default connection profile, which should always be index 0.
      indexOfInitiallySelectedConnectionProfile: 0,
      onAddProfileClicked: onAddProfileClicked,
      onDeleteProfileClicked: onDeleteProfileClicked,
      onConnect: _asyncToGenerator(function* (connection, config) {
        resolve(connection);
        (0, _connectionProfileUtils.saveConnectionConfig)(config, (0, _connectionProfileUtils.getOfficialRemoteServerCommand)());
        cleanupSubscriptionFunc();
      }),
      onError: function onError(err, config) {
        //eslint-disable-line handle-callback-err
        resolve( /*connection*/null);
        (0, _connectionProfileUtils.saveConnectionConfig)(config, (0, _connectionProfileUtils.getOfficialRemoteServerCommand)());
        cleanupSubscriptionFunc();
      },
      onCancel: function onCancel() {
        resolve( /*connection*/null);
        cleanupSubscriptionFunc();
      },
      onClosed: function onClosed() {
        // Unmount the ConnectionDialog and clean up the host element.
        if (hostEl) {
          ReactDOM.unmountComponentAtNode(hostEl);
          if (hostEl.parentNode) {
            hostEl.parentNode.removeChild(hostEl);
          }
        }
      }
    }, props);

    // If/when the saved connection profiles change, we want to re-render the dialog
    // with the new set of connection profiles.
    connectionProfilesSubscription = (0, _connectionProfileUtils.onSavedConnectionProfilesDidChange)(function (newProfiles) {
      compositeConnectionProfiles = newProfiles ? [defaultConnectionProfile].concat(newProfiles) : [defaultConnectionProfile];
      var newDialogProps = _extends({}, baseDialogProps, {
        connectionProfiles: compositeConnectionProfiles
      });
      ReactDOM.render(React.createElement(ConnectionDialog, newDialogProps), hostEl);
    });

    var initialDialogProps = _extends({}, baseDialogProps, {
      connectionProfiles: compositeConnectionProfiles
    });
    ReactDOM.render(React.createElement(ConnectionDialog, initialDialogProps), hostEl);
  });
}