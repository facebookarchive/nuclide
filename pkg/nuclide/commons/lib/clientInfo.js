'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import fs from 'fs';
import invariant from 'assert';
import once from './once';
import path from 'path';

const NUCLIDE_PACKAGE_JSON_PATH = require.resolve('../../../../package.json');
const NUCLIDE_BASEDIR = path.dirname(NUCLIDE_PACKAGE_JSON_PATH);

const pkgJson = JSON.parse(fs.readFileSync(NUCLIDE_PACKAGE_JSON_PATH));

// "Development" is defined as working from source - not packaged code.
// apm/npm and internal releases don't package the base `.flowconfig`, so
// we use this to figure if we're packaged or not.
export const isDevelopment = once(function(): boolean {
  try {
    fs.statSync(path.join(NUCLIDE_BASEDIR, '.flowconfig'));
    return true;
  } catch (err) {
    return false;
  }
});

export function isRunningInTest(): boolean {
  if (isRunningInClient()) {
    return atom.inSpecMode();
  } else {
    return process.env.NODE_ENV === 'test';
  }
}

export function isRunningInClient(): boolean {
  return typeof atom !== 'undefined';
}

// This path may be a symlink.
export function getAtomNuclideDir(): string {
  if (!isRunningInClient()) {
    throw Error('Not running in Atom.');
  }
  const nuclidePackageModule = atom.packages.getLoadedPackage('nuclide');
  invariant(nuclidePackageModule);
  return nuclidePackageModule.path;
}

export function getAtomVersion(): string {
  if (!isRunningInClient()) {
    throw Error('Not running in Atom.');
  }
  return atom.getVersion();
}

export function getNuclideVersion(): string {
  return pkgJson.version;
}

export function getNuclideRealDir(): string {
  return NUCLIDE_BASEDIR;
}
