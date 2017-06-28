'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteDirectory = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _atom = require('atom');

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-remote-connection'); /**
                                                                                         * Copyright (c) 2015-present, Facebook, Inc.
                                                                                         * All rights reserved.
                                                                                         *
                                                                                         * This source code is licensed under the license found in the LICENSE file in
                                                                                         * the root directory of this source tree.
                                                                                         *
                                                                                         * 
                                                                                         * @format
                                                                                         */

const MARKER_PROPERTY_FOR_REMOTE_DIRECTORY = '__nuclide_remote_directory__';

/* Mostly implements https://atom.io/docs/api/latest/Directory */
class RemoteDirectory {
  static isRemoteDirectory(directory) {
    /* $FlowFixMe */
    return directory[MARKER_PROPERTY_FOR_REMOTE_DIRECTORY] === true;
  }

  /**
   * @param uri should be of the form "nuclide://example.com/path/to/directory".
   */
  constructor(server, uri, symlink = false, options) {
    Object.defineProperty(this, MARKER_PROPERTY_FOR_REMOTE_DIRECTORY, {
      value: true
    });
    this._server = server;
    this._uri = uri;
    this._emitter = new _atom.Emitter();
    this._subscriptionCount = 0;
    this._symlink = symlink;
    const { path: directoryPath, hostname } = (_nuclideUri || _load_nuclideUri()).default.parse(uri);

    if (!(hostname != null)) {
      throw new Error('Invariant violation: "hostname != null"');
    }
    /** In the example, this would be "nuclide://example.com". */


    this._host = hostname;
    /** In the example, this would be "/path/to/directory". */
    this._localPath = directoryPath;
    // A workaround before Atom 2.0: see ::getHgRepoInfo of main.js.
    this._hgRepositoryDescription = options ? options.hgRepositoryDescription : null;
    this._deleted = false;
  }

  dispose() {
    this._subscriptionCount = 0;
    this._unsubscribeFromNativeChangeEvents();
  }

  onDidChange(callback) {
    this._willAddSubscription();
    return this._trackUnsubscription(this._emitter.on('did-change', callback));
  }

  onDidDelete(callback) {
    this._willAddSubscription();
    return this._trackUnsubscription(this._emitter.on('did-delete', callback));
  }

  _willAddSubscription() {
    this._subscriptionCount++;
    try {
      this._subscribeToNativeChangeEvents();
    } catch (err) {
      logger.error('Failed to subscribe RemoteDirectory:', this._localPath, err);
    }
  }

  _subscribeToNativeChangeEvents() {
    if (this._watchSubscription) {
      return;
    }
    const watchStream = this._server.getDirectoryWatch(this._uri);
    this._watchSubscription = watchStream.subscribe(watchUpdate => {
      logger.debug('watchDirectory update:', watchUpdate);
      switch (watchUpdate.type) {
        case 'change':
          return this._handleNativeChangeEvent();
        case 'delete':
          return this._handleNativeDeleteEvent();
      }
    }, error => {
      logger.error('Failed to subscribe RemoteDirectory:', this._uri, error);
      this._watchSubscription = null;
    }, () => {
      // Nothing needs to be done if the root directory watch has ended.
      logger.debug(`watchDirectory ended: ${this._uri}`);
      this._watchSubscription = null;
    });
  }

  _handleNativeChangeEvent() {
    this._emitter.emit('did-change');
  }

  _handleNativeDeleteEvent() {
    this._unsubscribeFromNativeChangeEvents();
    if (!this._deleted) {
      this._deleted = true;
      this._emitter.emit('did-delete');
    }
  }

  _trackUnsubscription(subscription) {
    return new _atom.Disposable(() => {
      subscription.dispose();
      this._didRemoveSubscription();
    });
  }

  _didRemoveSubscription() {
    this._subscriptionCount--;
    if (this._subscriptionCount === 0) {
      return this._unsubscribeFromNativeChangeEvents();
    }
  }

  _unsubscribeFromNativeChangeEvents() {
    if (this._watchSubscription) {
      try {
        this._watchSubscription.unsubscribe();
      } catch (error) {
        logger.warn('RemoteDirectory failed to unsubscribe from native events:', this._uri, error.message);
      }
      this._watchSubscription = null;
    }
  }

