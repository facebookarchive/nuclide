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

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atom = require('atom');

var _nuclideLogging = require('../../nuclide-logging');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var logger = (0, _nuclideLogging.getLogger)();

var MARKER_PROPERTY_FOR_REMOTE_DIRECTORY = '__nuclide_remote_directory__';

/* Mostly implements https://atom.io/docs/api/latest/Directory */

var RemoteDirectory = (function () {
  _createClass(RemoteDirectory, null, [{
    key: 'isRemoteDirectory',
    value: function isRemoteDirectory(directory) {
      /* $FlowFixMe */
      return directory[MARKER_PROPERTY_FOR_REMOTE_DIRECTORY] === true;
    }
  }]);

  /**
   * @param uri should be of the form "nuclide://example.com:9090/path/to/directory".
   */

  function RemoteDirectory(server, uri, symlink, options) {
    if (symlink === undefined) symlink = false;

    _classCallCheck(this, RemoteDirectory);

    Object.defineProperty(this, MARKER_PROPERTY_FOR_REMOTE_DIRECTORY, { value: true });
    this._server = server;
    this._uri = uri;
    this._emitter = new _atom.Emitter();
    this._subscriptionCount = 0;
    this._symlink = symlink;

    var _remoteUri$parse = _nuclideRemoteUri2['default'].parse(uri);

    var directoryPath = _remoteUri$parse.path;
    var protocol = _remoteUri$parse.protocol;
    var host = _remoteUri$parse.host;

    (0, _assert2['default'])(protocol);
    (0, _assert2['default'])(host);
    /** In the example, this would be "nuclide://example.com:9090". */
    this._host = protocol + '//' + host;
    /** In the example, this would be "/path/to/directory". */
    this._localPath = directoryPath;
    // A workaround before Atom 2.0: see ::getHgRepoInfo of main.js.
    this._hgRepositoryDescription = options ? options.hgRepositoryDescription : null;
  }

  _createClass(RemoteDirectory, [{
    key: 'onDidChange',
    value: function onDidChange(callback) {
      this._willAddSubscription();
      return this._trackUnsubscription(this._emitter.on('did-change', callback));
    }
  }, {
    key: '_willAddSubscription',
    value: function _willAddSubscription() {
      this._subscriptionCount++;
      try {
        this._subscribeToNativeChangeEvents();
      } catch (err) {
        logger.error('Failed to subscribe RemoteDirectory:', this._localPath, err);
      }
    }
  }, {
    key: '_subscribeToNativeChangeEvents',
    value: function _subscribeToNativeChangeEvents() {
      var _this = this;

      if (this._watchSubscription) {
        return;
      }

      var _ref = this._getService('FileWatcherService');

      var watchDirectory = _ref.watchDirectory;

      var watchStream = watchDirectory(this._uri);
      this._watchSubscription = watchStream.subscribe(function (watchUpdate) {
        logger.debug('watchDirectory update:', watchUpdate);
        if (watchUpdate.type === 'change') {
          return _this._handleNativeChangeEvent();
        }
      }, function (error) {
        logger.error('Failed to subscribe RemoteDirectory:', _this._uri, error);
      }, function () {
        // Nothing needs to be done if the root directory watch has ended.
        logger.debug('watchDirectory ended: ' + _this._uri);
      });
    }
  }, {
    key: '_handleNativeChangeEvent',
    value: function _handleNativeChangeEvent() {
      this._emitter.emit('did-change');
    }
  }, {
    key: '_trackUnsubscription',
    value: function _trackUnsubscription(subscription) {
      var _this2 = this;

      return new _atom.Disposable(function () {
        subscription.dispose();
        _this2._didRemoveSubscription();
      });
    }
  }, {
    key: '_didRemoveSubscription',
    value: function _didRemoveSubscription() {
      this._subscriptionCount--;
      if (this._subscriptionCount === 0) {
        return this._unsubscribeFromNativeChangeEvents();
      }
    }
  }, {
    key: '_unsubscribeFromNativeChangeEvents',
    value: function _unsubscribeFromNativeChangeEvents() {
      if (this._watchSubscription) {
        this._watchSubscription.dispose();
        this._watchSubscription = null;
      }
    }
  }, {
    key: 'isFile',
    value: function isFile() {
      return false;
    }
  }, {
    key: 'isDirectory',
    value: function isDirectory() {
      return true;
    }
  }, {
    key: 'isRoot',
    value: function isRoot() {
      return this._isRoot(this._localPath);
    }
  }, {
    key: 'exists',
    value: function exists() {
      return this._getFileSystemService().exists(this._localPath);
    }
  }, {
    key: 'existsSync',
    value: function existsSync() {
      return false;
    }
  }, {
    key: '_isRoot',
    value: function _isRoot(filePath) {
      filePath = _path2['default'].normalize(filePath);
      var parts = _path2['default'].parse(filePath);
      return parts.root === filePath;
    }
  }, {
    key: 'getPath',
    value: function getPath() {
      return this._uri;
    }
  }, {
    key: 'getLocalPath',
    value: function getLocalPath() {
      return this._localPath;
    }
  }, {
    key: 'getHost',
    value: function getHost() {
      return this._host;
    }
  }, {
    key: 'getRealPathSync',
    value: function getRealPathSync() {
      throw new Error('Not implemented');
    }
  }, {
    key: 'getBaseName',
    value: function getBaseName() {
      return _path2['default'].basename(this._localPath);
    }
  }, {
    key: 'relativize',
    value: function relativize(uri) {
      if (!uri) {
        return uri;
      }
      // Note: host of uri must match this._host.
      var subpath = _nuclideRemoteUri2['default'].parse(uri).path;
      return _path2['default'].relative(this._localPath, subpath);
    }
  }, {
    key: 'getParent',
    value: function getParent() {
      if (this.isRoot()) {
        return this;
      } else {
        var uri = this._host + _path2['default'].normalize(_path2['default'].join(this._localPath, '..'));
        return this._server.createDirectory(uri, this._hgRepositoryDescription);
      }
    }
  }, {
    key: 'getFile',
    value: function getFile(filename) {
      var uri = this._host + _path2['default'].join(this._localPath, filename);
      return this._server.createFile(uri);
    }
  }, {
    key: 'getSubdirectory',
    value: function getSubdirectory(dirname) {
      var uri = this._host + _path2['default'].join(this._localPath, dirname);
      return this._server.createDirectory(uri, this._hgRepositoryDescription);
    }
  }, {
    key: 'create',
    value: _asyncToGenerator(function* () {
      var created = yield this._getFileSystemService().mkdirp(this._localPath);
      if (this._subscriptionCount > 0) {
        this._subscribeToNativeChangeEvents();
      }
      return created;
    })
  }, {
    key: 'delete',
    value: _asyncToGenerator(function* () {
      yield this._getFileSystemService().rmdir(this._localPath);
      this._unsubscribeFromNativeChangeEvents();
    })

    /**
     * Renames this directory to the given absolute path.
     */
  }, {
    key: 'rename',
    value: _asyncToGenerator(function* (newPath) {
      yield this._getFileSystemService().rename(this._localPath, newPath);

      // Unsubscribe from the old `this._localPath`. This must be done before
      // setting the new `this._localPath`.
      this._unsubscribeFromNativeChangeEvents();

      var _remoteUri$parse2 = _nuclideRemoteUri2['default'].parse(this._uri);

      var protocol = _remoteUri$parse2.protocol;
      var host = _remoteUri$parse2.host;

      this._localPath = newPath;
      (0, _assert2['default'])(protocol);
      (0, _assert2['default'])(host);
      this._uri = protocol + '//' + host + this._localPath;

      // Subscribe to changes for the new `this._localPath`. This must be done
      // after setting the new `this._localPath`.
      if (this._subscriptionCount > 0) {
        this._subscribeToNativeChangeEvents();
      }
    })
  }, {
    key: 'getEntriesSync',
    value: function getEntriesSync() {
      throw new Error('not implemented');
    }

    /*
     * Calls `callback` with either an Array of entries or an Error if there was a problem fetching
     * those entries.
     *
     * Note: Although this function is `async`, it never rejects. Check whether the `error` argument
     * passed to `callback` is `null` to determine if there was an error.
     */
  }, {
    key: 'getEntries',
    value: _asyncToGenerator(function* (callback) {
      var _this3 = this;

      var entries = undefined;
      try {
        entries = yield this._getFileSystemService().readdir(this._localPath);
      } catch (e) {
        callback(e, null);
        return;
      }

      var directories = [];
      var files = [];
      entries.sort(function (a, b) {
        return a.file.toLowerCase().localeCompare(b.file.toLowerCase());
      }).forEach(function (entry) {
        (0, _assert2['default'])(entry);
        var uri = _this3._host + _path2['default'].join(_this3._localPath, entry.file);
        var symlink = entry.isSymbolicLink;
        if (entry.stats && entry.stats.isFile()) {
          files.push(_this3._server.createFile(uri, symlink));
        } else {
          directories.push(_this3._server.createDirectory(uri, _this3._hgRepositoryDescription, symlink));
        }
      });
      callback(null, directories.concat(files));
    })
  }, {
    key: 'contains',
    value: function contains(pathToCheck) {
      // Can't just do startsWith here. If this directory is "www" and you
      // are trying to check "www-base", just using startsWith would return
      // true, even though "www-base" is at the same level as "Www", not
      // contained in it.
      // So first check startsWith. If so, then if the two path lengths are
      // equal OR if the next character in the path to check is a path
      // separator, then we know the checked path is in this path.
      var endIndex = this.getPath().slice(-1) === _path2['default'].sep ? this.getPath().length - 1 : this.getPath().length;
      return pathToCheck != null && pathToCheck.startsWith(this.getPath()) && (pathToCheck.length === this.getPath().length || pathToCheck.charAt(endIndex) === _path2['default'].sep);
    }
  }, {
    key: 'off',
    value: function off() {}
    // This method is part of the EmitterMixin used by Atom's local Directory, but not documented
    // as part of the API - https://atom.io/docs/api/latest/Directory,
    // However, it appears to be called in project.coffee by Atom.

    // A workaround before Atom 2.0: see ::getHgRepoInfo of main.js.

  }, {
    key: 'getHgRepositoryDescription',
    value: function getHgRepositoryDescription() {
      return this._hgRepositoryDescription;
    }
  }, {
    key: 'isSymbolicLink',
    value: function isSymbolicLink() {
      return this._symlink;
    }
  }, {
    key: '_getFileSystemService',
    value: function _getFileSystemService() {
      return this._getService('FileSystemService');
    }
  }, {
    key: '_getService',
    value: function _getService(serviceName) {
      return this._server.getService(serviceName);
    }
  }]);

  return RemoteDirectory;
})();

