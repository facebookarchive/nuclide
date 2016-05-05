'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';
import type WatchmanSubscription from '../../nuclide-watchman-helpers/lib/WatchmanSubscription';
import type {FileChange} from '../../nuclide-watchman-helpers/lib/WatchmanClient';

import invariant from 'assert';
import path from 'path';
import {Observable} from 'rxjs';
import {fsPromise} from '../../nuclide-commons';
import {getLogger} from '../../nuclide-logging';
import {WatchmanClient} from '../../nuclide-watchman-helpers';

export type WatchResult = {
  path: NuclideUri;
  type: string;
};

type WatchEvent = 'change' | 'delete';

// Cache an observable for each watched entity (file or directory).
// Multiple watches for the same entity can share the same observable.
const entityObservable: Map<string, Observable<WatchResult>> = new Map();

// In addition, expose the observer behind each observable so we can
// dispatch events from the root subscription.
const entityObserver: Map<string, rx$IObserver<WatchEvent>> = new Map();

let watchmanClient: ?WatchmanClient = null;
function getWatchmanClient(): WatchmanClient {
  if (watchmanClient == null) {
    watchmanClient = new WatchmanClient();
  }
  return watchmanClient;
}

export function watchFile(filePath: NuclideUri): Observable<WatchResult> {
  return watchEntity(filePath, true);
}

export function watchDirectory(directoryPath: NuclideUri): Observable<WatchResult> {
  return watchEntity(directoryPath, false);
}

function watchEntity(
  entityPath: string,
  isFile: boolean,
): Observable<WatchResult> {
  return Observable.fromPromise(
    getRealPath(entityPath, isFile)
  ).flatMap(realPath => {
    let observable = entityObservable.get(realPath);
    if (observable != null) {
      return observable;
    }
    observable = Observable.create(observer => {
      entityObserver.set(realPath, observer);
      return () => {
        entityObserver.delete(realPath);
        entityObservable.delete(realPath);
      };
    }).map(type => ({path: realPath, type}))
      .share();
    entityObservable.set(realPath, observable);
    return observable;
  });
}

async function getRealPath(entityPath: string, isFile: boolean): Promise<string> {
  let stat;
  try {
    stat = await fsPromise.stat(entityPath);
  } catch (e) {
    // Atom watcher behavior compatibility.
    throw new Error(`Can't watch a non-existing entity: ${entityPath}`);
  }
  if (stat.isFile() !== isFile) {
    getLogger().warn(
      `FileWatcherService: expected ${entityPath} to be a ${isFile ? 'file' : 'directory'}`
    );
  }
  return await fsPromise.realpath(entityPath);
}

export function watchDirectoryRecursive(
  directoryPath: NuclideUri,
): Observable<string> {
  const client = getWatchmanClient();
  if (client.hasSubscription(directoryPath)) {
    return Observable.of('EXISTING');
  }
  return Observable.fromPromise(
    client.watchDirectoryRecursive(directoryPath)
  ).flatMap(watcher => {
    // Listen for watcher changes to route them to watched files and directories.
    watcher.on('change', entries => {
      onWatcherChange(watcher, entries);
    });

    return Observable.create(observer => {
      // Notify success watcher setup.
      observer.next('SUCCESS');

      return () => unwatchDirectoryRecursive(directoryPath);
    });
  });
}

function onWatcherChange(subscription: WatchmanSubscription, entries: Array<FileChange>): void {
  const directoryChanges = new Set();
  entries.forEach(entry => {
    const entryPath = path.join(subscription.root, entry.name);
    const observer = entityObserver.get(entryPath);
    if (observer != null) {
      // TODO(most): handle `rename`, if needed.
      if (!entry.exists) {
        observer.next('delete');
        observer.complete();
      } else {
        observer.next('change');
      }
    }
    // A file watch event can also be considered a directory change
    // for the parent directory if a file was created or deleted.
    if (entry.new || !entry.exists) {
      const entryDirectoryPath = path.dirname(entryPath);
      if (entityObserver.has(entryDirectoryPath)) {
        directoryChanges.add(entryDirectoryPath);
      }
    }
  });

  directoryChanges.forEach(watchedDirectoryPath => {
    const observer = entityObserver.get(watchedDirectoryPath);
    invariant(observer != null);
    observer.next('change');
  });
}

async function unwatchDirectoryRecursive(directoryPath: string): Promise<void> {
  await getWatchmanClient().unwatch(directoryPath);
}
