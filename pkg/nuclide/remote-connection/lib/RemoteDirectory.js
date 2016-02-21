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

  function RemoteDirectory(remote, uri, options) {
    _classCallCheck(this, RemoteDirectory);

    Object.defineProperty(this, MARKER_PROPERTY_FOR_REMOTE_DIRECTORY, { value: true });
    this._remote = remote;
    this._uri = uri;
    this._emitter = new _atom.Emitter();
    this._subscriptionCount = 0;

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
        if (entry.stats && entry.stats.isFile()) {
          files.push(_this3._remote.createFile(uri));
        } else {
          directories.push(_this3._remote.createDirectory(uri));
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
//# sourceMappingURL=data:application/json;base64,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QUFPO0FBQ3BDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDN0M7OztTQW5SVSxlQUFlIiwiZmlsZSI6IlJlbW90ZURpcmVjdG9yeS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtGaWxlU3lzdGVtU2VydmljZX0gZnJvbSAnLi4vLi4vc2VydmVyL2xpYi9zZXJ2aWNlcy9GaWxlU3lzdGVtU2VydmljZVR5cGUnO1xuaW1wb3J0IHR5cGUge1JlbW90ZUNvbm5lY3Rpb259IGZyb20gJy4vUmVtb3RlQ29ubmVjdGlvbic7XG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5RGVzY3JpcHRpb259IGZyb20gJy4uLy4uL3NvdXJjZS1jb250cm9sLWhlbHBlcnMnO1xuaW1wb3J0IHR5cGUge1JlbW90ZUZpbGV9IGZyb20gJy4vUmVtb3RlRmlsZSc7XG5cbmltcG9ydCB0eXBlb2YgKiBhcyBGaWxlV2F0Y2hlclNlcnZpY2UgZnJvbSAnLi4vLi4vZmlsZXdhdGNoZXItYmFzZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9sb2dnaW5nJztcbmltcG9ydCByZW1vdGVVcmkgZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG5jb25zdCBNQVJLRVJfUFJPUEVSVFlfRk9SX1JFTU9URV9ESVJFQ1RPUlkgPSAnX19udWNsaWRlX3JlbW90ZV9kaXJlY3RvcnlfXyc7XG5cbi8qIE1vc3RseSBpbXBsZW1lbnRzIGh0dHBzOi8vYXRvbS5pby9kb2NzL2FwaS9sYXRlc3QvRGlyZWN0b3J5ICovXG5leHBvcnQgY2xhc3MgUmVtb3RlRGlyZWN0b3J5IHtcbiAgc3RhdGljIGlzUmVtb3RlRGlyZWN0b3J5KGRpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkgfCBSZW1vdGVEaXJlY3RvcnkpOiBib29sZWFuIHtcbiAgICAvKiAkRmxvd0ZpeE1lICovXG4gICAgcmV0dXJuIGRpcmVjdG9yeVtNQVJLRVJfUFJPUEVSVFlfRk9SX1JFTU9URV9ESVJFQ1RPUlldID09PSB0cnVlO1xuICB9XG5cbiAgX3dhdGNoU3Vic2NyaXB0aW9uOiA/SURpc3Bvc2FibGU7XG4gIF9yZW1vdGU6IFJlbW90ZUNvbm5lY3Rpb247XG4gIF91cmk6IHN0cmluZztcbiAgX2VtaXR0ZXI6IGF0b20kRW1pdHRlcjtcbiAgX3N1YnNjcmlwdGlvbkNvdW50OiBudW1iZXI7XG4gIF9ob3N0OiBzdHJpbmc7XG4gIF9sb2NhbFBhdGg6IHN0cmluZztcbiAgX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uOiA/SGdSZXBvc2l0b3J5RGVzY3JpcHRpb247XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB1cmkgc2hvdWxkIGJlIG9mIHRoZSBmb3JtIFwibnVjbGlkZTovL2V4YW1wbGUuY29tOjkwOTAvcGF0aC90by9kaXJlY3RvcnlcIi5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHJlbW90ZTogUmVtb3RlQ29ubmVjdGlvbiwgdXJpOiBzdHJpbmcsIG9wdGlvbnM6ID9hbnkpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgTUFSS0VSX1BST1BFUlRZX0ZPUl9SRU1PVEVfRElSRUNUT1JZLCB7dmFsdWU6IHRydWV9KTtcbiAgICB0aGlzLl9yZW1vdGUgPSByZW1vdGU7XG4gICAgdGhpcy5fdXJpID0gdXJpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbkNvdW50ID0gMDtcbiAgICBjb25zdCB7cGF0aDogZGlyZWN0b3J5UGF0aCwgcHJvdG9jb2wsIGhvc3R9ID0gcmVtb3RlVXJpLnBhcnNlKHVyaSk7XG4gICAgaW52YXJpYW50KHByb3RvY29sKTtcbiAgICBpbnZhcmlhbnQoaG9zdCk7XG4gICAgLyoqIEluIHRoZSBleGFtcGxlLCB0aGlzIHdvdWxkIGJlIFwibnVjbGlkZTovL2V4YW1wbGUuY29tOjkwOTBcIi4gKi9cbiAgICB0aGlzLl9ob3N0ID0gcHJvdG9jb2wgKyAnLy8nICsgaG9zdDtcbiAgICAvKiogSW4gdGhlIGV4YW1wbGUsIHRoaXMgd291bGQgYmUgXCIvcGF0aC90by9kaXJlY3RvcnlcIi4gKi9cbiAgICB0aGlzLl9sb2NhbFBhdGggPSBkaXJlY3RvcnlQYXRoO1xuICAgIC8vIEEgd29ya2Fyb3VuZCBiZWZvcmUgQXRvbSAyLjA6IHNlZSA6OmdldEhnUmVwb0luZm8gb2YgbWFpbi5qcy5cbiAgICB0aGlzLl9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbiA9IG9wdGlvbnMgPyBvcHRpb25zLmhnUmVwb3NpdG9yeURlc2NyaXB0aW9uIDogbnVsbDtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlKGNhbGxiYWNrOiAoKSA9PiBhbnkpOiBJRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5fd2lsbEFkZFN1YnNjcmlwdGlvbigpO1xuICAgIHJldHVybiB0aGlzLl90cmFja1Vuc3Vic2NyaXB0aW9uKHRoaXMuX2VtaXR0ZXIub24oJ2RpZC1jaGFuZ2UnLCBjYWxsYmFjaykpO1xuICB9XG5cbiAgX3dpbGxBZGRTdWJzY3JpcHRpb24oKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uQ291bnQrKztcbiAgICB0cnkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlVG9OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIHN1YnNjcmliZSBSZW1vdGVEaXJlY3Rvcnk6JywgdGhpcy5fbG9jYWxQYXRoLCBlcnIpO1xuICAgIH1cbiAgfVxuXG4gIF9zdWJzY3JpYmVUb05hdGl2ZUNoYW5nZUV2ZW50cygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qge3dhdGNoRGlyZWN0b3J5fSA9ICh0aGlzLl9nZXRTZXJ2aWNlKCdGaWxlV2F0Y2hlclNlcnZpY2UnKTogRmlsZVdhdGNoZXJTZXJ2aWNlKTtcbiAgICBjb25zdCB3YXRjaFN0cmVhbSA9IHdhdGNoRGlyZWN0b3J5KHRoaXMuX3VyaSk7XG4gICAgdGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24gPSB3YXRjaFN0cmVhbS5zdWJzY3JpYmUod2F0Y2hVcGRhdGUgPT4ge1xuICAgICAgbG9nZ2VyLmRlYnVnKGB3YXRjaERpcmVjdG9yeSB1cGRhdGU6YCwgd2F0Y2hVcGRhdGUpO1xuICAgICAgaWYgKHdhdGNoVXBkYXRlLnR5cGUgPT09ICdjaGFuZ2UnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVOYXRpdmVDaGFuZ2VFdmVudCgpO1xuICAgICAgfVxuICAgIH0sIGVycm9yID0+IHtcbiAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIHN1YnNjcmliZSBSZW1vdGVEaXJlY3Rvcnk6JywgdGhpcy5fdXJpLCBlcnJvcik7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgLy8gTm90aGluZyBuZWVkcyB0byBiZSBkb25lIGlmIHRoZSByb290IGRpcmVjdG9yeSB3YXRjaCBoYXMgZW5kZWQuXG4gICAgICBsb2dnZXIuZGVidWcoYHdhdGNoRGlyZWN0b3J5IGVuZGVkOiAke3RoaXMuX3VyaX1gKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVOYXRpdmVDaGFuZ2VFdmVudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UnKTtcbiAgfVxuXG4gIF90cmFja1Vuc3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbjogSURpc3Bvc2FibGUpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9kaWRSZW1vdmVTdWJzY3JpcHRpb24oKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9kaWRSZW1vdmVTdWJzY3JpcHRpb24oKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uQ291bnQtLTtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9uQ291bnQgPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLl91bnN1YnNjcmliZUZyb21OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICB9XG4gIH1cblxuICBfdW5zdWJzY3JpYmVGcm9tTmF0aXZlQ2hhbmdlRXZlbnRzKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl93YXRjaFN1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGlzRmlsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpc0RpcmVjdG9yeSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlzUm9vdCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNSb290KHRoaXMuX2xvY2FsUGF0aCk7XG4gIH1cblxuICBleGlzdHMoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkuZXhpc3RzKHRoaXMuX2xvY2FsUGF0aCk7XG4gIH1cblxuICBleGlzdHNTeW5jKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIF9pc1Jvb3QoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGZpbGVQYXRoID0gcGF0aC5ub3JtYWxpemUoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHBhcnRzID0gcGF0aC5wYXJzZShmaWxlUGF0aCk7XG4gICAgcmV0dXJuIHBhcnRzLnJvb3QgPT09IGZpbGVQYXRoO1xuICB9XG5cbiAgZ2V0UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl91cmk7XG4gIH1cblxuICBnZXRMb2NhbFBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fbG9jYWxQYXRoO1xuICB9XG5cbiAgZ2V0SG9zdCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9ob3N0O1xuICB9XG5cbiAgZ2V0UmVhbFBhdGhTeW5jKCk6IHN0cmluZyB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIGdldEJhc2VOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhdGguYmFzZW5hbWUodGhpcy5fbG9jYWxQYXRoKTtcbiAgfVxuXG4gIHJlbGF0aXZpemUodXJpOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghdXJpKSB7XG4gICAgICByZXR1cm4gdXJpO1xuICAgIH1cbiAgICAvLyBOb3RlOiBob3N0IG9mIHVyaSBtdXN0IG1hdGNoIHRoaXMuX2hvc3QuXG4gICAgY29uc3Qgc3VicGF0aCA9IHJlbW90ZVVyaS5wYXJzZSh1cmkpLnBhdGg7XG4gICAgcmV0dXJuIHBhdGgucmVsYXRpdmUodGhpcy5fbG9jYWxQYXRoLCBzdWJwYXRoKTtcbiAgfVxuXG4gIGdldFBhcmVudCgpOiBSZW1vdGVEaXJlY3Rvcnkge1xuICAgIGlmICh0aGlzLmlzUm9vdCgpKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdXJpID0gdGhpcy5faG9zdCArIHBhdGgubm9ybWFsaXplKHBhdGguam9pbih0aGlzLl9sb2NhbFBhdGgsICcuLicpKTtcbiAgICAgIHJldHVybiB0aGlzLl9yZW1vdGUuY3JlYXRlRGlyZWN0b3J5KHVyaSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0RmlsZShmaWxlbmFtZTogc3RyaW5nKTogUmVtb3RlRmlsZSB7XG4gICAgY29uc3QgdXJpID0gdGhpcy5faG9zdCArIHBhdGguam9pbih0aGlzLl9sb2NhbFBhdGgsIGZpbGVuYW1lKTtcbiAgICByZXR1cm4gdGhpcy5fcmVtb3RlLmNyZWF0ZUZpbGUodXJpKTtcbiAgfVxuXG4gIGdldFN1YmRpcmVjdG9yeShkaXJuYW1lOiBzdHJpbmcpOiBSZW1vdGVEaXJlY3Rvcnkge1xuICAgIGNvbnN0IHVyaSA9IHRoaXMuX2hvc3QgKyBwYXRoLmpvaW4odGhpcy5fbG9jYWxQYXRoLCBkaXJuYW1lKTtcbiAgICByZXR1cm4gdGhpcy5fcmVtb3RlLmNyZWF0ZURpcmVjdG9yeSh1cmkpO1xuICB9XG5cbiAgYXN5bmMgY3JlYXRlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGNyZWF0ZWQgPSBhd2FpdCB0aGlzLl9nZXRGaWxlU3lzdGVtU2VydmljZSgpLm1rZGlycCh0aGlzLl9sb2NhbFBhdGgpO1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25Db3VudCA+IDApIHtcbiAgICAgIHRoaXMuX3N1YnNjcmliZVRvTmF0aXZlQ2hhbmdlRXZlbnRzKCk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVkO1xuICB9XG5cbiAgYXN5bmMgZGVsZXRlKCk6IFByb21pc2Uge1xuICAgIGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkucm1kaXIodGhpcy5fbG9jYWxQYXRoKTtcbiAgICB0aGlzLl91bnN1YnNjcmliZUZyb21OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5hbWVzIHRoaXMgZGlyZWN0b3J5IHRvIHRoZSBnaXZlbiBhYnNvbHV0ZSBwYXRoLlxuICAgKi9cbiAgYXN5bmMgcmVuYW1lKG5ld1BhdGg6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkucmVuYW1lKHRoaXMuX2xvY2FsUGF0aCwgbmV3UGF0aCk7XG5cbiAgICAvLyBVbnN1YnNjcmliZSBmcm9tIHRoZSBvbGQgYHRoaXMuX2xvY2FsUGF0aGAuIFRoaXMgbXVzdCBiZSBkb25lIGJlZm9yZVxuICAgIC8vIHNldHRpbmcgdGhlIG5ldyBgdGhpcy5fbG9jYWxQYXRoYC5cbiAgICB0aGlzLl91bnN1YnNjcmliZUZyb21OYXRpdmVDaGFuZ2VFdmVudHMoKTtcblxuICAgIGNvbnN0IHtwcm90b2NvbCwgaG9zdH0gPSByZW1vdGVVcmkucGFyc2UodGhpcy5fdXJpKTtcbiAgICB0aGlzLl9sb2NhbFBhdGggPSBuZXdQYXRoO1xuICAgIGludmFyaWFudChwcm90b2NvbCk7XG4gICAgaW52YXJpYW50KGhvc3QpO1xuICAgIHRoaXMuX3VyaSA9IHByb3RvY29sICsgJy8vJyArIGhvc3QgKyB0aGlzLl9sb2NhbFBhdGg7XG5cbiAgICAvLyBTdWJzY3JpYmUgdG8gY2hhbmdlcyBmb3IgdGhlIG5ldyBgdGhpcy5fbG9jYWxQYXRoYC4gVGhpcyBtdXN0IGJlIGRvbmVcbiAgICAvLyBhZnRlciBzZXR0aW5nIHRoZSBuZXcgYHRoaXMuX2xvY2FsUGF0aGAuXG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbkNvdW50ID4gMCkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlVG9OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICB9XG4gIH1cblxuICBnZXRFbnRyaWVzU3luYygpOiBBcnJheTxSZW1vdGVGaWxlIHwgUmVtb3RlRGlyZWN0b3J5PiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIC8qXG4gICAqIENhbGxzIGBjYWxsYmFja2Agd2l0aCBlaXRoZXIgYW4gQXJyYXkgb2YgZW50cmllcyBvciBhbiBFcnJvciBpZiB0aGVyZSB3YXMgYSBwcm9ibGVtIGZldGNoaW5nXG4gICAqIHRob3NlIGVudHJpZXMuXG4gICAqXG4gICAqIE5vdGU6IEFsdGhvdWdoIHRoaXMgZnVuY3Rpb24gaXMgYGFzeW5jYCwgaXQgbmV2ZXIgcmVqZWN0cy4gQ2hlY2sgd2hldGhlciB0aGUgYGVycm9yYCBhcmd1bWVudFxuICAgKiBwYXNzZWQgdG8gYGNhbGxiYWNrYCBpcyBgbnVsbGAgdG8gZGV0ZXJtaW5lIGlmIHRoZXJlIHdhcyBhbiBlcnJvci5cbiAgICovXG4gIGFzeW5jIGdldEVudHJpZXMoXG4gICAgY2FsbGJhY2s6IChlcnJvcjogP2F0b20kR2V0RW50cmllc0Vycm9yLCBlbnRyaWVzOiA/QXJyYXk8UmVtb3RlRGlyZWN0b3J5IHwgUmVtb3RlRmlsZT4pID0+IGFueSxcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IGVudHJpZXM7XG4gICAgdHJ5IHtcbiAgICAgIGVudHJpZXMgPSBhd2FpdCB0aGlzLl9nZXRGaWxlU3lzdGVtU2VydmljZSgpLnJlYWRkaXIodGhpcy5fbG9jYWxQYXRoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjYWxsYmFjayhlLCBudWxsKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkaXJlY3RvcmllcyA6IEFycmF5PFJlbW90ZURpcmVjdG9yeT4gPSBbXTtcbiAgICBjb25zdCBmaWxlcyA9IFtdO1xuICAgIGVudHJpZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgcmV0dXJuIGEuZmlsZS50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoYi5maWxlLnRvTG93ZXJDYXNlKCkpO1xuICAgIH0pLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgaW52YXJpYW50KGVudHJ5KTtcbiAgICAgIGNvbnN0IHVyaSA9IHRoaXMuX2hvc3QgKyBwYXRoLmpvaW4odGhpcy5fbG9jYWxQYXRoLCBlbnRyeS5maWxlKTtcbiAgICAgIGlmIChlbnRyeS5zdGF0cyAmJiBlbnRyeS5zdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgICBmaWxlcy5wdXNoKHRoaXMuX3JlbW90ZS5jcmVhdGVGaWxlKHVyaSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlyZWN0b3JpZXMucHVzaCh0aGlzLl9yZW1vdGUuY3JlYXRlRGlyZWN0b3J5KHVyaSkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNhbGxiYWNrKG51bGwsIGRpcmVjdG9yaWVzLmNvbmNhdChmaWxlcykpO1xuICB9XG5cbiAgY29udGFpbnMocGF0aFRvQ2hlY2s6ID9zdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyBDYW4ndCBqdXN0IGRvIHN0YXJ0c1dpdGggaGVyZS4gSWYgdGhpcyBkaXJlY3RvcnkgaXMgXCJ3d3dcIiBhbmQgeW91XG4gICAgLy8gYXJlIHRyeWluZyB0byBjaGVjayBcInd3dy1iYXNlXCIsIGp1c3QgdXNpbmcgc3RhcnRzV2l0aCB3b3VsZCByZXR1cm5cbiAgICAvLyB0cnVlLCBldmVuIHRob3VnaCBcInd3dy1iYXNlXCIgaXMgYXQgdGhlIHNhbWUgbGV2ZWwgYXMgXCJXd3dcIiwgbm90XG4gICAgLy8gY29udGFpbmVkIGluIGl0LlxuICAgIC8vIFNvIGZpcnN0IGNoZWNrIHN0YXJ0c1dpdGguIElmIHNvLCB0aGVuIGlmIHRoZSB0d28gcGF0aCBsZW5ndGhzIGFyZVxuICAgIC8vIGVxdWFsIE9SIGlmIHRoZSBuZXh0IGNoYXJhY3RlciBpbiB0aGUgcGF0aCB0byBjaGVjayBpcyBhIHBhdGhcbiAgICAvLyBzZXBhcmF0b3IsIHRoZW4gd2Uga25vdyB0aGUgY2hlY2tlZCBwYXRoIGlzIGluIHRoaXMgcGF0aC5cbiAgICBjb25zdCBlbmRJbmRleCA9IHRoaXMuZ2V0UGF0aCgpLnNsaWNlKC0xKSA9PT0gcGF0aC5zZXBcbiAgICAgICAgICAgICAgICAgICA/IHRoaXMuZ2V0UGF0aCgpLmxlbmd0aCAtIDFcbiAgICAgICAgICAgICAgICAgICA6IHRoaXMuZ2V0UGF0aCgpLmxlbmd0aDtcbiAgICByZXR1cm4gcGF0aFRvQ2hlY2sgIT0gbnVsbFxuICAgICAgJiYgcGF0aFRvQ2hlY2suc3RhcnRzV2l0aCh0aGlzLmdldFBhdGgoKSlcbiAgICAgICYmIChwYXRoVG9DaGVjay5sZW5ndGggPT09IHRoaXMuZ2V0UGF0aCgpLmxlbmd0aFxuICAgICAgICAgIHx8IHBhdGhUb0NoZWNrLmNoYXJBdChlbmRJbmRleCkgPT09IHBhdGguc2VwKTtcbiAgfVxuXG4gIG9mZigpIHtcbiAgICAvLyBUaGlzIG1ldGhvZCBpcyBwYXJ0IG9mIHRoZSBFbWl0dGVyTWl4aW4gdXNlZCBieSBBdG9tJ3MgbG9jYWwgRGlyZWN0b3J5LCBidXQgbm90IGRvY3VtZW50ZWRcbiAgICAvLyBhcyBwYXJ0IG9mIHRoZSBBUEkgLSBodHRwczovL2F0b20uaW8vZG9jcy9hcGkvbGF0ZXN0L0RpcmVjdG9yeSxcbiAgICAvLyBIb3dldmVyLCBpdCBhcHBlYXJzIHRvIGJlIGNhbGxlZCBpbiBwcm9qZWN0LmNvZmZlZSBieSBBdG9tLlxuICB9XG5cbiAgLy8gQSB3b3JrYXJvdW5kIGJlZm9yZSBBdG9tIDIuMDogc2VlIDo6Z2V0SGdSZXBvSW5mbyBvZiBtYWluLmpzLlxuICBnZXRIZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbigpOiA/SGdSZXBvc2l0b3J5RGVzY3JpcHRpb24ge1xuICAgIHJldHVybiB0aGlzLl9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbjtcbiAgfVxuXG4gIF9nZXRGaWxlU3lzdGVtU2VydmljZSgpOiBGaWxlU3lzdGVtU2VydmljZSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNlcnZpY2UoJ0ZpbGVTeXN0ZW1TZXJ2aWNlJyk7XG4gIH1cblxuICBfZ2V0U2VydmljZShzZXJ2aWNlTmFtZTogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fcmVtb3RlLmdldFNlcnZpY2Uoc2VydmljZU5hbWUpO1xuICB9XG59XG4iXX0=