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

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _atom = require('atom');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var _nuclideLogging = require('../../nuclide-logging');

var logger = (0, _nuclideLogging.getLogger)();

/* Mostly implements https://atom.io/docs/api/latest/File */

var RemoteFile = (function () {
  function RemoteFile(server, remotePath) {
    var symlink = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    _classCallCheck(this, RemoteFile);

    this._server = server;

    var _remoteUri$parse = _nuclideRemoteUri2['default'].parse(remotePath);

    var localPath = _remoteUri$parse.path;

    this._localPath = localPath;
    this._path = remotePath;
    this._emitter = new _atom.Emitter();
    this._subscriptionCount = 0;
    this._deleted = false;
    this._symlink = symlink;
  }

  _createClass(RemoteFile, [{
    key: 'onDidChange',
    value: function onDidChange(callback) {
      this._willAddSubscription();
      return this._trackUnsubscription(this._emitter.on('did-change', callback));
    }
  }, {
    key: 'onDidRename',
    value: function onDidRename(callback) {
      this._willAddSubscription();
      return this._trackUnsubscription(this._emitter.on('did-rename', callback));
    }
  }, {
    key: 'onDidDelete',
    value: function onDidDelete(callback) {
      this._willAddSubscription();
      return this._trackUnsubscription(this._emitter.on('did-delete', callback));
    }
  }, {
    key: '_willAddSubscription',
    value: function _willAddSubscription() {
      this._subscriptionCount++;
      return this._subscribeToNativeChangeEvents();
    }
  }, {
    key: '_subscribeToNativeChangeEvents',
    value: function _subscribeToNativeChangeEvents() {
      var _this = this;

      if (this._watchSubscription) {
        return;
      }

      var _ref = this._getService('FileWatcherService');

      var watchFile = _ref.watchFile;

      var watchStream = watchFile(this._path);
      this._watchSubscription = watchStream.subscribe(function (watchUpdate) {
        logger.debug('watchFile update:', watchUpdate);
        switch (watchUpdate.type) {
          case 'change':
            return _this._handleNativeChangeEvent();
          case 'delete':
            return _this._handleNativeDeleteEvent();
          case 'rename':
            return _this._handleNativeRenameEvent(watchUpdate.path);
        }
      }, function (error) {
        logger.error('Failed to subscribe RemoteFile:', _this._path, error);
      }, function () {
        // Nothing needs to be done if the root directory watch has ended.
        logger.debug('watchFile ended: ' + _this._path);
      });
    }
  }, {
    key: '_handleNativeChangeEvent',
    value: _asyncToGenerator(function* () {
      // Don't bother checking the file - this can be very expensive.
      this._emitter.emit('did-change');
    })
  }, {
    key: '_handleNativeRenameEvent',
    value: function _handleNativeRenameEvent(newPath) {
      this._unsubscribeFromNativeChangeEvents();

      var _remoteUri$parse2 = _nuclideRemoteUri2['default'].parse(this._path);

      var protocol = _remoteUri$parse2.protocol;
      var host = _remoteUri$parse2.host;

      this._localPath = newPath;
      (0, _assert2['default'])(protocol);
      (0, _assert2['default'])(host);
      this._path = protocol + '//' + host + this._localPath;
      this._subscribeToNativeChangeEvents();
      this._emitter.emit('did-rename');
    }
  }, {
    key: '_handleNativeDeleteEvent',
    value: function _handleNativeDeleteEvent() {
      this._unsubscribeFromNativeChangeEvents();
      if (!this._deleted) {
        this._deleted = true;
        this._emitter.emit('did-delete');
      }
    }

    /*
     * Return a new Disposable that upon dispose, will remove the bound watch subscription.
     * When the number of subscriptions reach 0, the file is unwatched.
     */
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
        this._unsubscribeFromNativeChangeEvents();
      }
    }
  }, {
    key: '_unsubscribeFromNativeChangeEvents',
    value: function _unsubscribeFromNativeChangeEvents() {
      if (this._watchSubscription) {
        this._watchSubscription.unsubscribe();
        this._watchSubscription = null;
      }
    }
  }, {
    key: 'onWillThrowWatchError',
    value: function onWillThrowWatchError(callback) {
      return this._emitter.on('will-throw-watch-error', callback);
    }
  }, {
    key: 'isFile',
    value: function isFile() {
      return true;
    }
  }, {
    key: 'isDirectory',
    value: function isDirectory() {
      return false;
    }
  }, {
    key: 'exists',
    value: function exists() {
      return this._getFileSystemService().exists(this._localPath);
    }
  }, {
    key: 'existsSync',
    value: function existsSync() {
      return true;
    }
  }, {
    key: 'getDigestSync',
    value: function getDigestSync() {
      if (this._digest) {
        return this._digest;
      } else {
        throw new Error('getDigestSync is not supported in RemoteFile');
      }
    }
  }, {
    key: 'getDigest',
    value: _asyncToGenerator(function* () {
      if (this._digest) {
        return this._digest;
      }
      yield this.read();
      (0, _assert2['default'])(this._digest);
      return this._digest;
    })
  }, {
    key: '_setDigest',
    value: function _setDigest(contents) {
      var hash = _crypto2['default'].createHash('sha1').update(contents || '');
      (0, _assert2['default'])(hash);
      this._digest = hash.digest('hex');
    }
  }, {
    key: 'setEncoding',
    value: function setEncoding(encoding) {
      this._encoding = encoding;
    }
  }, {
    key: 'getEncoding',
    value: function getEncoding() {
      return this._encoding;
    }
  }, {
    key: 'getPath',
    value: function getPath() {
      return this._path;
    }
  }, {
    key: 'getLocalPath',
    value: function getLocalPath() {
      return this._localPath;
    }
  }, {
    key: 'getRealPathSync',
    value: function getRealPathSync() {
      return this._realpath || this._path;
    }
  }, {
    key: 'getRealPath',
    value: _asyncToGenerator(function* () {
      if (this._realpath == null) {
        this._realpath = yield this._getFileSystemService().realpath(this._localPath);
      }
      (0, _assert2['default'])(this._realpath);
      return this._realpath;
    })
  }, {
    key: 'getBaseName',
    value: function getBaseName() {
      return _path2['default'].basename(this._path);
    }
  }, {
    key: 'create',
    value: _asyncToGenerator(function* () {
      var wasCreated = yield this._getFileSystemService().newFile(this._localPath);
      if (this._subscriptionCount > 0) {
        this._subscribeToNativeChangeEvents();
      }
      return wasCreated;
    })
  }, {
    key: 'delete',
    value: _asyncToGenerator(function* () {
      try {
        yield this._getFileSystemService().unlink(this._localPath);
        this._handleNativeDeleteEvent();
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    })
  }, {
    key: 'rename',
    value: _asyncToGenerator(function* (newPath) {
      yield this._getFileSystemService().rename(this._localPath, newPath);
      this._handleNativeRenameEvent(newPath);
    })
  }, {
    key: 'copy',
    value: _asyncToGenerator(function* (newPath) {
      var wasCopied = yield this._getFileSystemService().copy(this._localPath, newPath);
      this._subscribeToNativeChangeEvents();
      return wasCopied;
    })
  }, {
    key: 'read',
    value: _asyncToGenerator(function* (flushCache) {
      var data = yield this._getFileSystemService().readFile(this._localPath);
      var contents = data.toString();
      this._setDigest(contents);
      // TODO: respect encoding
      return contents;
    })
  }, {
    key: 'readSync',
    value: function readSync(flushcache) {
      throw new Error('readSync is not supported in RemoteFile');
    }
  }, {
    key: 'write',
    value: _asyncToGenerator(function* (text) {
      var previouslyExisted = yield this.exists();
      yield this._getFileSystemService().writeFile(this._localPath, text);
      if (!previouslyExisted && this._subscriptionCount > 0) {
        this._subscribeToNativeChangeEvents();
      }
    })
  }, {
    key: 'getParent',
    value: function getParent() {
      var _remoteUri$parse3 = _nuclideRemoteUri2['default'].parse(this._path);

      var localPath = _remoteUri$parse3.path;
      var protocol = _remoteUri$parse3.protocol;
      var host = _remoteUri$parse3.host;

      (0, _assert2['default'])(protocol);
      (0, _assert2['default'])(host);
      var directoryPath = protocol + '//' + host + _path2['default'].dirname(localPath);
      var remoteConnection = this._server.getRemoteConnectionForUri(this._path);
      var hgRepositoryDescription = remoteConnection != null ? remoteConnection.getHgRepositoryDescription() : null;
      return this._server.createDirectory(directoryPath, hgRepositoryDescription);
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

  return RemoteFile;
})();

exports.RemoteFile = RemoteFile;
//# sourceMappingURL=data:application/json;base64,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V0FBVyxDQUFDLG1CQUFtQixDQUFDLENBQUM7S0FDOUM7OztXQUVVLHFCQUFDLFdBQW1CLEVBQU87QUFDcEMsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUM3Qzs7O1NBL1FVLFVBQVUiLCJmaWxlIjoiUmVtb3RlRmlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtTZXJ2ZXJDb25uZWN0aW9ufSBmcm9tICcuL1NlcnZlckNvbm5lY3Rpb24nO1xuaW1wb3J0IHR5cGUge1JlbW90ZURpcmVjdG9yeX0gZnJvbSAnLi9SZW1vdGVEaXJlY3RvcnknO1xuaW1wb3J0IHR5cGUge0ZpbGVTeXN0ZW1TZXJ2aWNlfSBmcm9tICcuLi8uLi9udWNsaWRlLXNlcnZlci9saWIvc2VydmljZXMvRmlsZVN5c3RlbVNlcnZpY2VUeXBlJztcbmltcG9ydCB0eXBlb2YgKiBhcyBGaWxlV2F0Y2hlclNlcnZpY2UgZnJvbSAnLi4vLi4vbnVjbGlkZS1maWxld2F0Y2hlci1iYXNlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgY3J5cHRvIGZyb20gJ2NyeXB0byc7XG5pbXBvcnQge0Rpc3Bvc2FibGUsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHJlbW90ZVVyaSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG4vKiBNb3N0bHkgaW1wbGVtZW50cyBodHRwczovL2F0b20uaW8vZG9jcy9hcGkvbGF0ZXN0L0ZpbGUgKi9cbmV4cG9ydCBjbGFzcyBSZW1vdGVGaWxlIHtcblxuICBfZGVsZXRlZDogYm9vbGVhbjtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9lbmNvZGluZzogP3N0cmluZztcbiAgX2xvY2FsUGF0aDogc3RyaW5nO1xuICBfcGF0aDogc3RyaW5nO1xuICBfcmVhbHBhdGg6ID9zdHJpbmc7XG4gIF9zZXJ2ZXI6IFNlcnZlckNvbm5lY3Rpb247XG4gIF9zdWJzY3JpcHRpb25Db3VudDogbnVtYmVyO1xuICBfd2F0Y2hTdWJzY3JpcHRpb246ID9yeCRJU3Vic2NyaXB0aW9uO1xuICBfZGlnZXN0OiA/c3RyaW5nO1xuICBfc3ltbGluazogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBzZXJ2ZXI6IFNlcnZlckNvbm5lY3Rpb24sXG4gICAgcmVtb3RlUGF0aDogc3RyaW5nLFxuICAgIHN5bWxpbms6IGJvb2xlYW4gPSBmYWxzZSxcbiAgKSB7XG4gICAgdGhpcy5fc2VydmVyID0gc2VydmVyO1xuICAgIGNvbnN0IHtwYXRoOiBsb2NhbFBhdGh9ID0gcmVtb3RlVXJpLnBhcnNlKHJlbW90ZVBhdGgpO1xuICAgIHRoaXMuX2xvY2FsUGF0aCA9IGxvY2FsUGF0aDtcbiAgICB0aGlzLl9wYXRoID0gcmVtb3RlUGF0aDtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25Db3VudCA9IDA7XG4gICAgdGhpcy5fZGVsZXRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3N5bWxpbmsgPSBzeW1saW5rO1xuICB9XG5cbiAgb25EaWRDaGFuZ2UoY2FsbGJhY2s6ICgpID0+IG1peGVkKTogSURpc3Bvc2FibGUge1xuICAgIHRoaXMuX3dpbGxBZGRTdWJzY3JpcHRpb24oKTtcbiAgICByZXR1cm4gdGhpcy5fdHJhY2tVbnN1YnNjcmlwdGlvbih0aGlzLl9lbWl0dGVyLm9uKCdkaWQtY2hhbmdlJywgY2FsbGJhY2spKTtcbiAgfVxuXG4gIG9uRGlkUmVuYW1lKGNhbGxiYWNrOiAoKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICB0aGlzLl93aWxsQWRkU3Vic2NyaXB0aW9uKCk7XG4gICAgcmV0dXJuIHRoaXMuX3RyYWNrVW5zdWJzY3JpcHRpb24odGhpcy5fZW1pdHRlci5vbignZGlkLXJlbmFtZScsIGNhbGxiYWNrKSk7XG4gIH1cblxuICBvbkRpZERlbGV0ZShjYWxsYmFjazogKCkgPT4gbWl4ZWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5fd2lsbEFkZFN1YnNjcmlwdGlvbigpO1xuICAgIHJldHVybiB0aGlzLl90cmFja1Vuc3Vic2NyaXB0aW9uKHRoaXMuX2VtaXR0ZXIub24oJ2RpZC1kZWxldGUnLCBjYWxsYmFjaykpO1xuICB9XG5cbiAgX3dpbGxBZGRTdWJzY3JpcHRpb24oKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uQ291bnQrKztcbiAgICByZXR1cm4gdGhpcy5fc3Vic2NyaWJlVG9OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgfVxuXG4gIF9zdWJzY3JpYmVUb05hdGl2ZUNoYW5nZUV2ZW50cygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qge3dhdGNoRmlsZX0gPSAodGhpcy5fZ2V0U2VydmljZSgnRmlsZVdhdGNoZXJTZXJ2aWNlJyk6IEZpbGVXYXRjaGVyU2VydmljZSk7XG4gICAgY29uc3Qgd2F0Y2hTdHJlYW0gPSB3YXRjaEZpbGUodGhpcy5fcGF0aCk7XG4gICAgdGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24gPSB3YXRjaFN0cmVhbS5zdWJzY3JpYmUod2F0Y2hVcGRhdGUgPT4ge1xuICAgICAgbG9nZ2VyLmRlYnVnKCd3YXRjaEZpbGUgdXBkYXRlOicsIHdhdGNoVXBkYXRlKTtcbiAgICAgIHN3aXRjaCAod2F0Y2hVcGRhdGUudHlwZSkge1xuICAgICAgICBjYXNlICdjaGFuZ2UnOlxuICAgICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVOYXRpdmVDaGFuZ2VFdmVudCgpO1xuICAgICAgICBjYXNlICdkZWxldGUnOlxuICAgICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVOYXRpdmVEZWxldGVFdmVudCgpO1xuICAgICAgICBjYXNlICdyZW5hbWUnOlxuICAgICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVOYXRpdmVSZW5hbWVFdmVudCh3YXRjaFVwZGF0ZS5wYXRoKTtcbiAgICAgIH1cbiAgICB9LCBlcnJvciA9PiB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byBzdWJzY3JpYmUgUmVtb3RlRmlsZTonLCB0aGlzLl9wYXRoLCBlcnJvcik7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgLy8gTm90aGluZyBuZWVkcyB0byBiZSBkb25lIGlmIHRoZSByb290IGRpcmVjdG9yeSB3YXRjaCBoYXMgZW5kZWQuXG4gICAgICBsb2dnZXIuZGVidWcoYHdhdGNoRmlsZSBlbmRlZDogJHt0aGlzLl9wYXRofWApO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX2hhbmRsZU5hdGl2ZUNoYW5nZUV2ZW50KCk6IFByb21pc2Uge1xuICAgIC8vIERvbid0IGJvdGhlciBjaGVja2luZyB0aGUgZmlsZSAtIHRoaXMgY2FuIGJlIHZlcnkgZXhwZW5zaXZlLlxuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZScpO1xuICB9XG5cbiAgX2hhbmRsZU5hdGl2ZVJlbmFtZUV2ZW50KG5ld1BhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3Vuc3Vic2NyaWJlRnJvbU5hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICAgIGNvbnN0IHtwcm90b2NvbCwgaG9zdH0gPSByZW1vdGVVcmkucGFyc2UodGhpcy5fcGF0aCk7XG4gICAgdGhpcy5fbG9jYWxQYXRoID0gbmV3UGF0aDtcbiAgICBpbnZhcmlhbnQocHJvdG9jb2wpO1xuICAgIGludmFyaWFudChob3N0KTtcbiAgICB0aGlzLl9wYXRoID0gcHJvdG9jb2wgKyAnLy8nICsgaG9zdCArIHRoaXMuX2xvY2FsUGF0aDtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb05hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLXJlbmFtZScpO1xuICB9XG5cbiAgX2hhbmRsZU5hdGl2ZURlbGV0ZUV2ZW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3Vuc3Vic2NyaWJlRnJvbU5hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICAgIGlmICghdGhpcy5fZGVsZXRlZCkge1xuICAgICAgdGhpcy5fZGVsZXRlZCA9IHRydWU7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1kZWxldGUnKTtcbiAgICB9XG4gIH1cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGlzcG9zYWJsZSB0aGF0IHVwb24gZGlzcG9zZSwgd2lsbCByZW1vdmUgdGhlIGJvdW5kIHdhdGNoIHN1YnNjcmlwdGlvbi5cbiAgICogV2hlbiB0aGUgbnVtYmVyIG9mIHN1YnNjcmlwdGlvbnMgcmVhY2ggMCwgdGhlIGZpbGUgaXMgdW53YXRjaGVkLlxuICAgKi9cbiAgX3RyYWNrVW5zdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uOiBJRGlzcG9zYWJsZSk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2RpZFJlbW92ZVN1YnNjcmlwdGlvbigpO1xuICAgIH0pO1xuICB9XG5cbiAgX2RpZFJlbW92ZVN1YnNjcmlwdGlvbigpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25Db3VudC0tO1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25Db3VudCA9PT0gMCkge1xuICAgICAgdGhpcy5fdW5zdWJzY3JpYmVGcm9tTmF0aXZlQ2hhbmdlRXZlbnRzKCk7XG4gICAgfVxuICB9XG5cbiAgX3Vuc3Vic2NyaWJlRnJvbU5hdGl2ZUNoYW5nZUV2ZW50cygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX3dhdGNoU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICB0aGlzLl93YXRjaFN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgb25XaWxsVGhyb3dXYXRjaEVycm9yKFxuICAgIGNhbGxiYWNrOiAod2F0Y2hFcnJvcjoge2Vycm9yOiBFcnJvcjsgaGFuZGxlOiAoKSA9PiB2b2lkfSkgPT4gbWl4ZWQsXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignd2lsbC10aHJvdy13YXRjaC1lcnJvcicsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGlzRmlsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlzRGlyZWN0b3J5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGV4aXN0cygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKS5leGlzdHModGhpcy5fbG9jYWxQYXRoKTtcbiAgfVxuXG4gIGV4aXN0c1N5bmMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBnZXREaWdlc3RTeW5jKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuX2RpZ2VzdCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2RpZ2VzdDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdnZXREaWdlc3RTeW5jIGlzIG5vdCBzdXBwb3J0ZWQgaW4gUmVtb3RlRmlsZScpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldERpZ2VzdCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGlmICh0aGlzLl9kaWdlc3QpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kaWdlc3Q7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMucmVhZCgpO1xuICAgIGludmFyaWFudCh0aGlzLl9kaWdlc3QpO1xuICAgIHJldHVybiB0aGlzLl9kaWdlc3Q7XG4gIH1cblxuICBfc2V0RGlnZXN0KGNvbnRlbnRzOiBzdHJpbmcpIHtcbiAgICBjb25zdCBoYXNoID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTEnKS51cGRhdGUoY29udGVudHMgfHwgJycpO1xuICAgIGludmFyaWFudChoYXNoKTtcbiAgICB0aGlzLl9kaWdlc3QgPSBoYXNoLmRpZ2VzdCgnaGV4Jyk7XG4gIH1cblxuICBzZXRFbmNvZGluZyhlbmNvZGluZzogc3RyaW5nKSB7XG4gICAgdGhpcy5fZW5jb2RpbmcgPSBlbmNvZGluZztcbiAgfVxuXG4gIGdldEVuY29kaW5nKCk6ID9zdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9lbmNvZGluZztcbiAgfVxuXG4gIGdldFBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fcGF0aDtcbiAgfVxuXG4gIGdldExvY2FsUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9sb2NhbFBhdGg7XG4gIH1cblxuICBnZXRSZWFsUGF0aFN5bmMoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fcmVhbHBhdGggfHwgdGhpcy5fcGF0aDtcbiAgfVxuXG4gIGFzeW5jIGdldFJlYWxQYXRoKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgaWYgKHRoaXMuX3JlYWxwYXRoID09IG51bGwpIHtcbiAgICAgIHRoaXMuX3JlYWxwYXRoID0gYXdhaXQgdGhpcy5fZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKS5yZWFscGF0aCh0aGlzLl9sb2NhbFBhdGgpO1xuICAgIH1cbiAgICBpbnZhcmlhbnQodGhpcy5fcmVhbHBhdGgpO1xuICAgIHJldHVybiB0aGlzLl9yZWFscGF0aDtcbiAgfVxuXG4gIGdldEJhc2VOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhdGguYmFzZW5hbWUodGhpcy5fcGF0aCk7XG4gIH1cblxuICBhc3luYyBjcmVhdGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3Qgd2FzQ3JlYXRlZCA9IGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkubmV3RmlsZSh0aGlzLl9sb2NhbFBhdGgpO1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25Db3VudCA+IDApIHtcbiAgICAgIHRoaXMuX3N1YnNjcmliZVRvTmF0aXZlQ2hhbmdlRXZlbnRzKCk7XG4gICAgfVxuICAgIHJldHVybiB3YXNDcmVhdGVkO1xuICB9XG5cbiAgYXN5bmMgZGVsZXRlKCk6IFByb21pc2Uge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLl9nZXRGaWxlU3lzdGVtU2VydmljZSgpLnVubGluayh0aGlzLl9sb2NhbFBhdGgpO1xuICAgICAgdGhpcy5faGFuZGxlTmF0aXZlRGVsZXRlRXZlbnQoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKGVycm9yLmNvZGUgIT09ICdFTk9FTlQnKSB7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJlbmFtZShuZXdQYXRoOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICBhd2FpdCB0aGlzLl9nZXRGaWxlU3lzdGVtU2VydmljZSgpLnJlbmFtZSh0aGlzLl9sb2NhbFBhdGgsIG5ld1BhdGgpO1xuICAgIHRoaXMuX2hhbmRsZU5hdGl2ZVJlbmFtZUV2ZW50KG5ld1BhdGgpO1xuICB9XG5cbiAgYXN5bmMgY29weShuZXdQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCB3YXNDb3BpZWQgPSBhd2FpdCB0aGlzLl9nZXRGaWxlU3lzdGVtU2VydmljZSgpLmNvcHkodGhpcy5fbG9jYWxQYXRoLCBuZXdQYXRoKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb05hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICAgIHJldHVybiB3YXNDb3BpZWQ7XG4gIH1cblxuICBhc3luYyByZWFkKGZsdXNoQ2FjaGU/OiBib29sZWFuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5fZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKS5yZWFkRmlsZSh0aGlzLl9sb2NhbFBhdGgpO1xuICAgIGNvbnN0IGNvbnRlbnRzID0gZGF0YS50b1N0cmluZygpO1xuICAgIHRoaXMuX3NldERpZ2VzdChjb250ZW50cyk7XG4gICAgLy8gVE9ETzogcmVzcGVjdCBlbmNvZGluZ1xuICAgIHJldHVybiBjb250ZW50cztcbiAgfVxuXG4gIHJlYWRTeW5jKGZsdXNoY2FjaGU6IGJvb2xlYW4pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVhZFN5bmMgaXMgbm90IHN1cHBvcnRlZCBpbiBSZW1vdGVGaWxlJyk7XG4gIH1cblxuICBhc3luYyB3cml0ZSh0ZXh0OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwcmV2aW91c2x5RXhpc3RlZCA9IGF3YWl0IHRoaXMuZXhpc3RzKCk7XG4gICAgYXdhaXQgdGhpcy5fZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKS53cml0ZUZpbGUodGhpcy5fbG9jYWxQYXRoLCB0ZXh0KTtcbiAgICBpZiAoIXByZXZpb3VzbHlFeGlzdGVkICYmIHRoaXMuX3N1YnNjcmlwdGlvbkNvdW50ID4gMCkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlVG9OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICB9XG4gIH1cblxuICBnZXRQYXJlbnQoKTogUmVtb3RlRGlyZWN0b3J5IHtcbiAgICBjb25zdCB7cGF0aDogbG9jYWxQYXRoLCBwcm90b2NvbCwgaG9zdH0gPSByZW1vdGVVcmkucGFyc2UodGhpcy5fcGF0aCk7XG4gICAgaW52YXJpYW50KHByb3RvY29sKTtcbiAgICBpbnZhcmlhbnQoaG9zdCk7XG4gICAgY29uc3QgZGlyZWN0b3J5UGF0aCA9IHByb3RvY29sICsgJy8vJyArIGhvc3QgKyBwYXRoLmRpcm5hbWUobG9jYWxQYXRoKTtcbiAgICBjb25zdCByZW1vdGVDb25uZWN0aW9uID0gdGhpcy5fc2VydmVyLmdldFJlbW90ZUNvbm5lY3Rpb25Gb3JVcmkodGhpcy5fcGF0aCk7XG4gICAgY29uc3QgaGdSZXBvc2l0b3J5RGVzY3JpcHRpb24gPSByZW1vdGVDb25uZWN0aW9uICE9IG51bGwgP1xuICAgICAgcmVtb3RlQ29ubmVjdGlvbi5nZXRIZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbigpIDpcbiAgICAgIG51bGw7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZlci5jcmVhdGVEaXJlY3RvcnkoZGlyZWN0b3J5UGF0aCwgaGdSZXBvc2l0b3J5RGVzY3JpcHRpb24pO1xuICB9XG5cbiAgaXNTeW1ib2xpY0xpbmsoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N5bWxpbms7XG4gIH1cblxuICBfZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKTogRmlsZVN5c3RlbVNlcnZpY2Uge1xuICAgIHJldHVybiB0aGlzLl9nZXRTZXJ2aWNlKCdGaWxlU3lzdGVtU2VydmljZScpO1xuICB9XG5cbiAgX2dldFNlcnZpY2Uoc2VydmljZU5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZlci5nZXRTZXJ2aWNlKHNlcnZpY2VOYW1lKTtcbiAgfVxufVxuIl19