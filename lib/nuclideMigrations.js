'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const PACKAGE_PREFIX_REGEXP = /^(nuclide|fb)-/;

function migrateConfig(): void {
  const allUserConfigs = atom.config.getRawValue(null, {
    sources: atom.config.getUserConfigPath(),
  });

  // Migrate only if user config exists and is a non-null Object. Anything else is outside what the
  // migration is able to handle.
  if (typeof allUserConfigs !== 'object' || allUserConfigs == null) {
    return;
  }

  // Having performed migrations is a proxy for deciding whether this is the first time these
  // migrations have been run. If any settings matching `PACKAGE_PREFIX_REGEXP` are found, this is
  // likely the first time the 'nuclide' package has been activated.
  let didMigrate = false;
  Object.keys(allUserConfigs).forEach(function(k) {
    if (PACKAGE_PREFIX_REGEXP.test(k)) {
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

      // Track that a setting in need of migration was found.
      didMigrate = true;
    }
  });

  // Remove obsolete remote-projects setting
  atom.config.unset('nuclide.remoteProjectsConfig');
  atom.config.unset('nuclide.nuclide-diagnostics-ui.enableAutofix');
  atom.config.unset('nuclide.nuclide-health.showActiveHandles');
  atom.config.unset('nuclide.nuclide-health.showActiveRequests');
  atom.config.unset('nuclide.nuclide-health.showCpu');
  atom.config.unset('nuclide.nuclide-health.showHeap');
  atom.config.unset('nuclide.nuclide-health.showKeyLatency');
  atom.config.unset('nuclide.nuclide-health.showMemory');

  // If any migrations were performed, forcibly enable the 'incompatible-packages' package because
  // it may have been disabled programmatically via internal means. Only do this while migrating so
  // users can re-disable the package normally after an initial migration.
  if (didMigrate) {
    const disabledPackages = atom.config.get('core.disabledPackages');
    if (Array.isArray(disabledPackages)) {
      const incompatPkgsIndex = disabledPackages.indexOf('incompatible-packages');
      if (incompatPkgsIndex >= 0) {
        disabledPackages.splice(incompatPkgsIndex, 1);
        atom.config.setRawValue('core.disabledPackages', disabledPackages);
      }
    }
  }
}

module.exports = {
  migrateConfig,
};
