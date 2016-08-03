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
  // ['nuclide-clang-atom', 'nuclide-clang'],
  // ['nuclide-debugger-hhvm', 'nuclide-debugger-php'],
  // ['nuclide-debugger-lldb-client', 'nuclide-debugger-lldb'],
  // ['nuclide-remote-ctags', 'nuclide-ctags'],
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
}
