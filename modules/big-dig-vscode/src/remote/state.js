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

import type {AnyTeardown} from 'nuclide-commons/UniversalDisposable';

import * as vscode from 'vscode';
import {Subject} from 'rxjs';
import {getLogger} from 'log4js';

import onEachObservedClosable from '../util/onEachObservedClosable';
import {ConnectionWrapper} from '../ConnectionWrapper';
import {RemoteFileSystem} from '../RemoteFileSystem';
import {ThriftRemoteFileSystem} from '../ThriftRemoteFileSystem';

import {connectionProfileUpdates} from '../configuration';
import {Server} from './Server';

const logger = getLogger('remote');
const hostnameToFilesystem: Map<string, RemoteFileSystem> = new Map();
const filesystemSubject: Subject<RemoteFileSystem> = new Subject();

/**
 * Listen for new filesystems, returning a disposable that will cause listening
 * to stop (and dispose of any active handlers, by default).
 *
 * @param handler called on each new filesystem. May return a disposable that
 * will be disposed if the filesystem is closed or (by default) if unsubscribed.
 * @param options
 *    - `ignoreCurrent`: do not call `handler` on preexisting filesystems.
 *      Default: false.
 *    - `stayAliveOnUnsubscribe`: do not dispose handlers when unsubscribed; do
 *      don only after its filesystem is disposed. Default: false.
 * @return a disposable that will stop listening for new filesystems. If
 * `stayAliveOnUnsubscribe: false`, then it will also dispose of all handlers.
 */
export function onEachFilesystem(
  handler: RemoteFileSystem => ?AnyTeardown | Promise<?AnyTeardown>,
  options: {
    ignoreCurrent?: boolean,
    stayAliveOnUnsubscribe?: boolean,
  } = {},
): IDisposable {
  const emitCurrent = !options.ignoreCurrent;
  const disposeHandlersOnUnsubscribe = !options.stayAliveOnUnsubscribe;

  return onEachObservedClosable(
    filesystemSubject.startWith(
      ...(emitCurrent ? hostnameToFilesystem.values() : []),
    ),
    handler,
    (fs, listener) => fs.onDisposed(listener),
    {
      disposeHandlersOnUnsubscribe,
      disposeHandlerOnNext: false,
    },
  );
}

/**
 * @return a list of all existing filesystems.
 */
export function getFilesystems(): Array<RemoteFileSystem> {
  return [...hostnameToFilesystem.values()];
}

/**
 * @return a list of all filesystems that have current connections.
 */
export function getConnectedFilesystems(): Array<{
  fs: RemoteFileSystem,
  conn: ConnectionWrapper,
}> {
  return getFilesystems()
    .map(fs => ({fs, conn: fs.getServer().getCurrentConnection()}))
    .map(({fs, conn}) => (conn == null ? null : {fs, conn}))
    .filter(Boolean);
}

/**
 * @return a list of existing servers.
 */
export function getServers(): Array<Server> {
  return getFilesystems().map(fs => fs.getServer());
}

/** @return the filesystem that handles the uri, else null. */
export function getFilesystemForUri(uri: vscode.Uri): ?RemoteFileSystem {
  return getFilesystems().find(fs => fs.handlesResource(uri));
}

/**
 * Start loading filesystems from configured profiles. Call this *just once*
 * when the extension is activated.
 * @returns a disposable that will dispose of all existing filesystems and stop
 * loading new filesystems.
 *
 * TODO(T27503907): listen for configuration changes and load/unload
 * filesystems.
 */
export function startFilesystems(): IDisposable {
  // Maintain a list of existing filesystems.
  // Note that we turn `emitCurrent` off because it relies on `filesystems`
  const maintainExistingFsList = onEachFilesystem(
    fs => {
      if (fs.isDisposed()) {
        return;
      } else {
        const hostname = fs.getHostname();
        hostnameToFilesystem.set(hostname, fs);
        return () => {
          fs.dispose();
          hostnameToFilesystem.delete(hostname);
        };
      }
    },
    {emitCurrent: false, disposeOnUnsubscribe: true},
  );

  const sub = connectionProfileUpdates({withCurrent: true}).subscribe(
    change => {
      if (change.kind === 'added') {
        const {profile} = change;
        try {
          const server = new Server(profile);
          const rfs = createRemoteFileSystem(profile.hostname, server);
          logger.info(`Loaded filesystem ${profile.hostname}`);
          filesystemSubject.next(rfs);
        } catch (error) {
          logger.error(error);
          vscode.window.showErrorMessage(
            `Could not load filesystem for ${profile.hostname}.`,
          );
        }
      } else if (change.kind === 'removed') {
        const {hostname} = change;
        const fs = hostnameToFilesystem.get(hostname);
        if (fs != null) {
          fs.dispose();
          logger.info(`Unloaded filesystem ${hostname}`);
        }
      } else {
        (change: empty);
      }
    },
  );

  return {
    dispose() {
      maintainExistingFsList.dispose();
      sub.unsubscribe();
    },
  };
}

function createRemoteFileSystem(
  hostname: string,
  server: Server,
): RemoteFileSystem {
  const useThriftFs = false;
  logger.info(`Using Thrift remote file system: ${useThriftFs.toString()}`);
  if (useThriftFs) {
    return new ThriftRemoteFileSystem(hostname, server);
  }
  return new RemoteFileSystem(hostname, server);
}
