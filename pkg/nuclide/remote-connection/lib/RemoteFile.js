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
    var symlink = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    _classCallCheck(this, RemoteFile);

    this._remote = remote;

    var _remoteUri$parse = _remoteUri2['default'].parse(remotePath);

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

  return RemoteFile;
})();

exports.RemoteFile = RemoteFile;
//# sourceMappingURL=data:application/json;base64,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IGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7UmVtb3RlQ29ubmVjdGlvbn0gZnJvbSAnLi9SZW1vdGVDb25uZWN0aW9uJztcbmltcG9ydCB0eXBlIHtSZW1vdGVEaXJlY3Rvcnl9IGZyb20gJy4vUmVtb3RlRGlyZWN0b3J5JztcbmltcG9ydCB0eXBlIHtGaWxlU3lzdGVtU2VydmljZX0gZnJvbSAnLi4vLi4vc2VydmVyL2xpYi9zZXJ2aWNlcy9GaWxlU3lzdGVtU2VydmljZVR5cGUnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIEZpbGVXYXRjaGVyU2VydmljZSBmcm9tICcuLi8uLi9maWxld2F0Y2hlci1iYXNlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHBhdGhVdGlsIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGNyeXB0byBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHtEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCByZW1vdGVVcmkgZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG4vKiBNb3N0bHkgaW1wbGVtZW50cyBodHRwczovL2F0b20uaW8vZG9jcy9hcGkvbGF0ZXN0L0ZpbGUgKi9cbmV4cG9ydCBjbGFzcyBSZW1vdGVGaWxlIHtcblxuICBfZGVsZXRlZDogYm9vbGVhbjtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9lbmNvZGluZzogP3N0cmluZztcbiAgX2xvY2FsUGF0aDogc3RyaW5nO1xuICBfcGF0aDogc3RyaW5nO1xuICBfcmVhbHBhdGg6ID9zdHJpbmc7XG4gIF9yZW1vdGU6IFJlbW90ZUNvbm5lY3Rpb247XG4gIF9zdWJzY3JpcHRpb25Db3VudDogbnVtYmVyO1xuICBfd2F0Y2hTdWJzY3JpcHRpb246ID9JRGlzcG9zYWJsZTtcbiAgX2RpZ2VzdDogP3N0cmluZztcbiAgX3N5bWxpbms6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVtb3RlOiBSZW1vdGVDb25uZWN0aW9uLFxuICAgIHJlbW90ZVBhdGg6IHN0cmluZyxcbiAgICBzeW1saW5rOiBib29sZWFuID0gZmFsc2UsXG4gICkge1xuICAgIHRoaXMuX3JlbW90ZSA9IHJlbW90ZTtcbiAgICBjb25zdCB7cGF0aDogbG9jYWxQYXRofSA9IHJlbW90ZVVyaS5wYXJzZShyZW1vdGVQYXRoKTtcbiAgICB0aGlzLl9sb2NhbFBhdGggPSBsb2NhbFBhdGg7XG4gICAgdGhpcy5fcGF0aCA9IHJlbW90ZVBhdGg7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uQ291bnQgPSAwO1xuICAgIHRoaXMuX2RlbGV0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9zeW1saW5rID0gc3ltbGluaztcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlKGNhbGxiYWNrOiAoKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICB0aGlzLl93aWxsQWRkU3Vic2NyaXB0aW9uKCk7XG4gICAgcmV0dXJuIHRoaXMuX3RyYWNrVW5zdWJzY3JpcHRpb24odGhpcy5fZW1pdHRlci5vbignZGlkLWNoYW5nZScsIGNhbGxiYWNrKSk7XG4gIH1cblxuICBvbkRpZFJlbmFtZShjYWxsYmFjazogKCkgPT4gbWl4ZWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5fd2lsbEFkZFN1YnNjcmlwdGlvbigpO1xuICAgIHJldHVybiB0aGlzLl90cmFja1Vuc3Vic2NyaXB0aW9uKHRoaXMuX2VtaXR0ZXIub24oJ2RpZC1yZW5hbWUnLCBjYWxsYmFjaykpO1xuICB9XG5cbiAgb25EaWREZWxldGUoY2FsbGJhY2s6ICgpID0+IG1peGVkKTogSURpc3Bvc2FibGUge1xuICAgIHRoaXMuX3dpbGxBZGRTdWJzY3JpcHRpb24oKTtcbiAgICByZXR1cm4gdGhpcy5fdHJhY2tVbnN1YnNjcmlwdGlvbih0aGlzLl9lbWl0dGVyLm9uKCdkaWQtZGVsZXRlJywgY2FsbGJhY2spKTtcbiAgfVxuXG4gIF93aWxsQWRkU3Vic2NyaXB0aW9uKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbkNvdW50Kys7XG4gICAgcmV0dXJuIHRoaXMuX3N1YnNjcmliZVRvTmF0aXZlQ2hhbmdlRXZlbnRzKCk7XG4gIH1cblxuICBfc3Vic2NyaWJlVG9OYXRpdmVDaGFuZ2VFdmVudHMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3dhdGNoU3Vic2NyaXB0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHt3YXRjaEZpbGV9ID0gKHRoaXMuX2dldFNlcnZpY2UoJ0ZpbGVXYXRjaGVyU2VydmljZScpOiBGaWxlV2F0Y2hlclNlcnZpY2UpO1xuICAgIGNvbnN0IHdhdGNoU3RyZWFtID0gd2F0Y2hGaWxlKHRoaXMuX3BhdGgpO1xuICAgIHRoaXMuX3dhdGNoU3Vic2NyaXB0aW9uID0gd2F0Y2hTdHJlYW0uc3Vic2NyaWJlKHdhdGNoVXBkYXRlID0+IHtcbiAgICAgIGxvZ2dlci5kZWJ1Zygnd2F0Y2hGaWxlIHVwZGF0ZTonLCB3YXRjaFVwZGF0ZSk7XG4gICAgICBzd2l0Y2ggKHdhdGNoVXBkYXRlLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnY2hhbmdlJzpcbiAgICAgICAgICByZXR1cm4gdGhpcy5faGFuZGxlTmF0aXZlQ2hhbmdlRXZlbnQoKTtcbiAgICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgICByZXR1cm4gdGhpcy5faGFuZGxlTmF0aXZlRGVsZXRlRXZlbnQoKTtcbiAgICAgICAgY2FzZSAncmVuYW1lJzpcbiAgICAgICAgICByZXR1cm4gdGhpcy5faGFuZGxlTmF0aXZlUmVuYW1lRXZlbnQod2F0Y2hVcGRhdGUucGF0aCk7XG4gICAgICB9XG4gICAgfSwgZXJyb3IgPT4ge1xuICAgICAgbG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gc3Vic2NyaWJlIFJlbW90ZUZpbGU6JywgdGhpcy5fcGF0aCwgZXJyb3IpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIC8vIE5vdGhpbmcgbmVlZHMgdG8gYmUgZG9uZSBpZiB0aGUgcm9vdCBkaXJlY3Rvcnkgd2F0Y2ggaGFzIGVuZGVkLlxuICAgICAgbG9nZ2VyLmRlYnVnKGB3YXRjaEZpbGUgZW5kZWQ6ICR7dGhpcy5fcGF0aH1gKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIF9oYW5kbGVOYXRpdmVDaGFuZ2VFdmVudCgpOiBQcm9taXNlIHtcbiAgICAvLyBEb24ndCBib3RoZXIgY2hlY2tpbmcgdGhlIGZpbGUgLSB0aGlzIGNhbiBiZSB2ZXJ5IGV4cGVuc2l2ZS5cbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UnKTtcbiAgfVxuXG4gIF9oYW5kbGVOYXRpdmVSZW5hbWVFdmVudChuZXdQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl91bnN1YnNjcmliZUZyb21OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICBjb25zdCB7cHJvdG9jb2wsIGhvc3R9ID0gcmVtb3RlVXJpLnBhcnNlKHRoaXMuX3BhdGgpO1xuICAgIHRoaXMuX2xvY2FsUGF0aCA9IG5ld1BhdGg7XG4gICAgaW52YXJpYW50KHByb3RvY29sKTtcbiAgICBpbnZhcmlhbnQoaG9zdCk7XG4gICAgdGhpcy5fcGF0aCA9IHByb3RvY29sICsgJy8vJyArIGhvc3QgKyB0aGlzLl9sb2NhbFBhdGg7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1yZW5hbWUnKTtcbiAgfVxuXG4gIF9oYW5kbGVOYXRpdmVEZWxldGVFdmVudCgpOiB2b2lkIHtcbiAgICB0aGlzLl91bnN1YnNjcmliZUZyb21OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICBpZiAoIXRoaXMuX2RlbGV0ZWQpIHtcbiAgICAgIHRoaXMuX2RlbGV0ZWQgPSB0cnVlO1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdkaWQtZGVsZXRlJyk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgICogUmV0dXJuIGEgbmV3IERpc3Bvc2FibGUgdGhhdCB1cG9uIGRpc3Bvc2UsIHdpbGwgcmVtb3ZlIHRoZSBib3VuZCB3YXRjaCBzdWJzY3JpcHRpb24uXG4gICAqIFdoZW4gdGhlIG51bWJlciBvZiBzdWJzY3JpcHRpb25zIHJlYWNoIDAsIHRoZSBmaWxlIGlzIHVud2F0Y2hlZC5cbiAgICovXG4gIF90cmFja1Vuc3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbjogSURpc3Bvc2FibGUpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9kaWRSZW1vdmVTdWJzY3JpcHRpb24oKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9kaWRSZW1vdmVTdWJzY3JpcHRpb24oKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uQ291bnQtLTtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9uQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX3Vuc3Vic2NyaWJlRnJvbU5hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICAgIH1cbiAgfVxuXG4gIF91bnN1YnNjcmliZUZyb21OYXRpdmVDaGFuZ2VFdmVudHMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3dhdGNoU3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl93YXRjaFN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl93YXRjaFN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgb25XaWxsVGhyb3dXYXRjaEVycm9yKFxuICAgIGNhbGxiYWNrOiAod2F0Y2hFcnJvcjoge2Vycm9yOiBFcnJvcjsgaGFuZGxlOiAoKSA9PiB2b2lkfSkgPT4gbWl4ZWQsXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignd2lsbC10aHJvdy13YXRjaC1lcnJvcicsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGlzRmlsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlzRGlyZWN0b3J5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGV4aXN0cygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKS5leGlzdHModGhpcy5fbG9jYWxQYXRoKTtcbiAgfVxuXG4gIGV4aXN0c1N5bmMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBnZXREaWdlc3RTeW5jKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuX2RpZ2VzdCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2RpZ2VzdDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdnZXREaWdlc3RTeW5jIGlzIG5vdCBzdXBwb3J0ZWQgaW4gUmVtb3RlRmlsZScpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldERpZ2VzdCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGlmICh0aGlzLl9kaWdlc3QpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kaWdlc3Q7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMucmVhZCgpO1xuICAgIGludmFyaWFudCh0aGlzLl9kaWdlc3QpO1xuICAgIHJldHVybiB0aGlzLl9kaWdlc3Q7XG4gIH1cblxuICBfc2V0RGlnZXN0KGNvbnRlbnRzOiBzdHJpbmcpIHtcbiAgICBjb25zdCBoYXNoID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTEnKS51cGRhdGUoY29udGVudHMgfHwgJycpO1xuICAgIGludmFyaWFudChoYXNoKTtcbiAgICB0aGlzLl9kaWdlc3QgPSBoYXNoLmRpZ2VzdCgnaGV4Jyk7XG4gIH1cblxuICBzZXRFbmNvZGluZyhlbmNvZGluZzogc3RyaW5nKSB7XG4gICAgdGhpcy5fZW5jb2RpbmcgPSBlbmNvZGluZztcbiAgfVxuXG4gIGdldEVuY29kaW5nKCk6ID9zdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9lbmNvZGluZztcbiAgfVxuXG4gIGdldFBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fcGF0aDtcbiAgfVxuXG4gIGdldExvY2FsUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9sb2NhbFBhdGg7XG4gIH1cblxuICBnZXRSZWFsUGF0aFN5bmMoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fcmVhbHBhdGggfHwgdGhpcy5fcGF0aDtcbiAgfVxuXG4gIGFzeW5jIGdldFJlYWxQYXRoKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgaWYgKHRoaXMuX3JlYWxwYXRoID09IG51bGwpIHtcbiAgICAgIHRoaXMuX3JlYWxwYXRoID0gYXdhaXQgdGhpcy5fZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKS5yZWFscGF0aCh0aGlzLl9sb2NhbFBhdGgpO1xuICAgIH1cbiAgICBpbnZhcmlhbnQodGhpcy5fcmVhbHBhdGgpO1xuICAgIHJldHVybiB0aGlzLl9yZWFscGF0aDtcbiAgfVxuXG4gIGdldEJhc2VOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhdGhVdGlsLmJhc2VuYW1lKHRoaXMuX3BhdGgpO1xuICB9XG5cbiAgYXN5bmMgY3JlYXRlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHdhc0NyZWF0ZWQgPSBhd2FpdCB0aGlzLl9nZXRGaWxlU3lzdGVtU2VydmljZSgpLm5ld0ZpbGUodGhpcy5fbG9jYWxQYXRoKTtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9uQ291bnQgPiAwKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVUb05hdGl2ZUNoYW5nZUV2ZW50cygpO1xuICAgIH1cbiAgICByZXR1cm4gd2FzQ3JlYXRlZDtcbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZSgpOiBQcm9taXNlIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5fZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKS51bmxpbmsodGhpcy5fbG9jYWxQYXRoKTtcbiAgICAgIHRoaXMuX2hhbmRsZU5hdGl2ZURlbGV0ZUV2ZW50KCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChlcnJvci5jb2RlICE9PSAnRU5PRU5UJykge1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyByZW5hbWUobmV3UGF0aDogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgYXdhaXQgdGhpcy5fZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKS5yZW5hbWUodGhpcy5fbG9jYWxQYXRoLCBuZXdQYXRoKTtcbiAgICB0aGlzLl9oYW5kbGVOYXRpdmVSZW5hbWVFdmVudChuZXdQYXRoKTtcbiAgfVxuXG4gIGFzeW5jIGNvcHkobmV3UGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3Qgd2FzQ29waWVkID0gYXdhaXQgdGhpcy5fZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKS5jb3B5KHRoaXMuX2xvY2FsUGF0aCwgbmV3UGF0aCk7XG4gICAgdGhpcy5fc3Vic2NyaWJlVG9OYXRpdmVDaGFuZ2VFdmVudHMoKTtcbiAgICByZXR1cm4gd2FzQ29waWVkO1xuICB9XG5cbiAgYXN5bmMgcmVhZChmbHVzaENhY2hlPzogYm9vbGVhbik6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkucmVhZEZpbGUodGhpcy5fbG9jYWxQYXRoKTtcbiAgICBjb25zdCBjb250ZW50cyA9IGRhdGEudG9TdHJpbmcoKTtcbiAgICB0aGlzLl9zZXREaWdlc3QoY29udGVudHMpO1xuICAgIC8vIFRPRE86IHJlc3BlY3QgZW5jb2RpbmdcbiAgICByZXR1cm4gY29udGVudHM7XG4gIH1cblxuICByZWFkU3luYyhmbHVzaGNhY2hlOiBib29sZWFuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlYWRTeW5jIGlzIG5vdCBzdXBwb3J0ZWQgaW4gUmVtb3RlRmlsZScpO1xuICB9XG5cbiAgYXN5bmMgd3JpdGUodGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcHJldmlvdXNseUV4aXN0ZWQgPSBhd2FpdCB0aGlzLmV4aXN0cygpO1xuICAgIGF3YWl0IHRoaXMuX2dldEZpbGVTeXN0ZW1TZXJ2aWNlKCkud3JpdGVGaWxlKHRoaXMuX2xvY2FsUGF0aCwgdGV4dCk7XG4gICAgaWYgKCFwcmV2aW91c2x5RXhpc3RlZCAmJiB0aGlzLl9zdWJzY3JpcHRpb25Db3VudCA+IDApIHtcbiAgICAgIHRoaXMuX3N1YnNjcmliZVRvTmF0aXZlQ2hhbmdlRXZlbnRzKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0UGFyZW50KCk6IFJlbW90ZURpcmVjdG9yeSB7XG4gICAgY29uc3Qge3BhdGg6IGxvY2FsUGF0aCwgcHJvdG9jb2wsIGhvc3R9ID0gcmVtb3RlVXJpLnBhcnNlKHRoaXMuX3BhdGgpO1xuICAgIGludmFyaWFudChwcm90b2NvbCk7XG4gICAgaW52YXJpYW50KGhvc3QpO1xuICAgIGNvbnN0IGRpcmVjdG9yeVBhdGggPSBwcm90b2NvbCArICcvLycgKyBob3N0ICsgcGF0aFV0aWwuZGlybmFtZShsb2NhbFBhdGgpO1xuICAgIHJldHVybiB0aGlzLl9yZW1vdGUuY3JlYXRlRGlyZWN0b3J5KGRpcmVjdG9yeVBhdGgpO1xuICB9XG5cbiAgaXNTeW1ib2xpY0xpbmsoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N5bWxpbms7XG4gIH1cblxuICBfZ2V0RmlsZVN5c3RlbVNlcnZpY2UoKTogRmlsZVN5c3RlbVNlcnZpY2Uge1xuICAgIHJldHVybiB0aGlzLl9nZXRTZXJ2aWNlKCdGaWxlU3lzdGVtU2VydmljZScpO1xuICB9XG5cbiAgX2dldFNlcnZpY2Uoc2VydmljZU5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX3JlbW90ZS5nZXRTZXJ2aWNlKHNlcnZpY2VOYW1lKTtcbiAgfVxufVxuIl19