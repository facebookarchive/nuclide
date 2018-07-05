/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import * as vscode from 'vscode';
import {ConnectionWrapper} from '../ConnectionWrapper';
import {TerminalWrapper} from './TerminalWrapper';
import {getIntegratedTerminal} from '../configuration';
import {spawnRemote} from '../RemoteProcess';

/**
 * Creates a vscode.Terminal attached to a remote
 */
export async function createRemoteTerminal(
  conn: ConnectionWrapper,
  cwd?: string,
  env?: {[x: string]: string},
): Promise<vscode.Terminal> {
  const {shell, shellArgs} = getIntegratedTerminal();
  const t = new TerminalWrapper('term: ' + conn.getAddress());
  // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
  const p = await spawnRemote(conn, shell, shellArgs, {
    cwd,
    shell: false,
    usePty: true,
    env,
    addBigDigToPath: true,
  });
  await t.ready;
  t.terminal.show(false);
  t.stdin.pipe(p.stdin);
  t.on('close', () => {
    p.kill('SIGTERM');
  });
  t.on('resize', () => {
    p.resize(t.columns, t.rows);
  });
  p.stdout.pipe(t.stdout);
  p.stderr.pipe(t.stderr);
  p.once('close', () => t.close());
  p.once('error', err => {
    vscode.window.showWarningMessage(`Error from terminal: ${err.toString()}`);
    t.close();
  });
  return t.terminal;
}
