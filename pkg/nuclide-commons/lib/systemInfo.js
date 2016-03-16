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
import {asyncExecute} from './process';

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
  const {stdout} = await asyncExecute(flowPath, ['--version']);
  return stdout.trim();
}

export async function getClangVersion(): Promise<string> {
  const {stdout} = await asyncExecute('clang', ['--version']);
  return stdout.trim();
}
