'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import os from 'os';
import {checkOutput} from './process';

export const OS_TYPE = {
  WIN32: 'win32',
  WIN64: 'win64',
  LINUX: 'linux',
  OSX: 'darwin',
};

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
