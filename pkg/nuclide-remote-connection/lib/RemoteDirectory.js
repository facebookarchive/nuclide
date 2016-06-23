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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _nuclideRemoteUri4;

function _nuclideRemoteUri3() {
  return _nuclideRemoteUri4 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

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
   * @param uri should be of the form "nuclide://example.com/path/to/directory".
   */

  function RemoteDirectory(server, uri, symlink, options) {
    if (symlink === undefined) symlink = false;

    _classCallCheck(this, RemoteDirectory);

    Object.defineProperty(this, MARKER_PROPERTY_FOR_REMOTE_DIRECTORY, { value: true });
    this._server = server;
    this._uri = uri;
    this._emitter = new (_atom2 || _atom()).Emitter();
    this._subscriptionCount = 0;
    this._symlink = symlink;

    var _default$parse = (_nuclideRemoteUri4 || _nuclideRemoteUri3()).default.parse(uri);

    var directoryPath = _default$parse.path;
    var protocol = _default$parse.protocol;
    var host = _default$parse.host;

    (0, (_assert2 || _assert()).default)(protocol);
    (0, (_assert2 || _assert()).default)(host);
    /** In the example, this would be "nuclide://example.com". */
    this._host = host;
    /** In the example, this would be "/path/to/directory". */
    this._localPath = directoryPath;
    // A workaround before Atom 2.0: see ::getHgRepoInfo of main.js.
    this._hgRepositoryDescription = options ? options.hgRepositoryDescription : null;
    this._deleted = false;
  }

  _createClass(RemoteDirectory, [{
    key: 'onDidChange',
    value: function onDidChange(callback) {
      this._willAddSubscription();
      return this._trackUnsubscription(this._emitter.on('did-change', callback));
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

      var _ref = this._getService('FileWatcherService');

      var watchDirectory = _ref.watchDirectory;

      var watchStream = watchDirectory(this._uri);
      this._watchSubscription = watchStream.subscribe(function (watchUpdate) {
        logger.debug('watchDirectory update:', watchUpdate);
        switch (watchUpdate.type) {
          case 'change':
            return _this._handleNativeChangeEvent();
          case 'delete':
            return _this._handleNativeDeleteEvent();
        }
      }, function (error) {
        logger.error('Failed to subscribe RemoteDirectory:', _this._uri, error);
        _this._watchSubscription = null;
      }, function () {
        // Nothing needs to be done if the root directory watch has ended.
        logger.debug('watchDirectory ended: ' + _this._uri);
        _this._watchSubscription = null;
      });
    }
  }, {
    key: '_handleNativeChangeEvent',
    value: function _handleNativeChangeEvent() {
      this._emitter.emit('did-change');
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
        return this._unsubscribeFromNativeChangeEvents();
      }
    }
  }, {
    key: '_unsubscribeFromNativeChangeEvents',
    value: function _unsubscribeFromNativeChangeEvents() {
      if (this._watchSubscription) {
        try {
          this._watchSubscription.unsubscribe();
        } catch (error) {
          logger.warn('RemoteDirectory failed to unsubscribe from native events:', this._uri, error.message);
        }
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
      filePath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.normalize(filePath);
      var parts = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.parsePath(filePath);
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
    key: 'getRealPathSync',
    value: function getRealPathSync() {
      throw new Error('Not implemented');
    }
  }, {
    key: 'getBaseName',
    value: function getBaseName() {
      return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(this._localPath);
    }
  }, {
    key: 'relativize',
    value: function relativize(uri) {
      if (!uri) {
        return uri;
      }
      // Note: host of uri must match this._host.
      var subpath = (_nuclideRemoteUri4 || _nuclideRemoteUri3()).default.parse(uri).path;
      return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.relative(this._localPath, subpath);
    }
  }, {
    key: 'getParent',
    value: function getParent() {
      if (this.isRoot()) {
        return this;
      } else {
        var uri = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.createRemoteUri(this._host, (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(this._localPath));
        return this._server.createDirectory(uri, this._hgRepositoryDescription);
      }
    }
  }, {
    key: 'getFile',
    value: function getFile(filename) {
      var uri = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.createRemoteUri(this._host, (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(this._localPath, filename));
      return this._server.createFile(uri);
    }
  }, {
    key: 'getSubdirectory',
    value: function getSubdirectory(dir) {
      var uri = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.createRemoteUri(this._host, (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(this._localPath, dir));
      return this._server.createDirectory(uri, this._hgRepositoryDescription);
    }
  }, {
    key: 'create',
    value: _asyncToGenerator(function* () {
      (0, (_assert2 || _assert()).default)(!this._deleted, 'RemoteDirectory has been deleted');
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
      this._handleNativeDeleteEvent();
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

      var _default$parse2 = (_nuclideRemoteUri4 || _nuclideRemoteUri3()).default.parse(this._uri);

      var protocol = _default$parse2.protocol;
      var host = _default$parse2.host;

      this._localPath = newPath;
      (0, (_assert2 || _assert()).default)(protocol);
      (0, (_assert2 || _assert()).default)(host);
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
        (0, (_assert2 || _assert()).default)(entry);
        var uri = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.createRemoteUri(_this3._host, (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(_this3._localPath, entry.file));
        var symlink = entry.isSymbolicLink;
        if (entry.stats && entry.stats.isFile()) {
          files.push(_this3._server.createFile(uri, symlink));
        } else {
          directories.push(_this3._server.createDirectory(uri, _this3._hgRepositoryDescription, symlink));
        }
      });
      callback(null, directories.concat(files));
    })
  }, {
    key: 'contains',
    value: function contains(pathToCheck) {
      if (pathToCheck == null) {
        return false;
      }

      return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.contains(this.getPath(), pathToCheck);
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

  return RemoteDirectory;
})();

exports.RemoteDirectory = RemoteDirectory;