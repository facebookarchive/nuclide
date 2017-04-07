/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Subscription, Observable} from 'rxjs';
import typeof * as ClangProcessService from './ClangProcessService';
import type {ClangCompileResult} from './rpc-types';
import type {ClangServerArgs} from './find-clang-server-args';

import nuclideUri from '../../commons-node/nuclideUri';
import {getServerSideMarshalers} from '../../nuclide-marshalers-common';
import {BehaviorSubject} from 'rxjs';

import {asyncExecute, createProcessStream} from '../../commons-node/process';
import {RpcProcess} from '../../nuclide-rpc';
import {ServiceRegistry, loadServicesConfig} from '../../nuclide-rpc';
import {watchFile} from '../../nuclide-filewatcher-rpc';

export type ClangServerStatus = 'ready' | 'compiling';

let serviceRegistry: ?ServiceRegistry = null;

function getServiceRegistry(): ServiceRegistry {
  if (serviceRegistry == null) {
    serviceRegistry = new ServiceRegistry(
      getServerSideMarshalers,
      loadServicesConfig(nuclideUri.join(__dirname, '..')),
      'clang_language_service',
    );
  }
  return serviceRegistry;
}

function spawnClangProcess(
  src: string,
  serverArgs: ClangServerArgs,
  flags: Array<string>,
): Observable<child_process$ChildProcess> {
  const {libClangLibraryFile, pythonPathEnv, pythonExecutable} = serverArgs;
  const pathToLibClangServer = nuclideUri.join(__dirname, '../python/clang_server.py');
  const args = [pathToLibClangServer];
  if (libClangLibraryFile != null) {
    args.push('--libclang-file', libClangLibraryFile);
  }
  args.push('--', src);
  args.push(...flags);
  const options = {
    cwd: nuclideUri.dirname(pathToLibClangServer),
    stdio: 'pipe',
    detached: false, // When Atom is killed, clang_server.py should be killed, too.
    env: {
      PYTHONPATH: pythonPathEnv,
    },
  };

  // Note that safeSpawn() often overrides options.env.PATH, but that only happens when
  // options.env is undefined (which is not the case here). This will only be an issue if the
  // system cannot find `pythonExecutable`.
  return createProcessStream(pythonExecutable, args, options);
}

export type ClangServerFlags = {
  flags: Array<string>,
  usesDefaultFlags: boolean,
  flagsFile: ?string,
};

export default class ClangServer extends RpcProcess {
  static Status: {[key: string]: ClangServerStatus} = Object.freeze({
    READY: 'ready',
    COMPILING: 'compiling',
  });

  _usesDefaultFlags: boolean;
  _pendingCompileRequests: number;
  _serverStatus: BehaviorSubject<ClangServerStatus>;
  _flagsSubscription: ?Subscription;
  _flagsChanged: boolean;

  constructor(
    src: string,
    serverArgs: ClangServerArgs,
    flagsData: ClangServerFlags,
  ) {
    super(
      `ClangServer-${src}`,
      getServiceRegistry(),
      spawnClangProcess(src, serverArgs, flagsData.flags),
    );
    this._usesDefaultFlags = flagsData.usesDefaultFlags;
    this._pendingCompileRequests = 0;
    this._serverStatus = new BehaviorSubject(ClangServer.Status.READY);
    this._flagsChanged = false;
    if (flagsData.flagsFile != null) {
      this._flagsSubscription =
        watchFile(flagsData.flagsFile)
          .refCount()
          .take(1)
          .subscribe(
            x => { this._flagsChanged = true; },
            () => {},  // ignore errors
          );
    }
  }

  dispose() {
    super.dispose();
    this._serverStatus.complete();
    if (this._flagsSubscription != null) {
      this._flagsSubscription.unsubscribe();
    }
  }

  getService(): Promise<ClangProcessService> {
    return super.getService('ClangProcessService');
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

  getFlagsChanged(): boolean {
    return this._flagsChanged;
  }

  // Call this instead of using the RPC layer directly.
  // This way, we can track when the server is busy compiling.
  async compile(contents: string): Promise<?ClangCompileResult> {
    if (this._pendingCompileRequests++ === 0) {
      this._serverStatus.next(ClangServer.Status.COMPILING);
    }
    try {
      const service = await this.getService();
      return await service.compile(contents)
        .then(result => ({
          ...result,
          accurateFlags: !this._usesDefaultFlags,
        }));
    } finally {
      if (--this._pendingCompileRequests === 0) {
        this._serverStatus.next(ClangServer.Status.READY);
      }
    }
  }

  getStatus(): ClangServerStatus {
    return this._serverStatus.getValue();
  }

  waitForReady(): Promise<mixed> {
    if (this.getStatus() === ClangServer.Status.READY) {
      return Promise.resolve();
    }
    return this._serverStatus
      .takeWhile(x => x !== ClangServer.Status.READY)
      .toPromise();
  }
}
