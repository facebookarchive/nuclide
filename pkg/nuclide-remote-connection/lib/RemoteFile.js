'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteFile = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _crypto = _interopRequireDefault(require('crypto'));

var _atom = require('atom');

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _stream = _interopRequireDefault(require('stream'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-remote-connection');

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
    this._subscribeToNativeChangeEvents();
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
      // In the case of new files, it's normal for the remote file to not exist yet.
      if (error.code !== 'ENOENT') {
        logger.error('Failed to subscribe RemoteFile:', this._path, error);
      }
      this._watchSubscription = null;
    }, () => {
      // Nothing needs to be done if the root directory watch has ended.
      logger.debug(`watchFile ended: ${this._path}`);
      this._watchSubscription = null;
    });

    // No need to wait for that async check.
    this._checkWatchOutOfOpenDirectories();
  }

  _checkWatchOutOfOpenDirectories() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const isPathInOpenDirectories = atom.project.contains(_this._path);
      if (!isPathInOpenDirectories && (yield (0, (_passesGK || _load_passesGK()).default)('nuclide_watch_warn_unmanaged_file'))) {
        atom.notifications.addWarning(`Couldn't watch remote file \`${(_nuclideUri || _load_nuclideUri()).default.basename(_this._path)}\` for changes!`, {
          detail: "Updates to the file outside Nuclide won't reload automatically\n" + "Please add the file's project directory to Nuclide\n",
          dismissable: true
        });
      }
    })();
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
    return this._getFileSystemService().exists(this._path);
  }

  existsSync() {
    return true;
  }

  getDigestSync() {
    // flowlint-next-line sketchy-null-string:off
    if (!this._digest) {
      // File's `getDigestSync()` calls `readSync()`, which we don't implement.
      // However, we mimic it's behavior for when a file does not exist.
      this._setDigest('');
    }
    // flowlint-next-line sketchy-null-string:off

    if (!this._digest) {
      throw new Error('Invariant violation: "this._digest"');
    }

    return this._digest;
  }

  getDigest() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // flowlint-next-line sketchy-null-string:off
      if (_this2._digest) {
        return _this2._digest;
      }
      yield _this2.read();
      // flowlint-next-line sketchy-null-string:off

      if (!_this2._digest) {
        throw new Error('Invariant violation: "this._digest"');
      }

      return _this2._digest;
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
    // flowlint-next-line sketchy-null-string:off
    return this._realpath || this._path;
  }

  getRealPath() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this3._realpath == null) {
        _this3._realpath = yield _this3._getFileSystemService().realpath(_this3._path);
      }

      if (!_this3._realpath) {
        throw new Error('Invariant violation: "this._realpath"');
      }

      return _this3._realpath;
    })();
  }

  getBaseName() {
    return (_nuclideUri || _load_nuclideUri()).default.basename(this._path);
  }

  create() {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const wasCreated = yield _this4._getFileSystemService().newFile(_this4._path);
      if (_this4._subscriptionCount > 0) {
        _this4._subscribeToNativeChangeEvents();
      }
      return wasCreated;
    })();
  }

  delete() {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        yield _this5._getFileSystemService().unlink(_this5._path);
        _this5._handleNativeDeleteEvent();
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    })();
  }

  copy(newPath) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const wasCopied = yield _this6._getFileSystemService().copy(_this6._path, newPath);
      _this6._subscribeToNativeChangeEvents();
      return wasCopied;
    })();
  }

  read(flushCache) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const data = yield _this7._getFileSystemService().readFile(_this7._path);
      const contents = data.toString();
      _this7._setDigest(contents);
      // TODO: respect encoding
      return contents;
    })();
  }

  readSync(flushcache) {
    throw new Error('readSync is not supported in RemoteFile');
  }

  write(text) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const previouslyExisted = yield _this8.exists();
      yield _this8._getFileSystemService().writeFile(_this8._path, text);
      if (!previouslyExisted && _this8._subscriptionCount > 0) {
        _this8._subscribeToNativeChangeEvents();
      }
    })();
  }

  writeWithPermission(text, permission) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const previouslyExisted = yield _this9.exists();
      yield _this9._getFileSystemService().writeFile(_this9._path, text, {
        mode: permission
      });
      if (!previouslyExisted && _this9._subscriptionCount > 0) {
        _this9._subscribeToNativeChangeEvents();
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

  /**
   * Implementing a real stream (with chunks) is potentially very inefficient, as making
   * multiple RPC calls can take much longer than just fetching the entire file.
   * This stream just fetches the entire file contents for now.
   */
  createReadStream() {
    const path = this._path;
    const service = this._getFileSystemService();
    // push() triggers another read(), so make sure we don't read the file twice.
    let pushed = false;
    const stream = new _stream.default.Readable({
      read(size) {
        if (pushed) {
          return;
        }
        service.readFile(path).then(buffer => {
          pushed = true;
          stream.push(buffer);
          stream.push(null);
        }, err => {
          stream.emit('error', err);
        });
      }
    });
    return stream;
  }

  /**
   * As with createReadStream, it's potentially very inefficient to write remotely in multiple
   * chunks. This stream just accumulates the data locally and flushes it all at once.
   */
  createWriteStream() {
    const writeData = [];
    let writeLength = 0;
    const stream = new _stream.default.Writable({
      write(chunk, encoding, next) {
        // `chunk` may be mutated by the caller, so make sure it's copied.
        writeData.push(Buffer.from(chunk));
        writeLength += chunk.length;
        next();
      }
    });
    const originalEnd = stream.end;
    // TODO: (hansonw) T20364274 Override final() in Node 8 and above.
    // For now, we'll overwrite the end function manually.
    // $FlowIgnore
    stream.end = cb => {
      if (!(cb instanceof Function)) {
        throw new Error('end() called without a callback');
      }

      this._getFileSystemService().writeFileBuffer(this._path, Buffer.concat(writeData, writeLength)).then(() => cb(), err => {
        stream.emit('error', err);
        cb();
      });
      originalEnd.call(stream);
    };
    return stream;
  }
}
exports.RemoteFile = RemoteFile;