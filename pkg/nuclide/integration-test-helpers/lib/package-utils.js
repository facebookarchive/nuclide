'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import featureConfig from '../../feature-config';
import invariant from 'assert';
import path from 'path';
import {__testUseOnly_removeFeature} from '../../../../';

/**
 * Activates all nuclide and fb atom packages that do not defer their own activation until a
 * certain command or hook is executed.
 *
 * @returns A promise that resolves to an array of strings, which are the names of all the packages
 *   that this function activates.
 */
export async function activateAllPackages(): Promise<Array<string>> {
  // These are packages we want to activate, including some which come bundled with atom,
  // or ones widely used in conjunction with nuclide.
  const whitelist = [
    'autocomplete-plus',
    'hyperclick',
    'status-bar',
  ];

  // TODO(jonaldislarry) These package(s) cannot be activated manually -- t9243542.
  ['nuclide-fuzzy-filename-provider'].forEach(name => __testUseOnly_removeFeature(name));

  const packageNames = atom.packages.getAvailablePackageNames().filter(name => {
    const pack = atom.packages.loadPackage(name);
    invariant(pack != null);
    const isActivationDeferred = pack.hasActivationCommands() || pack.hasActivationHooks();
    const isLanguagePackage = name.startsWith('language-');
    const inWhitelist = whitelist.indexOf(name) >= 0;
    return (isLanguagePackage || inWhitelist) && !isActivationDeferred;
  });

  // Ensure 3rd-party packages are not installed via the 'atom-package-deps' package when the
  // 'nuclide' package is activated. It makes network requests that never return in a test env.
  featureConfig.set('installRecommendedPackages', false);

  // Include the path to the nuclide package.
  packageNames.push(path.join(__dirname, '../../../..'));
  await Promise.all(packageNames.map(pack => atom.packages.activatePackage(pack)));
  return atom.packages.getActivePackages().map(pack => pack.name);
}

export function deactivateAllPackages(): void {
  atom.packages.deactivatePackages();
  atom.packages.unloadPackages();
}
