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
import os from 'os';
import path from 'path';
import {checkOutput} from './process';

const NUCLIDE_PACKAGE_JSON_PATH = require.resolve('../../package.json');
const NUCLIDE_BASEDIR = path.dirname(NUCLIDE_PACKAGE_JSON_PATH);

const pkgJson = JSON.parse(fs.readFileSync(NUCLIDE_PACKAGE_JSON_PATH));

export const OS_TYPE = {
  WIN32: 'win32',
  WIN64: 'win64',
  LINUX: 'linux',
  OSX: 'darwin',
};

// "Development" is defined as working from source - not packaged code.
// apm/npm and internal releases don't package the base `.flowconfig`, so
// we use this to figure if we're packaged or not.
export const isDevelopment = once((): boolean => {
  try {
    fs.statSync(path.join(NUCLIDE_BASEDIR, '.flowconfig'));
    return true;
  } catch (err) {
    return false;
  }
});

// Prior to Atom v1.7.0, `atom.inSpecMode` had a chance of performing an IPC call that could be
// expensive depending on how much work the other process was doing. Because this value will not
// change during run time, memoize the value to ensure the IPC call is performed only once.
//
// See [`getWindowLoadSettings`][1] for the sneaky getter and `remote` call that this memoization
// ensures happens only once.
//
// [1]: https://github.com/atom/atom/blob/v1.6.2/src/window-load-settings-helpers.coffee#L10-L14
export const isRunningInTest = once((): boolean => {
  if (isRunningInClient()) {
    return atom.inSpecMode();
  } else {
    return process.env.NODE_ENV === 'test';
  }
});

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

export function getOsType(): string {
  return os.platform();
}

export function isRunningInWindows(): boolean {
  return getOsType() === OS_TYPE.WIN32 || getOsType() === OS_TYPE.WIN64;
}

export function getOsVersion(): string {
  return os.release();
}

export async function getFlowVersion(): Promise<string> {
  // $UPFixMe: This should use nuclide-features-config
  const flowPath = global.atom && global.atom.config.get('nuclide-flow.pathToFlow') || 'flow';
  const {stdout} = await checkOutput(flowPath, ['--version']);
  return stdout.trim();
}

export async function getClangVersion(): Promise<string> {
  const {stdout} = await checkOutput('clang', ['--version']);
  return stdout.trim();
}

export function getRuntimePath(): string {
  // "resourcesPath" only exists in Atom. It's as close as you can get to
  // Atom's path. In the general case, it looks like this:
  // Mac: "/Applications/Atom.app/Contents/Resources"
  // Linux: "/usr/share/atom/resources"
  // Windows: "C:\\Users\\asuarez\\AppData\\Local\\atom\\app-1.6.2\\resources"
  //          "C:\Atom\resources"
  if (global.atom && typeof process.resourcesPath === 'string') {
    const resourcesPath = process.resourcesPath;
    if (os.platform() === 'darwin') {
      return resourcesPath.replace(/\/Contents\/Resources$/, '');
    } else if (os.platform() === 'linux') {
      return resourcesPath.replace(/\/resources$/, '');
    } else {
      return resourcesPath.replace(/[\\]+resources$/, '');
    }
  } else {
    return process.execPath;
  }
}
