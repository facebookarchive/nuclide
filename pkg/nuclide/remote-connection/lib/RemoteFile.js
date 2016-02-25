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

exports.RemoteFile = RemoteFile;
//# sourceMappingURL=data:application/json;base64,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LElBQVksRUFBaUI7QUFDdkMsVUFBTSxpQkFBaUIsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUM5QyxZQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BFLFVBQUksQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxFQUFFO0FBQ3JELFlBQUksQ0FBQyw4QkFBOEIsRUFBRSxDQUFDO09BQ3ZDO0tBQ0Y7OztXQUVRLHFCQUFvQjs4QkFDZSx1QkFBVSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQzs7VUFBeEQsU0FBUyxxQkFBZixJQUFJO1VBQWEsUUFBUSxxQkFBUixRQUFRO1VBQUUsSUFBSSxxQkFBSixJQUFJOztBQUN0QywrQkFBVSxRQUFRLENBQUMsQ0FBQztBQUNwQiwrQkFBVSxJQUFJLENBQUMsQ0FBQztBQUNoQixVQUFNLGFBQWEsR0FBRyxRQUFRLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxrQkFBUyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDM0UsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNwRDs7O1dBRW9CLGlDQUFzQjtBQUN6QyxhQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsQ0FBQztLQUM5Qzs7O1dBRVUscUJBQUMsV0FBbUIsRUFBTztBQUNwQyxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQzdDOzs7U0FqUVUsVUFBVSIsImZpbGUiOiJSZW1vdGVGaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1JlbW90ZUNvbm5lY3Rpb259IGZyb20gJy4vUmVtb3RlQ29ubmVjdGlvbic7XG5pbXBvcnQgdHlwZSB7UmVtb3RlRGlyZWN0b3J5fSBmcm9tICcuL1JlbW90ZURpcmVjdG9yeSc7XG5pbXBvcnQgdHlwZSB7RmlsZVN5c3RlbVNlcnZpY2V9IGZyb20gJy4uLy4uL3NlcnZlci9saWIvc2VydmljZXMvRmlsZVN5c3RlbVNlcnZpY2VUeXBlJztcbmltcG9ydCB0eXBlb2YgKiBhcyBGaWxlV2F0Y2hlclNlcnZpY2UgZnJvbSAnLi4vLi4vZmlsZXdhdGNoZXItYmFzZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBwYXRoVXRpbCBmcm9tICdwYXRoJztcbmltcG9ydCBjcnlwdG8gZnJvbSAnY3J5cHRvJztcbmltcG9ydCB7RGlzcG9zYWJsZSwgRW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgcmVtb3RlVXJpIGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuLyogTW9zdGx5IGltcGxlbWVudHMgaHR0cHM6Ly9hdG9tLmlvL2RvY3MvYXBpL2xhdGVzdC9GaWxlICovXG5leHBvcnQgY2xhc3MgUmVtb3RlRmlsZSB7XG5cbiAgX2RlbGV0ZWQ6IGJvb2xlYW47XG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfZW5jb2Rpbmc6ID9zdHJpbmc7XG4gIF9sb2NhbFBhdGg6IHN0cmluZztcbiAgX3BhdGg6IHN0cmluZztcbiAgX3JlYWxwYXRoOiA/c3RyaW5nO1xuICBfcmVtb3RlOiBSZW1vdGVDb25uZWN0aW9uO1xuICBfc3Vic2NyaXB0aW9uQ291bnQ6IG51bWJlcjtcbiAgX3dhdGNoU3Vic2NyaXB0aW9uOiA/SURpc3Bvc2FibGU7XG4gIF9kaWdlc3Q6ID9zdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocmVtb3RlOiBSZW1vdGVDb25uZWN0aW9uLCByZW1vdGVQYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9yZW1vdGUgPSByZW1vdGU7XG4gICAgY29uc3Qge3BhdGg6IGxvY2FsUGF0aH0gPSByZW1vdGVVcmkucGFyc2UocmVtb3RlUGF0aCk7XG4gICAgdGhpcy5fbG9jYWxQYXRoID0gbG9jYWxQYXRoO1xuICAgIHRoaXMuX3BhdGggPSByZW1vdGVQYXRoO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbkNvdW50ID0gMDtcbiAgICB0aGlzLl9kZWxldGVkID0gZmFsc2U7XG4gIH1cblxuICBvbkRpZENoYW5nZShjYWxsYmFjazogKCkgPT4gbWl4ZWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5fd2lsbEFkZFN1YnNjcmlwdGlvbigpO1xuICAgIHJldHVybiB0aGlzLl90cmFja1Vuc3Vic2NyaXB0aW9uKHRoaXMuX2VtaXR0ZXIub24oJ2RpZC1jaGFuZ2UnLCBjYWxsYmFjaykpO1xuICB9XG5cbiAgb25EaWRSZW5hbWUoY2FsbGJhY2s6ICgpID0+IG1peGVkKTogSURpc3Bvc2FibGUge1xuICAgIHRoaXMuX3dpbGxBZGRTdWJzY3JpcHRpb24oKTtcbiAgICByZXR1cm4gdGhpcy5fdHJhY2tVbnN1YnNjcmlwdGlvbih0aGlzLl9lbWl0dGVyLm9uKCdkaWQtcmVuYW1lJywgY2FsbGJhY2spKTtcbiAgfVxuXG4gIG9uRGlkRGVsZXRlKGNhbGxiYWNrOiAoKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICB0aGlzLl93aWxsQWRkU3Vic2NyaXB0aW9uKCk7XG4gICAgcmV0dXJuIHRoaXMuX3RyYWNrVW5zdWJzY3JpcHRpb24odGhpcy5fZW1pdHRlci5vbignZGlkLWRlbGV0ZScsIGNhbGxiYWNrKSk7XG4gIH1cblxuICBfd2lsbEFkZFN1YnNjcmlwdGlvbigpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25Db3VudCsrO1xuICAgIHJldHVybiB0aGlzLl9zdWJzY3JpYmVUb05hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICB9XG5cbiAgX3N1YnNjcmliZVRvTmF0aXZlQ2hhbmdlRXZlbnRzKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl93YXRjaFN1YnNjcmlwdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7d2F0Y2hGaWxlfSA9ICh0aGlzLl9nZXRTZXJ2aWNlKCdGaWxlV2F0Y2hlclNlcnZpY2UnKTogRmlsZVdhdGNoZXJTZXJ2aWNlKTtcbiAgICBjb25zdCB3YXRjaFN0cmVhbSA9IHdhdGNoRmlsZSh0aGlzLl9wYXRoKTtcbiAgICB0aGlzLl93YXRjaFN1YnNjcmlwdGlvbiA9IHdhdGNoU3RyZWFtLnN1YnNjcmliZSh3YXRjaFVwZGF0ZSA9PiB7XG4gICAgICBsb2dnZXIuZGVidWcoJ3dhdGNoRmlsZSB1cGRhdGU6Jywgd2F0Y2hVcGRhdGUpO1xuICAgICAgc3dpdGNoICh3YXRjaFVwZGF0ZS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2NoYW5nZSc6XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRsZU5hdGl2ZUNoYW5nZUV2ZW50KCk7XG4gICAgICAgIGNhc2UgJ2RlbGV0ZSc6XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRsZU5hdGl2ZURlbGV0ZUV2ZW50KCk7XG4gICAgICAgIGNhc2UgJ3JlbmFtZSc6XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRsZU5hdGl2ZVJlbmFtZUV2ZW50KHdhdGNoVXBkYXRlLnBhdGgpO1xuICAgICAgfVxuICAgIH0sIGVycm9yID0+IHtcbiAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIHN1YnNjcmliZSBSZW1vdGVGaWxlOicsIHRoaXMuX3BhdGgsIGVycm9yKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICAvLyBOb3RoaW5nIG5lZWRzIHRvIGJlIGRvbmUgaWYgdGhlIHJvb3QgZGlyZWN0b3J5IHdhdGNoIGhhcyBlbmRlZC5cbiAgICAgIGxvZ2dlci5kZWJ1Zyhgd2F0Y2hGaWxlIGVuZGVkOiAke3RoaXMuX3BhdGh9YCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfaGFuZGxlTmF0aXZlQ2hhbmdlRXZlbnQoKTogUHJvbWlzZSB7XG4gICAgLy8gRG9uJ3QgYm90aGVyIGNoZWNraW5nIHRoZSBmaWxlIC0gdGhpcyBjYW4gYmUgdmVyeSBleHBlbnNpdmUuXG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlJyk7XG4gIH1cblxuICBfaGFuZGxlTmF0aXZlUmVuYW1lRXZlbnQobmV3UGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fdW5zdWJzY3JpYmVGcm9tTmF0aXZlQ2hhbmdlRXZlbnRzKCk7XG4gICAgY29uc3Qge3Byb3RvY29sLCBob3N0fSA9IHJlbW90ZVVyaS5wYXJzZSh0aGlzLl9wYXRoKTtcbiAgICB0aGlzLl9sb2NhbFBhdGggPSBuZXdQYXRoO1xuICAgIGludmFyaWFudChwcm90b2NvbCk7XG4gICAgaW52YXJpYW50KGhvc3QpO1xuICAgIHRoaXMuX3BhdGggPSBwcm90b2NvbCArICcvLycgKyBob3N0ICsgdGhpcy5fbG9jYWxQYXRoO1xuICAgIHRoaXMuX3N1YnNjcmliZVRvTmF0aXZlQ2hhbmdlRXZlbnRzKCk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdkaWQtcmVuYW1lJyk7XG4gIH1cblxuICBfaGFuZGxlTmF0aXZlRGVsZXRlRXZlbnQoKTogdm9pZCB7XG4gICAgdGhpcy5fdW5zdWJzY3JpYmVGcm9tTmF0aXZlQ2hhbmdlRXZlbnRzKCk7XG4gICAgaWYgKCF0aGlzLl9kZWxldGVkKSB7XG4gICAgICB0aGlzLl9kZWxldGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLWRlbGV0ZScpO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICAqIFJldHVybiBhIG5ldyBEaXNwb3NhYmxlIHRoYXQgdXBvbiBkaXNwb3NlLCB3aWxsIHJlbW92ZSB0aGUgYm91bmQgd2F0Y2ggc3Vic2NyaXB0aW9uLlxuICAgKiBXaGVuIHRoZSBudW1iZXIgb2Ygc3Vic2NyaXB0aW9ucyByZWFjaCAwLCB0aGUgZmlsZSBpcyB1bndhdGNoZWQuXG4gICAqL1xuICBfdHJhY2tVbnN1YnNjcmlwdGlvbihzdWJzY3JpcHRpb246IElEaXNwb3NhYmxlKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fZGlkUmVtb3ZlU3Vic2NyaXB0aW9uKCk7XG4gICAgfSk7XG4gIH1cblxuICBfZGlkUmVtb3ZlU3Vic2NyaXB0aW9uKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbkNvdW50LS07XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbkNvdW50ID09PSAwKSB7XG4gICAgICB0aGlzLl91bnN1YnNjcmliZUZyb21OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICB9XG4gIH1cblxuICBfdW5zdWJzY3JpYmVGcm9tTmF0aXZlQ2hhbmdlRXZlbnRzKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl93YXRjaFN1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fd2F0Y2hTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIG9uV2lsbFRocm93V2F0Y2hFcnJvcihcbiAgICBjYWxsYmFjazogKHdhdGNoRXJyb3I6IHtlcnJvcjogRXJyb3I7IGhhbmRsZTogKCkgPT4gdm9pZH0pID0+IG1peGVkLFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ3dpbGwtdGhyb3ctd2F0Y2gtZXJyb3InLCBjYWxsYmFjayk7XG4gIH1cblxuICBpc0ZpbGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpc0RpcmVjdG9yeSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBleGlzdHMoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkuZXhpc3RzKHRoaXMuX2xvY2FsUGF0aCk7XG4gIH1cblxuICBleGlzdHNTeW5jKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZ2V0RGlnZXN0U3luYygpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLl9kaWdlc3QpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kaWdlc3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZ2V0RGlnZXN0U3luYyBpcyBub3Qgc3VwcG9ydGVkIGluIFJlbW90ZUZpbGUnKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXREaWdlc3QoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBpZiAodGhpcy5fZGlnZXN0KSB7XG4gICAgICByZXR1cm4gdGhpcy5fZGlnZXN0O1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLnJlYWQoKTtcbiAgICBpbnZhcmlhbnQodGhpcy5fZGlnZXN0KTtcbiAgICByZXR1cm4gdGhpcy5fZGlnZXN0O1xuICB9XG5cbiAgX3NldERpZ2VzdChjb250ZW50czogc3RyaW5nKSB7XG4gICAgY29uc3QgaGFzaCA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGExJykudXBkYXRlKGNvbnRlbnRzIHx8ICcnKTtcbiAgICBpbnZhcmlhbnQoaGFzaCk7XG4gICAgdGhpcy5fZGlnZXN0ID0gaGFzaC5kaWdlc3QoJ2hleCcpO1xuICB9XG5cbiAgc2V0RW5jb2RpbmcoZW5jb2Rpbmc6IHN0cmluZykge1xuICAgIHRoaXMuX2VuY29kaW5nID0gZW5jb2Rpbmc7XG4gIH1cblxuICBnZXRFbmNvZGluZygpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jb2Rpbmc7XG4gIH1cblxuICBnZXRQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3BhdGg7XG4gIH1cblxuICBnZXRMb2NhbFBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fbG9jYWxQYXRoO1xuICB9XG5cbiAgZ2V0UmVhbFBhdGhTeW5jKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3JlYWxwYXRoIHx8IHRoaXMuX3BhdGg7XG4gIH1cblxuICBhc3luYyBnZXRSZWFsUGF0aCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGlmICh0aGlzLl9yZWFscGF0aCA9PSBudWxsKSB7XG4gICAgICB0aGlzLl9yZWFscGF0aCA9IGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkucmVhbHBhdGgodGhpcy5fbG9jYWxQYXRoKTtcbiAgICB9XG4gICAgaW52YXJpYW50KHRoaXMuX3JlYWxwYXRoKTtcbiAgICByZXR1cm4gdGhpcy5fcmVhbHBhdGg7XG4gIH1cblxuICBnZXRCYXNlTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBwYXRoVXRpbC5iYXNlbmFtZSh0aGlzLl9wYXRoKTtcbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCB3YXNDcmVhdGVkID0gYXdhaXQgdGhpcy5fZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKS5uZXdGaWxlKHRoaXMuX2xvY2FsUGF0aCk7XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbkNvdW50ID4gMCkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlVG9OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICB9XG4gICAgcmV0dXJuIHdhc0NyZWF0ZWQ7XG4gIH1cblxuICBhc3luYyBkZWxldGUoKTogUHJvbWlzZSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkudW5saW5rKHRoaXMuX2xvY2FsUGF0aCk7XG4gICAgICB0aGlzLl9oYW5kbGVOYXRpdmVEZWxldGVFdmVudCgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoZXJyb3IuY29kZSAhPT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmVuYW1lKG5ld1BhdGg6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkucmVuYW1lKHRoaXMuX2xvY2FsUGF0aCwgbmV3UGF0aCk7XG4gICAgdGhpcy5faGFuZGxlTmF0aXZlUmVuYW1lRXZlbnQobmV3UGF0aCk7XG4gIH1cblxuICBhc3luYyBjb3B5KG5ld1BhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHdhc0NvcGllZCA9IGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkuY29weSh0aGlzLl9sb2NhbFBhdGgsIG5ld1BhdGgpO1xuICAgIHRoaXMuX3N1YnNjcmliZVRvTmF0aXZlQ2hhbmdlRXZlbnRzKCk7XG4gICAgcmV0dXJuIHdhc0NvcGllZDtcbiAgfVxuXG4gIGFzeW5jIHJlYWQoZmx1c2hDYWNoZT86IGJvb2xlYW4pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLl9nZXRGaWxlU3lzdGVtU2VydmljZSgpLnJlYWRGaWxlKHRoaXMuX2xvY2FsUGF0aCk7XG4gICAgY29uc3QgY29udGVudHMgPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgdGhpcy5fc2V0RGlnZXN0KGNvbnRlbnRzKTtcbiAgICAvLyBUT0RPOiByZXNwZWN0IGVuY29kaW5nXG4gICAgcmV0dXJuIGNvbnRlbnRzO1xuICB9XG5cbiAgcmVhZFN5bmMoZmx1c2hjYWNoZTogYm9vbGVhbik6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZWFkU3luYyBpcyBub3Qgc3VwcG9ydGVkIGluIFJlbW90ZUZpbGUnKTtcbiAgfVxuXG4gIGFzeW5jIHdyaXRlKHRleHQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHByZXZpb3VzbHlFeGlzdGVkID0gYXdhaXQgdGhpcy5leGlzdHMoKTtcbiAgICBhd2FpdCB0aGlzLl9nZXRGaWxlU3lzdGVtU2VydmljZSgpLndyaXRlRmlsZSh0aGlzLl9sb2NhbFBhdGgsIHRleHQpO1xuICAgIGlmICghcHJldmlvdXNseUV4aXN0ZWQgJiYgdGhpcy5fc3Vic2NyaXB0aW9uQ291bnQgPiAwKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVUb05hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICAgIH1cbiAgfVxuXG4gIGdldFBhcmVudCgpOiBSZW1vdGVEaXJlY3Rvcnkge1xuICAgIGNvbnN0IHtwYXRoOiBsb2NhbFBhdGgsIHByb3RvY29sLCBob3N0fSA9IHJlbW90ZVVyaS5wYXJzZSh0aGlzLl9wYXRoKTtcbiAgICBpbnZhcmlhbnQocHJvdG9jb2wpO1xuICAgIGludmFyaWFudChob3N0KTtcbiAgICBjb25zdCBkaXJlY3RvcnlQYXRoID0gcHJvdG9jb2wgKyAnLy8nICsgaG9zdCArIHBhdGhVdGlsLmRpcm5hbWUobG9jYWxQYXRoKTtcbiAgICByZXR1cm4gdGhpcy5fcmVtb3RlLmNyZWF0ZURpcmVjdG9yeShkaXJlY3RvcnlQYXRoKTtcbiAgfVxuXG4gIF9nZXRGaWxlU3lzdGVtU2VydmljZSgpOiBGaWxlU3lzdGVtU2VydmljZSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNlcnZpY2UoJ0ZpbGVTeXN0ZW1TZXJ2aWNlJyk7XG4gIH1cblxuICBfZ2V0U2VydmljZShzZXJ2aWNlTmFtZTogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fcmVtb3RlLmdldFNlcnZpY2Uoc2VydmljZU5hbWUpO1xuICB9XG59XG4iXX0=