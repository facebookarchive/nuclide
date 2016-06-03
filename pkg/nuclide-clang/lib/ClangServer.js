'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import path from 'path';

import {asyncExecute, safeSpawn} from '../../commons-node/process';
import RpcProcess from '../../commons-node/RpcProcess';
import findClangServerArgs from './find-clang-server-args';

async function spawnClangProcess(
  src: string,
  flags: Array<string>,
): Promise<child_process$ChildProcess> {
  const {libClangLibraryFile, pythonPathEnv, pythonExecutable} = await findClangServerArgs();
  const pathToLibClangServer = path.join(__dirname, '../python/clang_server.py');
  const args = [pathToLibClangServer];
  if (libClangLibraryFile != null) {
    args.push('--libclang-file', libClangLibraryFile);
  }
  args.push('--', src);
  args.push(...flags);
  const options = {
    cwd: path.dirname(pathToLibClangServer),
    stdio: 'pipe',
    detached: false, // When Atom is killed, clang_server.py should be killed, too.
    env: {
      PYTHONPATH: pythonPathEnv,
    },
  };

  // Note that safeSpawn() often overrides options.env.PATH, but that only happens when
  // options.env is undefined (which is not the case here). This will only be an issue if the
  // system cannot find `pythonExecutable`.
  return safeSpawn(pythonExecutable, args, options);
}

export default class ClangServer extends RpcProcess<Object, any> {

  _src: string;
  _flags: Array<string>;
  _usesDefaultFlags: boolean;
  _pendingCompileRequests: number;

  constructor(src: string, flags: Array<string>, usesDefaultFlags?: boolean = false) {
    super(`ClangServer-${src}`, () => spawnClangProcess(src, flags));
    this._src = src;
    this._flags = flags;
    this._usesDefaultFlags = usesDefaultFlags;
    this._pendingCompileRequests = 0;
  }

  /**
   * Returns RSS of the child process in bytes.
   * Works on Unix and Mac OS X.
   */
  async getMemoryUsage(): Promise<number> {
    if (this._process == null) {
      return 0;
    }
    const {exitCode, stdout} = await asyncExecute(
      'ps',
      ['-p', this._process.pid.toString(), '-o', 'rss='],
    );
    if (exitCode !== 0) {
      return 0;
    }
    return parseInt(stdout, 10) * 1024; // ps returns KB
  }

  usesDefaultFlags(): boolean {
    return this._usesDefaultFlags;
  }

  /**
   * Send a request to the Clang server.
   * Requests are processed serially and strictly in order.
   * If the server is currently compiling, all other requests will automatically return null
   * (unless the `blocking` parameter is explicitly provided).
   */
  async call(
    method: string,
    args: Object,
    blocking?: boolean,
  ): Promise<any> {
    if (method === 'compile') {
      this._pendingCompileRequests++;
    } else if (!blocking && this._pendingCompileRequests) {
      // All non-blocking requests should instantly fail.
      // This allows the client to fall back to default autocomplete, ctags, etc.
      return null;
    }
    try {
      return await super.call(method, args);
    } finally {
      if (method === 'compile') {
        this._pendingCompileRequests--;
      }
    }
  }
}
