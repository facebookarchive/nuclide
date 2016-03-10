Object.defineProperty(exports, '__esModule', {
  value: true
});
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

var _logging = require('../../logging');

var _commons = require('../../commons');

var logger = (0, _logging.getLogger)();
var dialogPromiseQueue = null;

/**
 * Opens the remote connection dialog flow, which includes asking the user
 * for connection parameters (e.g. username, server name, etc), and optionally
 * asking for additional (e.g. 2-fac) authentication.
 */

function openConnectionDialog(props) {
  if (!dialogPromiseQueue) {
    dialogPromiseQueue = new _commons.PromiseQueue();
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
    var baseDialogProps = _commons.extend.immutableExtend({
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
      var newDialogProps = _commons.extend.immutableExtend(baseDialogProps, { connectionProfiles: compositeConnectionProfiles });
      ReactDOM.render(React.createElement(ConnectionDialog, newDialogProps), hostEl);
    });

    var initialDialogProps = _commons.extend.immutableExtend(baseDialogProps, { connectionProfiles: compositeConnectionProfiles });
    ReactDOM.render(React.createElement(ConnectionDialog, initialDialogProps), hostEl);
  });
}
//# sourceMappingURL=data:application/json;base64,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QixJQUFJLENBQUMsQ0FBQztBQUM3QiwrQkFBdUIsRUFBRSxDQUFDO09BQzNCO0FBQ0QsY0FBUSxFQUFFLG9CQUFNOztBQUVkLFlBQUksTUFBTSxFQUFFO0FBQ1Ysa0JBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN4QyxjQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUU7QUFDckIsa0JBQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1dBQ3ZDO1NBQ0Y7T0FDRjtLQUNGLEVBQUUsS0FBSyxDQUFDLENBQUM7Ozs7QUFJVixrQ0FBOEIsR0FBRyxnRUFDL0IsVUFBQyxXQUFXLEVBQTZDO0FBQ3ZELGlDQUEyQixHQUFHLFdBQVcsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUN0RixDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDL0IsVUFBTSxjQUFjLEdBQUcsZ0JBQU8sZUFBZSxDQUMzQyxlQUFlLEVBQ2YsRUFBQyxrQkFBa0IsRUFBRSwyQkFBMkIsRUFBQyxDQUNsRCxDQUFDO0FBQ0YsY0FBUSxDQUFDLE1BQU0sQ0FBQyxvQkFBQyxnQkFBZ0IsRUFBSyxjQUFjLENBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztLQUNuRSxDQUNGLENBQUM7O0FBRUYsUUFBTSxrQkFBa0IsR0FBRyxnQkFBTyxlQUFlLENBQy9DLGVBQWUsRUFDZixFQUFDLGtCQUFrQixFQUFFLDJCQUEyQixFQUFDLENBQ2xELENBQUM7QUFDRixZQUFRLENBQUMsTUFBTSxDQUFDLG9CQUFDLGdCQUFnQixFQUFLLGtCQUFrQixDQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7R0FDdkUsQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoib3Blbi1jb25uZWN0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtcbiAgZ2V0RGVmYXVsdENvbm5lY3Rpb25Qcm9maWxlLFxuICBnZXRPZmZpY2lhbFJlbW90ZVNlcnZlckNvbW1hbmQsXG4gIGdldFNhdmVkQ29ubmVjdGlvblByb2ZpbGVzLFxuICBvblNhdmVkQ29ubmVjdGlvblByb2ZpbGVzRGlkQ2hhbmdlLFxuICBzYXZlQ29ubmVjdGlvbkNvbmZpZyxcbiAgc2F2ZUNvbm5lY3Rpb25Qcm9maWxlcyxcbn0gZnJvbSAnLi9jb25uZWN0aW9uLXByb2ZpbGUtdXRpbHMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuXG5pbXBvcnQgdHlwZSB7UmVtb3RlQ29ubmVjdGlvbn0gZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24nO1xuaW1wb3J0IHR5cGUge051Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZX0gZnJvbSAnLi9jb25uZWN0aW9uLXR5cGVzJztcbmltcG9ydCB7ZXh0ZW5kLCBQcm9taXNlUXVldWV9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcbmxldCBkaWFsb2dQcm9taXNlUXVldWU6ID9Qcm9taXNlUXVldWUgPSBudWxsO1xuXG4vKipcbiAqIE9wZW5zIHRoZSByZW1vdGUgY29ubmVjdGlvbiBkaWFsb2cgZmxvdywgd2hpY2ggaW5jbHVkZXMgYXNraW5nIHRoZSB1c2VyXG4gKiBmb3IgY29ubmVjdGlvbiBwYXJhbWV0ZXJzIChlLmcuIHVzZXJuYW1lLCBzZXJ2ZXIgbmFtZSwgZXRjKSwgYW5kIG9wdGlvbmFsbHlcbiAqIGFza2luZyBmb3IgYWRkaXRpb25hbCAoZS5nLiAyLWZhYykgYXV0aGVudGljYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcGVuQ29ubmVjdGlvbkRpYWxvZyhwcm9wczogT2JqZWN0KTogUHJvbWlzZTw/UmVtb3RlQ29ubmVjdGlvbj4ge1xuICBpZiAoIWRpYWxvZ1Byb21pc2VRdWV1ZSkge1xuICAgIGRpYWxvZ1Byb21pc2VRdWV1ZSA9IG5ldyBQcm9taXNlUXVldWUoKTtcbiAgfVxuXG4gIHJldHVybiBkaWFsb2dQcm9taXNlUXVldWUuc3VibWl0KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCB7XG4gICAgICBSZWFjdCxcbiAgICAgIFJlYWN0RE9NLFxuICAgIH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuICAgIGNvbnN0IENvbm5lY3Rpb25EaWFsb2cgPSByZXF1aXJlKCcuL0Nvbm5lY3Rpb25EaWFsb2cnKTtcbiAgICBjb25zdCB3b3Jrc3BhY2VFbCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSk7XG4gICAgY29uc3QgaG9zdEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgd29ya3NwYWNlRWwuYXBwZW5kQ2hpbGQoaG9zdEVsKTtcblxuICAgIC8vIER1cmluZyB0aGUgbGlmZXRpbWUgb2YgdGhpcyAnb3BlbkNvbm5lY3Rpb25EaWFsb2cnIGZsb3csIHRoZSAnZGVmYXVsdCdcbiAgICAvLyBjb25uZWN0aW9uIHByb2ZpbGUgc2hvdWxkIG5vdCBjaGFuZ2UgKGV2ZW4gaWYgaXQgaXMgcmVzZXQgYnkgdGhlIHVzZXJcbiAgICAvLyBjb25uZWN0aW5nIHRvIGEgcmVtb3RlIHByb2plY3QgZnJvbSBhbm90aGVyIEF0b20gd2luZG93KS5cbiAgICBjb25zdCBkZWZhdWx0Q29ubmVjdGlvblByb2ZpbGU6IE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZSA9IGdldERlZmF1bHRDb25uZWN0aW9uUHJvZmlsZSgpO1xuICAgIC8vIFRoZSBgY29tcG9zaXRlQ29ubmVjdGlvblByb2ZpbGVzYCBpcyB0aGUgY29tYmluYXRpb24gb2YgdGhlIGRlZmF1bHQgY29ubmVjdGlvblxuICAgIC8vIHByb2ZpbGUgcGx1cyBhbnkgdXNlci1jcmVhdGVkIGNvbm5lY3Rpb24gcHJvZmlsZXMuIEluaXRpYWxpemUgdGhpcyB0byB0aGVcbiAgICAvLyBkZWZhdWx0IGNvbm5lY3Rpb24gcHJvZmlsZS4gVGhpcyBhcnJheSBvZiBwcm9maWxlcyBtYXkgY2hhbmdlIGluIHRoZSBsaWZldGltZVxuICAgIC8vIG9mIGBvcGVuQ29ubmVjdGlvbkRpYWxvZ2AgZmxvdy5cbiAgICBsZXQgY29tcG9zaXRlQ29ubmVjdGlvblByb2ZpbGVzOiBBcnJheTxOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGU+ID1cbiAgICAgICAgW2RlZmF1bHRDb25uZWN0aW9uUHJvZmlsZV07XG4gICAgLy8gQWRkIGFueSBwcmV2aW91c2x5LWNyZWF0ZWQgKHNhdmVkKSBjb25uZWN0aW9uIHByb2ZpbGVzLlxuICAgIGNvbXBvc2l0ZUNvbm5lY3Rpb25Qcm9maWxlcyA9IGNvbXBvc2l0ZUNvbm5lY3Rpb25Qcm9maWxlcy5jb25jYXQoZ2V0U2F2ZWRDb25uZWN0aW9uUHJvZmlsZXMoKSk7XG5cbiAgICAvLyBXZSB3YW50IHRvIG9ic2VydmUgY2hhbmdlcyBpbiB0aGUgc2F2ZWQgY29ubmVjdGlvbiBwcm9maWxlcyBkdXJpbmcgdGhlXG4gICAgLy8gbGlmZXRpbWUgb2YgdGhpcyBjb25uZWN0aW9uIGRpYWxvZywgYmVjYXVzZSB0aGUgdXNlciBjYW4gYWRkL2RlbGV0ZVxuICAgIC8vIGEgcHJvZmlsZSBmcm9tIGEgY29ubmVjdGlvbiBkaWFsb2cuXG4gICAgbGV0IGNvbm5lY3Rpb25Qcm9maWxlc1N1YnNjcmlwdGlvbjogP0lEaXNwb3NhYmxlID0gbnVsbDtcbiAgICBmdW5jdGlvbiBjbGVhbnVwU3Vic2NyaXB0aW9uRnVuYygpOiB2b2lkIHtcbiAgICAgIGlmIChjb25uZWN0aW9uUHJvZmlsZXNTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgY29ubmVjdGlvblByb2ZpbGVzU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbkRlbGV0ZVByb2ZpbGVDbGlja2VkKGluZGV4VG9EZWxldGU6IG51bWJlcikge1xuICAgICAgaWYgKGluZGV4VG9EZWxldGUgPT09IDApIHtcbiAgICAgICAgLy8gbm8tb3A6IFRoZSBkZWZhdWx0IGNvbm5lY3Rpb24gcHJvZmlsZSBjYW4ndCBiZSBkZWxldGVkLlxuICAgICAgICAvLyBUT0RPIGplc3NpY2FsaW46IFNob3cgdGhpcyBlcnJvciBtZXNzYWdlIGluIGEgYmV0dGVyIHBsYWNlLlxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ1RoZSBkZWZhdWx0IGNvbm5lY3Rpb24gcHJvZmlsZSBjYW5ub3QgYmUgZGVsZXRlZC4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGNvbXBvc2l0ZUNvbm5lY3Rpb25Qcm9maWxlcykge1xuICAgICAgICBpZiAoaW5kZXhUb0RlbGV0ZSA+PSBjb21wb3NpdGVDb25uZWN0aW9uUHJvZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgbG9nZ2VyLmZhdGFsKCdUcmllZCB0byBkZWxldGUgYSBjb25uZWN0aW9uIHByb2ZpbGUgd2l0aCBhbiBpbmRleCB0aGF0IGRvZXMgbm90IGV4aXN0LiAnICtcbiAgICAgICAgICAgICAgJ1RoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbi4nKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBpbmRleCBvZiB0aGUgcHJvZmlsZSB0byBkZWxldGUuXG4gICAgICAgIGxldCBuZXdDb25uZWN0aW9uUHJvZmlsZXMgPSBjb21wb3NpdGVDb25uZWN0aW9uUHJvZmlsZXMuc2xpY2UoMCwgaW5kZXhUb0RlbGV0ZSkuY29uY2F0KFxuICAgICAgICAgICAgY29tcG9zaXRlQ29ubmVjdGlvblByb2ZpbGVzLnNsaWNlKGluZGV4VG9EZWxldGUgKyAxKSk7XG4gICAgICAgIC8vIFJlbW92ZSB0aGUgZmlyc3QgaW5kZXgsIGJlY2F1c2UgdGhpcyBpcyB0aGUgZGVmYXVsdCBjb25uZWN0aW9uIHByb2ZpbGUsXG4gICAgICAgIC8vIG5vdCBhIHVzZXItY3JlYXRlZCBwcm9maWxlLlxuICAgICAgICBuZXdDb25uZWN0aW9uUHJvZmlsZXMgPSBuZXdDb25uZWN0aW9uUHJvZmlsZXMuc2xpY2UoMSk7XG4gICAgICAgIHNhdmVDb25uZWN0aW9uUHJvZmlsZXMobmV3Q29ubmVjdGlvblByb2ZpbGVzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgbmV3UHJvZmlsZUZvcm07XG4gICAgLypcbiAgICAgKiBXaGVuIHRoZSBcIitcIiBidXR0b24gaXMgY2xpY2tlZCAodGhlIHVzZXIgaW50ZW5kcyB0byBhZGQgYSBuZXcgY29ubmVjdGlvbiBwcm9maWxlKSxcbiAgICAgKiBvcGVuIGEgbmV3IGRpYWxvZyB3aXRoIGEgZm9ybSB0byBjcmVhdGUgb25lLlxuICAgICAqIFRoaXMgbmV3IGRpYWxvZyB3aWxsIGJlIHByZWZpbGxlZCB3aXRoIHRoZSBpbmZvIGZyb20gdGhlIGRlZmF1bHQgY29ubmVjdGlvbiBwcm9maWxlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG9uQWRkUHJvZmlsZUNsaWNrZWQoKSB7XG4gICAgICAvLyBJZiB0aGVyZSBpcyBhbHJlYWR5IGFuIG9wZW4gZm9ybSwgZG9uJ3Qgb3BlbiBhbm90aGVyIG9uZS5cbiAgICAgIGlmIChuZXdQcm9maWxlRm9ybSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBob3N0RWxlbWVudEZvck5ld1Byb2ZpbGVGb3JtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICB3b3Jrc3BhY2VFbC5hcHBlbmRDaGlsZChob3N0RWxlbWVudEZvck5ld1Byb2ZpbGVGb3JtKTtcblxuICAgICAgLy8gUHJvcHNcbiAgICAgIGNvbnN0IGNsb3NlTmV3UHJvZmlsZUZvcm0gPSAoKSA9PiB7XG4gICAgICAgIG5ld1Byb2ZpbGVGb3JtID0gbnVsbDtcbiAgICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZShob3N0RWxlbWVudEZvck5ld1Byb2ZpbGVGb3JtKTtcbiAgICAgICAgaG9zdEVsZW1lbnRGb3JOZXdQcm9maWxlRm9ybS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGhvc3RFbGVtZW50Rm9yTmV3UHJvZmlsZUZvcm0pO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IG9uU2F2ZSA9IChuZXdQcm9maWxlOiBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGUpID0+IHtcbiAgICAgICAgLy8gRG9uJ3QgaW5jbHVkZSB0aGUgZGVmYXVsdCBjb25uZWN0aW9uIHByb2ZpbGUuXG4gICAgICAgIGNvbnN0IHVzZXJDcmVhdGVkUHJvZmlsZXMgPSBjb21wb3NpdGVDb25uZWN0aW9uUHJvZmlsZXMuc2xpY2UoMSkuY29uY2F0KG5ld1Byb2ZpbGUpO1xuICAgICAgICBzYXZlQ29ubmVjdGlvblByb2ZpbGVzKHVzZXJDcmVhdGVkUHJvZmlsZXMpO1xuICAgICAgICBjbG9zZU5ld1Byb2ZpbGVGb3JtKCk7XG4gICAgICB9O1xuICAgICAgY29uc3QgaW5pdGlhbERpYWxvZ1Byb3BzID0ge1xuICAgICAgICBvbkNhbmNlbDogY2xvc2VOZXdQcm9maWxlRm9ybSxcbiAgICAgICAgb25TYXZlLFxuICAgICAgICBpbml0aWFsRm9ybUZpZWxkczogZGVmYXVsdENvbm5lY3Rpb25Qcm9maWxlLnBhcmFtcyxcbiAgICAgIH07XG5cbiAgICAgIC8vIFBvcCB1cCBhIGRpYWxvZyB0aGF0IGlzIHByZS1maWxsZWQgd2l0aCB0aGUgZGVmYXVsdCBwYXJhbXMuXG4gICAgICBjb25zdCBDcmVhdGVDb25uZWN0aW9uUHJvZmlsZUZvcm0gPSByZXF1aXJlKCcuL0NyZWF0ZUNvbm5lY3Rpb25Qcm9maWxlRm9ybScpO1xuICAgICAgbmV3UHJvZmlsZUZvcm0gPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICAgIDxDcmVhdGVDb25uZWN0aW9uUHJvZmlsZUZvcm0gey4uLmluaXRpYWxEaWFsb2dQcm9wc30gLz4sXG4gICAgICAgIGhvc3RFbGVtZW50Rm9yTmV3UHJvZmlsZUZvcm0sXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFRoZSBjb25uZWN0aW9uIHByb2ZpbGVzIGNvdWxkIGNoYW5nZSwgYnV0IHRoZSByZXN0IG9mIHRoZSBwcm9wcyBwYXNzZWRcbiAgICAvLyB0byB0aGUgQ29ubmVjdGlvbkRpYWxvZyB3aWxsIG5vdC5cbiAgICAvLyBOb3RlOiB0aGUgYGNsZWFudXBTdWJzY3JpcHRpb25GdW5jYCBpcyBjYWxsZWQgd2hlbiB0aGUgZGlhbG9nIGNsb3NlczpcbiAgICAvLyBgb25Db25uZWN0YCwgYG9uRXJyb3JgLCBvciBgb25DYW5jZWxgLlxuICAgIGNvbnN0IGJhc2VEaWFsb2dQcm9wcyA9IGV4dGVuZC5pbW11dGFibGVFeHRlbmQoe1xuICAgICAgLy8gU2VsZWN0IHRoZSBkZWZhdWx0IGNvbm5lY3Rpb24gcHJvZmlsZSwgd2hpY2ggc2hvdWxkIGFsd2F5cyBiZSBpbmRleCAwLlxuICAgICAgaW5kZXhPZkluaXRpYWxseVNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU6IDAsXG4gICAgICBvbkFkZFByb2ZpbGVDbGlja2VkLFxuICAgICAgb25EZWxldGVQcm9maWxlQ2xpY2tlZCxcbiAgICAgIG9uQ29ubmVjdDogYXN5bmMgKGNvbm5lY3Rpb24sIGNvbmZpZykgPT4ge1xuICAgICAgICByZXNvbHZlKGNvbm5lY3Rpb24pO1xuICAgICAgICBzYXZlQ29ubmVjdGlvbkNvbmZpZyhjb25maWcsIGdldE9mZmljaWFsUmVtb3RlU2VydmVyQ29tbWFuZCgpKTtcbiAgICAgICAgY2xlYW51cFN1YnNjcmlwdGlvbkZ1bmMoKTtcbiAgICAgIH0sXG4gICAgICBvbkVycm9yOiAoZXJyLCBjb25maWcpID0+IHsgLy9lc2xpbnQtZGlzYWJsZS1saW5lIGhhbmRsZS1jYWxsYmFjay1lcnJcbiAgICAgICAgcmVzb2x2ZSgvKmNvbm5lY3Rpb24qLyBudWxsKTtcbiAgICAgICAgc2F2ZUNvbm5lY3Rpb25Db25maWcoY29uZmlnLCBnZXRPZmZpY2lhbFJlbW90ZVNlcnZlckNvbW1hbmQoKSk7XG4gICAgICAgIGNsZWFudXBTdWJzY3JpcHRpb25GdW5jKCk7XG4gICAgICB9LFxuICAgICAgb25DYW5jZWw6ICgpID0+IHtcbiAgICAgICAgcmVzb2x2ZSgvKmNvbm5lY3Rpb24qLyBudWxsKTtcbiAgICAgICAgY2xlYW51cFN1YnNjcmlwdGlvbkZ1bmMoKTtcbiAgICAgIH0sXG4gICAgICBvbkNsb3NlZDogKCkgPT4ge1xuICAgICAgICAvLyBVbm1vdW50IHRoZSBDb25uZWN0aW9uRGlhbG9nIGFuZCBjbGVhbiB1cCB0aGUgaG9zdCBlbGVtZW50LlxuICAgICAgICBpZiAoaG9zdEVsKSB7XG4gICAgICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZShob3N0RWwpO1xuICAgICAgICAgIGlmIChob3N0RWwucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgaG9zdEVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoaG9zdEVsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSwgcHJvcHMpO1xuXG4gICAgLy8gSWYvd2hlbiB0aGUgc2F2ZWQgY29ubmVjdGlvbiBwcm9maWxlcyBjaGFuZ2UsIHdlIHdhbnQgdG8gcmUtcmVuZGVyIHRoZSBkaWFsb2dcbiAgICAvLyB3aXRoIHRoZSBuZXcgc2V0IG9mIGNvbm5lY3Rpb24gcHJvZmlsZXMuXG4gICAgY29ubmVjdGlvblByb2ZpbGVzU3Vic2NyaXB0aW9uID0gb25TYXZlZENvbm5lY3Rpb25Qcm9maWxlc0RpZENoYW5nZShcbiAgICAgIChuZXdQcm9maWxlczogP0FycmF5PE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZT4pID0+IHtcbiAgICAgICAgY29tcG9zaXRlQ29ubmVjdGlvblByb2ZpbGVzID0gbmV3UHJvZmlsZXMgPyBbZGVmYXVsdENvbm5lY3Rpb25Qcm9maWxlXS5jb25jYXQobmV3UHJvZmlsZXMpIDpcbiAgICAgICAgICAgIFtkZWZhdWx0Q29ubmVjdGlvblByb2ZpbGVdO1xuICAgICAgICBjb25zdCBuZXdEaWFsb2dQcm9wcyA9IGV4dGVuZC5pbW11dGFibGVFeHRlbmQoXG4gICAgICAgICAgYmFzZURpYWxvZ1Byb3BzLFxuICAgICAgICAgIHtjb25uZWN0aW9uUHJvZmlsZXM6IGNvbXBvc2l0ZUNvbm5lY3Rpb25Qcm9maWxlc30sXG4gICAgICAgICk7XG4gICAgICAgIFJlYWN0RE9NLnJlbmRlcig8Q29ubmVjdGlvbkRpYWxvZyB7Li4ubmV3RGlhbG9nUHJvcHN9IC8+LCBob3N0RWwpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICBjb25zdCBpbml0aWFsRGlhbG9nUHJvcHMgPSBleHRlbmQuaW1tdXRhYmxlRXh0ZW5kKFxuICAgICAgYmFzZURpYWxvZ1Byb3BzLFxuICAgICAge2Nvbm5lY3Rpb25Qcm9maWxlczogY29tcG9zaXRlQ29ubmVjdGlvblByb2ZpbGVzfSxcbiAgICApO1xuICAgIFJlYWN0RE9NLnJlbmRlcig8Q29ubmVjdGlvbkRpYWxvZyB7Li4uaW5pdGlhbERpYWxvZ1Byb3BzfSAvPiwgaG9zdEVsKTtcbiAgfSk7XG59XG4iXX0=