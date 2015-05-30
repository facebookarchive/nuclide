'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {fsPromise} = require('nuclide-commons');
var path = require('path');
var {EventEmitter} = require('events');
var {WatchmanClient} = require('nuclide-watchman-helpers');

var watchmanClient: ?WatchmanClient = null;

type WatchEntry = {
  eventEmitter: EventEmitter;
  subscriptionCount: number;
};

var watchedFiles: {[filePath: string]: WatchEntry} = {};
var watchedDirectories: {[directoryPath: string]: WatchEntry} = {};

async function watchFile(filePath: string): Promise<number> {
  var exists = await fsPromise.exists(filePath);
  if (!exists) {
    // Atom watcher behavior compatability.
    throw new Error('Can\'t watch a non-existing file! : ' + filePath);
  }
  var realPath = await fsPromise.realpath(filePath);
  var watchEntry = watchedFiles[realPath];
  if (!watchEntry) {
    watchEntry = watchedFiles[realPath] = {
      eventEmitter: new EventEmitter(),
      subscriptionCount: 0,
      eventEmitterId: null,
    };
  }
  watchEntry.subscriptionCount++;
  // A watch entry would have only a permanent eventEmitterId for all the future watch requests.
  watchEntry.eventEmitterId = watchEntry.eventEmitterId || this.registerEventEmitter(watchEntry.eventEmitter);
  return watchEntry.eventEmitterId;
}

async function unwatchFile(filePath: string): Promise<void> {
  var exists = await fsPromise.exists(filePath);
  if (!exists) {
    return;
  }
  var realPath = await fsPromise.realpath(filePath);
  var watchEntry = watchedFiles[realPath];
  if (watchEntry) {
    if (--watchEntry.subscriptionCount === 0) {
      delete watchedFiles[realPath];
    }
  }
}

async function watchDirectory(directoryPath: string): Promise<number> {
  var exists = await fsPromise.exists(directoryPath);
  if (!exists) {
    return;
  }
  var realPath = await fsPromise.realpath(directoryPath);
  var watchEntry = watchedDirectories[realPath];
  if (!watchEntry) {
    watchEntry = watchedDirectories[realPath] = {
      eventEmitter: new EventEmitter(),
      subscriptionCount: 0,
      eventEmitterId: null,
    };
  }
  watchEntry.subscriptionCount++;
  // A watch entry would have only a permanent eventEmitterId for all the future watch requests.
  watchEntry.eventEmitterId = watchEntry.eventEmitterId || this.registerEventEmitter(watchEntry.eventEmitter);
  return watchEntry.eventEmitterId;
}

async function unwatchDirectory(directoryPath: string): Promise<void> {
  var exists = await fsPromise.exists(directoryPath);
  if (!exists) {
    return;
  }
  var realPath = await fsPromise.realpath(directoryPath);
  var watchEntry = watchedDirectories[realPath];
  if (watchEntry) {
    if (--watchEntry.subscriptionCount === 0) {
      delete watchedDirectories[realPath];
    }
  }
}

async function watchDirectoryRecursive(directoryPath: string, channel: string): Promise {
  watchmanClient = watchmanClient || new WatchmanClient();
  if (watchmanClient.hasSubscription(directoryPath)) {
    return;
  }
  var watcher = await watchmanClient.watchDirectoryRecursive(directoryPath);

  watcher.on('change', (entries: Array<FileChange>) => {
    this.publish(channel);

    var directoryChanges = {};

    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var entryPath = path.join(watcher.root, entry.name);
      if (watchedFiles[entryPath]) {
        var fileWatcherEntry = watchedFiles[entryPath];
        // TODO(most): handle `rename`, if needed.
        if (!entry.exists) {
          fileWatcherEntry.eventEmitter.emit('delete');
        } else {
          fileWatcherEntry.eventEmitter.emit('change');
        }
      }
      // A file watch event can also be considered a directry change
      // for the parent directory if a file was created or deleted.
      if (entry.new || !entry.exists) {
        var entryDirectoryPath = path.join(entryPath, '..');
        if (watchedDirectories[entryDirectoryPath]) {
          directoryChanges[entryDirectoryPath] = (directoryChanges[entryDirectoryPath] || []).concat([entry]);
        }
      }
    }

    for (var watchedDirectoryPath in directoryChanges) {
      var changes = directoryChanges[watchedDirectoryPath];
      var directoryWatcherEntry = watchedDirectories[watchedDirectoryPath];
      directoryWatcherEntry.eventEmitter.emit('change', changes);
    }
  });
}

async function unwatchDirectoryRecursive(directoryPath: string) {
  watchmanClient = watchmanClient || new WatchmanClient();
  await watchmanClient.unwatch(directoryPath);
}

module.exports = {
  services: {
    '/watcher/watchFile': {handler: watchFile, method: 'post'},
    '/watcher/unwatchFile': {handler: unwatchFile, method: 'post'},
    '/watcher/watchDirectory': {handler: watchDirectory, method: 'post'},
    '/watcher/unwatchDirectory': {handler: unwatchDirectory, method: 'post'},
    '/watcher/watchDirectoryRecursive': {handler: watchDirectoryRecursive, method: 'post'},
    '/watcher/unwatchDirectoryRecursive': {handler: unwatchDirectoryRecursive, method: 'post'},
  },
};
