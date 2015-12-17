'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const CONFIG_PREFIX_REGEXP = /^(nuclide|fb)-/;

function migrateConfig(): void {
  const allUserConfigs = atom.config.getRawValue(null, {
    sources: atom.config.getUserConfigPath(),
  });

  // Migrate only if user config exists and is a non-null Object. Anything else is outside what the
  // migration is able to handle.
  if (typeof allUserConfigs !== 'object' || allUserConfigs == null) {
    return;
  }

  Object.keys(allUserConfigs).forEach(function(k) {
    if (CONFIG_PREFIX_REGEXP.test(k)) {
      let newConfig = atom.config.get('nuclide');

      if (typeof newConfig !== 'object' || newConfig == null) {
        // If no 'nuclide' config has been set yet, initialize it with an empty object so it can
        // be populated with the old settings.
        newConfig = {};
      }

      newConfig[k] = allUserConfigs[k];
      atom.config.setRawValue('nuclide', newConfig);

      // Remove old setting so it is not migrated again.
      atom.config.unset(k);
    }
  });

  // Remove obsolete remote-projects setting
  atom.config.unset('nuclide.remoteProjectsConfig');
}

module.exports = {
  migrateConfig,
};
