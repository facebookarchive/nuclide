var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

      var _getService2 = this._getService('FileWatcherService');

      var watchDirectory = _getService2.watchDirectory;

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

module.exports = RemoteDirectory;
//# sourceMappingURL=data:application/json;base64,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O0FBQ3BDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDN0M7OztTQW5SRyxlQUFlOzs7QUFzUnJCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDIiwiZmlsZSI6IlJlbW90ZURpcmVjdG9yeS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtGaWxlU3lzdGVtU2VydmljZX0gZnJvbSAnLi4vLi4vc2VydmVyL2xpYi9zZXJ2aWNlcy9GaWxlU3lzdGVtU2VydmljZVR5cGUnO1xuaW1wb3J0IHR5cGUge1JlbW90ZUNvbm5lY3Rpb259IGZyb20gJy4vUmVtb3RlQ29ubmVjdGlvbic7XG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5RGVzY3JpcHRpb259IGZyb20gJy4uLy4uL3NvdXJjZS1jb250cm9sLWhlbHBlcnMnO1xuaW1wb3J0IHR5cGUgUmVtb3RlRmlsZSBmcm9tICcuL1JlbW90ZUZpbGUnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7RGlzcG9zYWJsZSwgRW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5pbXBvcnQgcmVtb3RlVXJpIGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuY29uc3QgTUFSS0VSX1BST1BFUlRZX0ZPUl9SRU1PVEVfRElSRUNUT1JZID0gJ19fbnVjbGlkZV9yZW1vdGVfZGlyZWN0b3J5X18nO1xuXG4vKiBNb3N0bHkgaW1wbGVtZW50cyBodHRwczovL2F0b20uaW8vZG9jcy9hcGkvbGF0ZXN0L0RpcmVjdG9yeSAqL1xuY2xhc3MgUmVtb3RlRGlyZWN0b3J5IHtcbiAgc3RhdGljIGlzUmVtb3RlRGlyZWN0b3J5KGRpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkgfCBSZW1vdGVEaXJlY3RvcnkpOiBib29sZWFuIHtcbiAgICAvKiAkRmxvd0ZpeE1lICovXG4gICAgcmV0dXJuIGRpcmVjdG9yeVtNQVJLRVJfUFJPUEVSVFlfRk9SX1JFTU9URV9ESVJFQ1RPUlldID09PSB0cnVlO1xuICB9XG5cbiAgX3dhdGNoU3Vic2NyaXB0aW9uOiA/SURpc3Bvc2FibGU7XG4gIF9yZW1vdGU6IFJlbW90ZUNvbm5lY3Rpb247XG4gIF91cmk6IHN0cmluZztcbiAgX2VtaXR0ZXI6IGF0b20kRW1pdHRlcjtcbiAgX3N1YnNjcmlwdGlvbkNvdW50OiBudW1iZXI7XG4gIF9ob3N0OiBzdHJpbmc7XG4gIF9sb2NhbFBhdGg6IHN0cmluZztcbiAgX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uOiA/SGdSZXBvc2l0b3J5RGVzY3JpcHRpb247XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB1cmkgc2hvdWxkIGJlIG9mIHRoZSBmb3JtIFwibnVjbGlkZTovL2V4YW1wbGUuY29tOjkwOTAvcGF0aC90by9kaXJlY3RvcnlcIi5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHJlbW90ZTogUmVtb3RlQ29ubmVjdGlvbiwgdXJpOiBzdHJpbmcsIG9wdGlvbnM6ID9hbnkpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgTUFSS0VSX1BST1BFUlRZX0ZPUl9SRU1PVEVfRElSRUNUT1JZLCB7dmFsdWU6IHRydWV9KTtcbiAgICB0aGlzLl9yZW1vdGUgPSByZW1vdGU7XG4gICAgdGhpcy5fdXJpID0gdXJpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbkNvdW50ID0gMDtcbiAgICBjb25zdCB7cGF0aDogZGlyZWN0b3J5UGF0aCwgcHJvdG9jb2wsIGhvc3R9ID0gcmVtb3RlVXJpLnBhcnNlKHVyaSk7XG4gICAgaW52YXJpYW50KHByb3RvY29sKTtcbiAgICBpbnZhcmlhbnQoaG9zdCk7XG4gICAgLyoqIEluIHRoZSBleGFtcGxlLCB0aGlzIHdvdWxkIGJlIFwibnVjbGlkZTovL2V4YW1wbGUuY29tOjkwOTBcIi4gKi9cbiAgICB0aGlzLl9ob3N0ID0gcHJvdG9jb2wgKyAnLy8nICsgaG9zdDtcbiAgICAvKiogSW4gdGhlIGV4YW1wbGUsIHRoaXMgd291bGQgYmUgXCIvcGF0aC90by9kaXJlY3RvcnlcIi4gKi9cbiAgICB0aGlzLl9sb2NhbFBhdGggPSBkaXJlY3RvcnlQYXRoO1xuICAgIC8vIEEgd29ya2Fyb3VuZCBiZWZvcmUgQXRvbSAyLjA6IHNlZSA6OmdldEhnUmVwb0luZm8gb2YgbWFpbi5qcy5cbiAgICB0aGlzLl9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbiA9IG9wdGlvbnMgPyBvcHRpb25zLmhnUmVwb3NpdG9yeURlc2NyaXB0aW9uIDogbnVsbDtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlKGNhbGxiYWNrOiAoKSA9PiBhbnkpOiBJRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5fd2lsbEFkZFN1YnNjcmlwdGlvbigpO1xuICAgIHJldHVybiB0aGlzLl90cmFja1Vuc3Vic2NyaXB0aW9uKHRoaXMuX2VtaXR0ZXIub24oJ2RpZC1jaGFuZ2UnLCBjYWxsYmFjaykpO1xuICB9XG5cbiAgX3dpbGxBZGRTdWJzY3JpcHRpb24oKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uQ291bnQrKztcbiAgICB0cnkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlVG9OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIHN1YnNjcmliZSBSZW1vdGVEaXJlY3Rvcnk6JywgdGhpcy5fbG9jYWxQYXRoLCBlcnIpO1xuICAgIH1cbiAgfVxuXG4gIF9zdWJzY3JpYmVUb05hdGl2ZUNoYW5nZUV2ZW50cygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qge3dhdGNoRGlyZWN0b3J5fSA9IHRoaXMuX2dldFNlcnZpY2UoJ0ZpbGVXYXRjaGVyU2VydmljZScpO1xuICAgIGNvbnN0IHdhdGNoU3RyZWFtID0gd2F0Y2hEaXJlY3RvcnkodGhpcy5fdXJpKTtcbiAgICB0aGlzLl93YXRjaFN1YnNjcmlwdGlvbiA9IHdhdGNoU3RyZWFtLnN1YnNjcmliZSh3YXRjaFVwZGF0ZSA9PiB7XG4gICAgICBsb2dnZXIuZGVidWcoYHdhdGNoRGlyZWN0b3J5IHVwZGF0ZTpgLCB3YXRjaFVwZGF0ZSk7XG4gICAgICBpZiAod2F0Y2hVcGRhdGUudHlwZSA9PT0gJ2NoYW5nZScpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRsZU5hdGl2ZUNoYW5nZUV2ZW50KCk7XG4gICAgICB9XG4gICAgfSwgZXJyb3IgPT4ge1xuICAgICAgbG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gc3Vic2NyaWJlIFJlbW90ZURpcmVjdG9yeTonLCB0aGlzLl91cmksIGVycm9yKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICAvLyBOb3RoaW5nIG5lZWRzIHRvIGJlIGRvbmUgaWYgdGhlIHJvb3QgZGlyZWN0b3J5IHdhdGNoIGhhcyBlbmRlZC5cbiAgICAgIGxvZ2dlci5kZWJ1Zyhgd2F0Y2hEaXJlY3RvcnkgZW5kZWQ6ICR7dGhpcy5fdXJpfWApO1xuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZU5hdGl2ZUNoYW5nZUV2ZW50KCk6IHZvaWQge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZScpO1xuICB9XG5cbiAgX3RyYWNrVW5zdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uOiBJRGlzcG9zYWJsZSk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2RpZFJlbW92ZVN1YnNjcmlwdGlvbigpO1xuICAgIH0pO1xuICB9XG5cbiAgX2RpZFJlbW92ZVN1YnNjcmlwdGlvbigpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25Db3VudC0tO1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25Db3VudCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3Vuc3Vic2NyaWJlRnJvbU5hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICAgIH1cbiAgfVxuXG4gIF91bnN1YnNjcmliZUZyb21OYXRpdmVDaGFuZ2VFdmVudHMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3dhdGNoU3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl93YXRjaFN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl93YXRjaFN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgaXNGaWxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlzRGlyZWN0b3J5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaXNSb290KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc1Jvb3QodGhpcy5fbG9jYWxQYXRoKTtcbiAgfVxuXG4gIGV4aXN0cygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKS5leGlzdHModGhpcy5fbG9jYWxQYXRoKTtcbiAgfVxuXG4gIGV4aXN0c1N5bmMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgX2lzUm9vdChmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgZmlsZVBhdGggPSBwYXRoLm5vcm1hbGl6ZShmaWxlUGF0aCk7XG4gICAgY29uc3QgcGFydHMgPSBwYXRoLnBhcnNlKGZpbGVQYXRoKTtcbiAgICByZXR1cm4gcGFydHMucm9vdCA9PT0gZmlsZVBhdGg7XG4gIH1cblxuICBnZXRQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3VyaTtcbiAgfVxuXG4gIGdldExvY2FsUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9sb2NhbFBhdGg7XG4gIH1cblxuICBnZXRIb3N0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2hvc3Q7XG4gIH1cblxuICBnZXRSZWFsUGF0aFN5bmMoKTogc3RyaW5nIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgZ2V0QmFzZU5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcGF0aC5iYXNlbmFtZSh0aGlzLl9sb2NhbFBhdGgpO1xuICB9XG5cbiAgcmVsYXRpdml6ZSh1cmk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKCF1cmkpIHtcbiAgICAgIHJldHVybiB1cmk7XG4gICAgfVxuICAgIC8vIE5vdGU6IGhvc3Qgb2YgdXJpIG11c3QgbWF0Y2ggdGhpcy5faG9zdC5cbiAgICBjb25zdCBzdWJwYXRoID0gcmVtb3RlVXJpLnBhcnNlKHVyaSkucGF0aDtcbiAgICByZXR1cm4gcGF0aC5yZWxhdGl2ZSh0aGlzLl9sb2NhbFBhdGgsIHN1YnBhdGgpO1xuICB9XG5cbiAgZ2V0UGFyZW50KCk6IFJlbW90ZURpcmVjdG9yeSB7XG4gICAgaWYgKHRoaXMuaXNSb290KCkpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB1cmkgPSB0aGlzLl9ob3N0ICsgcGF0aC5ub3JtYWxpemUocGF0aC5qb2luKHRoaXMuX2xvY2FsUGF0aCwgJy4uJykpO1xuICAgICAgcmV0dXJuIHRoaXMuX3JlbW90ZS5jcmVhdGVEaXJlY3RvcnkodXJpKTtcbiAgICB9XG4gIH1cblxuICBnZXRGaWxlKGZpbGVuYW1lOiBzdHJpbmcpOiBSZW1vdGVGaWxlIHtcbiAgICBjb25zdCB1cmkgPSB0aGlzLl9ob3N0ICsgcGF0aC5qb2luKHRoaXMuX2xvY2FsUGF0aCwgZmlsZW5hbWUpO1xuICAgIHJldHVybiB0aGlzLl9yZW1vdGUuY3JlYXRlRmlsZSh1cmkpO1xuICB9XG5cbiAgZ2V0U3ViZGlyZWN0b3J5KGRpcm5hbWU6IHN0cmluZyk6IFJlbW90ZURpcmVjdG9yeSB7XG4gICAgY29uc3QgdXJpID0gdGhpcy5faG9zdCArIHBhdGguam9pbih0aGlzLl9sb2NhbFBhdGgsIGRpcm5hbWUpO1xuICAgIHJldHVybiB0aGlzLl9yZW1vdGUuY3JlYXRlRGlyZWN0b3J5KHVyaSk7XG4gIH1cblxuICBhc3luYyBjcmVhdGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgY3JlYXRlZCA9IGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkubWtkaXJwKHRoaXMuX2xvY2FsUGF0aCk7XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbkNvdW50ID4gMCkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlVG9OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZWQ7XG4gIH1cblxuICBhc3luYyBkZWxldGUoKTogUHJvbWlzZSB7XG4gICAgYXdhaXQgdGhpcy5fZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKS5ybWRpcih0aGlzLl9sb2NhbFBhdGgpO1xuICAgIHRoaXMuX3Vuc3Vic2NyaWJlRnJvbU5hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbmFtZXMgdGhpcyBkaXJlY3RvcnkgdG8gdGhlIGdpdmVuIGFic29sdXRlIHBhdGguXG4gICAqL1xuICBhc3luYyByZW5hbWUobmV3UGF0aDogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgYXdhaXQgdGhpcy5fZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKS5yZW5hbWUodGhpcy5fbG9jYWxQYXRoLCBuZXdQYXRoKTtcblxuICAgIC8vIFVuc3Vic2NyaWJlIGZyb20gdGhlIG9sZCBgdGhpcy5fbG9jYWxQYXRoYC4gVGhpcyBtdXN0IGJlIGRvbmUgYmVmb3JlXG4gICAgLy8gc2V0dGluZyB0aGUgbmV3IGB0aGlzLl9sb2NhbFBhdGhgLlxuICAgIHRoaXMuX3Vuc3Vic2NyaWJlRnJvbU5hdGl2ZUNoYW5nZUV2ZW50cygpO1xuXG4gICAgY29uc3Qge3Byb3RvY29sLCBob3N0fSA9IHJlbW90ZVVyaS5wYXJzZSh0aGlzLl91cmkpO1xuICAgIHRoaXMuX2xvY2FsUGF0aCA9IG5ld1BhdGg7XG4gICAgaW52YXJpYW50KHByb3RvY29sKTtcbiAgICBpbnZhcmlhbnQoaG9zdCk7XG4gICAgdGhpcy5fdXJpID0gcHJvdG9jb2wgKyAnLy8nICsgaG9zdCArIHRoaXMuX2xvY2FsUGF0aDtcblxuICAgIC8vIFN1YnNjcmliZSB0byBjaGFuZ2VzIGZvciB0aGUgbmV3IGB0aGlzLl9sb2NhbFBhdGhgLiBUaGlzIG11c3QgYmUgZG9uZVxuICAgIC8vIGFmdGVyIHNldHRpbmcgdGhlIG5ldyBgdGhpcy5fbG9jYWxQYXRoYC5cbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9uQ291bnQgPiAwKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVUb05hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICAgIH1cbiAgfVxuXG4gIGdldEVudHJpZXNTeW5jKCk6IEFycmF5PFJlbW90ZUZpbGUgfCBSZW1vdGVEaXJlY3Rvcnk+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgLypcbiAgICogQ2FsbHMgYGNhbGxiYWNrYCB3aXRoIGVpdGhlciBhbiBBcnJheSBvZiBlbnRyaWVzIG9yIGFuIEVycm9yIGlmIHRoZXJlIHdhcyBhIHByb2JsZW0gZmV0Y2hpbmdcbiAgICogdGhvc2UgZW50cmllcy5cbiAgICpcbiAgICogTm90ZTogQWx0aG91Z2ggdGhpcyBmdW5jdGlvbiBpcyBgYXN5bmNgLCBpdCBuZXZlciByZWplY3RzLiBDaGVjayB3aGV0aGVyIHRoZSBgZXJyb3JgIGFyZ3VtZW50XG4gICAqIHBhc3NlZCB0byBgY2FsbGJhY2tgIGlzIGBudWxsYCB0byBkZXRlcm1pbmUgaWYgdGhlcmUgd2FzIGFuIGVycm9yLlxuICAgKi9cbiAgYXN5bmMgZ2V0RW50cmllcyhcbiAgICBjYWxsYmFjazogKGVycm9yOiA/RXJyb3IsIGVudHJpZXM6ID9BcnJheTxSZW1vdGVEaXJlY3RvcnkgfCBSZW1vdGVGaWxlPikgPT4gYW55LFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgZW50cmllcztcbiAgICB0cnkge1xuICAgICAgZW50cmllcyA9IGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkucmVhZGRpcih0aGlzLl9sb2NhbFBhdGgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNhbGxiYWNrKGUsIG51bGwpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGRpcmVjdG9yaWVzIDogQXJyYXk8UmVtb3RlRGlyZWN0b3J5PiA9IFtdO1xuICAgIGNvbnN0IGZpbGVzID0gW107XG4gICAgZW50cmllcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICByZXR1cm4gYS5maWxlLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShiLmZpbGUudG9Mb3dlckNhc2UoKSk7XG4gICAgfSkuZm9yRWFjaCgoZW50cnkpID0+IHtcbiAgICAgIGludmFyaWFudChlbnRyeSk7XG4gICAgICBjb25zdCB1cmkgPSB0aGlzLl9ob3N0ICsgcGF0aC5qb2luKHRoaXMuX2xvY2FsUGF0aCwgZW50cnkuZmlsZSk7XG4gICAgICBpZiAoZW50cnkuc3RhdHMgJiYgZW50cnkuc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgZmlsZXMucHVzaCh0aGlzLl9yZW1vdGUuY3JlYXRlRmlsZSh1cmkpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRpcmVjdG9yaWVzLnB1c2godGhpcy5fcmVtb3RlLmNyZWF0ZURpcmVjdG9yeSh1cmkpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjYWxsYmFjayhudWxsLCBkaXJlY3Rvcmllcy5jb25jYXQoZmlsZXMpKTtcbiAgfVxuXG4gIGNvbnRhaW5zKHBhdGhUb0NoZWNrOiA/c3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8gQ2FuJ3QganVzdCBkbyBzdGFydHNXaXRoIGhlcmUuIElmIHRoaXMgZGlyZWN0b3J5IGlzIFwid3d3XCIgYW5kIHlvdVxuICAgIC8vIGFyZSB0cnlpbmcgdG8gY2hlY2sgXCJ3d3ctYmFzZVwiLCBqdXN0IHVzaW5nIHN0YXJ0c1dpdGggd291bGQgcmV0dXJuXG4gICAgLy8gdHJ1ZSwgZXZlbiB0aG91Z2ggXCJ3d3ctYmFzZVwiIGlzIGF0IHRoZSBzYW1lIGxldmVsIGFzIFwiV3d3XCIsIG5vdFxuICAgIC8vIGNvbnRhaW5lZCBpbiBpdC5cbiAgICAvLyBTbyBmaXJzdCBjaGVjayBzdGFydHNXaXRoLiBJZiBzbywgdGhlbiBpZiB0aGUgdHdvIHBhdGggbGVuZ3RocyBhcmVcbiAgICAvLyBlcXVhbCBPUiBpZiB0aGUgbmV4dCBjaGFyYWN0ZXIgaW4gdGhlIHBhdGggdG8gY2hlY2sgaXMgYSBwYXRoXG4gICAgLy8gc2VwYXJhdG9yLCB0aGVuIHdlIGtub3cgdGhlIGNoZWNrZWQgcGF0aCBpcyBpbiB0aGlzIHBhdGguXG4gICAgY29uc3QgZW5kSW5kZXggPSB0aGlzLmdldFBhdGgoKS5zbGljZSgtMSkgPT09IHBhdGguc2VwXG4gICAgICAgICAgICAgICAgICAgPyB0aGlzLmdldFBhdGgoKS5sZW5ndGggLSAxXG4gICAgICAgICAgICAgICAgICAgOiB0aGlzLmdldFBhdGgoKS5sZW5ndGg7XG4gICAgcmV0dXJuIHBhdGhUb0NoZWNrICE9IG51bGxcbiAgICAgICYmIHBhdGhUb0NoZWNrLnN0YXJ0c1dpdGgodGhpcy5nZXRQYXRoKCkpXG4gICAgICAmJiAocGF0aFRvQ2hlY2subGVuZ3RoID09PSB0aGlzLmdldFBhdGgoKS5sZW5ndGhcbiAgICAgICAgICB8fCBwYXRoVG9DaGVjay5jaGFyQXQoZW5kSW5kZXgpID09PSBwYXRoLnNlcCk7XG4gIH1cblxuICBvZmYoKSB7XG4gICAgLy8gVGhpcyBtZXRob2QgaXMgcGFydCBvZiB0aGUgRW1pdHRlck1peGluIHVzZWQgYnkgQXRvbSdzIGxvY2FsIERpcmVjdG9yeSwgYnV0IG5vdCBkb2N1bWVudGVkXG4gICAgLy8gYXMgcGFydCBvZiB0aGUgQVBJIC0gaHR0cHM6Ly9hdG9tLmlvL2RvY3MvYXBpL2xhdGVzdC9EaXJlY3RvcnksXG4gICAgLy8gSG93ZXZlciwgaXQgYXBwZWFycyB0byBiZSBjYWxsZWQgaW4gcHJvamVjdC5jb2ZmZWUgYnkgQXRvbS5cbiAgfVxuXG4gIC8vIEEgd29ya2Fyb3VuZCBiZWZvcmUgQXRvbSAyLjA6IHNlZSA6OmdldEhnUmVwb0luZm8gb2YgbWFpbi5qcy5cbiAgZ2V0SGdSZXBvc2l0b3J5RGVzY3JpcHRpb24oKTogP0hnUmVwb3NpdG9yeURlc2NyaXB0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5faGdSZXBvc2l0b3J5RGVzY3JpcHRpb247XG4gIH1cblxuICBfZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKTogRmlsZVN5c3RlbVNlcnZpY2Uge1xuICAgIHJldHVybiB0aGlzLl9nZXRTZXJ2aWNlKCdGaWxlU3lzdGVtU2VydmljZScpO1xuICB9XG5cbiAgX2dldFNlcnZpY2Uoc2VydmljZU5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX3JlbW90ZS5nZXRTZXJ2aWNlKHNlcnZpY2VOYW1lKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlbW90ZURpcmVjdG9yeTtcbiJdfQ==