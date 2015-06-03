'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var path = require('path');

/**
 * This class keeps the PathSets passed to it up to date by using file system
 * watchers to observe when relevant file additions and deletions occur.
 * This class currently relies on the Nuclide WatchmanClient, which requires fb-watchman.
 */
// TODO (t7298196) Investigate falling back to Node watchers.
class PathSetUpdater {
  constructor() {
    this._pathSetToSubscription = new Map();
  }

  dispose() {
    if (this._watchmanClient) {
      this._watchmanClient.dispose();
    }
  }


  // Section: Add/Remove PathSets

  /**
   * @param pathSet The PathSet to keep updated.
   * @param localDirectory The directory for which we are interested in file
   * changes. This is likely to the be the same as the directory the PathSet
   * was created from.
   * @return Disposable that can be disposed to stop updating the PathSet.
   */
  async startUpdatingPathSet(pathSet: PathSet, localDirectory: string): Promise<Disposable> {
    var subscription = await this._addWatchmanSubscription(localDirectory);
    this._pathSetToSubscription.set(pathSet, subscription);
    subscription.on('change', this._processWatchmanUpdate.bind(this, subscription.root, pathSet));
    var {Disposable} = require('event-kit');
    return new Disposable(() => this._stopUpdatingPathSet(pathSet));
  }

  _stopUpdatingPathSet(pathSet: PathSet) {
    var subscription = this._pathSetToSubscription.get(pathSet);
    if (subscription) {
      this._pathSetToSubscription.delete(pathSet);
      this._removeWatchmanSubscription(subscription);
    }
  }


  // Section: Watchman Subscriptions

  _setupWatcherService() {
    if (this._watchmanClient) {
      return;
    }
    var {WatchmanClient} = require('nuclide-watchman-helpers');
    this._watchmanClient = new WatchmanClient();
  }

  async _addWatchmanSubscription(localDirectory: string): Promise<WatchmanSubscription> {
    if (!this._watchmanClient) {
      this._setupWatcherService();
    }

    var subscription = await this._watchmanClient.watchDirectoryRecursive(localDirectory);
    return subscription;
  }

  _removeWatchmanSubscription(subscription: WatchmanSubscription) {
    if (!this._watchmanClient) {
      return;
    }
    this._watchmanClient.unwatch(subscription.path);
  }


  // Section: PathSet Updating

  /**
   * @param watchmanSubscriptionRoot The absolute path of the directory that is watched.
   * @param pathSet The PathSet that should be updated by this watchman update.
   * @param files The `files` field of an fb-watchman update. Each file in the
   *   update is expected to contain fields for `name`, `new`, and `exists`.
   */
  _processWatchmanUpdate(watchmanSubscriptionRoot: string, pathSet: PathSet, files: mixed): void {
    var newPaths = [];
    var deletedPaths = [];

    files.forEach(file => {
      var absolutePath = path.join(watchmanSubscriptionRoot, file.name);
      if (file.new) {
        newPaths.push(absolutePath);
      } else if (!file.exists) {
        deletedPaths.push(absolutePath);
      }
    });

    if (newPaths.length) {
      pathSet.addPaths(newPaths);
    }
    if (deletedPaths.length) {
      pathSet.removePaths(deletedPaths);
    }
  }

}

module.exports = PathSetUpdater;
