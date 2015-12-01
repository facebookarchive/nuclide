'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Activates all nuclide and fb atom packages.
 *
 * @returns A promise that resolves to an array of strings, which are the names of all the packages
 *   that this function activates.
 */
export async function activateAllPackages(): Promise<Array<string>> {
  const packageNames = atom.packages.getAvailablePackageNames().filter(
    name => {
      // TODO(jonaldislarry) These packages somehow stop execution when their activation is awaited.
      const inBlacklist = [
        'fb-phabricator',
        'nuclide-clipboard-path',
        'nuclide-format-js',
        'nuclide-move-pane',
        'nuclide-react-native-inspector',
        'nuclide-service-monitor',
      ].concat([ // TODO(jonaldislarry) These packages error when deactivated for some reason.
        'nuclide-file-tree',
        'nuclide-toolbar',
        'nuclide-fuzzy-filename-provider',
      ]).indexOf(name) >= 0;

      const isNuclidePackage = name.startsWith('fb-') || name.startsWith('nuclide-');

      return isNuclidePackage && !inBlacklist;
    }
  );

  await Promise.all(packageNames.map(pack => atom.packages.activatePackage(pack)));
  return packageNames;
}
