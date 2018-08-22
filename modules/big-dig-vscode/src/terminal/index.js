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
import {TerminalWrapper} from '../util/TerminalWrapper';
import {getIntegratedTerminal} from '../configuration';
import {spawnRemote} from '../RemoteProcess';

/**
 * Creates a `vscode.Terminal` attached to a remote process.
 */
export async function createRemoteTerminal(
  conn: ConnectionWrapper,
  cwd?: string,
  env?: {[x: string]: string},
): Promise<vscode.Terminal> {
  const {shell, shellArgs} = getIntegratedTerminal();
  const proxy = new TerminalWrapper('term: ' + conn.getAddress());
  // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
  const remote = await spawnRemote(conn, shell, shellArgs, {
    cwd,
    shell: false,
    usePty: true,
    env,
    addBigDigToPath: true,
  });
  await proxy.ready;

  proxy.on('close', () => {
    remote.kill('SIGTERM');
  });
  proxy.on('resize', () => {
    const {columns, rows} = proxy;
    remote.resize(columns, rows);
  });
  proxy.stdin.pipe(remote.stdin);

  remote.stdout.pipe(proxy.stdout);
  remote.stderr.pipe(proxy.stderr);
  remote.once('close', () => proxy.close());
  remote.once('error', err => {
    vscode.window.showWarningMessage(`Error from terminal: ${err.toString()}`);
    proxy.close();
  });

  proxy.terminal.show(false);
  return proxy.terminal;
}
