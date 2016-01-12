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

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _atom = require('atom');

var _remoteUri = require('../../remote-uri');

var _remoteUri2 = _interopRequireDefault(_remoteUri);

var _logging = require('../../logging');

var logger = (0, _logging.getLogger)();

/* Mostly implements https://atom.io/docs/api/latest/File */

var RemoteFile = (function () {
  function RemoteFile(remote, remotePath) {
    _classCallCheck(this, RemoteFile);

    this._remote = remote;

    var _remoteUri$parse = _remoteUri2['default'].parse(remotePath);

    var localPath = _remoteUri$parse.path;

    this._localPath = localPath;
    this._path = remotePath;
    this._emitter = new _atom.Emitter();
    this._subscriptionCount = 0;
    this._cachedContents = null;
    this._deleted = false;
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

      var _getService2 = this._getService('FileWatcherService');

      var watchFile = _getService2.watchFile;

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
      var oldContents = this._cachedContents;
      try {
        var newContents = yield this.read( /*flushCache*/true);
        if (oldContents !== newContents) {
          this._emitter.emit('did-change');
        }
      } catch (error) {
        // We can't read the file, so we cancel the watcher subscription.
        this._unsubscribeFromNativeChangeEvents();
        var handled = false;
        var _handle = function _handle() {
          handled = true;
        };
        error.eventType = 'change';
        this._emitter.emit('will-throw-watch-error', { error: error, handle: _handle });
        if (!handled) {
          var newError = new Error('Cannot read file after file change event: ' + this._path);
          // $FlowFixMe non-existing property.
          newError.originalError = error;
          // $FlowFixMe non-existing property.
          newError.code = 'ENOENT';
          throw newError;
        }
      }
    })
  }, {
    key: '_handleNativeRenameEvent',
    value: function _handleNativeRenameEvent(newPath) {
      this._unsubscribeFromNativeChangeEvents();
      this._cachedContents = null;

      var _remoteUri$parse2 = _remoteUri2['default'].parse(this._path);

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
      this._cachedContents = null;
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
        this._watchSubscription.dispose();
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
      // TODO: return cachedContents if exists and !flushCache
      // This involves the reload scenario, where the same instance of the file is read(),
      // but the file contents should reload.
      var data = yield this._getFileSystemService().readFile(this._localPath);
      var contents = data.toString();
      this._setDigest(contents);
      this._cachedContents = contents;
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
      this._cachedContents = text;
      if (!previouslyExisted && this._subscriptionCount > 0) {
        this._subscribeToNativeChangeEvents();
      }
    })
  }, {
    key: 'getParent',
    value: function getParent() {
      var _remoteUri$parse3 = _remoteUri2['default'].parse(this._path);

      var localPath = _remoteUri$parse3.path;
      var protocol = _remoteUri$parse3.protocol;
      var host = _remoteUri$parse3.host;

      (0, _assert2['default'])(protocol);
      (0, _assert2['default'])(host);
      var directoryPath = protocol + '//' + host + _path2['default'].dirname(localPath);
      return this._remote.createDirectory(directoryPath);
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

  return RemoteFile;
})();

