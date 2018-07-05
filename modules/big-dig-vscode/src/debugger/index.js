/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import * as vscode from 'vscode';

import {BigDigDebugConfigurationProvider} from './BigDigDebugConfigurationProvider';

export function startDebugProviders(): IDisposable {
  const debugConfigurationProvider = new BigDigDebugConfigurationProvider();
  const reg = vscode.debug.registerDebugConfigurationProvider(
    'big-dig',
    debugConfigurationProvider,
  );
  return vscode.Disposable.from(reg, debugConfigurationProvider);
}
