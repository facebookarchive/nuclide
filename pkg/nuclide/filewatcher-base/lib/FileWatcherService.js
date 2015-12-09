'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../remote-uri';
import type WatchmanSubscription from '../../watchman-helpers/lib/WatchmanSubscription';
import type {FileChange} from '../../watchman-helpers/lib/WatchmanClient';
import type {watcher$WatchResult} from './types';

import invariant from 'assert';
import path from 'path';
import {Observable} from 'rx';
import {EventEmitter} from 'events';
import {fsPromise} from '../../commons';
import {WatchmanClient} from '../../watchman-helpers';

type watcher$WatchEntry = {
  eventEmitter: EventEmitter;
  subscriptionCount: number;
};

const watchedFiles: Map<string, watcher$WatchEntry> = new Map();
const watchedDirectories: Map<string, watcher$WatchEntry> = new Map();

const CHANGE_EVENT_NAME = 'change';
const DELETE_EVENT_NAME = 'delete';

let watchmanClient: ?WatchmanClient = null;
function getWatchmanClient(): WatchmanClient {
  if (watchmanClient == null) {
    watchmanClient = new WatchmanClient();
  }
  return watchmanClient;
}

export function watchFile(filePath: NuclideUri): Observable<watcher$WatchResult> {
  return watchEntity(watchedFiles, filePath, [CHANGE_EVENT_NAME, DELETE_EVENT_NAME]);
}

export function watchDirectory(directoryPath: NuclideUri): Observable<watcher$WatchResult> {
  return watchEntity(watchedDirectories, directoryPath, [CHANGE_EVENT_NAME]);
}

function watchEntity(
  watchedEntities: Map<string, watcher$WatchEntry>,
  entityPath: string,
  watchEvents: Array<string>,
): Observable<watcher$WatchResult> {
  return Observable.fromPromise(
    getRealPath(entityPath)
  ).flatMap(realPath => {
    let watchEntry = watchedEntities.get(realPath);
    if (watchEntry == null) {
      watchEntry = {
        eventEmitter: new EventEmitter(),
        subscriptionCount: 0,
      };
      watchedEntities.set(realPath, watchEntry);
    }
    watchEntry.subscriptionCount++;

    const {eventEmitter} = watchEntry;
    const watcherObservable = Observable.merge(watchEvents.map(watchEvent =>
      Observable.fromEvent(
        eventEmitter,
        watchEvent,
        () => {
          return {path: entityPath, type: watchEvent};
        },
      )
    ));

    watcherObservable.subscribeOnCompleted(() => {
      unwatchEntity(watchedEntities, realPath);
    });

    return watcherObservable;
  });
}

async function getRealPath(entityPath: string): Promise<string> {
  const exists = await fsPromise.exists(entityPath);
  if (!exists) {
    // Atom watcher behavior compatability.
    throw new Error(`Can't watch a non-existing entity: ${entityPath}`);
  }
  return await fsPromise.realpath(entityPath);
}

async function unwatchEntity(
  watchedEntities: Map<string, watcher$WatchEntry>,
  realPath: string,
): Promise<void> {
  const watchEntry = watchedEntities.get(realPath);
  if (watchEntry && --watchEntry.subscriptionCount === 0) {
    watchedEntities.delete(realPath);
  }
}

export function watchDirectoryRecursive(
  directoryPath: NuclideUri
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
      observer.onNext('SUCCESS');

      return () => unwatchDirectoryRecursive(directoryPath);
    });
  });
}

function onWatcherChange(subscription: WatchmanSubscription, entries: Array<FileChange>): void {
  const directoryChanges = new Map();
  for (const entry of entries) {
    const entryPath = path.join(subscription.root, entry.name);
    if (watchedFiles.has(entryPath)) {
      // $FlowFixMe(most)
      const {eventEmitter} = watchedFiles.get(entryPath);
      // TODO(most): handle `rename`, if needed.
      if (!entry.exists) {
        eventEmitter.emit(DELETE_EVENT_NAME);
      } else {
        eventEmitter.emit(CHANGE_EVENT_NAME);
      }
    }
    // A file watch event can also be considered a directry change
    // for the parent directory if a file was created or deleted.
    if (entry.new || !entry.exists) {
      const entryDirectoryPath = path.dirname(entryPath);
      if (watchedDirectories.has(entryDirectoryPath)) {
        if (!directoryChanges.has(entryDirectoryPath)) {
          directoryChanges.set(entryDirectoryPath, []);
        }
        // $FlowFixMe(most)
        directoryChanges.get(entryDirectoryPath).push(entry);
      }
    }
  }

  for (const [watchedDirectoryPath, changes] of directoryChanges) {
    const watchEntry = watchedDirectories.get(watchedDirectoryPath);
    invariant(watchEntry != null);
    const {eventEmitter} = watchEntry;
    eventEmitter.emit(CHANGE_EVENT_NAME, changes);
  }
}

async function unwatchDirectoryRecursive(directoryPath: string): Promise<void> {
  await getWatchmanClient().unwatch(directoryPath);
}
