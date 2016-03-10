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

var _logging = require('../../logging');

var _remoteUri = require('../../remote-uri');

var _remoteUri2 = _interopRequireDefault(_remoteUri);

var logger = (0, _logging.getLogger)();

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

  function RemoteDirectory(remote, uri, symlink, options) {
    if (symlink === undefined) symlink = false;

    _classCallCheck(this, RemoteDirectory);

    Object.defineProperty(this, MARKER_PROPERTY_FOR_REMOTE_DIRECTORY, { value: true });
    this._remote = remote;
    this._uri = uri;
    this._emitter = new _atom.Emitter();
    this._subscriptionCount = 0;
    this._symlink = symlink;

    var _remoteUri$parse = _remoteUri2['default'].parse(uri);

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
      var subpath = _remoteUri2['default'].parse(uri).path;
      return _path2['default'].relative(this._localPath, subpath);
    }
  }, {
    key: 'getParent',
    value: function getParent() {
      if (this.isRoot()) {
        return this;
      } else {
        var uri = this._host + _path2['default'].normalize(_path2['default'].join(this._localPath, '..'));
        return this._remote.createDirectory(uri);
      }
    }
  }, {
    key: 'getFile',
    value: function getFile(filename) {
      var uri = this._host + _path2['default'].join(this._localPath, filename);
      return this._remote.createFile(uri);
    }
  }, {
    key: 'getSubdirectory',
    value: function getSubdirectory(dirname) {
      var uri = this._host + _path2['default'].join(this._localPath, dirname);
      return this._remote.createDirectory(uri);
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

      var _remoteUri$parse2 = _remoteUri2['default'].parse(this._uri);

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
          files.push(_this3._remote.createFile(uri, symlink));
        } else {
          directories.push(_this3._remote.createDirectory(uri, symlink));
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
      return this._remote.getService(serviceName);
    }
  }]);

  return RemoteDirectory;
})();

