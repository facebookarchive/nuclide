Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideFileTreeLibFileTreeHelpers = require('../../nuclide-file-tree/lib/FileTreeHelpers');

var _nuclideFileTreeLibFileTreeHelpers2 = _interopRequireDefault(_nuclideFileTreeLibFileTreeHelpers);

var _nuclideRemoteConnection = require('../../nuclide-remote-connection');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var _atom = require('atom');

var _rxjs = require('rxjs');

var _rxjs2 = _interopRequireDefault(_rxjs);

var CwdApi = (function () {
  function CwdApi(initialCwdPath) {
    var _this = this;

    _classCallCheck(this, CwdApi);

    this._cwdPath$ = new _rxjs2['default'].BehaviorSubject(initialCwdPath);
    this._cwd$ = this._cwdPath$.distinctUntilChanged().map(function () {
      return _this.getCwd();
    }).map(function (directory) {
      return isValidDirectory(directory) ? directory : null;
    });

    this._disposables = new _atom.CompositeDisposable(
    // If the active directory is removed, fall back to the default.
    atom.project.onDidChangePaths(function () {
      var currentPath = _this._cwdPath$.getValue();
      if (currentPath == null || !isValidCwdPath(currentPath)) {
        _this._cwdPath$.next(_this._getDefaultCwdPath());
      }
    }));
  }

  _createClass(CwdApi, [{
    key: 'setCwd',
    value: function setCwd(path) {
      if (!isValidCwdPath(path)) {
        throw new Error('Path is not a project root: ' + path);
      }
      this._cwdPath$.next(path);
    }
  }, {
    key: 'observeCwd',
    value: function observeCwd(callback) {
      return new _nuclideCommons.DisposableSubscription(this._cwd$.subscribe(function (directory) {
        callback(directory);
      }));
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: '_getDefaultCwdPath',
    value: function _getDefaultCwdPath() {
      var directory = atom.project.getDirectories()[0];
      return directory == null ? null : directory.getPath();
    }
  }, {
    key: 'getCwd',
    value: function getCwd() {
      return getDirectory(this._cwdPath$.getValue() || this._getDefaultCwdPath());
    }
  }]);

  return CwdApi;
})();

exports.CwdApi = CwdApi;

function getDirectory(path) {
  if (path == null) {
    return null;
  }
  if (_nuclideRemoteUri2['default'].isRemote(path)) {
    var connection = _nuclideRemoteConnection.RemoteConnection.getForUri(path);
    if (connection == null) {
      return null;
    }
    return new _nuclideRemoteConnection.RemoteDirectory(connection.getConnection(), path);
  }
  return new _atom.Directory(path);
}

function isValidDirectory(directory) {
  if (directory == null) {
    return true;
  }
  return _nuclideFileTreeLibFileTreeHelpers2['default'].isValidDirectory(directory);
}

function isValidCwdPath(path) {
  if (path == null) {
    return true;
  }
  var validPaths = atom.project.getDirectories().map(function (directory) {
    return directory.getPath();
  });
  return validPaths.indexOf(path) !== -1;
}