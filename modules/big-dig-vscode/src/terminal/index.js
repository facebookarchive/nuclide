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

import type {RemoteChildProcess} from '../RemoteProcess';
import type {TerminalWrapper} from '../util/TerminalWrapper';

import * as vscode from 'vscode';
import {ConnectionWrapper} from '../ConnectionWrapper';
import {getIntegratedTerminal} from '../configuration';
import {spawnRemote} from '../RemoteProcess';
import {createProxyExecutable} from '../util/ProxyExecutable';

/**
 * Creates a `vscode.Terminal` attached to a remote process.
 */
export async function createRemoteTerminal(
  conn: ConnectionWrapper,
  cwd?: string,
  env?: {[x: string]: string},
): Promise<vscode.Terminal> {
  const {shell, shellArgs} = getIntegratedTerminal();

  // TODO(siegbell): use the new, proposed `TerminalRenderer` API instead of a proxy process.
  const exec = await createProxyExecutable();
  exec.spawned.take(1).subscribe(async ({proxy}) => {
    // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
    const remote = await spawnRemote(conn, shell, shellArgs, {
      cwd,
      shell: false,
      usePty: true,
      env,
      addBigDigToPath: true,
    });
    connectProxyToRemoteProcess(proxy, remote);
  });

  exec.terminal.show(false /* take UI focus */);
  return exec.terminal;
}

function connectProxyToRemoteProcess(
  proxy: TerminalWrapper,
  remote: RemoteChildProcess,
): void {
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
}
