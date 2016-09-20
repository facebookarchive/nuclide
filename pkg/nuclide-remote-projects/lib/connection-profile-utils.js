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

exports.getDefaultConnectionProfile = getDefaultConnectionProfile;
exports.getSavedConnectionProfiles = getSavedConnectionProfiles;
exports.saveConnectionProfiles = saveConnectionProfiles;
exports.onSavedConnectionProfilesDidChange = onSavedConnectionProfilesDidChange;
exports.saveConnectionConfig = saveConnectionConfig;
exports.getDefaultConfig = getDefaultConfig;
exports.getOfficialRemoteServerCommand = getOfficialRemoteServerCommand;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

/**
 * Section: Default Connection Profile
 */

/**
 * A default connection profile is a combination of the user's last inputs to
 * the connection dialog and the default settings, plus the update logic we use
 * to change the remote server command.
 */

function getDefaultConnectionProfile() {
  var defaultConnectionSettings = getDefaultConfig();
  var currentOfficialRSC = defaultConnectionSettings.remoteServerCommand;

  var rawLastConnectionDetails = window.localStorage.getItem('nuclide:nuclide-remote-projects:lastConnectionDetails');

  var lastConnectionDetails = undefined;
  try {
    lastConnectionDetails = JSON.parse(rawLastConnectionDetails);
  } catch (err) {
    // nothing to do...
  } finally {
    if (lastConnectionDetails == null) {
      lastConnectionDetails = {};
    }
  }

  (0, (_assert2 || _assert()).default)(lastConnectionDetails != null);
  var _lastConnectionDetails = lastConnectionDetails;
  var lastOfficialRemoteServerCommand = _lastConnectionDetails.lastOfficialRemoteServerCommand;
  var updatedConfig = _lastConnectionDetails.updatedConfig;

  var lastConfig = updatedConfig || {};

  // Only use the user's last saved remote server command if there has been no
  // change (upgrade) in the official remote server command.
  var remoteServerCommand = currentOfficialRSC;
  if (lastOfficialRemoteServerCommand === currentOfficialRSC && lastConfig.remoteServerCommand) {
    remoteServerCommand = lastConfig.remoteServerCommand;
  }
  var dialogSettings = _extends({}, defaultConnectionSettings, lastConfig, { remoteServerCommand: remoteServerCommand });
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

function getSavedConnectionProfiles() {
  var connectionProfiles = (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-remote-projects.connectionProfiles');
  (0, (_assert2 || _assert()).default)(Array.isArray(connectionProfiles));
  prepareSavedConnectionProfilesForDisplay(connectionProfiles);
  return connectionProfiles;
}

/**
 * Saves the connection profiles. Overwrites any existing profiles.
 */

function saveConnectionProfiles(profiles) {
  prepareConnectionProfilesForSaving(profiles);
  (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.set('nuclide-remote-projects.connectionProfiles', profiles);
}

/**
 * Calls the callback when the saved connection profiles change.
 * @return Disposable that can be disposed to stop listening for changes.
 */

function onSavedConnectionProfilesDidChange(callback) {
  return (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.onDidChange('nuclide-remote-projects.connectionProfiles', function (event) {
    var newProfiles = event.newValue;
    prepareSavedConnectionProfilesForDisplay(newProfiles);
    callback(newProfiles);
  });
}

/**
 * Section: Default/Last-Used Connection Profiles
 */

/**
 * Saves a connection configuration along with the last official server command.
 */

function saveConnectionConfig(config, lastOfficialRemoteServerCommand) {
  // Don't store user's password.
  var updatedConfig = _extends({}, config, { password: '' });
  // SshConnectionConfiguration's sshPort type is 'number', but we want to save
  // everything as strings.
  updatedConfig.sshPort = String(config.sshPort);
  window.localStorage.setItem('nuclide:nuclide-remote-projects:lastConnectionDetails', JSON.stringify({
    updatedConfig: updatedConfig,
    // Save last official command to detect upgrade.
    lastOfficialRemoteServerCommand: lastOfficialRemoteServerCommand
  }));
}

var defaultConfig = null;
/**
 * This fetches the 'default' connection configuration supplied to the user
 * regardless of any connection profiles they might have saved.
 */

function getDefaultConfig() {
  if (defaultConfig) {
    return defaultConfig;
  }
  var defaultConfigGetter = undefined;
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
  var defaultConnectionSettings = getDefaultConfig();
  var currentOfficialRSC = defaultConnectionSettings.remoteServerCommand;
  connectionProfiles.forEach(function (profile) {
    if (!profile.params.remoteServerCommand) {
      profile.params.remoteServerCommand = currentOfficialRSC;
    }
  });
}

function prepareConnectionProfilesForSaving(connectionProfiles) {
  // If a connection profile has a default remote server command, replace it with
  // an empty string. This indicates that this server command should be filled in
  // when this profile is used.
  var defaultConnectionSettings = getDefaultConfig();
  var currentOfficialRSC = defaultConnectionSettings.remoteServerCommand;
  connectionProfiles.forEach(function (profile) {
    if (profile.params.remoteServerCommand === currentOfficialRSC) {
      profile.params.remoteServerCommand = '';
    }
  });
}