'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteDirectory = undefined;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

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
    this._emitter = new (_eventKit || _load_eventKit()).Emitter();
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
    this._isArchive = options != null && Boolean(options.isArchive);
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

  /**
   * We may want to provide an implementation for this at some point.
   * However, for the time being, we don't get any benefits from doing so.
   */
  onDidChangeFiles(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default();
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
    const watchStream = (_nuclideUri || _load_nuclideUri()).default.isInArchive(this._uri) ? this._server.getFileWatch((_nuclideUri || _load_nuclideUri()).default.ancestorOutsideArchive(this._uri)) : this._server.getDirectoryWatch(this._uri);
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
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
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

  _joinLocalPath(name) {
    return this._isArchive ? (_nuclideUri || _load_nuclideUri()).default.archiveJoin(this._localPath, name) : (_nuclideUri || _load_nuclideUri()).default.join(this._localPath, name);
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
    if (!(_nuclideUri || _load_nuclideUri()).default.isRemote(uri || '')) {
      return uri;
    }
    const parsedUrl = (_nuclideUri || _load_nuclideUri()).default.parse(uri);
    if (parsedUrl.hostname !== this._host) {
      return uri;
    }
    return (_nuclideUri || _load_nuclideUri()).default.relative(this._localPath, parsedUrl.path);
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
    const uri = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(this._host, this._joinLocalPath(filename));
    return this._server.createFile(uri);
  }

  getSubdirectory(dir) {
    const uri = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(this._host, this._joinLocalPath(dir));
    return this._server.createDirectory(uri, this._hgRepositoryDescription);
  }

  async create() {
    if (!!this._deleted) {
      throw new Error('RemoteDirectory has been deleted');
    }

    const created = await this._getFileSystemService().mkdirp(this._uri);
    if (this._subscriptionCount > 0) {
      this._subscribeToNativeChangeEvents();
    }
    return created;
  }

  async delete() {
    await this._getFileSystemService().rmdir(this._uri);
    this._handleNativeDeleteEvent();
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
  async getEntries(callback) {
    let entries;
    try {
      entries = await this._getFileSystemService().readdirSorted(this._uri);
    } catch (e) {
      callback(e, null);
      return;
    }

    const directories = [];
    const files = [];
    entries.forEach(entry => {
      const [name, isFile, symlink] = entry;
      const uri = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(this._host, this._joinLocalPath(name));
      if (isFile) {
        files.push(this._server.createFile(uri, symlink));
      } else {
        directories.push(this._server.createDirectory(uri, this._hgRepositoryDescription, symlink));
      }
    });
    callback(null, directories.concat(files));
  }

  contains(pathToCheck) {
    if (!(_nuclideUri || _load_nuclideUri()).default.isRemote(pathToCheck || '')) {
      return false;
    }

    return (_nuclideUri || _load_nuclideUri()).default.contains(this.getPath(), pathToCheck || '');
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