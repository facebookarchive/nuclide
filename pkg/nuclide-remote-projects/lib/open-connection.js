"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openConnectionDialog = openConnectionDialog;

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

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
// eslint-disable-next-line nuclide-internal/import-type-style
const getLogger = () => (0, _log4js().getLogger)('nuclide-remote-projects');
/**
 * Opens the remote connection dialog flow, which includes asking the user
 * for connection parameters (e.g. username, server name, etc), and optionally
 * asking for additional (e.g. 2-fac) authentication.
 */


function openConnectionDialog(dialogOptions) {
  return new Promise(resolve => {
    (0, _showModal().default)(({
      dismiss
    }) => {
      const StatefulModal = (0, _bindObservableAsProps().bindObservableAsProps)(createPropsStream({
        dismiss,
        onConnected: resolve,
        dialogOptions
      }), _RemoteProjectConnectionModal().default);
      return React.createElement(StatefulModal, null);
    }, {
      shouldDismissOnClickOutsideModal: () => false
    });
  });
}
/**
 * Creates an observable that contains the props of the wizard component. When the state changes,
 * the observable emits new props and (thanks to `bindObservableAsProps`), we re-render the
 * component.
 */


function createPropsStream({
  dismiss,
  onConnected,
  dialogOptions
}) {
  // During the lifetime of this 'openConnectionDialog' flow, the 'default'
  // connection profile should not change (even if it is reset by the user
  // connecting to a remote project from another Atom window).
  const defaultConnectionProfile = (0, _connectionProfileUtils().getDefaultConnectionProfile)(dialogOptions);
  const initialConnectionProfiles = [defaultConnectionProfile, ...(0, _connectionProfileUtils().getSavedConnectionProfiles)()]; // These props don't change over the lifetime of the modal.

  const staticProps = {
    defaultConnectionProfile,
    initialFormFields: defaultConnectionProfile.params,
    profileHosts: (0, _connectionProfileUtils().getUniqueHostsForProfiles)(initialConnectionProfiles),
    onScreenChange: screen => {
      updateState({
        screen
      });
    },
    onConnect: async (connection, config) => {
      onConnected(connection);
      (0, _connectionProfileUtils().saveConnectionConfig)(config, (0, _connectionProfileUtils().getOfficialRemoteServerCommand)());
    },
    onCancel: () => {
      onConnected(null);
      dismiss();
    },
    onError: (err_, config) => {
      onConnected(
      /* connection */
      null);
      (0, _connectionProfileUtils().saveConnectionConfig)(config, (0, _connectionProfileUtils().getOfficialRemoteServerCommand)());
    },
    onClosed: () => {
      dismiss();
    },

    onSaveProfile(index, profile) {
      const connectionProfiles = model.state.connectionProfiles.slice(); // Override the existing version.

      connectionProfiles.splice(index, 1, profile);
      updateState({
        connectionProfiles
      });
    },

    onDeleteProfileClicked(indexToDelete) {
      if (indexToDelete === 0) {
        // no-op: The default connection profile can't be deleted.
        // TODO jessicalin: Show this error message in a better place.
        atom.notifications.addError('The default connection profile cannot be deleted.');
        return;
      }

      const {
        connectionProfiles,
        selectedProfileIndex
      } = model.state;

      if (connectionProfiles) {
        if (indexToDelete >= connectionProfiles.length) {
          getLogger().fatal('Tried to delete a connection profile with an index that does not exist. ' + 'This should never happen.');
          return;
        }

        const nextConnectionProfiles = connectionProfiles.slice();
        nextConnectionProfiles.splice(indexToDelete, 1);
        const nextSelectedProfileIndex = selectedProfileIndex >= indexToDelete ? selectedProfileIndex - 1 : selectedProfileIndex;
        updateState({
          selectedProfileIndex: nextSelectedProfileIndex,
          connectionProfiles: nextConnectionProfiles
        });
      }
    },

    onProfileCreated(newProfile) {
      const connectionProfiles = [...model.state.connectionProfiles, newProfile];
      updateState({
        connectionProfiles,
        selectedProfileIndex: connectionProfiles.length - 1,
        screen: 'connect'
      });
    },

    onProfileSelected(selectedProfileIndex) {
      updateState({
        selectedProfileIndex
      });
    }

  };

  function updateState(nextState, saveProfiles = true) {
    const prevState = model.state;
    model.setState(nextState); // If the connection profiles changed, save them to the config. The `saveProfiles` option allows
    // us to opt out because this is a bi-directional sync and we don't want to cause an infinite
    // loop!

    if (saveProfiles && nextState.connectionProfiles != null && nextState.connectionProfiles !== prevState.connectionProfiles) {
      // Don't include the first profile when saving since that's the default.
      (0, _connectionProfileUtils().saveConnectionProfiles)(nextState.connectionProfiles.slice(1));
    }
  }

  const model = new (_Model().default)({
    screen: 'connect',
    selectedProfileIndex: 0,
    connectionProfiles: initialConnectionProfiles
  });
  const props = model.toObservable().map(state => Object.assign({}, state, staticProps));
  const savedProfilesStream = (0, _event().observableFromSubscribeFunction)(_connectionProfileUtils().onSavedConnectionProfilesDidChange).map(() => (0, _connectionProfileUtils().getSavedConnectionProfiles)());
  return _RxMin.Observable.using(() => // If something else changes the saved profiles, we want to update our state to reflect those
  // changes.
  savedProfilesStream.subscribe(savedProfiles => {
    updateState({
      connectionProfiles: [defaultConnectionProfile, ...savedProfiles]
    }, // Don't write the changes to the config; that's where we got them from and we don't want
    // to cause an infinite loop.
    false);
  }), () => props);
}