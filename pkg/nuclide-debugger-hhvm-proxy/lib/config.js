'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HhvmDebuggerConfig} from '..';

const defaultConfig: HhvmDebuggerConfig = {
  xdebugPort: 9000,
  logLevel: 'INFO',
  targetUri: '',
  hhvmBinaryPath: '/usr/local/hphpi/bin/hhvm',
};

let config: HhvmDebuggerConfig = defaultConfig;

export function getConfig(): HhvmDebuggerConfig {
  return config;
}

export function setConfig(newConfig: HhvmDebuggerConfig): void {
  config = {
    ...newConfig,
  };
}

export function clearConfig(): void {
  config = defaultConfig;
}
