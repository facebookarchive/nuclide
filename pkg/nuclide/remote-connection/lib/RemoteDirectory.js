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
//# sourceMappingURL=data:application/json;base64,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QU87QUFDcEMsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUM3Qzs7O1NBblJHLGVBQWU7OztBQXNSckIsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiUmVtb3RlRGlyZWN0b3J5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0ZpbGVTeXN0ZW1TZXJ2aWNlfSBmcm9tICcuLi8uLi9zZXJ2ZXIvbGliL3NlcnZpY2VzL0ZpbGVTeXN0ZW1TZXJ2aWNlVHlwZSc7XG5pbXBvcnQgdHlwZSB7T2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuaW1wb3J0IHR5cGUge1JlbW90ZUNvbm5lY3Rpb259IGZyb20gJy4vUmVtb3RlQ29ubmVjdGlvbic7XG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5RGVzY3JpcHRpb259IGZyb20gJy4uLy4uL3NvdXJjZS1jb250cm9sLWhlbHBlcnMnO1xuaW1wb3J0IHR5cGUgUmVtb3RlRmlsZSBmcm9tICcuL1JlbW90ZUZpbGUnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7RGlzcG9zYWJsZSwgRW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5pbXBvcnQgcmVtb3RlVXJpIGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuY29uc3QgTUFSS0VSX1BST1BFUlRZX0ZPUl9SRU1PVEVfRElSRUNUT1JZID0gJ19fbnVjbGlkZV9yZW1vdGVfZGlyZWN0b3J5X18nO1xuXG4vKiBNb3N0bHkgaW1wbGVtZW50cyBodHRwczovL2F0b20uaW8vZG9jcy9hcGkvbGF0ZXN0L0RpcmVjdG9yeSAqL1xuY2xhc3MgUmVtb3RlRGlyZWN0b3J5IHtcbiAgc3RhdGljIGlzUmVtb3RlRGlyZWN0b3J5KGRpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkgfCBSZW1vdGVEaXJlY3RvcnkpOiBib29sZWFuIHtcbiAgICAvKiAkRmxvd0ZpeE1lICovXG4gICAgcmV0dXJuIGRpcmVjdG9yeVtNQVJLRVJfUFJPUEVSVFlfRk9SX1JFTU9URV9ESVJFQ1RPUlldID09PSB0cnVlO1xuICB9XG5cbiAgX3dhdGNoU3Vic2NyaXB0aW9uOiA/YXRvbSREaXNwb3NhYmxlO1xuICBfcmVtb3RlOiBSZW1vdGVDb25uZWN0aW9uO1xuICBfdXJpOiBzdHJpbmc7XG4gIF9lbWl0dGVyOiBhdG9tJEVtaXR0ZXI7XG4gIF9zdWJzY3JpcHRpb25Db3VudDogbnVtYmVyO1xuICBfaG9zdDogc3RyaW5nO1xuICBfbG9jYWxQYXRoOiBzdHJpbmc7XG4gIF9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbjogP0hnUmVwb3NpdG9yeURlc2NyaXB0aW9uO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gdXJpIHNob3VsZCBiZSBvZiB0aGUgZm9ybSBcIm51Y2xpZGU6Ly9leGFtcGxlLmNvbTo5MDkwL3BhdGgvdG8vZGlyZWN0b3J5XCIuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihyZW1vdGU6IFJlbW90ZUNvbm5lY3Rpb24sIHVyaTogc3RyaW5nLCBvcHRpb25zOiA/YW55KSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIE1BUktFUl9QUk9QRVJUWV9GT1JfUkVNT1RFX0RJUkVDVE9SWSwge3ZhbHVlOiB0cnVlfSk7XG4gICAgdGhpcy5fcmVtb3RlID0gcmVtb3RlO1xuICAgIHRoaXMuX3VyaSA9IHVyaTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25Db3VudCA9IDA7XG4gICAgY29uc3Qge3BhdGg6IGRpcmVjdG9yeVBhdGgsIHByb3RvY29sLCBob3N0fSA9IHJlbW90ZVVyaS5wYXJzZSh1cmkpO1xuICAgIGludmFyaWFudChwcm90b2NvbCk7XG4gICAgaW52YXJpYW50KGhvc3QpO1xuICAgIC8qKiBJbiB0aGUgZXhhbXBsZSwgdGhpcyB3b3VsZCBiZSBcIm51Y2xpZGU6Ly9leGFtcGxlLmNvbTo5MDkwXCIuICovXG4gICAgdGhpcy5faG9zdCA9IHByb3RvY29sICsgJy8vJyArIGhvc3Q7XG4gICAgLyoqIEluIHRoZSBleGFtcGxlLCB0aGlzIHdvdWxkIGJlIFwiL3BhdGgvdG8vZGlyZWN0b3J5XCIuICovXG4gICAgdGhpcy5fbG9jYWxQYXRoID0gZGlyZWN0b3J5UGF0aDtcbiAgICAvLyBBIHdvcmthcm91bmQgYmVmb3JlIEF0b20gMi4wOiBzZWUgOjpnZXRIZ1JlcG9JbmZvIG9mIG1haW4uanMuXG4gICAgdGhpcy5faGdSZXBvc2l0b3J5RGVzY3JpcHRpb24gPSBvcHRpb25zID8gb3B0aW9ucy5oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbiA6IG51bGw7XG4gIH1cblxuICBvbkRpZENoYW5nZShjYWxsYmFjazogKCkgPT4gYW55KTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICB0aGlzLl93aWxsQWRkU3Vic2NyaXB0aW9uKCk7XG4gICAgcmV0dXJuIHRoaXMuX3RyYWNrVW5zdWJzY3JpcHRpb24odGhpcy5fZW1pdHRlci5vbignZGlkLWNoYW5nZScsIGNhbGxiYWNrKSk7XG4gIH1cblxuICBfd2lsbEFkZFN1YnNjcmlwdGlvbigpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25Db3VudCsrO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVUb05hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gc3Vic2NyaWJlIFJlbW90ZURpcmVjdG9yeTonLCB0aGlzLl9sb2NhbFBhdGgsIGVycik7XG4gICAgfVxuICB9XG5cbiAgX3N1YnNjcmliZVRvTmF0aXZlQ2hhbmdlRXZlbnRzKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl93YXRjaFN1YnNjcmlwdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7d2F0Y2hEaXJlY3Rvcnl9ID0gdGhpcy5fZ2V0U2VydmljZSgnRmlsZVdhdGNoZXJTZXJ2aWNlJyk7XG4gICAgY29uc3Qgd2F0Y2hTdHJlYW0gPSB3YXRjaERpcmVjdG9yeSh0aGlzLl91cmkpO1xuICAgIHRoaXMuX3dhdGNoU3Vic2NyaXB0aW9uID0gd2F0Y2hTdHJlYW0uc3Vic2NyaWJlKHdhdGNoVXBkYXRlID0+IHtcbiAgICAgIGxvZ2dlci5kZWJ1Zyhgd2F0Y2hEaXJlY3RvcnkgdXBkYXRlOmAsIHdhdGNoVXBkYXRlKTtcbiAgICAgIGlmICh3YXRjaFVwZGF0ZS50eXBlID09PSAnY2hhbmdlJykge1xuICAgICAgICByZXR1cm4gdGhpcy5faGFuZGxlTmF0aXZlQ2hhbmdlRXZlbnQoKTtcbiAgICAgIH1cbiAgICB9LCBlcnJvciA9PiB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byBzdWJzY3JpYmUgUmVtb3RlRGlyZWN0b3J5OicsIHRoaXMuX3VyaSwgZXJyb3IpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIC8vIE5vdGhpbmcgbmVlZHMgdG8gYmUgZG9uZSBpZiB0aGUgcm9vdCBkaXJlY3Rvcnkgd2F0Y2ggaGFzIGVuZGVkLlxuICAgICAgbG9nZ2VyLmRlYnVnKGB3YXRjaERpcmVjdG9yeSBlbmRlZDogJHt0aGlzLl91cml9YCk7XG4gICAgfSk7XG4gIH1cblxuICBfaGFuZGxlTmF0aXZlQ2hhbmdlRXZlbnQoKTogdm9pZCB7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlJyk7XG4gIH1cblxuICBfdHJhY2tVbnN1YnNjcmlwdGlvbihzdWJzY3JpcHRpb246IGF0b20kRGlzcG9zYWJsZSk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9kaWRSZW1vdmVTdWJzY3JpcHRpb24oKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9kaWRSZW1vdmVTdWJzY3JpcHRpb24oKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uQ291bnQtLTtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9uQ291bnQgPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLl91bnN1YnNjcmliZUZyb21OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICB9XG4gIH1cblxuICBfdW5zdWJzY3JpYmVGcm9tTmF0aXZlQ2hhbmdlRXZlbnRzKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl93YXRjaFN1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGlzRmlsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpc0RpcmVjdG9yeSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlzUm9vdCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNSb290KHRoaXMuX2xvY2FsUGF0aCk7XG4gIH1cblxuICBleGlzdHMoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkuZXhpc3RzKHRoaXMuX2xvY2FsUGF0aCk7XG4gIH1cblxuICBleGlzdHNTeW5jKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIF9pc1Jvb3QoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGZpbGVQYXRoID0gcGF0aC5ub3JtYWxpemUoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHBhcnRzID0gcGF0aC5wYXJzZShmaWxlUGF0aCk7XG4gICAgcmV0dXJuIHBhcnRzLnJvb3QgPT09IGZpbGVQYXRoO1xuICB9XG5cbiAgZ2V0UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl91cmk7XG4gIH1cblxuICBnZXRMb2NhbFBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fbG9jYWxQYXRoO1xuICB9XG5cbiAgZ2V0SG9zdCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9ob3N0O1xuICB9XG5cbiAgZ2V0UmVhbFBhdGhTeW5jKCk6IHN0cmluZyB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIGdldEJhc2VOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhdGguYmFzZW5hbWUodGhpcy5fbG9jYWxQYXRoKTtcbiAgfVxuXG4gIHJlbGF0aXZpemUodXJpOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghdXJpKSB7XG4gICAgICByZXR1cm4gdXJpO1xuICAgIH1cbiAgICAvLyBOb3RlOiBob3N0IG9mIHVyaSBtdXN0IG1hdGNoIHRoaXMuX2hvc3QuXG4gICAgY29uc3Qgc3VicGF0aCA9IHJlbW90ZVVyaS5wYXJzZSh1cmkpLnBhdGg7XG4gICAgcmV0dXJuIHBhdGgucmVsYXRpdmUodGhpcy5fbG9jYWxQYXRoLCBzdWJwYXRoKTtcbiAgfVxuXG4gIGdldFBhcmVudCgpOiBSZW1vdGVEaXJlY3Rvcnkge1xuICAgIGlmICh0aGlzLmlzUm9vdCgpKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdXJpID0gdGhpcy5faG9zdCArIHBhdGgubm9ybWFsaXplKHBhdGguam9pbih0aGlzLl9sb2NhbFBhdGgsICcuLicpKTtcbiAgICAgIHJldHVybiB0aGlzLl9yZW1vdGUuY3JlYXRlRGlyZWN0b3J5KHVyaSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0RmlsZShmaWxlbmFtZTogc3RyaW5nKTogUmVtb3RlRmlsZSB7XG4gICAgY29uc3QgdXJpID0gdGhpcy5faG9zdCArIHBhdGguam9pbih0aGlzLl9sb2NhbFBhdGgsIGZpbGVuYW1lKTtcbiAgICByZXR1cm4gdGhpcy5fcmVtb3RlLmNyZWF0ZUZpbGUodXJpKTtcbiAgfVxuXG4gIGdldFN1YmRpcmVjdG9yeShkaXJuYW1lOiBzdHJpbmcpOiBSZW1vdGVEaXJlY3Rvcnkge1xuICAgIGNvbnN0IHVyaSA9IHRoaXMuX2hvc3QgKyBwYXRoLmpvaW4odGhpcy5fbG9jYWxQYXRoLCBkaXJuYW1lKTtcbiAgICByZXR1cm4gdGhpcy5fcmVtb3RlLmNyZWF0ZURpcmVjdG9yeSh1cmkpO1xuICB9XG5cbiAgYXN5bmMgY3JlYXRlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGNyZWF0ZWQgPSBhd2FpdCB0aGlzLl9nZXRGaWxlU3lzdGVtU2VydmljZSgpLm1rZGlycCh0aGlzLl9sb2NhbFBhdGgpO1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25Db3VudCA+IDApIHtcbiAgICAgIHRoaXMuX3N1YnNjcmliZVRvTmF0aXZlQ2hhbmdlRXZlbnRzKCk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVkO1xuICB9XG5cbiAgYXN5bmMgZGVsZXRlKCk6IFByb21pc2Uge1xuICAgIGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkucm1kaXIodGhpcy5fbG9jYWxQYXRoKTtcbiAgICB0aGlzLl91bnN1YnNjcmliZUZyb21OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5hbWVzIHRoaXMgZGlyZWN0b3J5IHRvIHRoZSBnaXZlbiBhYnNvbHV0ZSBwYXRoLlxuICAgKi9cbiAgYXN5bmMgcmVuYW1lKG5ld1BhdGg6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkucmVuYW1lKHRoaXMuX2xvY2FsUGF0aCwgbmV3UGF0aCk7XG5cbiAgICAvLyBVbnN1YnNjcmliZSBmcm9tIHRoZSBvbGQgYHRoaXMuX2xvY2FsUGF0aGAuIFRoaXMgbXVzdCBiZSBkb25lIGJlZm9yZVxuICAgIC8vIHNldHRpbmcgdGhlIG5ldyBgdGhpcy5fbG9jYWxQYXRoYC5cbiAgICB0aGlzLl91bnN1YnNjcmliZUZyb21OYXRpdmVDaGFuZ2VFdmVudHMoKTtcblxuICAgIGNvbnN0IHtwcm90b2NvbCwgaG9zdH0gPSByZW1vdGVVcmkucGFyc2UodGhpcy5fdXJpKTtcbiAgICB0aGlzLl9sb2NhbFBhdGggPSBuZXdQYXRoO1xuICAgIGludmFyaWFudChwcm90b2NvbCk7XG4gICAgaW52YXJpYW50KGhvc3QpO1xuICAgIHRoaXMuX3VyaSA9IHByb3RvY29sICsgJy8vJyArIGhvc3QgKyB0aGlzLl9sb2NhbFBhdGg7XG5cbiAgICAvLyBTdWJzY3JpYmUgdG8gY2hhbmdlcyBmb3IgdGhlIG5ldyBgdGhpcy5fbG9jYWxQYXRoYC4gVGhpcyBtdXN0IGJlIGRvbmVcbiAgICAvLyBhZnRlciBzZXR0aW5nIHRoZSBuZXcgYHRoaXMuX2xvY2FsUGF0aGAuXG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbkNvdW50ID4gMCkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlVG9OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICB9XG4gIH1cblxuICBnZXRFbnRyaWVzU3luYygpOiBBcnJheTxSZW1vdGVGaWxlIHwgUmVtb3RlRGlyZWN0b3J5PiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIC8qXG4gICAqIENhbGxzIGBjYWxsYmFja2Agd2l0aCBlaXRoZXIgYW4gQXJyYXkgb2YgZW50cmllcyBvciBhbiBFcnJvciBpZiB0aGVyZSB3YXMgYSBwcm9ibGVtIGZldGNoaW5nXG4gICAqIHRob3NlIGVudHJpZXMuXG4gICAqXG4gICAqIE5vdGU6IEFsdGhvdWdoIHRoaXMgZnVuY3Rpb24gaXMgYGFzeW5jYCwgaXQgbmV2ZXIgcmVqZWN0cy4gQ2hlY2sgd2hldGhlciB0aGUgYGVycm9yYCBhcmd1bWVudFxuICAgKiBwYXNzZWQgdG8gYGNhbGxiYWNrYCBpcyBgbnVsbGAgdG8gZGV0ZXJtaW5lIGlmIHRoZXJlIHdhcyBhbiBlcnJvci5cbiAgICovXG4gIGFzeW5jIGdldEVudHJpZXMoXG4gICAgY2FsbGJhY2s6IChlcnJvcjogP0Vycm9yLCBlbnRyaWVzOiA/QXJyYXk8UmVtb3RlRGlyZWN0b3J5IHwgUmVtb3RlRmlsZT4pID0+IGFueSxcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IGVudHJpZXM7XG4gICAgdHJ5IHtcbiAgICAgIGVudHJpZXMgPSBhd2FpdCB0aGlzLl9nZXRGaWxlU3lzdGVtU2VydmljZSgpLnJlYWRkaXIodGhpcy5fbG9jYWxQYXRoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjYWxsYmFjayhlLCBudWxsKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkaXJlY3RvcmllcyA6IEFycmF5PFJlbW90ZURpcmVjdG9yeT4gPSBbXTtcbiAgICBjb25zdCBmaWxlcyA9IFtdO1xuICAgIGVudHJpZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgcmV0dXJuIGEuZmlsZS50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoYi5maWxlLnRvTG93ZXJDYXNlKCkpO1xuICAgIH0pLmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgICBpbnZhcmlhbnQoZW50cnkpO1xuICAgICAgY29uc3QgdXJpID0gdGhpcy5faG9zdCArIHBhdGguam9pbih0aGlzLl9sb2NhbFBhdGgsIGVudHJ5LmZpbGUpO1xuICAgICAgaWYgKGVudHJ5LnN0YXRzICYmIGVudHJ5LnN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgIGZpbGVzLnB1c2godGhpcy5fcmVtb3RlLmNyZWF0ZUZpbGUodXJpKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaXJlY3Rvcmllcy5wdXNoKHRoaXMuX3JlbW90ZS5jcmVhdGVEaXJlY3RvcnkodXJpKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY2FsbGJhY2sobnVsbCwgZGlyZWN0b3JpZXMuY29uY2F0KGZpbGVzKSk7XG4gIH1cblxuICBjb250YWlucyhwYXRoVG9DaGVjazogP3N0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIENhbid0IGp1c3QgZG8gc3RhcnRzV2l0aCBoZXJlLiBJZiB0aGlzIGRpcmVjdG9yeSBpcyBcInd3d1wiIGFuZCB5b3VcbiAgICAvLyBhcmUgdHJ5aW5nIHRvIGNoZWNrIFwid3d3LWJhc2VcIiwganVzdCB1c2luZyBzdGFydHNXaXRoIHdvdWxkIHJldHVyblxuICAgIC8vIHRydWUsIGV2ZW4gdGhvdWdoIFwid3d3LWJhc2VcIiBpcyBhdCB0aGUgc2FtZSBsZXZlbCBhcyBcIld3d1wiLCBub3RcbiAgICAvLyBjb250YWluZWQgaW4gaXQuXG4gICAgLy8gU28gZmlyc3QgY2hlY2sgc3RhcnRzV2l0aC4gSWYgc28sIHRoZW4gaWYgdGhlIHR3byBwYXRoIGxlbmd0aHMgYXJlXG4gICAgLy8gZXF1YWwgT1IgaWYgdGhlIG5leHQgY2hhcmFjdGVyIGluIHRoZSBwYXRoIHRvIGNoZWNrIGlzIGEgcGF0aFxuICAgIC8vIHNlcGFyYXRvciwgdGhlbiB3ZSBrbm93IHRoZSBjaGVja2VkIHBhdGggaXMgaW4gdGhpcyBwYXRoLlxuICAgIGNvbnN0IGVuZEluZGV4ID0gdGhpcy5nZXRQYXRoKCkuc2xpY2UoLTEpID09PSBwYXRoLnNlcFxuICAgICAgICAgICAgICAgICAgID8gdGhpcy5nZXRQYXRoKCkubGVuZ3RoIC0gMVxuICAgICAgICAgICAgICAgICAgIDogdGhpcy5nZXRQYXRoKCkubGVuZ3RoO1xuICAgIHJldHVybiBwYXRoVG9DaGVjayAhPSBudWxsXG4gICAgICAmJiBwYXRoVG9DaGVjay5zdGFydHNXaXRoKHRoaXMuZ2V0UGF0aCgpKVxuICAgICAgJiYgKHBhdGhUb0NoZWNrLmxlbmd0aCA9PT0gdGhpcy5nZXRQYXRoKCkubGVuZ3RoXG4gICAgICAgICAgfHwgcGF0aFRvQ2hlY2suY2hhckF0KGVuZEluZGV4KSA9PT0gcGF0aC5zZXApO1xuICB9XG5cbiAgb2ZmKCkge1xuICAgIC8vIFRoaXMgbWV0aG9kIGlzIHBhcnQgb2YgdGhlIEVtaXR0ZXJNaXhpbiB1c2VkIGJ5IEF0b20ncyBsb2NhbCBEaXJlY3RvcnksIGJ1dCBub3QgZG9jdW1lbnRlZFxuICAgIC8vIGFzIHBhcnQgb2YgdGhlIEFQSSAtIGh0dHBzOi8vYXRvbS5pby9kb2NzL2FwaS9sYXRlc3QvRGlyZWN0b3J5LFxuICAgIC8vIEhvd2V2ZXIsIGl0IGFwcGVhcnMgdG8gYmUgY2FsbGVkIGluIHByb2plY3QuY29mZmVlIGJ5IEF0b20uXG4gIH1cblxuICAvLyBBIHdvcmthcm91bmQgYmVmb3JlIEF0b20gMi4wOiBzZWUgOjpnZXRIZ1JlcG9JbmZvIG9mIG1haW4uanMuXG4gIGdldEhnUmVwb3NpdG9yeURlc2NyaXB0aW9uKCk6ID9IZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uO1xuICB9XG5cbiAgX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCk6IEZpbGVTeXN0ZW1TZXJ2aWNlIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U2VydmljZSgnRmlsZVN5c3RlbVNlcnZpY2UnKTtcbiAgfVxuXG4gIF9nZXRTZXJ2aWNlKHNlcnZpY2VOYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl9yZW1vdGUuZ2V0U2VydmljZShzZXJ2aWNlTmFtZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW1vdGVEaXJlY3Rvcnk7XG4iXX0=