exports.RemoteDirectory = RemoteDirectory;
//# sourceMappingURL=data:application/json;base64,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QTs7O1dBR3lCLHNDQUE2QjtBQUNyRCxhQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQztLQUN0Qzs7O1dBRWEsMEJBQVk7QUFDeEIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0tBQ3RCOzs7V0FFb0IsaUNBQXNCO0FBQ3pDLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0tBQzlDOzs7V0FFVSxxQkFBQyxXQUFtQixFQUFPO0FBQ3BDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDN0M7OztTQS9SVSxlQUFlIiwiZmlsZSI6IlJlbW90ZURpcmVjdG9yeS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtGaWxlU3lzdGVtU2VydmljZX0gZnJvbSAnLi4vLi4vc2VydmVyL2xpYi9zZXJ2aWNlcy9GaWxlU3lzdGVtU2VydmljZVR5cGUnO1xuaW1wb3J0IHR5cGUge1JlbW90ZUNvbm5lY3Rpb259IGZyb20gJy4vUmVtb3RlQ29ubmVjdGlvbic7XG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5RGVzY3JpcHRpb259IGZyb20gJy4uLy4uL3NvdXJjZS1jb250cm9sLWhlbHBlcnMnO1xuaW1wb3J0IHR5cGUge1JlbW90ZUZpbGV9IGZyb20gJy4vUmVtb3RlRmlsZSc7XG5cbmltcG9ydCB0eXBlb2YgKiBhcyBGaWxlV2F0Y2hlclNlcnZpY2UgZnJvbSAnLi4vLi4vZmlsZXdhdGNoZXItYmFzZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9sb2dnaW5nJztcbmltcG9ydCByZW1vdGVVcmkgZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG5jb25zdCBNQVJLRVJfUFJPUEVSVFlfRk9SX1JFTU9URV9ESVJFQ1RPUlkgPSAnX19udWNsaWRlX3JlbW90ZV9kaXJlY3RvcnlfXyc7XG5cbi8qIE1vc3RseSBpbXBsZW1lbnRzIGh0dHBzOi8vYXRvbS5pby9kb2NzL2FwaS9sYXRlc3QvRGlyZWN0b3J5ICovXG5leHBvcnQgY2xhc3MgUmVtb3RlRGlyZWN0b3J5IHtcbiAgc3RhdGljIGlzUmVtb3RlRGlyZWN0b3J5KGRpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkgfCBSZW1vdGVEaXJlY3RvcnkpOiBib29sZWFuIHtcbiAgICAvKiAkRmxvd0ZpeE1lICovXG4gICAgcmV0dXJuIGRpcmVjdG9yeVtNQVJLRVJfUFJPUEVSVFlfRk9SX1JFTU9URV9ESVJFQ1RPUlldID09PSB0cnVlO1xuICB9XG5cbiAgX3dhdGNoU3Vic2NyaXB0aW9uOiA/SURpc3Bvc2FibGU7XG4gIF9yZW1vdGU6IFJlbW90ZUNvbm5lY3Rpb247XG4gIF91cmk6IHN0cmluZztcbiAgX2VtaXR0ZXI6IGF0b20kRW1pdHRlcjtcbiAgX3N1YnNjcmlwdGlvbkNvdW50OiBudW1iZXI7XG4gIF9ob3N0OiBzdHJpbmc7XG4gIF9sb2NhbFBhdGg6IHN0cmluZztcbiAgX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uOiA/SGdSZXBvc2l0b3J5RGVzY3JpcHRpb247XG4gIF9zeW1saW5rOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gdXJpIHNob3VsZCBiZSBvZiB0aGUgZm9ybSBcIm51Y2xpZGU6Ly9leGFtcGxlLmNvbTo5MDkwL3BhdGgvdG8vZGlyZWN0b3J5XCIuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICByZW1vdGU6IFJlbW90ZUNvbm5lY3Rpb24sXG4gICAgdXJpOiBzdHJpbmcsXG4gICAgc3ltbGluazogYm9vbGVhbiA9IGZhbHNlLFxuICAgIG9wdGlvbnM6ID9hbnksXG4gICkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBNQVJLRVJfUFJPUEVSVFlfRk9SX1JFTU9URV9ESVJFQ1RPUlksIHt2YWx1ZTogdHJ1ZX0pO1xuICAgIHRoaXMuX3JlbW90ZSA9IHJlbW90ZTtcbiAgICB0aGlzLl91cmkgPSB1cmk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uQ291bnQgPSAwO1xuICAgIHRoaXMuX3N5bWxpbmsgPSBzeW1saW5rO1xuICAgIGNvbnN0IHtwYXRoOiBkaXJlY3RvcnlQYXRoLCBwcm90b2NvbCwgaG9zdH0gPSByZW1vdGVVcmkucGFyc2UodXJpKTtcbiAgICBpbnZhcmlhbnQocHJvdG9jb2wpO1xuICAgIGludmFyaWFudChob3N0KTtcbiAgICAvKiogSW4gdGhlIGV4YW1wbGUsIHRoaXMgd291bGQgYmUgXCJudWNsaWRlOi8vZXhhbXBsZS5jb206OTA5MFwiLiAqL1xuICAgIHRoaXMuX2hvc3QgPSBwcm90b2NvbCArICcvLycgKyBob3N0O1xuICAgIC8qKiBJbiB0aGUgZXhhbXBsZSwgdGhpcyB3b3VsZCBiZSBcIi9wYXRoL3RvL2RpcmVjdG9yeVwiLiAqL1xuICAgIHRoaXMuX2xvY2FsUGF0aCA9IGRpcmVjdG9yeVBhdGg7XG4gICAgLy8gQSB3b3JrYXJvdW5kIGJlZm9yZSBBdG9tIDIuMDogc2VlIDo6Z2V0SGdSZXBvSW5mbyBvZiBtYWluLmpzLlxuICAgIHRoaXMuX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uID0gb3B0aW9ucyA/IG9wdGlvbnMuaGdSZXBvc2l0b3J5RGVzY3JpcHRpb24gOiBudWxsO1xuICB9XG5cbiAgb25EaWRDaGFuZ2UoY2FsbGJhY2s6ICgpID0+IGFueSk6IElEaXNwb3NhYmxlIHtcbiAgICB0aGlzLl93aWxsQWRkU3Vic2NyaXB0aW9uKCk7XG4gICAgcmV0dXJuIHRoaXMuX3RyYWNrVW5zdWJzY3JpcHRpb24odGhpcy5fZW1pdHRlci5vbignZGlkLWNoYW5nZScsIGNhbGxiYWNrKSk7XG4gIH1cblxuICBfd2lsbEFkZFN1YnNjcmlwdGlvbigpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25Db3VudCsrO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVUb05hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gc3Vic2NyaWJlIFJlbW90ZURpcmVjdG9yeTonLCB0aGlzLl9sb2NhbFBhdGgsIGVycik7XG4gICAgfVxuICB9XG5cbiAgX3N1YnNjcmliZVRvTmF0aXZlQ2hhbmdlRXZlbnRzKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl93YXRjaFN1YnNjcmlwdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7d2F0Y2hEaXJlY3Rvcnl9ID0gKHRoaXMuX2dldFNlcnZpY2UoJ0ZpbGVXYXRjaGVyU2VydmljZScpOiBGaWxlV2F0Y2hlclNlcnZpY2UpO1xuICAgIGNvbnN0IHdhdGNoU3RyZWFtID0gd2F0Y2hEaXJlY3RvcnkodGhpcy5fdXJpKTtcbiAgICB0aGlzLl93YXRjaFN1YnNjcmlwdGlvbiA9IHdhdGNoU3RyZWFtLnN1YnNjcmliZSh3YXRjaFVwZGF0ZSA9PiB7XG4gICAgICBsb2dnZXIuZGVidWcoYHdhdGNoRGlyZWN0b3J5IHVwZGF0ZTpgLCB3YXRjaFVwZGF0ZSk7XG4gICAgICBpZiAod2F0Y2hVcGRhdGUudHlwZSA9PT0gJ2NoYW5nZScpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRsZU5hdGl2ZUNoYW5nZUV2ZW50KCk7XG4gICAgICB9XG4gICAgfSwgZXJyb3IgPT4ge1xuICAgICAgbG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gc3Vic2NyaWJlIFJlbW90ZURpcmVjdG9yeTonLCB0aGlzLl91cmksIGVycm9yKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICAvLyBOb3RoaW5nIG5lZWRzIHRvIGJlIGRvbmUgaWYgdGhlIHJvb3QgZGlyZWN0b3J5IHdhdGNoIGhhcyBlbmRlZC5cbiAgICAgIGxvZ2dlci5kZWJ1Zyhgd2F0Y2hEaXJlY3RvcnkgZW5kZWQ6ICR7dGhpcy5fdXJpfWApO1xuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZU5hdGl2ZUNoYW5nZUV2ZW50KCk6IHZvaWQge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZScpO1xuICB9XG5cbiAgX3RyYWNrVW5zdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uOiBJRGlzcG9zYWJsZSk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2RpZFJlbW92ZVN1YnNjcmlwdGlvbigpO1xuICAgIH0pO1xuICB9XG5cbiAgX2RpZFJlbW92ZVN1YnNjcmlwdGlvbigpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25Db3VudC0tO1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25Db3VudCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3Vuc3Vic2NyaWJlRnJvbU5hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICAgIH1cbiAgfVxuXG4gIF91bnN1YnNjcmliZUZyb21OYXRpdmVDaGFuZ2VFdmVudHMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3dhdGNoU3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl93YXRjaFN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl93YXRjaFN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgaXNGaWxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlzRGlyZWN0b3J5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaXNSb290KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc1Jvb3QodGhpcy5fbG9jYWxQYXRoKTtcbiAgfVxuXG4gIGV4aXN0cygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKS5leGlzdHModGhpcy5fbG9jYWxQYXRoKTtcbiAgfVxuXG4gIGV4aXN0c1N5bmMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgX2lzUm9vdChmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgZmlsZVBhdGggPSBwYXRoLm5vcm1hbGl6ZShmaWxlUGF0aCk7XG4gICAgY29uc3QgcGFydHMgPSBwYXRoLnBhcnNlKGZpbGVQYXRoKTtcbiAgICByZXR1cm4gcGFydHMucm9vdCA9PT0gZmlsZVBhdGg7XG4gIH1cblxuICBnZXRQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3VyaTtcbiAgfVxuXG4gIGdldExvY2FsUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9sb2NhbFBhdGg7XG4gIH1cblxuICBnZXRIb3N0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2hvc3Q7XG4gIH1cblxuICBnZXRSZWFsUGF0aFN5bmMoKTogc3RyaW5nIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgZ2V0QmFzZU5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcGF0aC5iYXNlbmFtZSh0aGlzLl9sb2NhbFBhdGgpO1xuICB9XG5cbiAgcmVsYXRpdml6ZSh1cmk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKCF1cmkpIHtcbiAgICAgIHJldHVybiB1cmk7XG4gICAgfVxuICAgIC8vIE5vdGU6IGhvc3Qgb2YgdXJpIG11c3QgbWF0Y2ggdGhpcy5faG9zdC5cbiAgICBjb25zdCBzdWJwYXRoID0gcmVtb3RlVXJpLnBhcnNlKHVyaSkucGF0aDtcbiAgICByZXR1cm4gcGF0aC5yZWxhdGl2ZSh0aGlzLl9sb2NhbFBhdGgsIHN1YnBhdGgpO1xuICB9XG5cbiAgZ2V0UGFyZW50KCk6IFJlbW90ZURpcmVjdG9yeSB7XG4gICAgaWYgKHRoaXMuaXNSb290KCkpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB1cmkgPSB0aGlzLl9ob3N0ICsgcGF0aC5ub3JtYWxpemUocGF0aC5qb2luKHRoaXMuX2xvY2FsUGF0aCwgJy4uJykpO1xuICAgICAgcmV0dXJuIHRoaXMuX3JlbW90ZS5jcmVhdGVEaXJlY3RvcnkodXJpKTtcbiAgICB9XG4gIH1cblxuICBnZXRGaWxlKGZpbGVuYW1lOiBzdHJpbmcpOiBSZW1vdGVGaWxlIHtcbiAgICBjb25zdCB1cmkgPSB0aGlzLl9ob3N0ICsgcGF0aC5qb2luKHRoaXMuX2xvY2FsUGF0aCwgZmlsZW5hbWUpO1xuICAgIHJldHVybiB0aGlzLl9yZW1vdGUuY3JlYXRlRmlsZSh1cmkpO1xuICB9XG5cbiAgZ2V0U3ViZGlyZWN0b3J5KGRpcm5hbWU6IHN0cmluZyk6IFJlbW90ZURpcmVjdG9yeSB7XG4gICAgY29uc3QgdXJpID0gdGhpcy5faG9zdCArIHBhdGguam9pbih0aGlzLl9sb2NhbFBhdGgsIGRpcm5hbWUpO1xuICAgIHJldHVybiB0aGlzLl9yZW1vdGUuY3JlYXRlRGlyZWN0b3J5KHVyaSk7XG4gIH1cblxuICBhc3luYyBjcmVhdGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgY3JlYXRlZCA9IGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkubWtkaXJwKHRoaXMuX2xvY2FsUGF0aCk7XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbkNvdW50ID4gMCkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlVG9OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZWQ7XG4gIH1cblxuICBhc3luYyBkZWxldGUoKTogUHJvbWlzZSB7XG4gICAgYXdhaXQgdGhpcy5fZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKS5ybWRpcih0aGlzLl9sb2NhbFBhdGgpO1xuICAgIHRoaXMuX3Vuc3Vic2NyaWJlRnJvbU5hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbmFtZXMgdGhpcyBkaXJlY3RvcnkgdG8gdGhlIGdpdmVuIGFic29sdXRlIHBhdGguXG4gICAqL1xuICBhc3luYyByZW5hbWUobmV3UGF0aDogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgYXdhaXQgdGhpcy5fZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKS5yZW5hbWUodGhpcy5fbG9jYWxQYXRoLCBuZXdQYXRoKTtcblxuICAgIC8vIFVuc3Vic2NyaWJlIGZyb20gdGhlIG9sZCBgdGhpcy5fbG9jYWxQYXRoYC4gVGhpcyBtdXN0IGJlIGRvbmUgYmVmb3JlXG4gICAgLy8gc2V0dGluZyB0aGUgbmV3IGB0aGlzLl9sb2NhbFBhdGhgLlxuICAgIHRoaXMuX3Vuc3Vic2NyaWJlRnJvbU5hdGl2ZUNoYW5nZUV2ZW50cygpO1xuXG4gICAgY29uc3Qge3Byb3RvY29sLCBob3N0fSA9IHJlbW90ZVVyaS5wYXJzZSh0aGlzLl91cmkpO1xuICAgIHRoaXMuX2xvY2FsUGF0aCA9IG5ld1BhdGg7XG4gICAgaW52YXJpYW50KHByb3RvY29sKTtcbiAgICBpbnZhcmlhbnQoaG9zdCk7XG4gICAgdGhpcy5fdXJpID0gcHJvdG9jb2wgKyAnLy8nICsgaG9zdCArIHRoaXMuX2xvY2FsUGF0aDtcblxuICAgIC8vIFN1YnNjcmliZSB0byBjaGFuZ2VzIGZvciB0aGUgbmV3IGB0aGlzLl9sb2NhbFBhdGhgLiBUaGlzIG11c3QgYmUgZG9uZVxuICAgIC8vIGFmdGVyIHNldHRpbmcgdGhlIG5ldyBgdGhpcy5fbG9jYWxQYXRoYC5cbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9uQ291bnQgPiAwKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVUb05hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICAgIH1cbiAgfVxuXG4gIGdldEVudHJpZXNTeW5jKCk6IEFycmF5PFJlbW90ZUZpbGUgfCBSZW1vdGVEaXJlY3Rvcnk+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgLypcbiAgICogQ2FsbHMgYGNhbGxiYWNrYCB3aXRoIGVpdGhlciBhbiBBcnJheSBvZiBlbnRyaWVzIG9yIGFuIEVycm9yIGlmIHRoZXJlIHdhcyBhIHByb2JsZW0gZmV0Y2hpbmdcbiAgICogdGhvc2UgZW50cmllcy5cbiAgICpcbiAgICogTm90ZTogQWx0aG91Z2ggdGhpcyBmdW5jdGlvbiBpcyBgYXN5bmNgLCBpdCBuZXZlciByZWplY3RzLiBDaGVjayB3aGV0aGVyIHRoZSBgZXJyb3JgIGFyZ3VtZW50XG4gICAqIHBhc3NlZCB0byBgY2FsbGJhY2tgIGlzIGBudWxsYCB0byBkZXRlcm1pbmUgaWYgdGhlcmUgd2FzIGFuIGVycm9yLlxuICAgKi9cbiAgYXN5bmMgZ2V0RW50cmllcyhcbiAgICBjYWxsYmFjazogKGVycm9yOiA/YXRvbSRHZXRFbnRyaWVzRXJyb3IsIGVudHJpZXM6ID9BcnJheTxSZW1vdGVEaXJlY3RvcnkgfCBSZW1vdGVGaWxlPikgPT4gYW55LFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgZW50cmllcztcbiAgICB0cnkge1xuICAgICAgZW50cmllcyA9IGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkucmVhZGRpcih0aGlzLl9sb2NhbFBhdGgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNhbGxiYWNrKGUsIG51bGwpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGRpcmVjdG9yaWVzIDogQXJyYXk8UmVtb3RlRGlyZWN0b3J5PiA9IFtdO1xuICAgIGNvbnN0IGZpbGVzID0gW107XG4gICAgZW50cmllcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICByZXR1cm4gYS5maWxlLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShiLmZpbGUudG9Mb3dlckNhc2UoKSk7XG4gICAgfSkuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICBpbnZhcmlhbnQoZW50cnkpO1xuICAgICAgY29uc3QgdXJpID0gdGhpcy5faG9zdCArIHBhdGguam9pbih0aGlzLl9sb2NhbFBhdGgsIGVudHJ5LmZpbGUpO1xuICAgICAgY29uc3Qgc3ltbGluayA9IGVudHJ5LmlzU3ltYm9saWNMaW5rO1xuICAgICAgaWYgKGVudHJ5LnN0YXRzICYmIGVudHJ5LnN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgIGZpbGVzLnB1c2godGhpcy5fcmVtb3RlLmNyZWF0ZUZpbGUodXJpLCBzeW1saW5rKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaXJlY3Rvcmllcy5wdXNoKHRoaXMuX3JlbW90ZS5jcmVhdGVEaXJlY3RvcnkodXJpLCBzeW1saW5rKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY2FsbGJhY2sobnVsbCwgZGlyZWN0b3JpZXMuY29uY2F0KGZpbGVzKSk7XG4gIH1cblxuICBjb250YWlucyhwYXRoVG9DaGVjazogP3N0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIENhbid0IGp1c3QgZG8gc3RhcnRzV2l0aCBoZXJlLiBJZiB0aGlzIGRpcmVjdG9yeSBpcyBcInd3d1wiIGFuZCB5b3VcbiAgICAvLyBhcmUgdHJ5aW5nIHRvIGNoZWNrIFwid3d3LWJhc2VcIiwganVzdCB1c2luZyBzdGFydHNXaXRoIHdvdWxkIHJldHVyblxuICAgIC8vIHRydWUsIGV2ZW4gdGhvdWdoIFwid3d3LWJhc2VcIiBpcyBhdCB0aGUgc2FtZSBsZXZlbCBhcyBcIld3d1wiLCBub3RcbiAgICAvLyBjb250YWluZWQgaW4gaXQuXG4gICAgLy8gU28gZmlyc3QgY2hlY2sgc3RhcnRzV2l0aC4gSWYgc28sIHRoZW4gaWYgdGhlIHR3byBwYXRoIGxlbmd0aHMgYXJlXG4gICAgLy8gZXF1YWwgT1IgaWYgdGhlIG5leHQgY2hhcmFjdGVyIGluIHRoZSBwYXRoIHRvIGNoZWNrIGlzIGEgcGF0aFxuICAgIC8vIHNlcGFyYXRvciwgdGhlbiB3ZSBrbm93IHRoZSBjaGVja2VkIHBhdGggaXMgaW4gdGhpcyBwYXRoLlxuICAgIGNvbnN0IGVuZEluZGV4ID0gdGhpcy5nZXRQYXRoKCkuc2xpY2UoLTEpID09PSBwYXRoLnNlcFxuICAgICAgICAgICAgICAgICAgID8gdGhpcy5nZXRQYXRoKCkubGVuZ3RoIC0gMVxuICAgICAgICAgICAgICAgICAgIDogdGhpcy5nZXRQYXRoKCkubGVuZ3RoO1xuICAgIHJldHVybiBwYXRoVG9DaGVjayAhPSBudWxsXG4gICAgICAmJiBwYXRoVG9DaGVjay5zdGFydHNXaXRoKHRoaXMuZ2V0UGF0aCgpKVxuICAgICAgJiYgKHBhdGhUb0NoZWNrLmxlbmd0aCA9PT0gdGhpcy5nZXRQYXRoKCkubGVuZ3RoXG4gICAgICAgICAgfHwgcGF0aFRvQ2hlY2suY2hhckF0KGVuZEluZGV4KSA9PT0gcGF0aC5zZXApO1xuICB9XG5cbiAgb2ZmKCkge1xuICAgIC8vIFRoaXMgbWV0aG9kIGlzIHBhcnQgb2YgdGhlIEVtaXR0ZXJNaXhpbiB1c2VkIGJ5IEF0b20ncyBsb2NhbCBEaXJlY3RvcnksIGJ1dCBub3QgZG9jdW1lbnRlZFxuICAgIC8vIGFzIHBhcnQgb2YgdGhlIEFQSSAtIGh0dHBzOi8vYXRvbS5pby9kb2NzL2FwaS9sYXRlc3QvRGlyZWN0b3J5LFxuICAgIC8vIEhvd2V2ZXIsIGl0IGFwcGVhcnMgdG8gYmUgY2FsbGVkIGluIHByb2plY3QuY29mZmVlIGJ5IEF0b20uXG4gIH1cblxuICAvLyBBIHdvcmthcm91bmQgYmVmb3JlIEF0b20gMi4wOiBzZWUgOjpnZXRIZ1JlcG9JbmZvIG9mIG1haW4uanMuXG4gIGdldEhnUmVwb3NpdG9yeURlc2NyaXB0aW9uKCk6ID9IZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uO1xuICB9XG5cbiAgaXNTeW1ib2xpY0xpbmsoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N5bWxpbms7XG4gIH1cblxuICBfZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKTogRmlsZVN5c3RlbVNlcnZpY2Uge1xuICAgIHJldHVybiB0aGlzLl9nZXRTZXJ2aWNlKCdGaWxlU3lzdGVtU2VydmljZScpO1xuICB9XG5cbiAgX2dldFNlcnZpY2Uoc2VydmljZU5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX3JlbW90ZS5nZXRTZXJ2aWNlKHNlcnZpY2VOYW1lKTtcbiAgfVxufVxuIl19