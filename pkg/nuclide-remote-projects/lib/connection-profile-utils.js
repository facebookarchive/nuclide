'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getIPsForHosts = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Returns an array of IP addresses for a given array of host names
 */
let getIPsForHosts = exports.getIPsForHosts = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (hosts) {
    const promise_array = hosts.map(function (host) {
      return (0, (_lookupPreferIpV || _load_lookupPreferIpV()).default)(host).catch(function () {});
    });
    const values = yield Promise.all(promise_array);
    return (0, (_collection || _load_collection()).arrayCompact)(values);
  });

  return function getIPsForHosts(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Section: Default/Last-Used Connection Profiles
 */

/**
 * Saves a connection configuration along with the last official server command.
 */


exports.getDefaultConnectionProfile = getDefaultConnectionProfile;
exports.getSavedConnectionProfiles = getSavedConnectionProfiles;
exports.saveConnectionProfiles = saveConnectionProfiles;
exports.onSavedConnectionProfilesDidChange = onSavedConnectionProfilesDidChange;
exports.getUniqueHostsForProfiles = getUniqueHostsForProfiles;
exports.saveConnectionConfig = saveConnectionConfig;
exports.getDefaultConfig = getDefaultConfig;
exports.getOfficialRemoteServerCommand = getOfficialRemoteServerCommand;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _lookupPreferIpV;

function _load_lookupPreferIpV() {
  return _lookupPreferIpV = _interopRequireDefault(require('../../nuclide-remote-connection/lib/lookup-prefer-ip-v6'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Section: Default Connection Profile
 */

/**
 * A default connection profile is a combination of the user's last inputs to
 * the connection dialog and the default settings, plus the update logic we use
 * to change the remote server command.
 */
function getDefaultConnectionProfile(options) {
  const defaultConnectionSettings = getDefaultConfig();
  const currentOfficialRSC = defaultConnectionSettings.remoteServerCommand;

  const rawLastConnectionDetails = localStorage.getItem('nuclide:nuclide-remote-projects:lastConnectionDetails');

  let lastConnectionDetails;
  try {
    // $FlowIgnore: null is ok here
    lastConnectionDetails = JSON.parse(rawLastConnectionDetails);
  } catch (err) {
    // nothing to do...
  } finally {
    if (lastConnectionDetails == null) {
      lastConnectionDetails = {};
    }
  }

  if (!(lastConnectionDetails != null)) {
    throw new Error('Invariant violation: "lastConnectionDetails != null"');
  }

  const {
    lastOfficialRemoteServerCommand,
    updatedConfig
  } = lastConnectionDetails;
  const lastConfig = updatedConfig || {};

  // Only use the user's last saved remote server command if there has been no
  // change (upgrade) in the official remote server command.
  let remoteServerCommand = currentOfficialRSC;
  if (lastOfficialRemoteServerCommand === currentOfficialRSC && lastConfig.remoteServerCommand) {
    remoteServerCommand = lastConfig.remoteServerCommand;
  }
  const dialogSettings = Object.assign({}, defaultConnectionSettings, lastConfig, {
    remoteServerCommand
  });
  if (options != null) {
    dialogSettings.cwd = options.initialCwd;
    dialogSettings.server = options.initialServer;
    // flowlint-next-line sketchy-null-string:off
    if (options.initialRemoteServerCommand) {
      dialogSettings.remoteServerCommand = options.initialRemoteServerCommand;
    }
  }
  // Due to a previous bug in the sshPort type, we may need to do this cast to
  // correct bad state that was persisted in users' configs.
  dialogSettings.sshPort = String(dialogSettings.sshPort);
  return {
    deletable: false,
    displayTitle: '(default)',
    params: dialogSettings,
    saveable: false
  };
}

/**
 * Section: User-created Connection Profiles
 */

/**
 * Returns an array of saved connection profiles.
 */
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

/* global localStorage */

function getSavedConnectionProfiles() {
  const connectionProfiles = (_featureConfig || _load_featureConfig()).default.get('nuclide-remote-projects.connectionProfiles');

  if (!Array.isArray(connectionProfiles)) {
    throw new Error('Invariant violation: "Array.isArray(connectionProfiles)"');
  }

  prepareSavedConnectionProfilesForDisplay(connectionProfiles);
  return connectionProfiles;
}

/**
 * Saves the connection profiles. Overwrites any existing profiles.
 */
function saveConnectionProfiles(profiles) {
  prepareConnectionProfilesForSaving(profiles);
  (_featureConfig || _load_featureConfig()).default.set('nuclide-remote-projects.connectionProfiles', profiles);
}

/**
 * Calls the callback when the saved connection profiles change.
 * @return Disposable that can be disposed to stop listening for changes.
 */
function onSavedConnectionProfilesDidChange(callback) {
  return (_featureConfig || _load_featureConfig()).default.onDidChange('nuclide-remote-projects.connectionProfiles', event => {
    const newProfiles = event.newValue;
    prepareSavedConnectionProfilesForDisplay(newProfiles);
    callback(newProfiles);
  });
}

/**
 * Returns an array of host names for a given array of connection profiles
 */
function getUniqueHostsForProfiles(profiles) {
  const uniqueHosts = new Set();
  for (let i = 0; i < profiles.length; i++) {
    uniqueHosts.add(profiles[i].params.server);
  }
  return Array.from(uniqueHosts);
}function saveConnectionConfig(config, lastOfficialRemoteServerCommand) {
  // Don't store user's password.
  const updatedConfig = Object.assign({}, config, { password: '' });
  // SshConnectionConfiguration's sshPort type is 'number', but we want to save
  // everything as strings.
  updatedConfig.sshPort = String(config.sshPort);
  localStorage.setItem('nuclide:nuclide-remote-projects:lastConnectionDetails', JSON.stringify({
    updatedConfig,
    // Save last official command to detect upgrade.
    lastOfficialRemoteServerCommand
  }));
}

let defaultConfig = null;
/**
 * This fetches the 'default' connection configuration supplied to the user
 * regardless of any connection profiles they might have saved.
 */
function getDefaultConfig() {
  if (defaultConfig) {
    return defaultConfig;
  }
  let defaultConfigGetter;
  try {
    // $FlowFB
    defaultConfigGetter = require('./fb/config');
  } catch (e) {
    defaultConfigGetter = require('./config');
  }
  defaultConfig = defaultConfigGetter.getConnectionDialogDefaultSettings();
  return defaultConfig;
}

function getOfficialRemoteServerCommand() {
  return getDefaultConfig().remoteServerCommand;
}

function prepareSavedConnectionProfilesForDisplay(connectionProfiles) {
  if (!connectionProfiles) {
    return;
  }
  // If a profile does not inclide a remote server command, this means the user
  // intended to use the default server command. We must fill this in.
  const defaultConnectionSettings = getDefaultConfig();
  const currentOfficialRSC = defaultConnectionSettings.remoteServerCommand;
  connectionProfiles.forEach(profile => {
    if (!profile.params.remoteServerCommand) {
      profile.params.remoteServerCommand = currentOfficialRSC;
    }
  });
}

function prepareConnectionProfilesForSaving(connectionProfiles) {
  // If a connection profile has a default remote server command, replace it with
  // an empty string. This indicates that this server command should be filled in
  // when this profile is used.
  const defaultConnectionSettings = getDefaultConfig();
  const currentOfficialRSC = defaultConnectionSettings.remoteServerCommand;
  connectionProfiles.forEach(profile => {
    if (profile.params.remoteServerCommand === currentOfficialRSC) {
      profile.params.remoteServerCommand = '';
    }
  });
}