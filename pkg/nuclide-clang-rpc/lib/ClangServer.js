/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Subscription} from 'rxjs';
import typeof * as ClangProcessService from './ClangProcessService';
import type {ClangCompileResult} from './rpc-types';
import type {ClangServerArgs} from './find-clang-server-args';

import nuclideUri from '../../commons-node/nuclideUri';
import {getServerSideMarshalers} from '../../nuclide-marshalers-common';
import idx from 'idx';
import {BehaviorSubject, Observable} from 'rxjs';

import {asyncExecute, createProcessStream} from '../../commons-node/process';
import {RpcProcess} from '../../nuclide-rpc';
import {ServiceRegistry, loadServicesConfig} from '../../nuclide-rpc';
import {watchFile} from '../../nuclide-filewatcher-rpc';

export type ClangServerStatus = 'finding_flags' | 'compiling' | 'ready' | 'disposed';

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
  serverArgsPromise: Promise<ClangServerArgs>,
  flagsPromise: Promise<?ClangServerFlags>,
): Observable<child_process$ChildProcess> {
  return Observable.fromPromise(Promise.all([serverArgsPromise, flagsPromise]))
    .switchMap(([serverArgs, flagsData]) => {
      const flags = idx(flagsData, _ => _.flags);
      if (flags == null) {
        // We're going to reject here.
        // ClangServer will also dispose itself upon encountering this.
        throw new Error(`No flags found for ${src}`);
      }
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
    });
}

export type ClangServerFlags = {
  flags: Array<string>,
  usesDefaultFlags: boolean,
  flagsFile: ?string,
};

export default class ClangServer {
  static Status: {[key: string]: ClangServerStatus} = Object.freeze({
    FINDING_FLAGS: 'finding_flags',
    COMPILING: 'compiling',
    READY: 'ready',
    DISPOSED: 'disposed',
  });

  _usesDefaultFlags: boolean;
  _pendingCompileRequests: number;
  _serverStatus: BehaviorSubject<ClangServerStatus>;
  _flagsSubscription: Subscription;
  _flagsChanged: boolean;
  _rpcProcess: RpcProcess;

  constructor(
    src: string,
    contents: string,
    serverArgsPromise: Promise<ClangServerArgs>,
    flagsPromise: Promise<?ClangServerFlags>,
  ) {
    this._usesDefaultFlags = false;
    this._pendingCompileRequests = 0;
    this._serverStatus = new BehaviorSubject(ClangServer.Status.FINDING_FLAGS);
    this._flagsChanged = false;
    this._flagsSubscription =
      Observable.fromPromise(flagsPromise)
        .do(flagsData => {
          if (flagsData == null) {
            // Servers without flags will be left in the 'disposed' state forever.
            // This ensures that all language requests bounce without erroring.
            this.dispose();
            return;
          }
          this._usesDefaultFlags = flagsData.usesDefaultFlags;
        })
        .switchMap(flagsData => {
          if (flagsData != null && flagsData.flagsFile != null) {
            return watchFile(flagsData.flagsFile)
              .refCount()
              .take(1);
          }
          return Observable.empty();
        })
        .subscribe(
          x => { this._flagsChanged = true; },
          () => {},  // ignore errors
        );
    this._rpcProcess = new RpcProcess(
      `ClangServer-${src}`,
      getServiceRegistry(),
      spawnClangProcess(src, serverArgsPromise, flagsPromise),
    );
    // Kick off an initial compilation to provide an accurate server state.
    // This will automatically reject if any kind of disposals/errors happen.
    this.compile(contents).catch(() => {});
  }

  dispose() {
    this._serverStatus.next(ClangServer.Status.DISPOSED);
    this._serverStatus.complete();
    this._rpcProcess.dispose();
    this._flagsSubscription.unsubscribe();
  }

  getService(): Promise<ClangProcessService> {
    if (this.isDisposed()) {
      throw new Error('Called getService() on a disposed ClangServer');
    }
    return this._rpcProcess.getService('ClangProcessService');
  }

  /**
   * Returns RSS of the child process in bytes.
   * Works on Unix and Mac OS X.
   */
  async getMemoryUsage(): Promise<number> {
    const {_process} = this._rpcProcess;
    if (_process == null) {
      return 0;
    }
    const {exitCode, stdout} = await asyncExecute(
      'ps',
      ['-p', _process.pid.toString(), '-o', 'rss='],
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
    const service = await this.getService();
    if (this._pendingCompileRequests++ === 0) {
      this._serverStatus.next(ClangServer.Status.COMPILING);
    }
    try {
      return await service.compile(contents)
        .then(result => ({
          ...result,
          accurateFlags: !this._usesDefaultFlags,
        }));
    } finally {
      if (--this._pendingCompileRequests === 0 && !this.isDisposed()) {
        this._serverStatus.next(ClangServer.Status.READY);
      }
    }
  }

  getStatus(): ClangServerStatus {
    return this._serverStatus.getValue();
  }

  isDisposed(): boolean {
    return this.getStatus() === ClangServer.Status.DISPOSED;
  }

  isReady(): boolean {
    return this.getStatus() === ClangServer.Status.READY;
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
