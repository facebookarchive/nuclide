'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const PACKAGE_RENAMES = new Map([
  ['nuclide-clang-atom', 'nuclide-clang'],
  ['nuclide-debugger-hhvm', 'nuclide-debugger-php'],
  ['nuclide-debugger-lldb-client', 'nuclide-debugger-native'],
  ['nuclide-remote-ctags', 'nuclide-ctags'],
]);

export default function configMigrator(): void {
  // Get the config as it exists in `config.cson` - without defaults
  const allNuclideConfigs = atom.config.getRawValue('nuclide', {
    sources: atom.config.getUserConfigPath(),
  });

  // Migrate only if there are settings for Nuclide.
  if (typeof allNuclideConfigs !== 'object' || allNuclideConfigs == null) {
    return;
  }

  for (const [before, after] of PACKAGE_RENAMES) {
    const configValue = allNuclideConfigs[before];
    if (configValue != null) {
      const oldKey = `nuclide.${before}`;
      const newKey = `nuclide.${after}`;

      // Only migrate settings with values.
      if (typeof configValue === 'object' && Object.keys(configValue).length) {
        atom.config.setRawValue(newKey, configValue);
      }

      // Remove old setting so it is not migrated again.
      atom.config.unset(oldKey);
    }
  }

  // Remote connection configs have since been migrated to separate files.
  if (allNuclideConfigs['nuclide-connection'] != null) {
    atom.config.unset('nuclide.nuclide-connection');
  }

  // Incorrect setting we've been adding.
  if (atom.config.getRawValue('file-watcher.promptWhenFileHasChangedOnDisk', {}) != null) {
    atom.config.unset('file-watcher');
  }

  const oldProfiles = allNuclideConfigs.connectionProfiles;
  if (oldProfiles != null) {
    const newProfiles =
      typeof allNuclideConfigs['nuclide-remote-projects'] === 'object' &&
      allNuclideConfigs['nuclide-remote-projects'] != null &&
      allNuclideConfigs['nuclide-remote-projects'].connectionProfiles;
    if (!(Array.isArray(newProfiles) && newProfiles.length > 0)) {
      // Don't overwrite values that may exist in the new location
      atom.config.setRawValue(
        'nuclide.nuclide-remote-projects.connectionProfiles',
        oldProfiles,
      );
      atom.config.unset('nuclide.connectionProfiles');
    } else if (Array.isArray(oldProfiles) && oldProfiles.length <= 1) {
      // When there are values in the location, and the old location has 0 or 1,
      // it's probably the default. This can happen if you switch to an old
      // Nuclide version and then back.
      atom.config.unset('nuclide.connectionProfiles');
    }
  }

  const {lastConnectionDetails} = allNuclideConfigs;
  if (lastConnectionDetails != null) {
    window.localStorage.setItem(
      'nuclide:nuclide-remote-projects:lastConnectionDetails',
      JSON.stringify(lastConnectionDetails),
    );
    atom.config.unset('nuclide.lastConnectionDetails');
  }
}