module.exports = RemoteFile;
//# sourceMappingURL=data:application/json;base64,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UyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEUsVUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7QUFDNUIsVUFBSSxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLEVBQUU7QUFDckQsWUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUM7T0FDdkM7S0FDRjs7O1dBRVEscUJBQW9COzhCQUNlLHVCQUFVLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDOztVQUF4RCxTQUFTLHFCQUFmLElBQUk7VUFBYSxRQUFRLHFCQUFSLFFBQVE7VUFBRSxJQUFJLHFCQUFKLElBQUk7O0FBQ3RDLCtCQUFVLFFBQVEsQ0FBQyxDQUFDO0FBQ3BCLCtCQUFVLElBQUksQ0FBQyxDQUFDO0FBQ2hCLFVBQU0sYUFBYSxHQUFHLFFBQVEsR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLGtCQUFTLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMzRSxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQ3BEOzs7V0FFb0IsaUNBQXNCO0FBQ3pDLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0tBQzlDOzs7V0FFVSxxQkFBQyxXQUFtQixFQUFPO0FBQ3BDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDN0M7OztTQWhTRyxVQUFVOzs7QUFtU2hCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDIiwiZmlsZSI6IlJlbW90ZUZpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7UmVtb3RlQ29ubmVjdGlvbn0gZnJvbSAnLi9SZW1vdGVDb25uZWN0aW9uJztcbmltcG9ydCB0eXBlIFJlbW90ZURpcmVjdG9yeSBmcm9tICcuL1JlbW90ZURpcmVjdG9yeSc7XG5pbXBvcnQgdHlwZSB7RmlsZVN5c3RlbVNlcnZpY2V9IGZyb20gJy4uLy4uL3NlcnZlci9saWIvc2VydmljZXMvRmlsZVN5c3RlbVNlcnZpY2VUeXBlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHBhdGhVdGlsIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGNyeXB0byBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHtEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCByZW1vdGVVcmkgZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG4vKiBNb3N0bHkgaW1wbGVtZW50cyBodHRwczovL2F0b20uaW8vZG9jcy9hcGkvbGF0ZXN0L0ZpbGUgKi9cbmNsYXNzIFJlbW90ZUZpbGUge1xuXG4gIF9jYWNoZWRDb250ZW50czogP3N0cmluZztcbiAgX2RlbGV0ZWQ6IGJvb2xlYW47XG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfZW5jb2Rpbmc6ID9zdHJpbmc7XG4gIF9sb2NhbFBhdGg6IHN0cmluZztcbiAgX3BhdGg6IHN0cmluZztcbiAgX3JlYWxwYXRoOiA/c3RyaW5nO1xuICBfcmVtb3RlOiBSZW1vdGVDb25uZWN0aW9uO1xuICBfc3Vic2NyaXB0aW9uQ291bnQ6IG51bWJlcjtcbiAgX3dhdGNoU3Vic2NyaXB0aW9uOiA/YXRvbSREaXNwb3NhYmxlO1xuICBfZGlnZXN0OiA/c3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHJlbW90ZTogUmVtb3RlQ29ubmVjdGlvbiwgcmVtb3RlUGF0aDogc3RyaW5nKSB7XG4gICAgdGhpcy5fcmVtb3RlID0gcmVtb3RlO1xuICAgIGNvbnN0IHtwYXRoOiBsb2NhbFBhdGh9ID0gcmVtb3RlVXJpLnBhcnNlKHJlbW90ZVBhdGgpO1xuICAgIHRoaXMuX2xvY2FsUGF0aCA9IGxvY2FsUGF0aDtcbiAgICB0aGlzLl9wYXRoID0gcmVtb3RlUGF0aDtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25Db3VudCA9IDA7XG4gICAgdGhpcy5fY2FjaGVkQ29udGVudHMgPSBudWxsO1xuICAgIHRoaXMuX2RlbGV0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlKGNhbGxiYWNrOiAoKSA9PiBtaXhlZCk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5fd2lsbEFkZFN1YnNjcmlwdGlvbigpO1xuICAgIHJldHVybiB0aGlzLl90cmFja1Vuc3Vic2NyaXB0aW9uKHRoaXMuX2VtaXR0ZXIub24oJ2RpZC1jaGFuZ2UnLCBjYWxsYmFjaykpO1xuICB9XG5cbiAgb25EaWRSZW5hbWUoY2FsbGJhY2s6ICgpID0+IG1peGVkKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICB0aGlzLl93aWxsQWRkU3Vic2NyaXB0aW9uKCk7XG4gICAgcmV0dXJuIHRoaXMuX3RyYWNrVW5zdWJzY3JpcHRpb24odGhpcy5fZW1pdHRlci5vbignZGlkLXJlbmFtZScsIGNhbGxiYWNrKSk7XG4gIH1cblxuICBvbkRpZERlbGV0ZShjYWxsYmFjazogKCkgPT4gbWl4ZWQpOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHRoaXMuX3dpbGxBZGRTdWJzY3JpcHRpb24oKTtcbiAgICByZXR1cm4gdGhpcy5fdHJhY2tVbnN1YnNjcmlwdGlvbih0aGlzLl9lbWl0dGVyLm9uKCdkaWQtZGVsZXRlJywgY2FsbGJhY2spKTtcbiAgfVxuXG4gIF93aWxsQWRkU3Vic2NyaXB0aW9uKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbkNvdW50Kys7XG4gICAgcmV0dXJuIHRoaXMuX3N1YnNjcmliZVRvTmF0aXZlQ2hhbmdlRXZlbnRzKCk7XG4gIH1cblxuICBfc3Vic2NyaWJlVG9OYXRpdmVDaGFuZ2VFdmVudHMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3dhdGNoU3Vic2NyaXB0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHt3YXRjaEZpbGV9ID0gdGhpcy5fZ2V0U2VydmljZSgnRmlsZVdhdGNoZXJTZXJ2aWNlJyk7XG4gICAgY29uc3Qgd2F0Y2hTdHJlYW0gPSB3YXRjaEZpbGUodGhpcy5fcGF0aCk7XG4gICAgdGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24gPSB3YXRjaFN0cmVhbS5zdWJzY3JpYmUod2F0Y2hVcGRhdGUgPT4ge1xuICAgICAgbG9nZ2VyLmRlYnVnKCd3YXRjaEZpbGUgdXBkYXRlOicsIHdhdGNoVXBkYXRlKTtcbiAgICAgIHN3aXRjaCAod2F0Y2hVcGRhdGUudHlwZSkge1xuICAgICAgICBjYXNlICdjaGFuZ2UnOlxuICAgICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVOYXRpdmVDaGFuZ2VFdmVudCgpO1xuICAgICAgICBjYXNlICdkZWxldGUnOlxuICAgICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVOYXRpdmVEZWxldGVFdmVudCgpO1xuICAgICAgICBjYXNlICdyZW5hbWUnOlxuICAgICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVOYXRpdmVSZW5hbWVFdmVudCh3YXRjaFVwZGF0ZS5wYXRoKTtcbiAgICAgIH1cbiAgICB9LCBlcnJvciA9PiB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byBzdWJzY3JpYmUgUmVtb3RlRmlsZTonLCB0aGlzLl9wYXRoLCBlcnJvcik7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgLy8gTm90aGluZyBuZWVkcyB0byBiZSBkb25lIGlmIHRoZSByb290IGRpcmVjdG9yeSB3YXRjaCBoYXMgZW5kZWQuXG4gICAgICBsb2dnZXIuZGVidWcoYHdhdGNoRmlsZSBlbmRlZDogJHt0aGlzLl9wYXRofWApO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX2hhbmRsZU5hdGl2ZUNoYW5nZUV2ZW50KCk6IFByb21pc2Uge1xuICAgIGNvbnN0IG9sZENvbnRlbnRzID0gdGhpcy5fY2FjaGVkQ29udGVudHM7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG5ld0NvbnRlbnRzID0gYXdhaXQgdGhpcy5yZWFkKC8qZmx1c2hDYWNoZSovIHRydWUpO1xuICAgICAgaWYgKG9sZENvbnRlbnRzICE9PSBuZXdDb250ZW50cykge1xuICAgICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UnKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgLy8gV2UgY2FuJ3QgcmVhZCB0aGUgZmlsZSwgc28gd2UgY2FuY2VsIHRoZSB3YXRjaGVyIHN1YnNjcmlwdGlvbi5cbiAgICAgIHRoaXMuX3Vuc3Vic2NyaWJlRnJvbU5hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICAgICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcbiAgICAgIGNvbnN0IGhhbmRsZSA9ICgpID0+IHtcbiAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICB9O1xuICAgICAgZXJyb3IuZXZlbnRUeXBlID0gJ2NoYW5nZSc7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ3dpbGwtdGhyb3ctd2F0Y2gtZXJyb3InLCB7ZXJyb3IsIGhhbmRsZX0pO1xuICAgICAgaWYgKCFoYW5kbGVkKSB7XG4gICAgICAgIGNvbnN0IG5ld0Vycm9yID0gbmV3IEVycm9yKGBDYW5ub3QgcmVhZCBmaWxlIGFmdGVyIGZpbGUgY2hhbmdlIGV2ZW50OiAke3RoaXMuX3BhdGh9YCk7XG4gICAgICAgIC8vICRGbG93Rml4TWUgbm9uLWV4aXN0aW5nIHByb3BlcnR5LlxuICAgICAgICBuZXdFcnJvci5vcmlnaW5hbEVycm9yID0gZXJyb3I7XG4gICAgICAgIC8vICRGbG93Rml4TWUgbm9uLWV4aXN0aW5nIHByb3BlcnR5LlxuICAgICAgICBuZXdFcnJvci5jb2RlID0gJ0VOT0VOVCc7XG4gICAgICAgIHRocm93IG5ld0Vycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVOYXRpdmVSZW5hbWVFdmVudChuZXdQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl91bnN1YnNjcmliZUZyb21OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICB0aGlzLl9jYWNoZWRDb250ZW50cyA9IG51bGw7XG4gICAgY29uc3Qge3Byb3RvY29sLCBob3N0fSA9IHJlbW90ZVVyaS5wYXJzZSh0aGlzLl9wYXRoKTtcbiAgICB0aGlzLl9sb2NhbFBhdGggPSBuZXdQYXRoO1xuICAgIGludmFyaWFudChwcm90b2NvbCk7XG4gICAgaW52YXJpYW50KGhvc3QpO1xuICAgIHRoaXMuX3BhdGggPSBwcm90b2NvbCArICcvLycgKyBob3N0ICsgdGhpcy5fbG9jYWxQYXRoO1xuICAgIHRoaXMuX3N1YnNjcmliZVRvTmF0aXZlQ2hhbmdlRXZlbnRzKCk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdkaWQtcmVuYW1lJyk7XG4gIH1cblxuICBfaGFuZGxlTmF0aXZlRGVsZXRlRXZlbnQoKTogdm9pZCB7XG4gICAgdGhpcy5fdW5zdWJzY3JpYmVGcm9tTmF0aXZlQ2hhbmdlRXZlbnRzKCk7XG4gICAgdGhpcy5fY2FjaGVkQ29udGVudHMgPSBudWxsO1xuICAgIGlmICghdGhpcy5fZGVsZXRlZCkge1xuICAgICAgdGhpcy5fZGVsZXRlZCA9IHRydWU7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1kZWxldGUnKTtcbiAgICB9XG4gIH1cblxuICAvKlxuICAgKiBSZXR1cm4gYSBuZXcgRGlzcG9zYWJsZSB0aGF0IHVwb24gZGlzcG9zZSwgd2lsbCByZW1vdmUgdGhlIGJvdW5kIHdhdGNoIHN1YnNjcmlwdGlvbi5cbiAgICogV2hlbiB0aGUgbnVtYmVyIG9mIHN1YnNjcmlwdGlvbnMgcmVhY2ggMCwgdGhlIGZpbGUgaXMgdW53YXRjaGVkLlxuICAgKi9cbiAgX3RyYWNrVW5zdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uOiBhdG9tJERpc3Bvc2FibGUpOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fZGlkUmVtb3ZlU3Vic2NyaXB0aW9uKCk7XG4gICAgfSk7XG4gIH1cblxuICBfZGlkUmVtb3ZlU3Vic2NyaXB0aW9uKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbkNvdW50LS07XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbkNvdW50ID09PSAwKSB7XG4gICAgICB0aGlzLl91bnN1YnNjcmliZUZyb21OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICB9XG4gIH1cblxuICBfdW5zdWJzY3JpYmVGcm9tTmF0aXZlQ2hhbmdlRXZlbnRzKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl93YXRjaFN1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIG9uV2lsbFRocm93V2F0Y2hFcnJvcihcbiAgICBjYWxsYmFjazogKHdhdGNoRXJyb3I6IHtlcnJvcjogRXJyb3IsIGhhbmRsZTogKCkgPT4gdm9pZH0pID0+IG1peGVkLFxuICApOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCd3aWxsLXRocm93LXdhdGNoLWVycm9yJywgY2FsbGJhY2spO1xuICB9XG5cbiAgaXNGaWxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaXNEaXJlY3RvcnkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZXhpc3RzKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLl9nZXRGaWxlU3lzdGVtU2VydmljZSgpLmV4aXN0cyh0aGlzLl9sb2NhbFBhdGgpO1xuICB9XG5cbiAgZXhpc3RzU3luYygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGdldERpZ2VzdFN5bmMoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5fZGlnZXN0KSB7XG4gICAgICByZXR1cm4gdGhpcy5fZGlnZXN0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2dldERpZ2VzdFN5bmMgaXMgbm90IHN1cHBvcnRlZCBpbiBSZW1vdGVGaWxlJyk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0RGlnZXN0KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgaWYgKHRoaXMuX2RpZ2VzdCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2RpZ2VzdDtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5yZWFkKCk7XG4gICAgaW52YXJpYW50KHRoaXMuX2RpZ2VzdCk7XG4gICAgcmV0dXJuIHRoaXMuX2RpZ2VzdDtcbiAgfVxuXG4gIF9zZXREaWdlc3QoY29udGVudHM6IHN0cmluZykge1xuICAgIGNvbnN0IGhhc2ggPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhMScpLnVwZGF0ZShjb250ZW50cyB8fCAnJyk7XG4gICAgaW52YXJpYW50KGhhc2gpO1xuICAgIHRoaXMuX2RpZ2VzdCA9IGhhc2guZGlnZXN0KCdoZXgnKTtcbiAgfVxuXG4gIHNldEVuY29kaW5nKGVuY29kaW5nOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9lbmNvZGluZyA9IGVuY29kaW5nO1xuICB9XG5cbiAgZ2V0RW5jb2RpbmcoKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY29kaW5nO1xuICB9XG5cbiAgZ2V0UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9wYXRoO1xuICB9XG5cbiAgZ2V0TG9jYWxQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2xvY2FsUGF0aDtcbiAgfVxuXG4gIGdldFJlYWxQYXRoU3luYygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9yZWFscGF0aCB8fCB0aGlzLl9wYXRoO1xuICB9XG5cbiAgYXN5bmMgZ2V0UmVhbFBhdGgoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBpZiAodGhpcy5fcmVhbHBhdGggPT0gbnVsbCkge1xuICAgICAgdGhpcy5fcmVhbHBhdGggPSBhd2FpdCB0aGlzLl9nZXRGaWxlU3lzdGVtU2VydmljZSgpLnJlYWxwYXRoKHRoaXMuX2xvY2FsUGF0aCk7XG4gICAgfVxuICAgIGludmFyaWFudCh0aGlzLl9yZWFscGF0aCk7XG4gICAgcmV0dXJuIHRoaXMuX3JlYWxwYXRoO1xuICB9XG5cbiAgZ2V0QmFzZU5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcGF0aFV0aWwuYmFzZW5hbWUodGhpcy5fcGF0aCk7XG4gIH1cblxuICBhc3luYyBjcmVhdGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3Qgd2FzQ3JlYXRlZCA9IGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkubmV3RmlsZSh0aGlzLl9sb2NhbFBhdGgpO1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25Db3VudCA+IDApIHtcbiAgICAgIHRoaXMuX3N1YnNjcmliZVRvTmF0aXZlQ2hhbmdlRXZlbnRzKCk7XG4gICAgfVxuICAgIHJldHVybiB3YXNDcmVhdGVkO1xuICB9XG5cbiAgYXN5bmMgZGVsZXRlKCk6IFByb21pc2Uge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLl9nZXRGaWxlU3lzdGVtU2VydmljZSgpLnVubGluayh0aGlzLl9sb2NhbFBhdGgpO1xuICAgICAgdGhpcy5faGFuZGxlTmF0aXZlRGVsZXRlRXZlbnQoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKGVycm9yLmNvZGUgIT09ICdFTk9FTlQnKSB7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJlbmFtZShuZXdQYXRoOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICBhd2FpdCB0aGlzLl9nZXRGaWxlU3lzdGVtU2VydmljZSgpLnJlbmFtZSh0aGlzLl9sb2NhbFBhdGgsIG5ld1BhdGgpO1xuICAgIHRoaXMuX2hhbmRsZU5hdGl2ZVJlbmFtZUV2ZW50KG5ld1BhdGgpO1xuICB9XG5cbiAgYXN5bmMgY29weShuZXdQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCB3YXNDb3BpZWQgPSBhd2FpdCB0aGlzLl9nZXRGaWxlU3lzdGVtU2VydmljZSgpLmNvcHkodGhpcy5fbG9jYWxQYXRoLCBuZXdQYXRoKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb05hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICAgIHJldHVybiB3YXNDb3BpZWQ7XG4gIH1cblxuICBhc3luYyByZWFkKGZsdXNoQ2FjaGU/OiBib29sZWFuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAvLyBUT0RPOiByZXR1cm4gY2FjaGVkQ29udGVudHMgaWYgZXhpc3RzIGFuZCAhZmx1c2hDYWNoZVxuICAgIC8vIFRoaXMgaW52b2x2ZXMgdGhlIHJlbG9hZCBzY2VuYXJpbywgd2hlcmUgdGhlIHNhbWUgaW5zdGFuY2Ugb2YgdGhlIGZpbGUgaXMgcmVhZCgpLFxuICAgIC8vIGJ1dCB0aGUgZmlsZSBjb250ZW50cyBzaG91bGQgcmVsb2FkLlxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLl9nZXRGaWxlU3lzdGVtU2VydmljZSgpLnJlYWRGaWxlKHRoaXMuX2xvY2FsUGF0aCk7XG4gICAgY29uc3QgY29udGVudHMgPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgdGhpcy5fc2V0RGlnZXN0KGNvbnRlbnRzKTtcbiAgICB0aGlzLl9jYWNoZWRDb250ZW50cyA9IGNvbnRlbnRzO1xuICAgIC8vIFRPRE86IHJlc3BlY3QgZW5jb2RpbmdcbiAgICByZXR1cm4gY29udGVudHM7XG4gIH1cblxuICByZWFkU3luYyhmbHVzaGNhY2hlOiBib29sZWFuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlYWRTeW5jIGlzIG5vdCBzdXBwb3J0ZWQgaW4gUmVtb3RlRmlsZScpO1xuICB9XG5cbiAgYXN5bmMgd3JpdGUodGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcHJldmlvdXNseUV4aXN0ZWQgPSBhd2FpdCB0aGlzLmV4aXN0cygpO1xuICAgIGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkud3JpdGVGaWxlKHRoaXMuX2xvY2FsUGF0aCwgdGV4dCk7XG4gICAgdGhpcy5fY2FjaGVkQ29udGVudHMgPSB0ZXh0O1xuICAgIGlmICghcHJldmlvdXNseUV4aXN0ZWQgJiYgdGhpcy5fc3Vic2NyaXB0aW9uQ291bnQgPiAwKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVUb05hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICAgIH1cbiAgfVxuXG4gIGdldFBhcmVudCgpOiBSZW1vdGVEaXJlY3Rvcnkge1xuICAgIGNvbnN0IHtwYXRoOiBsb2NhbFBhdGgsIHByb3RvY29sLCBob3N0fSA9IHJlbW90ZVVyaS5wYXJzZSh0aGlzLl9wYXRoKTtcbiAgICBpbnZhcmlhbnQocHJvdG9jb2wpO1xuICAgIGludmFyaWFudChob3N0KTtcbiAgICBjb25zdCBkaXJlY3RvcnlQYXRoID0gcHJvdG9jb2wgKyAnLy8nICsgaG9zdCArIHBhdGhVdGlsLmRpcm5hbWUobG9jYWxQYXRoKTtcbiAgICByZXR1cm4gdGhpcy5fcmVtb3RlLmNyZWF0ZURpcmVjdG9yeShkaXJlY3RvcnlQYXRoKTtcbiAgfVxuXG4gIF9nZXRGaWxlU3lzdGVtU2VydmljZSgpOiBGaWxlU3lzdGVtU2VydmljZSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNlcnZpY2UoJ0ZpbGVTeXN0ZW1TZXJ2aWNlJyk7XG4gIH1cblxuICBfZ2V0U2VydmljZShzZXJ2aWNlTmFtZTogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fcmVtb3RlLmdldFNlcnZpY2Uoc2VydmljZU5hbWUpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVtb3RlRmlsZTtcbiJdfQ==