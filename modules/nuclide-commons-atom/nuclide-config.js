/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import ConfigManager from './ConfigManager';
import fs from 'fs';
import nuclideUri from 'nuclide-commons/nuclideUri';
import nullthrows from 'nullthrows';
import CSON from 'season';

/**
 * This module provides a wrapper around an atom$Config to be used for storing
 * data not intended to be accessed by Nuclide users (which should be accessed
 * using feature-config or atom.config). These config values are accessed/stored
 * on disk in the NUCLIDE_CONFIG_FILE and should only be modified via the
 * NuclideConfigManager functions provided by this module's export
 */

const Config = atom.config.constructor;
const NUCLIDE_CONFIG_FILE = 'nuclide-config.cson';

const nuclideConfigFilePath = nuclideUri.join(
  nullthrows(process.env.ATOM_HOME),
  NUCLIDE_CONFIG_FILE,
);

function getConfigSettingsFromDisk() {
  let configSettings = {};

  if (fs.existsSync(nuclideConfigFilePath)) {
    configSettings = CSON.readFileSync(nuclideConfigFilePath);
  }
  return configSettings;
}

const nuclideConfig = new Config({
  mainSource: nuclideConfigFilePath,
  // reuse applicationDelegate's saveCallback but with nuclideConfig's context
  saveCallback() {
    atom.applicationDelegate.setUserSettings(
      this.settings,
      this.getUserConfigPath(),
    );
  },
});

// Reset the settings to match those stored in NUCLIDE_CONFIG_FILE. This sets
// settingsLoaded to true (allowing config to be saved using the saveCallback)
nuclideConfig.resetUserSettings(getConfigSettingsFromDisk());

const nuclideConfigManager = new ConfigManager(nuclideConfig);

export default nuclideConfigManager;
