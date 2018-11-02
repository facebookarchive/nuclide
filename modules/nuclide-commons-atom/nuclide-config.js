"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__updateConfigSettingsListener = __updateConfigSettingsListener;
exports.default = void 0;

var _electron = require("electron");

var _fs = _interopRequireDefault(require("fs"));

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _season() {
  const data = _interopRequireDefault(require("season"));

  _season = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _ConfigManager() {
  const data = _interopRequireDefault(require("./ConfigManager"));

  _ConfigManager = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
if (!(_electron.remote != null && _electron.remote.ipcMain != null && _electron.ipcRenderer != null)) {
  throw new Error("Invariant violation: \"remote != null && remote.ipcMain != null && ipcRenderer != null\"");
}
/**
 * This module provides a wrapper around an atom$Config to be used for storing
 * data not intended to be accessed by Nuclide users (which should be accessed
 * using feature-config or atom.config). These config values are accessed/stored
 * on disk in the NUCLIDE_CONFIG_FILE and should only be modified via the
 * NuclideConfig / ConfigManager functions provided by this module's export
 */


const Config = atom.config.constructor;
const NUCLIDE_CONFIG_FILE = 'nuclide-config.cson';
const UPDATE_NUCLIDE_CONFIG_SETTINGS = 'nuclide-config-update-settings';

const nuclideConfigFilePath = _nuclideUri().default.join((0, _nullthrows().default)(process.env.ATOM_HOME), NUCLIDE_CONFIG_FILE);

function getConfigSettingsFromDisk() {
  let configSettings = {};

  if (_fs.default.existsSync(nuclideConfigFilePath)) {
    configSettings = _season().default.readFileSync(nuclideConfigFilePath);
  }

  return configSettings;
}

const config = new Config({
  mainSource: nuclideConfigFilePath,

  // Reuse applicationDelegate's saveCallback but with nuclideConfig's context.
  // This delegates saving to the config file to atom's main process, which
  // handles saving contention
  saveCallback() {
    atom.applicationDelegate.setUserSettings(this.settings, this.getUserConfigPath());
  }

}); // Reset the settings to match those stored in NUCLIDE_CONFIG_FILE. This sets
// settingsLoaded to true (allowing config to be saved using the saveCallback)

config.resetUserSettings(getConfigSettingsFromDisk());
/**
 * Emit nuclide-config's settings so that other processes can update their
 * config settings to reflect changes values
 */

function emitConfigSettings(settings) {
  _electron.ipcRenderer.send(UPDATE_NUCLIDE_CONFIG_SETTINGS, settings);
}
/**
 * Extend the ConfigManager to overload the set/unset functionality. This is
 * necessary for interprocess communication so that config changes in one window
 * (process) are reflected in the config objects of other windows (processes).
 * Since set/unset writes to disk, we only want one set/unset call to occur for
 * any single action done by a process. The initiating process will call set/unset
 * and then emit the event to other processes, which will update their config objects
 * without writing to disk (via resetUserSettings).
 * Instead of restricting the underlying config set/unset calls to a single "main"
 * process, we call it for any process that calls nuclideConfig.set/unset and rely
 * on Atom's main process to handle any disk writing contention
 */


class NuclideConfig extends _ConfigManager().default {
  // Set the nuclide-config value and emit event with updated config values to
  // push config changes to other processes
  set(keyPath, value, options) {
    const setSuccess = super.set(keyPath, value, options);

    if (setSuccess) {
      emitConfigSettings({
        settings: this._config.settings,
        options
      });
    }

    return setSuccess;
  } // Unset the nuclide-config key and emit event with updated config values to
  // push config changes to other processes


  unset(keyPath, options) {
    super.unset(keyPath, options);
    emitConfigSettings({
      settings: this._config.settings,
      options
    });
  }

}

const nuclideConfig = new NuclideConfig(config);
/**
 * Listen to incoming nuclide-config changes from other processes and reset
 * the current process's config to match that emitted by the emitting process.
 * Clobber the entire config settings object to have all the "latest" values,
 * instead of setting individual key/vals, which may produce a config of merged
 * values from different sources
 */

_electron.remote.ipcMain.on(UPDATE_NUCLIDE_CONFIG_SETTINGS, __updateConfigSettingsListener); // NB: This isn't described correctly in electron-flowtype-definitions, so we'll
// fake it out


// export for testing
function __updateConfigSettingsListener(event, {
  settings,
  options
}) {
  if (event.sender.getOwnerBrowserWindow().id !== _electron.remote.getCurrentWindow().id) {
    // Update all settings without saving to disk
    nuclideConfig.getConfig().resetUserSettings(settings, options);
  }
}

var _default = nuclideConfig;
exports.default = _default;