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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _crypto2;

function _crypto() {
  return _crypto2 = _interopRequireDefault(require('crypto'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideRemoteUri4;

function _nuclideRemoteUri3() {
  return _nuclideRemoteUri4 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

/* Mostly implements https://atom.io/docs/api/latest/File */

var RemoteFile = (function () {
  function RemoteFile(server, remotePath) {
    var symlink = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    _classCallCheck(this, RemoteFile);

    this._server = server;
    this.setPath(remotePath);
    this._emitter = new (_atom2 || _atom()).Emitter();
    this._subscriptionCount = 0;
    this._deleted = false;
    this._symlink = symlink;
  }

  _createClass(RemoteFile, [{
    key: 'dispose',
    value: function dispose() {
      this._subscriptionCount = 0;
      this._unsubscribeFromNativeChangeEvents();
    }
  }, {
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
        _this._watchSubscription = null;
      }, function () {
        // Nothing needs to be done if the root directory watch has ended.
        logger.debug('watchFile ended: ' + _this._path);
        _this._watchSubscription = null;
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

      var _default$parse = (_nuclideRemoteUri4 || _nuclideRemoteUri3()).default.parse(this._path);

      var protocol = _default$parse.protocol;
      var host = _default$parse.host;

      this._localPath = newPath;
      (0, (_assert2 || _assert()).default)(protocol);
      (0, (_assert2 || _assert()).default)(host);
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

      return new (_atom2 || _atom()).Disposable(function () {
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
      if (!this._digest) {
        // File's `getDigestSync()` calls `readSync()`, which we don't implement.
        // However, we mimic it's behavior for when a file does not exist.
        this._setDigest('');
      }
      (0, (_assert2 || _assert()).default)(this._digest);
      return this._digest;
    }
  }, {
    key: 'getDigest',
    value: _asyncToGenerator(function* () {
      if (this._digest) {
        return this._digest;
      }
      yield this.read();
      (0, (_assert2 || _assert()).default)(this._digest);
      return this._digest;
    })
  }, {
    key: '_setDigest',
    value: function _setDigest(contents) {
      var hash = (_crypto2 || _crypto()).default.createHash('sha1').update(contents || '');
      (0, (_assert2 || _assert()).default)(hash);
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
    key: 'setPath',
    value: function setPath(remotePath) {
      var _default$parse2 = (_nuclideRemoteUri4 || _nuclideRemoteUri3()).default.parse(remotePath);

      var localPath = _default$parse2.path;

      this._localPath = localPath;
      this._path = remotePath;
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
      (0, (_assert2 || _assert()).default)(this._realpath);
      return this._realpath;
    })
  }, {
    key: 'getBaseName',
    value: function getBaseName() {
      return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(this._path);
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
      var _default$parse3 = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.parse(this._path);

      var localPath = _default$parse3.path;
      var protocol = _default$parse3.protocol;
      var host = _default$parse3.host;

      (0, (_assert2 || _assert()).default)(protocol);
      (0, (_assert2 || _assert()).default)(host);
      var directoryPath = protocol + '//' + host + (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(localPath);
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