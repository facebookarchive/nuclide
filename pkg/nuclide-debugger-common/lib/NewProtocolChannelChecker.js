/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

const NewChannelCompatibleEngines = new Set([
  'hhvm',
  'lldb',
  'java',
  'vscode-adapter',
  'mobilejs',
]);

export function isNewProtocolChannelEnabled(engineName: string): boolean {
  return NewChannelCompatibleEngines.has(engineName);
}
