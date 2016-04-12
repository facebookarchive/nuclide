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

var _nuclideWatchmanHelpers = require('../../nuclide-watchman-helpers');

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
      this._watchmanClient = new _nuclideWatchmanHelpers.WatchmanClient();
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
//# sourceMappingURL=data:application/json;base64,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LE1BQU0sRUFBRTtBQUN2QixzQkFBWSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNqQztPQUNGLENBQUMsQ0FBQzs7QUFFSCxVQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7QUFDbkIsZUFBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUM1QjtBQUNELFVBQUksWUFBWSxDQUFDLE1BQU0sRUFBRTtBQUN2QixlQUFPLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO09BQ25DO0tBQ0Y7OztTQWxIa0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiUGF0aFNldFVwZGF0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7UGF0aFNldH0gZnJvbSAnLi9QYXRoU2V0JztcbmltcG9ydCB0eXBlIHtXYXRjaG1hblN1YnNjcmlwdGlvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS13YXRjaG1hbi1oZWxwZXJzJztcblxuaW1wb3J0IHtEaXNwb3NhYmxlfSBmcm9tICdldmVudC1raXQnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge1dhdGNobWFuQ2xpZW50fSBmcm9tICcuLi8uLi9udWNsaWRlLXdhdGNobWFuLWhlbHBlcnMnO1xuXG4vKipcbiAqIFRoaXMgY2xhc3Mga2VlcHMgdGhlIFBhdGhTZXRzIHBhc3NlZCB0byBpdCB1cCB0byBkYXRlIGJ5IHVzaW5nIGZpbGUgc3lzdGVtXG4gKiB3YXRjaGVycyB0byBvYnNlcnZlIHdoZW4gcmVsZXZhbnQgZmlsZSBhZGRpdGlvbnMgYW5kIGRlbGV0aW9ucyBvY2N1ci5cbiAqIFRoaXMgY2xhc3MgY3VycmVudGx5IHJlbGllcyBvbiB0aGUgTnVjbGlkZSBXYXRjaG1hbkNsaWVudCwgd2hpY2ggcmVxdWlyZXMgZmItd2F0Y2htYW4uXG4gKi9cbi8vIFRPRE8gKHQ3Mjk4MTk2KSBJbnZlc3RpZ2F0ZSBmYWxsaW5nIGJhY2sgdG8gTm9kZSB3YXRjaGVycy5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhdGhTZXRVcGRhdGVyIHtcbiAgX3BhdGhTZXRUb1N1YnNjcmlwdGlvbjogTWFwPFBhdGhTZXQsIFdhdGNobWFuU3Vic2NyaXB0aW9uPjtcbiAgX3dhdGNobWFuQ2xpZW50OiA/V2F0Y2htYW5DbGllbnQ7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fcGF0aFNldFRvU3Vic2NyaXB0aW9uID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5fd2F0Y2htYW5DbGllbnQpIHtcbiAgICAgIHRoaXMuX3dhdGNobWFuQ2xpZW50LmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICAvLyBTZWN0aW9uOiBBZGQvUmVtb3ZlIFBhdGhTZXRzXG5cbiAgLyoqXG4gICAqIEBwYXJhbSBwYXRoU2V0IFRoZSBQYXRoU2V0IHRvIGtlZXAgdXBkYXRlZC5cbiAgICogQHBhcmFtIGxvY2FsRGlyZWN0b3J5IFRoZSBkaXJlY3RvcnkgZm9yIHdoaWNoIHdlIGFyZSBpbnRlcmVzdGVkIGluIGZpbGVcbiAgICogY2hhbmdlcy4gVGhpcyBpcyBsaWtlbHkgdG8gdGhlIGJlIHRoZSBzYW1lIGFzIHRoZSBkaXJlY3RvcnkgdGhlIFBhdGhTZXRcbiAgICogd2FzIGNyZWF0ZWQgZnJvbS5cbiAgICogQHJldHVybiBEaXNwb3NhYmxlIHRoYXQgY2FuIGJlIGRpc3Bvc2VkIHRvIHN0b3AgdXBkYXRpbmcgdGhlIFBhdGhTZXQuXG4gICAqL1xuICBhc3luYyBzdGFydFVwZGF0aW5nUGF0aFNldChcbiAgICBwYXRoU2V0OiBQYXRoU2V0LFxuICAgIGxvY2FsRGlyZWN0b3J5OiBzdHJpbmdcbiAgKTogUHJvbWlzZTxEaXNwb3NhYmxlPiB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gYXdhaXQgdGhpcy5fYWRkV2F0Y2htYW5TdWJzY3JpcHRpb24obG9jYWxEaXJlY3RvcnkpO1xuICAgIHRoaXMuX3BhdGhTZXRUb1N1YnNjcmlwdGlvbi5zZXQocGF0aFNldCwgc3Vic2NyaXB0aW9uKTtcblxuICAgIHN1YnNjcmlwdGlvbi5vbignY2hhbmdlJywgZmlsZXMgPT4gdGhpcy5fcHJvY2Vzc1dhdGNobWFuVXBkYXRlKFxuICAgICAgc3Vic2NyaXB0aW9uLnBhdGhGcm9tU3Vic2NyaXB0aW9uUm9vdFRvU3Vic2NyaXB0aW9uUGF0aCwgcGF0aFNldCwgZmlsZXNcbiAgICApKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4gdGhpcy5fc3RvcFVwZGF0aW5nUGF0aFNldChwYXRoU2V0KSk7XG4gIH1cblxuICBfc3RvcFVwZGF0aW5nUGF0aFNldChwYXRoU2V0OiBQYXRoU2V0KSB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5fcGF0aFNldFRvU3Vic2NyaXB0aW9uLmdldChwYXRoU2V0KTtcbiAgICBpZiAoc3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl9wYXRoU2V0VG9TdWJzY3JpcHRpb24uZGVsZXRlKHBhdGhTZXQpO1xuICAgICAgdGhpcy5fcmVtb3ZlV2F0Y2htYW5TdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uKTtcbiAgICB9XG4gIH1cblxuXG4gIC8vIFNlY3Rpb246IFdhdGNobWFuIFN1YnNjcmlwdGlvbnNcblxuICBfc2V0dXBXYXRjaGVyU2VydmljZSgpIHtcbiAgICBpZiAodGhpcy5fd2F0Y2htYW5DbGllbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fd2F0Y2htYW5DbGllbnQgPSBuZXcgV2F0Y2htYW5DbGllbnQoKTtcbiAgfVxuXG4gIGFzeW5jIF9hZGRXYXRjaG1hblN1YnNjcmlwdGlvbihsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxXYXRjaG1hblN1YnNjcmlwdGlvbj4ge1xuICAgIGlmICghdGhpcy5fd2F0Y2htYW5DbGllbnQpIHtcbiAgICAgIHRoaXMuX3NldHVwV2F0Y2hlclNlcnZpY2UoKTtcbiAgICB9XG4gICAgaW52YXJpYW50KHRoaXMuX3dhdGNobWFuQ2xpZW50KTtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5fd2F0Y2htYW5DbGllbnQud2F0Y2hEaXJlY3RvcnlSZWN1cnNpdmUobG9jYWxEaXJlY3RvcnkpO1xuICB9XG5cbiAgX3JlbW92ZVdhdGNobWFuU3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbjogV2F0Y2htYW5TdWJzY3JpcHRpb24pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX3dhdGNobWFuQ2xpZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3dhdGNobWFuQ2xpZW50LnVud2F0Y2goc3Vic2NyaXB0aW9uLnBhdGgpO1xuICB9XG5cblxuICAvLyBTZWN0aW9uOiBQYXRoU2V0IFVwZGF0aW5nXG5cbiAgLyoqXG4gICAqIEFkZHMgb3IgcmVtb3ZlcyBwYXRocyBmcm9tIHRoZSBwYXRoU2V0IGJhc2VkIG9uIHRoZSBmaWxlcyBpbiB0aGUgdXBkYXRlLlxuICAgKiBUaGlzIG1ldGhvZCBhc3N1bWVzIHRoZSBwYXRoU2V0IHNob3VsZCBiZSBwb3B1bGF0ZWQgd2l0aCBmaWxlIHBhdGhzIHRoYXRcbiAgICogYXJlICpSRUxBVElWRSogdG8gdGhlIGxvY2FsRGlyZWN0b3J5IHBhc3NlZCBpbnRvIFBhdGhTZXRVcGRhdGVyOjpzdGFydFVwZGF0aW5nUGF0aFNldC5cbiAgICogQHBhcmFtIHBhdGhGcm9tU3Vic2NyaXB0aW9uUm9vdFRvRGlyIFRoZSBwYXRoIGZyb20gdGhlIHdhdGNoZWRcbiAgICogICByb290IGRpcmVjdG9yeSAod2hhdCB3YXRjaG1hbiBhY3R1YWxseSB3YXRjaGVzKSB0byB0aGUgZGlyZWN0b3J5IG9mIGludGVyZXN0XG4gICAqICAgKGkuZS4gdGhlIGxvY2FsRGlyZWN0b3J5IHBhc3NlZCB0byBQYXRoU2V0VXBkYXRlcjo6c3RhcnRVcGRhdGluZ1BhdGhTZXQpLlxuICAgKiAgIEZvciBleGFtcGxlLCB0aGlzIHN0cmluZyBzaG91bGQgYmUgJycgaWYgdGhvc2UgYXJlIHRoZSBzYW1lLlxuICAgKiBAcGFyYW0gcGF0aFNldCBUaGUgUGF0aFNldCB0aGF0IHNob3VsZCBiZSB1cGRhdGVkIGJ5IHRoaXMgd2F0Y2htYW4gdXBkYXRlLlxuICAgKiBAcGFyYW0gZmlsZXMgVGhlIGBmaWxlc2AgZmllbGQgb2YgYW4gZmItd2F0Y2htYW4gdXBkYXRlLiBFYWNoIGZpbGUgaW4gdGhlXG4gICAqICAgdXBkYXRlIGlzIGV4cGVjdGVkIHRvIGNvbnRhaW4gZmllbGRzIGZvciBgbmFtZWAsIGBuZXdgLCBhbmQgYGV4aXN0c2AuXG4gICAqL1xuICBfcHJvY2Vzc1dhdGNobWFuVXBkYXRlKFxuICAgIHBhdGhGcm9tU3Vic2NyaXB0aW9uUm9vdFRvRGlyOiA/c3RyaW5nLFxuICAgIHBhdGhTZXQ6IFBhdGhTZXQsXG4gICAgZmlsZXM6IGFueSxcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgbmV3UGF0aHMgPSBbXTtcbiAgICBjb25zdCBkZWxldGVkUGF0aHMgPSBbXTtcblxuICAgIGZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICBjb25zdCBmaWxlTmFtZSA9IGZpbGUubmFtZTtcbiAgICAgIC8vIFdhdGNobWFuIHJldHVybnMgcGF0aHMgcmVsYXRpdmUgdG8gdGhlIHN1YnNjcmlwdGlvbiByb290LCB3aGljaCBtYXkgYmVcbiAgICAgIC8vIGRpZmZlcmVudCBmcm9tIChpLmUuIGEgcGFyZW50IGRpcmVjdG9yeSBvZikgdGhlIGxvY2FsRGlyZWN0b3J5IHBhc3NlZCBpbnRvXG4gICAgICAvLyBQYXRoU2V0VXBkYXRlcjo6c3RhcnRVcGRhdGluZ1BhdGhTZXQuIEJ1dCB0aGUgUGF0aFNldCBleHBlY3RzIHBhdGhzXG4gICAgICAvLyByZWxhdGl2ZSB0byB0aGUgbG9jYWxEaXJlY3RvcnkuIFRodXMgd2UgbmVlZCB0byBkbyB0aGlzIGFkanVzdG1lbnQuXG4gICAgICBjb25zdCBhZGp1c3RlZFBhdGggPSBwYXRoRnJvbVN1YnNjcmlwdGlvblJvb3RUb0RpciA/XG4gICAgICAgIGZpbGVOYW1lLnNsaWNlKHBhdGhGcm9tU3Vic2NyaXB0aW9uUm9vdFRvRGlyLmxlbmd0aCArIDEpIDpcbiAgICAgICAgZmlsZU5hbWU7XG4gICAgICBpZiAoZmlsZS5uZXcpIHtcbiAgICAgICAgbmV3UGF0aHMucHVzaChhZGp1c3RlZFBhdGgpO1xuICAgICAgfSBlbHNlIGlmICghZmlsZS5leGlzdHMpIHtcbiAgICAgICAgZGVsZXRlZFBhdGhzLnB1c2goYWRqdXN0ZWRQYXRoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChuZXdQYXRocy5sZW5ndGgpIHtcbiAgICAgIHBhdGhTZXQuYWRkUGF0aHMobmV3UGF0aHMpO1xuICAgIH1cbiAgICBpZiAoZGVsZXRlZFBhdGhzLmxlbmd0aCkge1xuICAgICAgcGF0aFNldC5yZW1vdmVQYXRocyhkZWxldGVkUGF0aHMpO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=