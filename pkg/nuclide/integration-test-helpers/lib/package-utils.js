'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';

/**
 * Activates all nuclide and fb atom packages that do not defer their own activation until a
 * certain command or hook is executed.
 *
 * @returns A promise that resolves to an array of strings, which are the names of all the packages
 *   that this function activates.
 */
export async function activateAllPackages(): Promise<Array<string>> {
  // TODO(jonaldislarry) These packages stop execution when deactivated for some reason.
  const blacklist = [
    'nuclide-fuzzy-filename-provider',
  ];

  // These packages are not nuclide specific but should still be activated.  E.g. they are bundled
  // with atom, or widely used in conjunction with nuclide.
  const whitelist = [
    'autocomplete-plus',
    'hyperclick',
    'status-bar',
  ];

  const packageNames = atom.packages.getAvailablePackageNames().filter(name => {
    const pack = atom.packages.loadPackage(name);
    invariant(pack != null);
    const isActivationDeferred = pack.hasActivationCommands() || pack.hasActivationHooks();
    const inBlacklist = blacklist.indexOf(name) >= 0;
    const isNuclidePackage = name.startsWith('fb-') || name.startsWith('nuclide-');
    const inWhitelist = whitelist.indexOf(name) >= 0;
    return (isNuclidePackage || inWhitelist) && !inBlacklist && !isActivationDeferred;
  });
  await Promise.all(packageNames.map(pack => atom.packages.activatePackage(pack)));
  return packageNames;
}

export function deactivateAllPackages(): void {
  atom.packages.deactivatePackages();
  atom.packages.unloadPackages();
}
