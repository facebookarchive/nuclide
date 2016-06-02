Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _eventKit2;

function _eventKit() {
  return _eventKit2 = require('event-kit');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideWatchmanHelpers2;

function _nuclideWatchmanHelpers() {
  return _nuclideWatchmanHelpers2 = require('../../nuclide-watchman-helpers');
}

// TODO: This probably won't work on Windows, but we'll worry about that
// when Watchman officially supports Windows.
var S_IFDIR = 16384;

/**
 * This class keeps the PathSets passed to it up to date by using file system
 * watchers to observe when relevant file additions and deletions occur.
 * This class currently relies on the Nuclide WatchmanClient, which requires fb-watchman.
 */
// TODO (t7298196) Investigate falling back to Node watchers.

var PathSetUpdater = (function () {
  function PathSetUpdater() {
    _classCallCheck(this, PathSetUpdater);

    this._pathSetToSubscription = new Map();
  }

  _createClass(PathSetUpdater, [{
    key: 'dispose',
    value: function dispose() {
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
  }, {
    key: 'startUpdatingPathSet',
    value: _asyncToGenerator(function* (pathSet, localDirectory) {
      var _this = this;

      var subscription = yield this._addWatchmanSubscription(localDirectory);
      this._pathSetToSubscription.set(pathSet, subscription);

      subscription.on('change', function (files) {
        return _this._processWatchmanUpdate(subscription.pathFromSubscriptionRootToSubscriptionPath, pathSet, files);
      });
      return new (_eventKit2 || _eventKit()).Disposable(function () {
        return _this._stopUpdatingPathSet(pathSet);
      });
    })
  }, {
    key: '_stopUpdatingPathSet',
    value: function _stopUpdatingPathSet(pathSet) {
      var subscription = this._pathSetToSubscription.get(pathSet);
      if (subscription) {
        this._pathSetToSubscription.delete(pathSet);
        this._removeWatchmanSubscription(subscription);
      }
    }

    // Section: Watchman Subscriptions

  }, {
    key: '_setupWatcherService',
    value: function _setupWatcherService() {
      if (this._watchmanClient) {
        return;
      }
      this._watchmanClient = new (_nuclideWatchmanHelpers2 || _nuclideWatchmanHelpers()).WatchmanClient();
    }
  }, {
    key: '_addWatchmanSubscription',
    value: _asyncToGenerator(function* (localDirectory) {
      if (!this._watchmanClient) {
        this._setupWatcherService();
      }
      (0, (_assert2 || _assert()).default)(this._watchmanClient);
      return yield this._watchmanClient.watchDirectoryRecursive(localDirectory);
    })
  }, {
    key: '_removeWatchmanSubscription',
    value: function _removeWatchmanSubscription(subscription) {
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
  }, {
    key: '_processWatchmanUpdate',
    value: function _processWatchmanUpdate(pathFromSubscriptionRootToDir, pathSet, files) {
      var newPaths = [];
      var deletedPaths = [];

      files.forEach(function (file) {
        // Only keep track of files.
        // eslint-disable-next-line no-bitwise
        if ((file.mode & S_IFDIR) !== 0) {
          return;
        }
        var fileName = file.name;
        // Watchman returns paths relative to the subscription root, which may be
        // different from (i.e. a parent directory of) the localDirectory passed into
        // PathSetUpdater::startUpdatingPathSet. But the PathSet expects paths
        // relative to the localDirectory. Thus we need to do this adjustment.
        var adjustedPath = pathFromSubscriptionRootToDir ? fileName.slice(pathFromSubscriptionRootToDir.length + 1) : fileName;
        if (!file.exists) {
          deletedPaths.push(adjustedPath);
        } else if (file.new) {
          newPaths.push(adjustedPath);
        }
      });

      if (newPaths.length) {
        pathSet.addPaths(newPaths);
      }
      if (deletedPaths.length) {
        pathSet.removePaths(deletedPaths);
      }
    }
  }]);

  return PathSetUpdater;
})();

exports.default = PathSetUpdater;
module.exports = exports.default;