exports.RemoteDirectory = RemoteDirectory;
//# sourceMappingURL=data:application/json;base64,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LEtBQUssa0JBQUssR0FBRyxDQUFBLEFBQUMsQ0FBQztLQUNyRDs7O1dBRUUsZUFBRyxFQUlMOzs7Ozs7QUFBQTs7O1dBR3lCLHNDQUE2QjtBQUNyRCxhQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQztLQUN0Qzs7O1dBRWEsMEJBQVk7QUFDeEIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0tBQ3RCOzs7V0FFb0IsaUNBQXNCO0FBQ3pDLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0tBQzlDOzs7V0FFVSxxQkFBQyxXQUFtQixFQUFPO0FBQ3BDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDN0M7OztTQS9SVSxlQUFlIiwiZmlsZSI6IlJlbW90ZURpcmVjdG9yeS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtGaWxlU3lzdGVtU2VydmljZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1zZXJ2ZXIvbGliL3NlcnZpY2VzL0ZpbGVTeXN0ZW1TZXJ2aWNlVHlwZSc7XG5pbXBvcnQgdHlwZSB7U2VydmVyQ29ubmVjdGlvbn0gZnJvbSAnLi9TZXJ2ZXJDb25uZWN0aW9uJztcbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1zb3VyY2UtY29udHJvbC1oZWxwZXJzJztcbmltcG9ydCB0eXBlIHtSZW1vdGVGaWxlfSBmcm9tICcuL1JlbW90ZUZpbGUnO1xuXG5pbXBvcnQgdHlwZW9mICogYXMgRmlsZVdhdGNoZXJTZXJ2aWNlIGZyb20gJy4uLy4uL251Y2xpZGUtZmlsZXdhdGNoZXItYmFzZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuaW1wb3J0IHJlbW90ZVVyaSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuY29uc3QgTUFSS0VSX1BST1BFUlRZX0ZPUl9SRU1PVEVfRElSRUNUT1JZID0gJ19fbnVjbGlkZV9yZW1vdGVfZGlyZWN0b3J5X18nO1xuXG4vKiBNb3N0bHkgaW1wbGVtZW50cyBodHRwczovL2F0b20uaW8vZG9jcy9hcGkvbGF0ZXN0L0RpcmVjdG9yeSAqL1xuZXhwb3J0IGNsYXNzIFJlbW90ZURpcmVjdG9yeSB7XG4gIHN0YXRpYyBpc1JlbW90ZURpcmVjdG9yeShkaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5IHwgUmVtb3RlRGlyZWN0b3J5KTogYm9vbGVhbiB7XG4gICAgLyogJEZsb3dGaXhNZSAqL1xuICAgIHJldHVybiBkaXJlY3RvcnlbTUFSS0VSX1BST1BFUlRZX0ZPUl9SRU1PVEVfRElSRUNUT1JZXSA9PT0gdHJ1ZTtcbiAgfVxuXG4gIF93YXRjaFN1YnNjcmlwdGlvbjogP0lEaXNwb3NhYmxlO1xuICBfc2VydmVyOiBTZXJ2ZXJDb25uZWN0aW9uO1xuICBfdXJpOiBzdHJpbmc7XG4gIF9lbWl0dGVyOiBhdG9tJEVtaXR0ZXI7XG4gIF9zdWJzY3JpcHRpb25Db3VudDogbnVtYmVyO1xuICBfaG9zdDogc3RyaW5nO1xuICBfbG9jYWxQYXRoOiBzdHJpbmc7XG4gIF9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbjogP0hnUmVwb3NpdG9yeURlc2NyaXB0aW9uO1xuICBfc3ltbGluazogYm9vbGVhbjtcblxuICAvKipcbiAgICogQHBhcmFtIHVyaSBzaG91bGQgYmUgb2YgdGhlIGZvcm0gXCJudWNsaWRlOi8vZXhhbXBsZS5jb206OTA5MC9wYXRoL3RvL2RpcmVjdG9yeVwiLlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgc2VydmVyOiBTZXJ2ZXJDb25uZWN0aW9uLFxuICAgIHVyaTogc3RyaW5nLFxuICAgIHN5bWxpbms6IGJvb2xlYW4gPSBmYWxzZSxcbiAgICBvcHRpb25zOiA/YW55LFxuICApIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgTUFSS0VSX1BST1BFUlRZX0ZPUl9SRU1PVEVfRElSRUNUT1JZLCB7dmFsdWU6IHRydWV9KTtcbiAgICB0aGlzLl9zZXJ2ZXIgPSBzZXJ2ZXI7XG4gICAgdGhpcy5fdXJpID0gdXJpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbkNvdW50ID0gMDtcbiAgICB0aGlzLl9zeW1saW5rID0gc3ltbGluaztcbiAgICBjb25zdCB7cGF0aDogZGlyZWN0b3J5UGF0aCwgcHJvdG9jb2wsIGhvc3R9ID0gcmVtb3RlVXJpLnBhcnNlKHVyaSk7XG4gICAgaW52YXJpYW50KHByb3RvY29sKTtcbiAgICBpbnZhcmlhbnQoaG9zdCk7XG4gICAgLyoqIEluIHRoZSBleGFtcGxlLCB0aGlzIHdvdWxkIGJlIFwibnVjbGlkZTovL2V4YW1wbGUuY29tOjkwOTBcIi4gKi9cbiAgICB0aGlzLl9ob3N0ID0gcHJvdG9jb2wgKyAnLy8nICsgaG9zdDtcbiAgICAvKiogSW4gdGhlIGV4YW1wbGUsIHRoaXMgd291bGQgYmUgXCIvcGF0aC90by9kaXJlY3RvcnlcIi4gKi9cbiAgICB0aGlzLl9sb2NhbFBhdGggPSBkaXJlY3RvcnlQYXRoO1xuICAgIC8vIEEgd29ya2Fyb3VuZCBiZWZvcmUgQXRvbSAyLjA6IHNlZSA6OmdldEhnUmVwb0luZm8gb2YgbWFpbi5qcy5cbiAgICB0aGlzLl9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbiA9IG9wdGlvbnMgPyBvcHRpb25zLmhnUmVwb3NpdG9yeURlc2NyaXB0aW9uIDogbnVsbDtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlKGNhbGxiYWNrOiAoKSA9PiBhbnkpOiBJRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5fd2lsbEFkZFN1YnNjcmlwdGlvbigpO1xuICAgIHJldHVybiB0aGlzLl90cmFja1Vuc3Vic2NyaXB0aW9uKHRoaXMuX2VtaXR0ZXIub24oJ2RpZC1jaGFuZ2UnLCBjYWxsYmFjaykpO1xuICB9XG5cbiAgX3dpbGxBZGRTdWJzY3JpcHRpb24oKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uQ291bnQrKztcbiAgICB0cnkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlVG9OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIHN1YnNjcmliZSBSZW1vdGVEaXJlY3Rvcnk6JywgdGhpcy5fbG9jYWxQYXRoLCBlcnIpO1xuICAgIH1cbiAgfVxuXG4gIF9zdWJzY3JpYmVUb05hdGl2ZUNoYW5nZUV2ZW50cygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qge3dhdGNoRGlyZWN0b3J5fSA9ICh0aGlzLl9nZXRTZXJ2aWNlKCdGaWxlV2F0Y2hlclNlcnZpY2UnKTogRmlsZVdhdGNoZXJTZXJ2aWNlKTtcbiAgICBjb25zdCB3YXRjaFN0cmVhbSA9IHdhdGNoRGlyZWN0b3J5KHRoaXMuX3VyaSk7XG4gICAgdGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24gPSB3YXRjaFN0cmVhbS5zdWJzY3JpYmUod2F0Y2hVcGRhdGUgPT4ge1xuICAgICAgbG9nZ2VyLmRlYnVnKGB3YXRjaERpcmVjdG9yeSB1cGRhdGU6YCwgd2F0Y2hVcGRhdGUpO1xuICAgICAgaWYgKHdhdGNoVXBkYXRlLnR5cGUgPT09ICdjaGFuZ2UnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVOYXRpdmVDaGFuZ2VFdmVudCgpO1xuICAgICAgfVxuICAgIH0sIGVycm9yID0+IHtcbiAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIHN1YnNjcmliZSBSZW1vdGVEaXJlY3Rvcnk6JywgdGhpcy5fdXJpLCBlcnJvcik7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgLy8gTm90aGluZyBuZWVkcyB0byBiZSBkb25lIGlmIHRoZSByb290IGRpcmVjdG9yeSB3YXRjaCBoYXMgZW5kZWQuXG4gICAgICBsb2dnZXIuZGVidWcoYHdhdGNoRGlyZWN0b3J5IGVuZGVkOiAke3RoaXMuX3VyaX1gKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVOYXRpdmVDaGFuZ2VFdmVudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UnKTtcbiAgfVxuXG4gIF90cmFja1Vuc3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbjogSURpc3Bvc2FibGUpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9kaWRSZW1vdmVTdWJzY3JpcHRpb24oKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9kaWRSZW1vdmVTdWJzY3JpcHRpb24oKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uQ291bnQtLTtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9uQ291bnQgPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLl91bnN1YnNjcmliZUZyb21OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICB9XG4gIH1cblxuICBfdW5zdWJzY3JpYmVGcm9tTmF0aXZlQ2hhbmdlRXZlbnRzKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl93YXRjaFN1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGlzRmlsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpc0RpcmVjdG9yeSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlzUm9vdCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNSb290KHRoaXMuX2xvY2FsUGF0aCk7XG4gIH1cblxuICBleGlzdHMoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkuZXhpc3RzKHRoaXMuX2xvY2FsUGF0aCk7XG4gIH1cblxuICBleGlzdHNTeW5jKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIF9pc1Jvb3QoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGZpbGVQYXRoID0gcGF0aC5ub3JtYWxpemUoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHBhcnRzID0gcGF0aC5wYXJzZShmaWxlUGF0aCk7XG4gICAgcmV0dXJuIHBhcnRzLnJvb3QgPT09IGZpbGVQYXRoO1xuICB9XG5cbiAgZ2V0UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl91cmk7XG4gIH1cblxuICBnZXRMb2NhbFBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fbG9jYWxQYXRoO1xuICB9XG5cbiAgZ2V0SG9zdCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9ob3N0O1xuICB9XG5cbiAgZ2V0UmVhbFBhdGhTeW5jKCk6IHN0cmluZyB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIGdldEJhc2VOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhdGguYmFzZW5hbWUodGhpcy5fbG9jYWxQYXRoKTtcbiAgfVxuXG4gIHJlbGF0aXZpemUodXJpOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghdXJpKSB7XG4gICAgICByZXR1cm4gdXJpO1xuICAgIH1cbiAgICAvLyBOb3RlOiBob3N0IG9mIHVyaSBtdXN0IG1hdGNoIHRoaXMuX2hvc3QuXG4gICAgY29uc3Qgc3VicGF0aCA9IHJlbW90ZVVyaS5wYXJzZSh1cmkpLnBhdGg7XG4gICAgcmV0dXJuIHBhdGgucmVsYXRpdmUodGhpcy5fbG9jYWxQYXRoLCBzdWJwYXRoKTtcbiAgfVxuXG4gIGdldFBhcmVudCgpOiBSZW1vdGVEaXJlY3Rvcnkge1xuICAgIGlmICh0aGlzLmlzUm9vdCgpKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdXJpID0gdGhpcy5faG9zdCArIHBhdGgubm9ybWFsaXplKHBhdGguam9pbih0aGlzLl9sb2NhbFBhdGgsICcuLicpKTtcbiAgICAgIHJldHVybiB0aGlzLl9zZXJ2ZXIuY3JlYXRlRGlyZWN0b3J5KHVyaSwgdGhpcy5faGdSZXBvc2l0b3J5RGVzY3JpcHRpb24pO1xuICAgIH1cbiAgfVxuXG4gIGdldEZpbGUoZmlsZW5hbWU6IHN0cmluZyk6IFJlbW90ZUZpbGUge1xuICAgIGNvbnN0IHVyaSA9IHRoaXMuX2hvc3QgKyBwYXRoLmpvaW4odGhpcy5fbG9jYWxQYXRoLCBmaWxlbmFtZSk7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZlci5jcmVhdGVGaWxlKHVyaSk7XG4gIH1cblxuICBnZXRTdWJkaXJlY3RvcnkoZGlybmFtZTogc3RyaW5nKTogUmVtb3RlRGlyZWN0b3J5IHtcbiAgICBjb25zdCB1cmkgPSB0aGlzLl9ob3N0ICsgcGF0aC5qb2luKHRoaXMuX2xvY2FsUGF0aCwgZGlybmFtZSk7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZlci5jcmVhdGVEaXJlY3RvcnkodXJpLCB0aGlzLl9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbik7XG4gIH1cblxuICBhc3luYyBjcmVhdGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgY3JlYXRlZCA9IGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkubWtkaXJwKHRoaXMuX2xvY2FsUGF0aCk7XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbkNvdW50ID4gMCkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlVG9OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZWQ7XG4gIH1cblxuICBhc3luYyBkZWxldGUoKTogUHJvbWlzZSB7XG4gICAgYXdhaXQgdGhpcy5fZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKS5ybWRpcih0aGlzLl9sb2NhbFBhdGgpO1xuICAgIHRoaXMuX3Vuc3Vic2NyaWJlRnJvbU5hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbmFtZXMgdGhpcyBkaXJlY3RvcnkgdG8gdGhlIGdpdmVuIGFic29sdXRlIHBhdGguXG4gICAqL1xuICBhc3luYyByZW5hbWUobmV3UGF0aDogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgYXdhaXQgdGhpcy5fZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKS5yZW5hbWUodGhpcy5fbG9jYWxQYXRoLCBuZXdQYXRoKTtcblxuICAgIC8vIFVuc3Vic2NyaWJlIGZyb20gdGhlIG9sZCBgdGhpcy5fbG9jYWxQYXRoYC4gVGhpcyBtdXN0IGJlIGRvbmUgYmVmb3JlXG4gICAgLy8gc2V0dGluZyB0aGUgbmV3IGB0aGlzLl9sb2NhbFBhdGhgLlxuICAgIHRoaXMuX3Vuc3Vic2NyaWJlRnJvbU5hdGl2ZUNoYW5nZUV2ZW50cygpO1xuXG4gICAgY29uc3Qge3Byb3RvY29sLCBob3N0fSA9IHJlbW90ZVVyaS5wYXJzZSh0aGlzLl91cmkpO1xuICAgIHRoaXMuX2xvY2FsUGF0aCA9IG5ld1BhdGg7XG4gICAgaW52YXJpYW50KHByb3RvY29sKTtcbiAgICBpbnZhcmlhbnQoaG9zdCk7XG4gICAgdGhpcy5fdXJpID0gcHJvdG9jb2wgKyAnLy8nICsgaG9zdCArIHRoaXMuX2xvY2FsUGF0aDtcblxuICAgIC8vIFN1YnNjcmliZSB0byBjaGFuZ2VzIGZvciB0aGUgbmV3IGB0aGlzLl9sb2NhbFBhdGhgLiBUaGlzIG11c3QgYmUgZG9uZVxuICAgIC8vIGFmdGVyIHNldHRpbmcgdGhlIG5ldyBgdGhpcy5fbG9jYWxQYXRoYC5cbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9uQ291bnQgPiAwKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVUb05hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICAgIH1cbiAgfVxuXG4gIGdldEVudHJpZXNTeW5jKCk6IEFycmF5PFJlbW90ZUZpbGUgfCBSZW1vdGVEaXJlY3Rvcnk+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgLypcbiAgICogQ2FsbHMgYGNhbGxiYWNrYCB3aXRoIGVpdGhlciBhbiBBcnJheSBvZiBlbnRyaWVzIG9yIGFuIEVycm9yIGlmIHRoZXJlIHdhcyBhIHByb2JsZW0gZmV0Y2hpbmdcbiAgICogdGhvc2UgZW50cmllcy5cbiAgICpcbiAgICogTm90ZTogQWx0aG91Z2ggdGhpcyBmdW5jdGlvbiBpcyBgYXN5bmNgLCBpdCBuZXZlciByZWplY3RzLiBDaGVjayB3aGV0aGVyIHRoZSBgZXJyb3JgIGFyZ3VtZW50XG4gICAqIHBhc3NlZCB0byBgY2FsbGJhY2tgIGlzIGBudWxsYCB0byBkZXRlcm1pbmUgaWYgdGhlcmUgd2FzIGFuIGVycm9yLlxuICAgKi9cbiAgYXN5bmMgZ2V0RW50cmllcyhcbiAgICBjYWxsYmFjazogKGVycm9yOiA/YXRvbSRHZXRFbnRyaWVzRXJyb3IsIGVudHJpZXM6ID9BcnJheTxSZW1vdGVEaXJlY3RvcnkgfCBSZW1vdGVGaWxlPikgPT4gYW55LFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgZW50cmllcztcbiAgICB0cnkge1xuICAgICAgZW50cmllcyA9IGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkucmVhZGRpcih0aGlzLl9sb2NhbFBhdGgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNhbGxiYWNrKGUsIG51bGwpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGRpcmVjdG9yaWVzIDogQXJyYXk8UmVtb3RlRGlyZWN0b3J5PiA9IFtdO1xuICAgIGNvbnN0IGZpbGVzID0gW107XG4gICAgZW50cmllcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICByZXR1cm4gYS5maWxlLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShiLmZpbGUudG9Mb3dlckNhc2UoKSk7XG4gICAgfSkuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICBpbnZhcmlhbnQoZW50cnkpO1xuICAgICAgY29uc3QgdXJpID0gdGhpcy5faG9zdCArIHBhdGguam9pbih0aGlzLl9sb2NhbFBhdGgsIGVudHJ5LmZpbGUpO1xuICAgICAgY29uc3Qgc3ltbGluayA9IGVudHJ5LmlzU3ltYm9saWNMaW5rO1xuICAgICAgaWYgKGVudHJ5LnN0YXRzICYmIGVudHJ5LnN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgIGZpbGVzLnB1c2godGhpcy5fc2VydmVyLmNyZWF0ZUZpbGUodXJpLCBzeW1saW5rKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaXJlY3Rvcmllcy5wdXNoKHRoaXMuX3NlcnZlci5jcmVhdGVEaXJlY3RvcnkodXJpLCB0aGlzLl9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbiwgc3ltbGluaykpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNhbGxiYWNrKG51bGwsIGRpcmVjdG9yaWVzLmNvbmNhdChmaWxlcykpO1xuICB9XG5cbiAgY29udGFpbnMocGF0aFRvQ2hlY2s6ID9zdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyBDYW4ndCBqdXN0IGRvIHN0YXJ0c1dpdGggaGVyZS4gSWYgdGhpcyBkaXJlY3RvcnkgaXMgXCJ3d3dcIiBhbmQgeW91XG4gICAgLy8gYXJlIHRyeWluZyB0byBjaGVjayBcInd3dy1iYXNlXCIsIGp1c3QgdXNpbmcgc3RhcnRzV2l0aCB3b3VsZCByZXR1cm5cbiAgICAvLyB0cnVlLCBldmVuIHRob3VnaCBcInd3dy1iYXNlXCIgaXMgYXQgdGhlIHNhbWUgbGV2ZWwgYXMgXCJXd3dcIiwgbm90XG4gICAgLy8gY29udGFpbmVkIGluIGl0LlxuICAgIC8vIFNvIGZpcnN0IGNoZWNrIHN0YXJ0c1dpdGguIElmIHNvLCB0aGVuIGlmIHRoZSB0d28gcGF0aCBsZW5ndGhzIGFyZVxuICAgIC8vIGVxdWFsIE9SIGlmIHRoZSBuZXh0IGNoYXJhY3RlciBpbiB0aGUgcGF0aCB0byBjaGVjayBpcyBhIHBhdGhcbiAgICAvLyBzZXBhcmF0b3IsIHRoZW4gd2Uga25vdyB0aGUgY2hlY2tlZCBwYXRoIGlzIGluIHRoaXMgcGF0aC5cbiAgICBjb25zdCBlbmRJbmRleCA9IHRoaXMuZ2V0UGF0aCgpLnNsaWNlKC0xKSA9PT0gcGF0aC5zZXBcbiAgICAgICAgICAgICAgICAgICA/IHRoaXMuZ2V0UGF0aCgpLmxlbmd0aCAtIDFcbiAgICAgICAgICAgICAgICAgICA6IHRoaXMuZ2V0UGF0aCgpLmxlbmd0aDtcbiAgICByZXR1cm4gcGF0aFRvQ2hlY2sgIT0gbnVsbFxuICAgICAgJiYgcGF0aFRvQ2hlY2suc3RhcnRzV2l0aCh0aGlzLmdldFBhdGgoKSlcbiAgICAgICYmIChwYXRoVG9DaGVjay5sZW5ndGggPT09IHRoaXMuZ2V0UGF0aCgpLmxlbmd0aFxuICAgICAgICAgIHx8IHBhdGhUb0NoZWNrLmNoYXJBdChlbmRJbmRleCkgPT09IHBhdGguc2VwKTtcbiAgfVxuXG4gIG9mZigpIHtcbiAgICAvLyBUaGlzIG1ldGhvZCBpcyBwYXJ0IG9mIHRoZSBFbWl0dGVyTWl4aW4gdXNlZCBieSBBdG9tJ3MgbG9jYWwgRGlyZWN0b3J5LCBidXQgbm90IGRvY3VtZW50ZWRcbiAgICAvLyBhcyBwYXJ0IG9mIHRoZSBBUEkgLSBodHRwczovL2F0b20uaW8vZG9jcy9hcGkvbGF0ZXN0L0RpcmVjdG9yeSxcbiAgICAvLyBIb3dldmVyLCBpdCBhcHBlYXJzIHRvIGJlIGNhbGxlZCBpbiBwcm9qZWN0LmNvZmZlZSBieSBBdG9tLlxuICB9XG5cbiAgLy8gQSB3b3JrYXJvdW5kIGJlZm9yZSBBdG9tIDIuMDogc2VlIDo6Z2V0SGdSZXBvSW5mbyBvZiBtYWluLmpzLlxuICBnZXRIZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbigpOiA/SGdSZXBvc2l0b3J5RGVzY3JpcHRpb24ge1xuICAgIHJldHVybiB0aGlzLl9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbjtcbiAgfVxuXG4gIGlzU3ltYm9saWNMaW5rKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zeW1saW5rO1xuICB9XG5cbiAgX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCk6IEZpbGVTeXN0ZW1TZXJ2aWNlIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U2VydmljZSgnRmlsZVN5c3RlbVNlcnZpY2UnKTtcbiAgfVxuXG4gIF9nZXRTZXJ2aWNlKHNlcnZpY2VOYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2ZXIuZ2V0U2VydmljZShzZXJ2aWNlTmFtZSk7XG4gIH1cbn1cbiJdfQ==