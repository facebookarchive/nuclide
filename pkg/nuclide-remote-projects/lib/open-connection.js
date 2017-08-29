'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.openConnectionDialog = openConnectionDialog;

var _Model;

function _load_Model() {
  return _Model = _interopRequireDefault(require('nuclide-commons/Model'));
}

var _showModal;

function _load_showModal() {
  return _showModal = _interopRequireDefault(require('../../nuclide-ui/showModal'));
}

var _connectionProfileUtils;

function _load_connectionProfileUtils() {
  return _connectionProfileUtils = require('./connection-profile-utils');
}

var _RemoteProjectConnectionModal;

function _load_RemoteProjectConnectionModal() {
  return _RemoteProjectConnectionModal = _interopRequireDefault(require('./RemoteProjectConnectionModal'));
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('nuclide-commons-ui/bindObservableAsProps');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _react = _interopRequireWildcard(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getLogger = () => (0, (_log4js || _load_log4js()).getLogger)('nuclide-remote-projects');

/**
 * Opens the remote connection dialog flow, which includes asking the user
 * for connection parameters (e.g. username, server name, etc), and optionally
 * asking for additional (e.g. 2-fac) authentication.
 */

// eslint-disable-next-line nuclide-internal/import-type-style
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

function openConnectionDialog(dialogOptions) {
  return new Promise(resolve => {
    (0, (_showModal || _load_showModal()).default)(dismiss => {
      const StatefulModal = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(createPropsStream({ dismiss, onConnected: resolve, dialogOptions }), (_RemoteProjectConnectionModal || _load_RemoteProjectConnectionModal()).default);
      return _react.createElement(StatefulModal, null);
    }, { shouldDismissOnClickOutsideModal: () => false });
  });
}

/**
 * Creates an observable that contains the props of the wizard component. When the state changes,
 * the observable emits new props and (thanks to `bindObservableAsProps`), we re-render the
 * component.
 */
function createPropsStream({ dismiss, onConnected, dialogOptions }) {
  // During the lifetime of this 'openConnectionDialog' flow, the 'default'
  // connection profile should not change (even if it is reset by the user
  // connecting to a remote project from another Atom window).
  const defaultConnectionProfile = (0, (_connectionProfileUtils || _load_connectionProfileUtils()).getDefaultConnectionProfile)(dialogOptions);

  const initialConnectionProfiles = [defaultConnectionProfile, ...(0, (_connectionProfileUtils || _load_connectionProfileUtils()).getSavedConnectionProfiles)()];

  // These props don't change over the lifetime of the modal.
  const staticProps = {
    defaultConnectionProfile,
    initialFormFields: defaultConnectionProfile.params,
    profileHosts: (0, (_connectionProfileUtils || _load_connectionProfileUtils()).getUniqueHostsForProfiles)(initialConnectionProfiles),

    onScreenChange: screen => {
      updateState({ screen });
    },
    onConnect: (() => {
      var _ref = (0, _asyncToGenerator.default)(function* (connection, config) {
        onConnected(connection);
        (0, (_connectionProfileUtils || _load_connectionProfileUtils()).saveConnectionConfig)(config, (0, (_connectionProfileUtils || _load_connectionProfileUtils()).getOfficialRemoteServerCommand)());
      });

      return function onConnect(_x, _x2) {
        return _ref.apply(this, arguments);
      };
    })(),
    onCancel: () => {
      onConnected(null);
      dismiss();
    },
    onError: (err_, config) => {
      onConnected( /* connection */null);
      (0, (_connectionProfileUtils || _load_connectionProfileUtils()).saveConnectionConfig)(config, (0, (_connectionProfileUtils || _load_connectionProfileUtils()).getOfficialRemoteServerCommand)());
    },
    onClosed: () => {
      dismiss();
    },
    onSaveProfile(index, profile) {
      const connectionProfiles = model.state.connectionProfiles.slice();
      // Override the existing version.
      connectionProfiles.splice(index, 1, profile);
      updateState({ connectionProfiles });
    },
    onDeleteProfileClicked(indexToDelete) {
      if (indexToDelete === 0) {
        // no-op: The default connection profile can't be deleted.
        // TODO jessicalin: Show this error message in a better place.
        atom.notifications.addError('The default connection profile cannot be deleted.');
        return;
      }
      const { connectionProfiles, selectedProfileIndex } = model.state;
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
      updateState({ selectedProfileIndex });
    }
  };

  function updateState(nextState, saveProfiles = true) {
    const prevState = model.state;
    model.setState(nextState);

    // If the connection profiles changed, save them to the config. The `saveProfiles` option allows
    // us to opt out because this is a bi-directional sync and we don't want to cause an infinite
    // loop!
    if (saveProfiles && nextState.connectionProfiles != null && nextState.connectionProfiles !== prevState.connectionProfiles) {
      // Don't include the first profile when saving since that's the default.
      (0, (_connectionProfileUtils || _load_connectionProfileUtils()).saveConnectionProfiles)(nextState.connectionProfiles.slice(1));
    }
  }

  const model = new (_Model || _load_Model()).default({
    screen: 'connect',
    selectedProfileIndex: 0,
    connectionProfiles: initialConnectionProfiles
  });

  const props = model.toObservable().map(state => Object.assign({}, state, staticProps));

  const savedProfilesStream = (0, (_event || _load_event()).observableFromSubscribeFunction)((_connectionProfileUtils || _load_connectionProfileUtils()).onSavedConnectionProfilesDidChange).map(() => (0, (_connectionProfileUtils || _load_connectionProfileUtils()).getSavedConnectionProfiles)());

  return _rxjsBundlesRxMinJs.Observable.using(() =>
  // If something else changes the saved profiles, we want to update our state to reflect those
  // changes.
  savedProfilesStream.subscribe(savedProfiles => {
    updateState({ connectionProfiles: [defaultConnectionProfile, ...savedProfiles] },
    // Don't write the changes to the config; that's where we got them from and we don't want
    // to cause an infinite loop.
    false);
  }), () => props);
}