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

import type {ProcessMessage} from 'nuclide-commons/process';
import type {ConnectableObservable} from 'rxjs';
import type {Socket} from './ExperimentalMessageRouter';
import type {PackageParams} from './ExperimentalPackage';
import type {InitializeMessage} from './run-package';

import {fork, getOutputStream} from 'nuclide-commons/process';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {ReplaySubject} from 'rxjs';
import ExperimentalMessageRouter from './ExperimentalMessageRouter';
import {activateExperimentalPackage} from './ExperimentalPackage';

export interface ExperimentalPackageRunner {
  activate(): void;
  dispose(): void;

  onDidError(callback: (error: Error) => mixed): IDisposable;
}

function getExposedSockets(
  packages: Array<PackageParams>,
  messageRouter: ExperimentalMessageRouter,
): Array<Socket> {
  // Exposed sockets are those that are either:
  // 1) provided here but not consumed
  // 2) consumed here but not provided.
  const allSockets = new Set();
  packages.forEach(pkg => {
    Object.keys(pkg.consumedServices).forEach(key => {
      const {socket} = pkg.consumedServices[key];
      allSockets.add(socket);
    });
    Object.keys(pkg.providedServices).forEach(key => {
      pkg.providedServices[key].rawConnections.forEach(({socket}) => {
        allSockets.add(socket);
      });
    });
  });
  return Array.from(allSockets).filter(
    socket => !allSockets.has(messageRouter.reverseSocket(socket)),
  );
}

export class ProcessPackageRunner implements ExperimentalPackageRunner {
  _processStream: ConnectableObservable<child_process$ChildProcess>;
  _outputStream: ConnectableObservable<ProcessMessage>;
  _disposed = new ReplaySubject(1);

  constructor(
    packages: Array<PackageParams>,
    messageRouter: ExperimentalMessageRouter,
  ): void {
    this._processStream = fork(require.resolve('./run-package-entry.js'), [], {
      silent: true,
    })
      .takeUntil(this._disposed)
      .do(proc => {
        proc.on('message', msg => {
          messageRouter.send(msg);
        });
        const exposedSockets = getExposedSockets(packages, messageRouter);
        proc.send(({packages, exposedSockets}: InitializeMessage));
        exposedSockets.forEach(socket => {
          // Intercept incoming messages for each exposed socket.
          messageRouter
            .getMessages(messageRouter.reverseSocket(socket))
            .takeUntil(this._disposed)
            .subscribe(msg => proc.send(msg));
        });
      })
      // TODO: Error on early completion.
      .share()
      .publishReplay(1);

    // Note: this won't start emitting anything activate() gets called.
    this._outputStream = this._processStream
      .switchMap(proc => getOutputStream(proc))
      .publish();
  }

  activate(): void {
    this._processStream.connect();
  }

  onDidError(callback: (error: Error) => mixed): IDisposable {
    return new UniversalDisposable(
      this._outputStream.refCount().subscribe({
        error: err => {
          callback(err);
        },
      }),
    );
  }

  dispose(): void {
    this._disposed.next();
  }
}

// Atom packages have to run in the same process.
export class AtomPackageRunner implements ExperimentalPackageRunner {
  _packages: Array<PackageParams>;
  _messageRouter: ExperimentalMessageRouter;
  _disposables: UniversalDisposable;

  constructor(
    packages: Array<PackageParams>,
    messageRouter: ExperimentalMessageRouter,
  ): void {
    this._packages = packages;
    this._messageRouter = messageRouter;
    this._disposables = new UniversalDisposable();
  }

  activate(): void {
    this._disposables.add(
      ...this._packages.map(params => {
        const pkg = activateExperimentalPackage(params, this._messageRouter);
        return () => {
          if (pkg.dispose != null) {
            pkg.dispose();
          }
        };
      }),
    );
  }

  dispose() {
    this._disposables.dispose();
  }

  onDidError(callback: (error: Error) => mixed): IDisposable {
    return new UniversalDisposable();
  }
}
