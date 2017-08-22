'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

var _nuclideWatchmanHelpers;

function _load_nuclideWatchmanHelpers() {
  return _nuclideWatchmanHelpers = require('../../../nuclide-watchman-helpers');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: This probably won't work on Windows, but we'll worry about that
// when Watchman officially supports Windows.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const S_IFDIR = 16384;

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
  startUpdatingPathSet(pathSet, localDirectory) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const subscription = yield _this._addWatchmanSubscription(localDirectory);
      _this._pathSetToSubscription.set(pathSet, subscription);

      subscription.on('change', function (files) {
        return _this._processWatchmanUpdate(subscription.pathFromSubscriptionRootToSubscriptionPath, pathSet, files);
      });
      return new (_eventKit || _load_eventKit()).Disposable(function () {
        return _this._stopUpdatingPathSet(pathSet);
      });
    })();
  }

  _stopUpdatingPathSet(pathSet) {
    const subscription = this._pathSetToSubscription.get(pathSet);
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
    this._watchmanClient = new (_nuclideWatchmanHelpers || _load_nuclideWatchmanHelpers()).WatchmanClient();
  }

  _addWatchmanSubscription(localDirectory) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this2._watchmanClient) {
        _this2._setupWatcherService();
      }

      if (!_this2._watchmanClient) {
        throw new Error('Invariant violation: "this._watchmanClient"');
      }

      return _this2._watchmanClient.watchDirectoryRecursive(localDirectory);
    })();
  }

  _removeWatchmanSubscription(subscription) {
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
  _processWatchmanUpdate(pathFromSubscriptionRootToDir, pathSet, files) {
    const newPaths = [];
    const deletedPaths = [];

    files.forEach(file => {
      // Only keep track of files.
      // eslint-disable-next-line no-bitwise
      if ((file.mode & S_IFDIR) !== 0) {
        return;
      }
      if (!file.exists) {
        deletedPaths.push(file.name);
      } else if (file.new) {
        newPaths.push(file.name);
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
exports.default = PathSetUpdater;