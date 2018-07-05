/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict
 * @format
 */

import * as vscode from 'vscode';

export interface IIntegratedTerminal {
  shell: string;
  shellArgs: Array<string>;
}

export function getIntegratedTerminal(): IIntegratedTerminal {
  const result = vscode.workspace
    .getConfiguration('big-dig')
    .get('terminal.integrated' || {shell: 'bash'});
  result.shell = result.shell || 'bash';
  result.shellArgs = result.shellArgs || [];
  return result;
}