  isFile() {
    return false;
  }

  isDirectory() {
    return true;
  }

  isRoot() {
    return this._isRoot(this._localPath);
  }

  exists() {
    return this._getFileSystemService().exists(this._uri);
  }

  existsSync() {
    // As of Atom 1.12, `atom.project.addPath` checks for project existence.
    // We must return true to have our remote directories be addable.
    return true;
  }

  _isRoot(filePath_) {
    let filePath = filePath_;
    filePath = (_nuclideUri || _load_nuclideUri()).default.normalize(filePath);
    const parts = (_nuclideUri || _load_nuclideUri()).default.parsePath(filePath);
    return parts.root === filePath;
  }

  getPath() {
    return this._uri;
  }

  getLocalPath() {
    return this._localPath;
  }

  getRealPathSync() {
    // Remote paths should already be resolved.
    return this._uri;
  }

  getBaseName() {
    return (_nuclideUri || _load_nuclideUri()).default.basename(this._localPath);
  }

  relativize(uri) {
    if (!uri) {
      return uri;
    }
    // Note: host of uri must match this._host.
    const subpath = (_nuclideUri || _load_nuclideUri()).default.parse(uri).path;
    return (_nuclideUri || _load_nuclideUri()).default.relative(this._localPath, subpath);
  }

  getParent() {
    if (this.isRoot()) {
      return this;
    } else {
      const uri = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(this._host, (_nuclideUri || _load_nuclideUri()).default.dirname(this._localPath));
      return this._server.createDirectory(uri, this._hgRepositoryDescription);
    }
  }

  getFile(filename) {
    const uri = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(this._host, (_nuclideUri || _load_nuclideUri()).default.join(this._localPath, filename));
    return this._server.createFile(uri);
  }

  getSubdirectory(dir) {
    const uri = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(this._host, (_nuclideUri || _load_nuclideUri()).default.join(this._localPath, dir));
    return this._server.createDirectory(uri, this._hgRepositoryDescription);
  }

  create() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!!_this._deleted) {
        throw new Error('RemoteDirectory has been deleted');
      }

      const created = yield _this._getFileSystemService().mkdirp(_this._uri);
      if (_this._subscriptionCount > 0) {
        _this._subscribeToNativeChangeEvents();
      }
      return created;
    })();
  }

  delete() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this2._getFileSystemService().rmdir(_this2._uri);
      _this2._handleNativeDeleteEvent();
    })();
  }

  getEntriesSync() {
    throw new Error('not implemented');
  }

  /*
   * Calls `callback` with either an Array of entries or an Error if there was a problem fetching
   * those entries.
   *
   * Note: Although this function is `async`, it never rejects. Check whether the `error` argument
   * passed to `callback` is `null` to determine if there was an error.
   */
  getEntries(callback) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let entries;
      try {
        entries = yield _this3._getFileSystemService().readdir(_this3._uri);
      } catch (e) {
        callback(e, null);
        return;
      }

      const directories = [];
      const files = [];
      entries.sort(function (a, b) {
        return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
      }).forEach(function (entry) {
        const [name, isFile, symlink] = entry;
        const uri = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(_this3._host, (_nuclideUri || _load_nuclideUri()).default.join(_this3._localPath, name));
        if (isFile) {
          files.push(_this3._server.createFile(uri, symlink));
        } else {
          directories.push(_this3._server.createDirectory(uri, _this3._hgRepositoryDescription, symlink));
        }
      });
      callback(null, directories.concat(files));
    })();
  }

  contains(pathToCheck) {
    if (pathToCheck == null) {
      return false;
    }

    return (_nuclideUri || _load_nuclideUri()).default.contains(this.getPath(), pathToCheck);
  }

  off() {}
  // This method is part of the EmitterMixin used by Atom's local Directory, but not documented
  // as part of the API - https://atom.io/docs/api/latest/Directory,
  // However, it appears to be called in project.coffee by Atom.


  // A workaround before Atom 2.0: see ::getHgRepoInfo of main.js.
  getHgRepositoryDescription() {
    return this._hgRepositoryDescription;
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
exports.RemoteDirectory = RemoteDirectory;