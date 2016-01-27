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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _eventKit = require('event-kit');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _watchmanHelpers = require('../../watchman-helpers');

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
      return new _eventKit.Disposable(function () {
        return _this._stopUpdatingPathSet(pathSet);
      });
    })
  }, {
    key: '_stopUpdatingPathSet',
    value: function _stopUpdatingPathSet(pathSet) {
      var subscription = this._pathSetToSubscription.get(pathSet);
      if (subscription) {
        this._pathSetToSubscription['delete'](pathSet);
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
      this._watchmanClient = new _watchmanHelpers.WatchmanClient();
    }
  }, {
    key: '_addWatchmanSubscription',
    value: _asyncToGenerator(function* (localDirectory) {
      if (!this._watchmanClient) {
        this._setupWatcherService();
      }
      (0, _assert2['default'])(this._watchmanClient);
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
        var fileName = file.name;
        // Watchman returns paths relative to the subscription root, which may be
        // different from (i.e. a parent directory of) the localDirectory passed into
        // PathSetUpdater::startUpdatingPathSet. But the PathSet expects paths
        // relative to the localDirectory. Thus we need to do this adjustment.
        var adjustedPath = pathFromSubscriptionRootToDir ? fileName.slice(pathFromSubscriptionRootToDir.length + 1) : fileName;
        if (file['new']) {
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
  }]);

  return PathSetUpdater;
})();

