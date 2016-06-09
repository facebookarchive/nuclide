'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof * as ClangProcessService from './ClangProcessService';
import type {
  ClangCompileResult,
  ClangCompletion,
  ClangDeclaration,
  ClangCursor,
  ClangOutlineTree,
} from './rpc-types';

import path from 'path';
import {asyncExecute, safeSpawn} from '../../commons-node/process';
import RpcProcess from '../../commons-node/RpcProcess';
import findClangServerArgs from './find-clang-server-args';
import {ServiceRegistry} from '../../nuclide-rpc';

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

export default class ClangServer extends RpcProcess {

  _src: string;
  _flags: Array<string>;
  _usesDefaultFlags: boolean;
  _pendingCompileRequests: number;

  constructor(
    src: string,
    serviceRegistry: ServiceRegistry,
    flags: Array<string>,
    usesDefaultFlags?: boolean = false,
  ) {
    super(`ClangServer-${src}`, serviceRegistry, () => spawnClangProcess(src, flags));
    this._src = src;
    this._flags = flags;
    this._usesDefaultFlags = usesDefaultFlags;
    this._pendingCompileRequests = 0;
  }

  _getClangService(): Promise<ClangProcessService> {
    return this.getService('ClangProcessService');
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

  async compile(contents: string): Promise<ClangCompileResult> {
    this._pendingCompileRequests++;
    try {
      return (await this._getClangService()).compile(contents);
    } finally {
      this._pendingCompileRequests--;
    }
  }

  async get_completions(
    contents: string,
    line: number,
    column: number,
    tokenStartColumn: number,
    prefix: string,
  ): Promise<?Array<ClangCompletion>> {
    if (this._pendingCompileRequests > 0) {
      return null;
    }
    return (await this._getClangService()).get_completions(
      contents, line, column, tokenStartColumn, prefix);
  }

  async get_declaration(
    contents: string,
    line: number,
    column: number,
  ): Promise<?ClangDeclaration> {
    if (this._pendingCompileRequests > 0) {
      return null;
    }
    return (await this._getClangService()).get_declaration(contents, line, column);
  }

  async get_declaration_info(
    contents: string,
    line: number,
    column: number,
  ): Promise<?Array<ClangCursor>> {
    if (this._pendingCompileRequests > 0) {
      return null;
    }
    return (await this._getClangService()).get_declaration_info(contents, line, column);
  }

  async get_outline(contents: string): Promise<?Array<ClangOutlineTree>> {
    // get_ouline is blocking, so no need to check for pending compiles
    return (await this._getClangService()).get_outline(contents);
  }
}
