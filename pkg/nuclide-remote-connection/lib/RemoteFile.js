'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteFile = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _crypto = _interopRequireDefault(require('crypto'));

var _atom = require('atom');

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

/* Mostly implements https://atom.io/docs/api/latest/File */
class RemoteFile {

  constructor(server, remotePath, symlink = false) {
    this._server = server;
    this.setPath(remotePath);
    this._emitter = new _atom.Emitter();
    this._subscriptionCount = 0;
    this._deleted = false;
    this._symlink = symlink;
  }

  dispose() {
    this._subscriptionCount = 0;
    this._unsubscribeFromNativeChangeEvents();
  }

  onDidChange(callback) {
    this._willAddSubscription();
    return this._trackUnsubscription(this._emitter.on('did-change', callback));
  }

  onDidRename(callback) {
    // TODO: this is not supported by the Watchman API.
    return new _atom.Disposable();
  }

  onDidDelete(callback) {
    this._willAddSubscription();
    return this._trackUnsubscription(this._emitter.on('did-delete', callback));
  }

  _willAddSubscription() {
    this._subscriptionCount++;
    return this._subscribeToNativeChangeEvents();
  }

  _subscribeToNativeChangeEvents() {
    if (this._watchSubscription) {
      return;
    }
    const watchStream = this._server.getFileWatch(this._path);
    this._watchSubscription = watchStream.subscribe(watchUpdate => {
      // This only happens after a `setPath` and subsequent file rename.
      // Getting this message signifies that the new file should be ready for watching.
      if (watchUpdate.path !== this._path) {
        logger.debug('watchFile renamed:', this._path);
        this._unsubscribeFromNativeChangeEvents();
        this._subscribeToNativeChangeEvents();
        return;
      }
      logger.debug('watchFile update:', watchUpdate);
      switch (watchUpdate.type) {
        case 'change':
          return this._handleNativeChangeEvent();
        case 'delete':
          return this._handleNativeDeleteEvent();
      }
    }, error => {
      logger.error('Failed to subscribe RemoteFile:', this._path, error);
      this._watchSubscription = null;
    }, () => {
      // Nothing needs to be done if the root directory watch has ended.
      logger.debug(`watchFile ended: ${this._path}`);
      this._watchSubscription = null;
    });
  }

  _handleNativeChangeEvent() {
    // Don't bother checking the file - this can be very expensive.
    this._emitter.emit('did-change');
    return Promise.resolve();
  }

  _handleNativeDeleteEvent() {
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
  _trackUnsubscription(subscription) {
    return new _atom.Disposable(() => {
      subscription.dispose();
      this._didRemoveSubscription();
    });
  }

  _didRemoveSubscription() {
    this._subscriptionCount--;
    if (this._subscriptionCount === 0) {
      this._unsubscribeFromNativeChangeEvents();
    }
  }

  _unsubscribeFromNativeChangeEvents() {
    if (this._watchSubscription) {
      this._watchSubscription.unsubscribe();
      this._watchSubscription = null;
    }
  }

  onWillThrowWatchError(callback) {
    return this._emitter.on('will-throw-watch-error', callback);
  }

  isFile() {
    return true;
  }

  isDirectory() {
    return false;
  }

  exists() {
    return this._getFileSystemService().exists(this._localPath);
  }

  existsSync() {
    return true;
  }

  getDigestSync() {
    if (!this._digest) {
      // File's `getDigestSync()` calls `readSync()`, which we don't implement.
      // However, we mimic it's behavior for when a file does not exist.
      this._setDigest('');
    }

    if (!this._digest) {
      throw new Error('Invariant violation: "this._digest"');
    }

    return this._digest;
  }

  getDigest() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this._digest) {
        return _this._digest;
      }
      yield _this.read();

      if (!_this._digest) {
        throw new Error('Invariant violation: "this._digest"');
      }

      return _this._digest;
    })();
  }

  _setDigest(contents) {
    const hash = _crypto.default.createHash('sha1').update(contents || '');

    if (!hash) {
      throw new Error('Invariant violation: "hash"');
    }

    this._digest = hash.digest('hex');
  }

  setEncoding(encoding) {
    this._encoding = encoding;
  }

  getEncoding() {
    return this._encoding;
  }

  setPath(remotePath) {
    const { path: localPath } = (_nuclideUri || _load_nuclideUri()).default.parse(remotePath);
    this._localPath = localPath;
    this._path = remotePath;
  }

  getPath() {
    return this._path;
  }

  getLocalPath() {
    return this._localPath;
  }

  getRealPathSync() {
    return this._realpath || this._path;
  }

  getRealPath() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this2._realpath == null) {
        _this2._realpath = yield _this2._getFileSystemService().realpath(_this2._localPath);
      }

      if (!_this2._realpath) {
        throw new Error('Invariant violation: "this._realpath"');
      }

      return _this2._realpath;
    })();
  }

  getBaseName() {
    return (_nuclideUri || _load_nuclideUri()).default.basename(this._path);
  }

  create() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const wasCreated = yield _this3._getFileSystemService().newFile(_this3._localPath);
      if (_this3._subscriptionCount > 0) {
        _this3._subscribeToNativeChangeEvents();
      }
      return wasCreated;
    })();
  }

  delete() {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        yield _this4._getFileSystemService().unlink(_this4._localPath);
        _this4._handleNativeDeleteEvent();
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    })();
  }

  copy(newPath) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const wasCopied = yield _this5._getFileSystemService().copy(_this5._localPath, newPath);
      _this5._subscribeToNativeChangeEvents();
      return wasCopied;
    })();
  }

  read(flushCache) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const data = yield _this6._getFileSystemService().readFile(_this6._localPath);
      const contents = data.toString();
      _this6._setDigest(contents);
      // TODO: respect encoding
      return contents;
    })();
  }

  readSync(flushcache) {
    throw new Error('readSync is not supported in RemoteFile');
  }

  write(text) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const previouslyExisted = yield _this7.exists();
      yield _this7._getFileSystemService().writeFile(_this7._localPath, text);
      if (!previouslyExisted && _this7._subscriptionCount > 0) {
        _this7._subscribeToNativeChangeEvents();
      }
    })();
  }

  getParent() {
    const directoryPath = (_nuclideUri || _load_nuclideUri()).default.dirname(this._path);
    const remoteConnection = this._server.getRemoteConnectionForUri(this._path);
    const hgRepositoryDescription = remoteConnection != null ? remoteConnection.getHgRepositoryDescription() : null;
    return this._server.createDirectory(directoryPath, hgRepositoryDescription);
  }

  isSymbolicLink() {
    return this._symlink;
  }

  _getFileSystemService() {
    return this._getService('FileSystemService');
  }

  _getService(serviceName) {
    return this._server.getService(serviceName);
  }
}
exports.RemoteFile = RemoteFile;