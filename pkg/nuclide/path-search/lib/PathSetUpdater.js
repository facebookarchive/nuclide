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

    subscription.on('change',
        (files) => this._processWatchmanUpdate(subscription.pathFromSubscriptionRootToSubscriptionPath, pathSet, files));

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
   * Adds or removes paths from the pathSet based on the files in the update.
   * This method assumes the pathSet should be populated with file paths that
   * are *RELATIVE* to the localDirectory passed into PathSetUpdater::startUpdatingPathSet.
   * @param pathFromSubscriptionRootToDir The path from the watched
   *   root directory (what watchman actually watches) to the directory of interest
   *   (i.e. the localDirectory passed to PathSetUpdater::startUpdatingPathSet).
   *   For example, this string should be '' if those are the same.
   * @param pathSet The PathSet that should be updated by this watchman update.
   * @param files The `files` field of an fb-watchman update. Each file in the
   *   update is expected to contain fields for `name`, `new`, and `exists`.
   */
  _processWatchmanUpdate(pathFromSubscriptionRootToDir: ?string, pathSet: PathSet, files: any): void {
    var newPaths = [];
    var deletedPaths = [];

    files.forEach(file => {
      var fileName = file.name;
      // Watchman returns paths relative to the subscription root, which may be
      // different from (i.e. a parent directory of) the localDirectory passed into
      // PathSetUpdater::startUpdatingPathSet. But the PathSet expects paths
      // relative to the localDirectory. Thus we need to do this adjustment.
      var adjustedPath = pathFromSubscriptionRootToDir ? fileName.slice(pathFromSubscriptionRootToDir.length + 1) : fileName;
      if (file.new) {
        newPaths.push(adjustedPath);
      } else if (!file.exists) {
        deletedPaths.push(adjustedPath);
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