exports['default'] = PathSetUpdater;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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LE1BQU0sRUFBRTtBQUN2QixzQkFBWSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNqQztPQUNGLENBQUMsQ0FBQzs7QUFFSCxVQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7QUFDbkIsZUFBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUM1QjtBQUNELFVBQUksWUFBWSxDQUFDLE1BQU0sRUFBRTtBQUN2QixlQUFPLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO09BQ25DO0tBQ0Y7OztTQWxIa0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiUGF0aFNldFVwZGF0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBQYXRoU2V0IGZyb20gJy4vUGF0aFNldCc7XG5pbXBvcnQgdHlwZSB7V2F0Y2htYW5TdWJzY3JpcHRpb259IGZyb20gJy4uLy4uL3dhdGNobWFuLWhlbHBlcnMnO1xuXG5pbXBvcnQge0Rpc3Bvc2FibGV9IGZyb20gJ2V2ZW50LWtpdCc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7V2F0Y2htYW5DbGllbnR9IGZyb20gJy4uLy4uL3dhdGNobWFuLWhlbHBlcnMnO1xuXG4vKipcbiAqIFRoaXMgY2xhc3Mga2VlcHMgdGhlIFBhdGhTZXRzIHBhc3NlZCB0byBpdCB1cCB0byBkYXRlIGJ5IHVzaW5nIGZpbGUgc3lzdGVtXG4gKiB3YXRjaGVycyB0byBvYnNlcnZlIHdoZW4gcmVsZXZhbnQgZmlsZSBhZGRpdGlvbnMgYW5kIGRlbGV0aW9ucyBvY2N1ci5cbiAqIFRoaXMgY2xhc3MgY3VycmVudGx5IHJlbGllcyBvbiB0aGUgTnVjbGlkZSBXYXRjaG1hbkNsaWVudCwgd2hpY2ggcmVxdWlyZXMgZmItd2F0Y2htYW4uXG4gKi9cbi8vIFRPRE8gKHQ3Mjk4MTk2KSBJbnZlc3RpZ2F0ZSBmYWxsaW5nIGJhY2sgdG8gTm9kZSB3YXRjaGVycy5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhdGhTZXRVcGRhdGVyIHtcbiAgX3BhdGhTZXRUb1N1YnNjcmlwdGlvbjogTWFwPFBhdGhTZXQsIFdhdGNobWFuU3Vic2NyaXB0aW9uPjtcbiAgX3dhdGNobWFuQ2xpZW50OiA/V2F0Y2htYW5DbGllbnQ7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fcGF0aFNldFRvU3Vic2NyaXB0aW9uID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5fd2F0Y2htYW5DbGllbnQpIHtcbiAgICAgIHRoaXMuX3dhdGNobWFuQ2xpZW50LmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICAvLyBTZWN0aW9uOiBBZGQvUmVtb3ZlIFBhdGhTZXRzXG5cbiAgLyoqXG4gICAqIEBwYXJhbSBwYXRoU2V0IFRoZSBQYXRoU2V0IHRvIGtlZXAgdXBkYXRlZC5cbiAgICogQHBhcmFtIGxvY2FsRGlyZWN0b3J5IFRoZSBkaXJlY3RvcnkgZm9yIHdoaWNoIHdlIGFyZSBpbnRlcmVzdGVkIGluIGZpbGVcbiAgICogY2hhbmdlcy4gVGhpcyBpcyBsaWtlbHkgdG8gdGhlIGJlIHRoZSBzYW1lIGFzIHRoZSBkaXJlY3RvcnkgdGhlIFBhdGhTZXRcbiAgICogd2FzIGNyZWF0ZWQgZnJvbS5cbiAgICogQHJldHVybiBEaXNwb3NhYmxlIHRoYXQgY2FuIGJlIGRpc3Bvc2VkIHRvIHN0b3AgdXBkYXRpbmcgdGhlIFBhdGhTZXQuXG4gICAqL1xuICBhc3luYyBzdGFydFVwZGF0aW5nUGF0aFNldChcbiAgICBwYXRoU2V0OiBQYXRoU2V0LFxuICAgIGxvY2FsRGlyZWN0b3J5OiBzdHJpbmdcbiAgKTogUHJvbWlzZTxEaXNwb3NhYmxlPiB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gYXdhaXQgdGhpcy5fYWRkV2F0Y2htYW5TdWJzY3JpcHRpb24obG9jYWxEaXJlY3RvcnkpO1xuICAgIHRoaXMuX3BhdGhTZXRUb1N1YnNjcmlwdGlvbi5zZXQocGF0aFNldCwgc3Vic2NyaXB0aW9uKTtcblxuICAgIHN1YnNjcmlwdGlvbi5vbignY2hhbmdlJywgKGZpbGVzKSA9PiB0aGlzLl9wcm9jZXNzV2F0Y2htYW5VcGRhdGUoXG4gICAgICBzdWJzY3JpcHRpb24ucGF0aEZyb21TdWJzY3JpcHRpb25Sb290VG9TdWJzY3JpcHRpb25QYXRoLCBwYXRoU2V0LCBmaWxlc1xuICAgICkpO1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB0aGlzLl9zdG9wVXBkYXRpbmdQYXRoU2V0KHBhdGhTZXQpKTtcbiAgfVxuXG4gIF9zdG9wVXBkYXRpbmdQYXRoU2V0KHBhdGhTZXQ6IFBhdGhTZXQpIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9wYXRoU2V0VG9TdWJzY3JpcHRpb24uZ2V0KHBhdGhTZXQpO1xuICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX3BhdGhTZXRUb1N1YnNjcmlwdGlvbi5kZWxldGUocGF0aFNldCk7XG4gICAgICB0aGlzLl9yZW1vdmVXYXRjaG1hblN1YnNjcmlwdGlvbihzdWJzY3JpcHRpb24pO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gU2VjdGlvbjogV2F0Y2htYW4gU3Vic2NyaXB0aW9uc1xuXG4gIF9zZXR1cFdhdGNoZXJTZXJ2aWNlKCkge1xuICAgIGlmICh0aGlzLl93YXRjaG1hbkNsaWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl93YXRjaG1hbkNsaWVudCA9IG5ldyBXYXRjaG1hbkNsaWVudCgpO1xuICB9XG5cbiAgYXN5bmMgX2FkZFdhdGNobWFuU3Vic2NyaXB0aW9uKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPFdhdGNobWFuU3Vic2NyaXB0aW9uPiB7XG4gICAgaWYgKCF0aGlzLl93YXRjaG1hbkNsaWVudCkge1xuICAgICAgdGhpcy5fc2V0dXBXYXRjaGVyU2VydmljZSgpO1xuICAgIH1cbiAgICBpbnZhcmlhbnQodGhpcy5fd2F0Y2htYW5DbGllbnQpO1xuICAgIHJldHVybiBhd2FpdCB0aGlzLl93YXRjaG1hbkNsaWVudC53YXRjaERpcmVjdG9yeVJlY3Vyc2l2ZShsb2NhbERpcmVjdG9yeSk7XG4gIH1cblxuICBfcmVtb3ZlV2F0Y2htYW5TdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uOiBXYXRjaG1hblN1YnNjcmlwdGlvbik6IHZvaWQge1xuICAgIGlmICghdGhpcy5fd2F0Y2htYW5DbGllbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fd2F0Y2htYW5DbGllbnQudW53YXRjaChzdWJzY3JpcHRpb24ucGF0aCk7XG4gIH1cblxuXG4gIC8vIFNlY3Rpb246IFBhdGhTZXQgVXBkYXRpbmdcblxuICAvKipcbiAgICogQWRkcyBvciByZW1vdmVzIHBhdGhzIGZyb20gdGhlIHBhdGhTZXQgYmFzZWQgb24gdGhlIGZpbGVzIGluIHRoZSB1cGRhdGUuXG4gICAqIFRoaXMgbWV0aG9kIGFzc3VtZXMgdGhlIHBhdGhTZXQgc2hvdWxkIGJlIHBvcHVsYXRlZCB3aXRoIGZpbGUgcGF0aHMgdGhhdFxuICAgKiBhcmUgKlJFTEFUSVZFKiB0byB0aGUgbG9jYWxEaXJlY3RvcnkgcGFzc2VkIGludG8gUGF0aFNldFVwZGF0ZXI6OnN0YXJ0VXBkYXRpbmdQYXRoU2V0LlxuICAgKiBAcGFyYW0gcGF0aEZyb21TdWJzY3JpcHRpb25Sb290VG9EaXIgVGhlIHBhdGggZnJvbSB0aGUgd2F0Y2hlZFxuICAgKiAgIHJvb3QgZGlyZWN0b3J5ICh3aGF0IHdhdGNobWFuIGFjdHVhbGx5IHdhdGNoZXMpIHRvIHRoZSBkaXJlY3Rvcnkgb2YgaW50ZXJlc3RcbiAgICogICAoaS5lLiB0aGUgbG9jYWxEaXJlY3RvcnkgcGFzc2VkIHRvIFBhdGhTZXRVcGRhdGVyOjpzdGFydFVwZGF0aW5nUGF0aFNldCkuXG4gICAqICAgRm9yIGV4YW1wbGUsIHRoaXMgc3RyaW5nIHNob3VsZCBiZSAnJyBpZiB0aG9zZSBhcmUgdGhlIHNhbWUuXG4gICAqIEBwYXJhbSBwYXRoU2V0IFRoZSBQYXRoU2V0IHRoYXQgc2hvdWxkIGJlIHVwZGF0ZWQgYnkgdGhpcyB3YXRjaG1hbiB1cGRhdGUuXG4gICAqIEBwYXJhbSBmaWxlcyBUaGUgYGZpbGVzYCBmaWVsZCBvZiBhbiBmYi13YXRjaG1hbiB1cGRhdGUuIEVhY2ggZmlsZSBpbiB0aGVcbiAgICogICB1cGRhdGUgaXMgZXhwZWN0ZWQgdG8gY29udGFpbiBmaWVsZHMgZm9yIGBuYW1lYCwgYG5ld2AsIGFuZCBgZXhpc3RzYC5cbiAgICovXG4gIF9wcm9jZXNzV2F0Y2htYW5VcGRhdGUoXG4gICAgcGF0aEZyb21TdWJzY3JpcHRpb25Sb290VG9EaXI6ID9zdHJpbmcsXG4gICAgcGF0aFNldDogUGF0aFNldCxcbiAgICBmaWxlczogYW55LFxuICApOiB2b2lkIHtcbiAgICBjb25zdCBuZXdQYXRocyA9IFtdO1xuICAgIGNvbnN0IGRlbGV0ZWRQYXRocyA9IFtdO1xuXG4gICAgZmlsZXMuZm9yRWFjaChmaWxlID0+IHtcbiAgICAgIGNvbnN0IGZpbGVOYW1lID0gZmlsZS5uYW1lO1xuICAgICAgLy8gV2F0Y2htYW4gcmV0dXJucyBwYXRocyByZWxhdGl2ZSB0byB0aGUgc3Vic2NyaXB0aW9uIHJvb3QsIHdoaWNoIG1heSBiZVxuICAgICAgLy8gZGlmZmVyZW50IGZyb20gKGkuZS4gYSBwYXJlbnQgZGlyZWN0b3J5IG9mKSB0aGUgbG9jYWxEaXJlY3RvcnkgcGFzc2VkIGludG9cbiAgICAgIC8vIFBhdGhTZXRVcGRhdGVyOjpzdGFydFVwZGF0aW5nUGF0aFNldC4gQnV0IHRoZSBQYXRoU2V0IGV4cGVjdHMgcGF0aHNcbiAgICAgIC8vIHJlbGF0aXZlIHRvIHRoZSBsb2NhbERpcmVjdG9yeS4gVGh1cyB3ZSBuZWVkIHRvIGRvIHRoaXMgYWRqdXN0bWVudC5cbiAgICAgIGNvbnN0IGFkanVzdGVkUGF0aCA9IHBhdGhGcm9tU3Vic2NyaXB0aW9uUm9vdFRvRGlyID9cbiAgICAgICAgZmlsZU5hbWUuc2xpY2UocGF0aEZyb21TdWJzY3JpcHRpb25Sb290VG9EaXIubGVuZ3RoICsgMSkgOlxuICAgICAgICBmaWxlTmFtZTtcbiAgICAgIGlmIChmaWxlLm5ldykge1xuICAgICAgICBuZXdQYXRocy5wdXNoKGFkanVzdGVkUGF0aCk7XG4gICAgICB9IGVsc2UgaWYgKCFmaWxlLmV4aXN0cykge1xuICAgICAgICBkZWxldGVkUGF0aHMucHVzaChhZGp1c3RlZFBhdGgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKG5ld1BhdGhzLmxlbmd0aCkge1xuICAgICAgcGF0aFNldC5hZGRQYXRocyhuZXdQYXRocyk7XG4gICAgfVxuICAgIGlmIChkZWxldGVkUGF0aHMubGVuZ3RoKSB7XG4gICAgICBwYXRoU2V0LnJlbW92ZVBhdGhzKGRlbGV0ZWRQYXRocyk7XG4gICAgfVxuICB9XG5cbn1cbiJdfQ==