'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import path from 'path';

var SMALLEST_NUCLIDE_BUILD_NUMBER = 5394875;

export function isRunningInClient(): boolean {
  return global.atom !== undefined;
}

export function getAtomVersion(): string {
  if (!isRunningInClient()) {
    throw Error('Not running in Atom/Nuclide.');
  }
  return global.atom.getVersion();
}

/**
 * Determine whether the package is running in Atom.app or Nuclide.app.
 *
 * While building Nuclide release, we set the internal build number as part of version number.
 * So the version looks like 1.0.$buildNumber. Since the internal build number is really big,
 * whereas the counterpart in Atom' version string is realtively small or not a valid number,
 * it is a good way to identify if the running editer is Nuclide or Atom.
 */
export function isRunningInNuclide(): boolean {
  if (!isRunningInClient()) {
    return false;
  }

  var version = getAtomVersion();
  var buildNumber = version.split('.')[2];
  // If the PATCH version (the third part of version string splitted by dot) is a number and larger
  // than SMALLEST_NUCLIDE_BUILD_NUMBER, then it's a build number.
  if (/^\d+$/.test(buildNumber) && parseInt(buildNumber, 10) >= SMALLEST_NUCLIDE_BUILD_NUMBER) {
    return true;
  }
  return false;
}

var atomConfig = isRunningInClient() ?
    require(path.join(atom.getLoadSettings().resourcePath, 'package.json')) :
    {};

export function getNuclideBuildNumber(): number {
  if (!isRunningInClient()) {
    throw Error('Not running in Atom/Nuclide.');
  }
  return atomConfig.buildNumber || 0;
}

// TODO(chenshen) implement isDevelopment.
// TODO(chenshen) implement getInstallerPackageBuildNumber.

export var __test__ = {
  SMALLEST_NUCLIDE_BUILD_NUMBER,
};
