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
//# sourceMappingURL=data:application/json;base64,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QUFDO0FBQzdCLCtCQUF1QixFQUFFLENBQUM7T0FDM0I7QUFDRCxjQUFRLEVBQUUsb0JBQU07O0FBRWQsWUFBSSxNQUFNLEVBQUU7QUFDVixrQkFBUSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hDLGNBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtBQUNyQixrQkFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7V0FDdkM7U0FDRjtPQUNGO09BQ0UsS0FBSyxDQUNULENBQUM7Ozs7QUFJRixrQ0FBOEIsR0FBRyxnRUFDL0IsVUFBQyxXQUFXLEVBQTZDO0FBQ3ZELGlDQUEyQixHQUFHLFdBQVcsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUN0RixDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDL0IsVUFBTSxjQUFjLGdCQUNmLGVBQWU7QUFDbEIsMEJBQWtCLEVBQUUsMkJBQTJCO1FBQ2hELENBQUM7QUFDRixjQUFRLENBQUMsTUFBTSxDQUFDLG9CQUFDLGdCQUFnQixFQUFLLGNBQWMsQ0FBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ25FLENBQ0YsQ0FBQzs7QUFFRixRQUFNLGtCQUFrQixnQkFDbkIsZUFBZTtBQUNsQix3QkFBa0IsRUFBRSwyQkFBMkI7TUFDaEQsQ0FBQztBQUNGLFlBQVEsQ0FBQyxNQUFNLENBQUMsb0JBQUMsZ0JBQWdCLEVBQUssa0JBQWtCLENBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztHQUN2RSxDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJvcGVuLWNvbm5lY3Rpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1xuICBnZXREZWZhdWx0Q29ubmVjdGlvblByb2ZpbGUsXG4gIGdldE9mZmljaWFsUmVtb3RlU2VydmVyQ29tbWFuZCxcbiAgZ2V0U2F2ZWRDb25uZWN0aW9uUHJvZmlsZXMsXG4gIG9uU2F2ZWRDb25uZWN0aW9uUHJvZmlsZXNEaWRDaGFuZ2UsXG4gIHNhdmVDb25uZWN0aW9uQ29uZmlnLFxuICBzYXZlQ29ubmVjdGlvblByb2ZpbGVzLFxufSBmcm9tICcuL2Nvbm5lY3Rpb24tcHJvZmlsZS11dGlscyc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcblxuaW1wb3J0IHR5cGUge1JlbW90ZUNvbm5lY3Rpb259IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLWNvbm5lY3Rpb24nO1xuaW1wb3J0IHR5cGUge051Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZX0gZnJvbSAnLi9jb25uZWN0aW9uLXR5cGVzJztcbmltcG9ydCB7UHJvbWlzZVF1ZXVlfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcbmxldCBkaWFsb2dQcm9taXNlUXVldWU6ID9Qcm9taXNlUXVldWUgPSBudWxsO1xuXG4vKipcbiAqIE9wZW5zIHRoZSByZW1vdGUgY29ubmVjdGlvbiBkaWFsb2cgZmxvdywgd2hpY2ggaW5jbHVkZXMgYXNraW5nIHRoZSB1c2VyXG4gKiBmb3IgY29ubmVjdGlvbiBwYXJhbWV0ZXJzIChlLmcuIHVzZXJuYW1lLCBzZXJ2ZXIgbmFtZSwgZXRjKSwgYW5kIG9wdGlvbmFsbHlcbiAqIGFza2luZyBmb3IgYWRkaXRpb25hbCAoZS5nLiAyLWZhYykgYXV0aGVudGljYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcGVuQ29ubmVjdGlvbkRpYWxvZyhwcm9wczogT2JqZWN0KTogUHJvbWlzZTw/UmVtb3RlQ29ubmVjdGlvbj4ge1xuICBpZiAoIWRpYWxvZ1Byb21pc2VRdWV1ZSkge1xuICAgIGRpYWxvZ1Byb21pc2VRdWV1ZSA9IG5ldyBQcm9taXNlUXVldWUoKTtcbiAgfVxuXG4gIHJldHVybiBkaWFsb2dQcm9taXNlUXVldWUuc3VibWl0KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCB7XG4gICAgICBSZWFjdCxcbiAgICAgIFJlYWN0RE9NLFxuICAgIH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuICAgIGNvbnN0IENvbm5lY3Rpb25EaWFsb2cgPSByZXF1aXJlKCcuL0Nvbm5lY3Rpb25EaWFsb2cnKTtcbiAgICBjb25zdCB3b3Jrc3BhY2VFbCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSk7XG4gICAgY29uc3QgaG9zdEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgd29ya3NwYWNlRWwuYXBwZW5kQ2hpbGQoaG9zdEVsKTtcblxuICAgIC8vIER1cmluZyB0aGUgbGlmZXRpbWUgb2YgdGhpcyAnb3BlbkNvbm5lY3Rpb25EaWFsb2cnIGZsb3csIHRoZSAnZGVmYXVsdCdcbiAgICAvLyBjb25uZWN0aW9uIHByb2ZpbGUgc2hvdWxkIG5vdCBjaGFuZ2UgKGV2ZW4gaWYgaXQgaXMgcmVzZXQgYnkgdGhlIHVzZXJcbiAgICAvLyBjb25uZWN0aW5nIHRvIGEgcmVtb3RlIHByb2plY3QgZnJvbSBhbm90aGVyIEF0b20gd2luZG93KS5cbiAgICBjb25zdCBkZWZhdWx0Q29ubmVjdGlvblByb2ZpbGU6IE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZSA9IGdldERlZmF1bHRDb25uZWN0aW9uUHJvZmlsZSgpO1xuICAgIC8vIFRoZSBgY29tcG9zaXRlQ29ubmVjdGlvblByb2ZpbGVzYCBpcyB0aGUgY29tYmluYXRpb24gb2YgdGhlIGRlZmF1bHQgY29ubmVjdGlvblxuICAgIC8vIHByb2ZpbGUgcGx1cyBhbnkgdXNlci1jcmVhdGVkIGNvbm5lY3Rpb24gcHJvZmlsZXMuIEluaXRpYWxpemUgdGhpcyB0byB0aGVcbiAgICAvLyBkZWZhdWx0IGNvbm5lY3Rpb24gcHJvZmlsZS4gVGhpcyBhcnJheSBvZiBwcm9maWxlcyBtYXkgY2hhbmdlIGluIHRoZSBsaWZldGltZVxuICAgIC8vIG9mIGBvcGVuQ29ubmVjdGlvbkRpYWxvZ2AgZmxvdy5cbiAgICBsZXQgY29tcG9zaXRlQ29ubmVjdGlvblByb2ZpbGVzOiBBcnJheTxOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGU+ID1cbiAgICAgICAgW2RlZmF1bHRDb25uZWN0aW9uUHJvZmlsZV07XG4gICAgLy8gQWRkIGFueSBwcmV2aW91c2x5LWNyZWF0ZWQgKHNhdmVkKSBjb25uZWN0aW9uIHByb2ZpbGVzLlxuICAgIGNvbXBvc2l0ZUNvbm5lY3Rpb25Qcm9maWxlcyA9IGNvbXBvc2l0ZUNvbm5lY3Rpb25Qcm9maWxlcy5jb25jYXQoZ2V0U2F2ZWRDb25uZWN0aW9uUHJvZmlsZXMoKSk7XG5cbiAgICAvLyBXZSB3YW50IHRvIG9ic2VydmUgY2hhbmdlcyBpbiB0aGUgc2F2ZWQgY29ubmVjdGlvbiBwcm9maWxlcyBkdXJpbmcgdGhlXG4gICAgLy8gbGlmZXRpbWUgb2YgdGhpcyBjb25uZWN0aW9uIGRpYWxvZywgYmVjYXVzZSB0aGUgdXNlciBjYW4gYWRkL2RlbGV0ZVxuICAgIC8vIGEgcHJvZmlsZSBmcm9tIGEgY29ubmVjdGlvbiBkaWFsb2cuXG4gICAgbGV0IGNvbm5lY3Rpb25Qcm9maWxlc1N1YnNjcmlwdGlvbjogP0lEaXNwb3NhYmxlID0gbnVsbDtcbiAgICBmdW5jdGlvbiBjbGVhbnVwU3Vic2NyaXB0aW9uRnVuYygpOiB2b2lkIHtcbiAgICAgIGlmIChjb25uZWN0aW9uUHJvZmlsZXNTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgY29ubmVjdGlvblByb2ZpbGVzU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbkRlbGV0ZVByb2ZpbGVDbGlja2VkKGluZGV4VG9EZWxldGU6IG51bWJlcikge1xuICAgICAgaWYgKGluZGV4VG9EZWxldGUgPT09IDApIHtcbiAgICAgICAgLy8gbm8tb3A6IFRoZSBkZWZhdWx0IGNvbm5lY3Rpb24gcHJvZmlsZSBjYW4ndCBiZSBkZWxldGVkLlxuICAgICAgICAvLyBUT0RPIGplc3NpY2FsaW46IFNob3cgdGhpcyBlcnJvciBtZXNzYWdlIGluIGEgYmV0dGVyIHBsYWNlLlxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ1RoZSBkZWZhdWx0IGNvbm5lY3Rpb24gcHJvZmlsZSBjYW5ub3QgYmUgZGVsZXRlZC4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGNvbXBvc2l0ZUNvbm5lY3Rpb25Qcm9maWxlcykge1xuICAgICAgICBpZiAoaW5kZXhUb0RlbGV0ZSA+PSBjb21wb3NpdGVDb25uZWN0aW9uUHJvZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgbG9nZ2VyLmZhdGFsKCdUcmllZCB0byBkZWxldGUgYSBjb25uZWN0aW9uIHByb2ZpbGUgd2l0aCBhbiBpbmRleCB0aGF0IGRvZXMgbm90IGV4aXN0LiAnICtcbiAgICAgICAgICAgICAgJ1RoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbi4nKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBpbmRleCBvZiB0aGUgcHJvZmlsZSB0byBkZWxldGUuXG4gICAgICAgIGxldCBuZXdDb25uZWN0aW9uUHJvZmlsZXMgPSBjb21wb3NpdGVDb25uZWN0aW9uUHJvZmlsZXMuc2xpY2UoMCwgaW5kZXhUb0RlbGV0ZSkuY29uY2F0KFxuICAgICAgICAgICAgY29tcG9zaXRlQ29ubmVjdGlvblByb2ZpbGVzLnNsaWNlKGluZGV4VG9EZWxldGUgKyAxKSk7XG4gICAgICAgIC8vIFJlbW92ZSB0aGUgZmlyc3QgaW5kZXgsIGJlY2F1c2UgdGhpcyBpcyB0aGUgZGVmYXVsdCBjb25uZWN0aW9uIHByb2ZpbGUsXG4gICAgICAgIC8vIG5vdCBhIHVzZXItY3JlYXRlZCBwcm9maWxlLlxuICAgICAgICBuZXdDb25uZWN0aW9uUHJvZmlsZXMgPSBuZXdDb25uZWN0aW9uUHJvZmlsZXMuc2xpY2UoMSk7XG4gICAgICAgIHNhdmVDb25uZWN0aW9uUHJvZmlsZXMobmV3Q29ubmVjdGlvblByb2ZpbGVzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgbmV3UHJvZmlsZUZvcm07XG4gICAgLypcbiAgICAgKiBXaGVuIHRoZSBcIitcIiBidXR0b24gaXMgY2xpY2tlZCAodGhlIHVzZXIgaW50ZW5kcyB0byBhZGQgYSBuZXcgY29ubmVjdGlvbiBwcm9maWxlKSxcbiAgICAgKiBvcGVuIGEgbmV3IGRpYWxvZyB3aXRoIGEgZm9ybSB0byBjcmVhdGUgb25lLlxuICAgICAqIFRoaXMgbmV3IGRpYWxvZyB3aWxsIGJlIHByZWZpbGxlZCB3aXRoIHRoZSBpbmZvIGZyb20gdGhlIGRlZmF1bHQgY29ubmVjdGlvbiBwcm9maWxlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG9uQWRkUHJvZmlsZUNsaWNrZWQoKSB7XG4gICAgICAvLyBJZiB0aGVyZSBpcyBhbHJlYWR5IGFuIG9wZW4gZm9ybSwgZG9uJ3Qgb3BlbiBhbm90aGVyIG9uZS5cbiAgICAgIGlmIChuZXdQcm9maWxlRm9ybSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBob3N0RWxlbWVudEZvck5ld1Byb2ZpbGVGb3JtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICB3b3Jrc3BhY2VFbC5hcHBlbmRDaGlsZChob3N0RWxlbWVudEZvck5ld1Byb2ZpbGVGb3JtKTtcblxuICAgICAgLy8gUHJvcHNcbiAgICAgIGNvbnN0IGNsb3NlTmV3UHJvZmlsZUZvcm0gPSAoKSA9PiB7XG4gICAgICAgIG5ld1Byb2ZpbGVGb3JtID0gbnVsbDtcbiAgICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZShob3N0RWxlbWVudEZvck5ld1Byb2ZpbGVGb3JtKTtcbiAgICAgICAgaG9zdEVsZW1lbnRGb3JOZXdQcm9maWxlRm9ybS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGhvc3RFbGVtZW50Rm9yTmV3UHJvZmlsZUZvcm0pO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IG9uU2F2ZSA9IChuZXdQcm9maWxlOiBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGUpID0+IHtcbiAgICAgICAgLy8gRG9uJ3QgaW5jbHVkZSB0aGUgZGVmYXVsdCBjb25uZWN0aW9uIHByb2ZpbGUuXG4gICAgICAgIGNvbnN0IHVzZXJDcmVhdGVkUHJvZmlsZXMgPSBjb21wb3NpdGVDb25uZWN0aW9uUHJvZmlsZXMuc2xpY2UoMSkuY29uY2F0KG5ld1Byb2ZpbGUpO1xuICAgICAgICBzYXZlQ29ubmVjdGlvblByb2ZpbGVzKHVzZXJDcmVhdGVkUHJvZmlsZXMpO1xuICAgICAgICBjbG9zZU5ld1Byb2ZpbGVGb3JtKCk7XG4gICAgICB9O1xuICAgICAgY29uc3QgaW5pdGlhbERpYWxvZ1Byb3BzID0ge1xuICAgICAgICBvbkNhbmNlbDogY2xvc2VOZXdQcm9maWxlRm9ybSxcbiAgICAgICAgb25TYXZlLFxuICAgICAgICBpbml0aWFsRm9ybUZpZWxkczogZGVmYXVsdENvbm5lY3Rpb25Qcm9maWxlLnBhcmFtcyxcbiAgICAgIH07XG5cbiAgICAgIC8vIFBvcCB1cCBhIGRpYWxvZyB0aGF0IGlzIHByZS1maWxsZWQgd2l0aCB0aGUgZGVmYXVsdCBwYXJhbXMuXG4gICAgICBjb25zdCBDcmVhdGVDb25uZWN0aW9uUHJvZmlsZUZvcm0gPSByZXF1aXJlKCcuL0NyZWF0ZUNvbm5lY3Rpb25Qcm9maWxlRm9ybScpO1xuICAgICAgbmV3UHJvZmlsZUZvcm0gPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICAgIDxDcmVhdGVDb25uZWN0aW9uUHJvZmlsZUZvcm0gey4uLmluaXRpYWxEaWFsb2dQcm9wc30gLz4sXG4gICAgICAgIGhvc3RFbGVtZW50Rm9yTmV3UHJvZmlsZUZvcm0sXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFRoZSBjb25uZWN0aW9uIHByb2ZpbGVzIGNvdWxkIGNoYW5nZSwgYnV0IHRoZSByZXN0IG9mIHRoZSBwcm9wcyBwYXNzZWRcbiAgICAvLyB0byB0aGUgQ29ubmVjdGlvbkRpYWxvZyB3aWxsIG5vdC5cbiAgICAvLyBOb3RlOiB0aGUgYGNsZWFudXBTdWJzY3JpcHRpb25GdW5jYCBpcyBjYWxsZWQgd2hlbiB0aGUgZGlhbG9nIGNsb3NlczpcbiAgICAvLyBgb25Db25uZWN0YCwgYG9uRXJyb3JgLCBvciBgb25DYW5jZWxgLlxuICAgIGNvbnN0IGJhc2VEaWFsb2dQcm9wcyA9IHtcbiAgICAgIC8vIFNlbGVjdCB0aGUgZGVmYXVsdCBjb25uZWN0aW9uIHByb2ZpbGUsIHdoaWNoIHNob3VsZCBhbHdheXMgYmUgaW5kZXggMC5cbiAgICAgIGluZGV4T2ZJbml0aWFsbHlTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiAwLFxuICAgICAgb25BZGRQcm9maWxlQ2xpY2tlZCxcbiAgICAgIG9uRGVsZXRlUHJvZmlsZUNsaWNrZWQsXG4gICAgICBvbkNvbm5lY3Q6IGFzeW5jIChjb25uZWN0aW9uLCBjb25maWcpID0+IHtcbiAgICAgICAgcmVzb2x2ZShjb25uZWN0aW9uKTtcbiAgICAgICAgc2F2ZUNvbm5lY3Rpb25Db25maWcoY29uZmlnLCBnZXRPZmZpY2lhbFJlbW90ZVNlcnZlckNvbW1hbmQoKSk7XG4gICAgICAgIGNsZWFudXBTdWJzY3JpcHRpb25GdW5jKCk7XG4gICAgICB9LFxuICAgICAgb25FcnJvcjogKGVyciwgY29uZmlnKSA9PiB7IC8vZXNsaW50LWRpc2FibGUtbGluZSBoYW5kbGUtY2FsbGJhY2stZXJyXG4gICAgICAgIHJlc29sdmUoLypjb25uZWN0aW9uKi8gbnVsbCk7XG4gICAgICAgIHNhdmVDb25uZWN0aW9uQ29uZmlnKGNvbmZpZywgZ2V0T2ZmaWNpYWxSZW1vdGVTZXJ2ZXJDb21tYW5kKCkpO1xuICAgICAgICBjbGVhbnVwU3Vic2NyaXB0aW9uRnVuYygpO1xuICAgICAgfSxcbiAgICAgIG9uQ2FuY2VsOiAoKSA9PiB7XG4gICAgICAgIHJlc29sdmUoLypjb25uZWN0aW9uKi8gbnVsbCk7XG4gICAgICAgIGNsZWFudXBTdWJzY3JpcHRpb25GdW5jKCk7XG4gICAgICB9LFxuICAgICAgb25DbG9zZWQ6ICgpID0+IHtcbiAgICAgICAgLy8gVW5tb3VudCB0aGUgQ29ubmVjdGlvbkRpYWxvZyBhbmQgY2xlYW4gdXAgdGhlIGhvc3QgZWxlbWVudC5cbiAgICAgICAgaWYgKGhvc3RFbCkge1xuICAgICAgICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUoaG9zdEVsKTtcbiAgICAgICAgICBpZiAoaG9zdEVsLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgIGhvc3RFbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGhvc3RFbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLi4ucHJvcHMsXG4gICAgfTtcblxuICAgIC8vIElmL3doZW4gdGhlIHNhdmVkIGNvbm5lY3Rpb24gcHJvZmlsZXMgY2hhbmdlLCB3ZSB3YW50IHRvIHJlLXJlbmRlciB0aGUgZGlhbG9nXG4gICAgLy8gd2l0aCB0aGUgbmV3IHNldCBvZiBjb25uZWN0aW9uIHByb2ZpbGVzLlxuICAgIGNvbm5lY3Rpb25Qcm9maWxlc1N1YnNjcmlwdGlvbiA9IG9uU2F2ZWRDb25uZWN0aW9uUHJvZmlsZXNEaWRDaGFuZ2UoXG4gICAgICAobmV3UHJvZmlsZXM6ID9BcnJheTxOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGU+KSA9PiB7XG4gICAgICAgIGNvbXBvc2l0ZUNvbm5lY3Rpb25Qcm9maWxlcyA9IG5ld1Byb2ZpbGVzID8gW2RlZmF1bHRDb25uZWN0aW9uUHJvZmlsZV0uY29uY2F0KG5ld1Byb2ZpbGVzKSA6XG4gICAgICAgICAgICBbZGVmYXVsdENvbm5lY3Rpb25Qcm9maWxlXTtcbiAgICAgICAgY29uc3QgbmV3RGlhbG9nUHJvcHMgPSB7XG4gICAgICAgICAgLi4uYmFzZURpYWxvZ1Byb3BzLFxuICAgICAgICAgIGNvbm5lY3Rpb25Qcm9maWxlczogY29tcG9zaXRlQ29ubmVjdGlvblByb2ZpbGVzLFxuICAgICAgICB9O1xuICAgICAgICBSZWFjdERPTS5yZW5kZXIoPENvbm5lY3Rpb25EaWFsb2cgey4uLm5ld0RpYWxvZ1Byb3BzfSAvPiwgaG9zdEVsKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3QgaW5pdGlhbERpYWxvZ1Byb3BzID0ge1xuICAgICAgLi4uYmFzZURpYWxvZ1Byb3BzLFxuICAgICAgY29ubmVjdGlvblByb2ZpbGVzOiBjb21wb3NpdGVDb25uZWN0aW9uUHJvZmlsZXMsXG4gICAgfTtcbiAgICBSZWFjdERPTS5yZW5kZXIoPENvbm5lY3Rpb25EaWFsb2cgey4uLmluaXRpYWxEaWFsb2dQcm9wc30gLz4sIGhvc3RFbCk7XG4gIH0pO1xufVxuIl19