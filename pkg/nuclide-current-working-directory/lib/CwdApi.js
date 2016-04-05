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

var _nuclideFileTreeLibFileTreeHelpers = require('../../nuclide-file-tree/lib/FileTreeHelpers');

var _nuclideFileTreeLibFileTreeHelpers2 = _interopRequireDefault(_nuclideFileTreeLibFileTreeHelpers);

var _nuclideRemoteConnection = require('../../nuclide-remote-connection');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var _atom = require('atom');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var CwdApi = (function () {
  function CwdApi(initialCwdPath) {
    var _this = this;

    _classCallCheck(this, CwdApi);

    this._cwdPath$ = new _rx2['default'].BehaviorSubject(initialCwdPath);
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
        _this._cwdPath$.onNext(_this._getDefaultCwdPath());
      }
    }));
  }

  _createClass(CwdApi, [{
    key: 'setCwd',
    value: function setCwd(path) {
      if (!isValidCwdPath(path)) {
        throw new Error('Path is not a project root: ' + path);
      }
      this._cwdPath$.onNext(path);
    }
  }, {
    key: 'observeCwd',
    value: function observeCwd(callback) {
      return this._cwd$.subscribe(function (directory) {
        callback(directory);
      });
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
    return new _nuclideRemoteConnection.RemoteDirectory(connection, path);
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
//# sourceMappingURL=data:application/json;base64,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O0dBQ2I7QUFDRCxTQUFPLCtDQUFnQixnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztDQUNwRDs7QUFFRCxTQUFTLGNBQWMsQ0FBQyxJQUFhLEVBQVc7QUFDOUMsTUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO0FBQ2hCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7QUFDRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFBLFNBQVM7V0FBSSxTQUFTLENBQUMsT0FBTyxFQUFFO0dBQUEsQ0FBQyxDQUFDO0FBQ3ZGLFNBQU8sVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztDQUN4QyIsImZpbGUiOiJDd2RBcGkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgRmlsZVRyZWVIZWxwZXJzIGZyb20gJy4uLy4uL251Y2xpZGUtZmlsZS10cmVlL2xpYi9GaWxlVHJlZUhlbHBlcnMnO1xuaW1wb3J0IHtSZW1vdGVDb25uZWN0aW9uLCBSZW1vdGVEaXJlY3Rvcnl9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLWNvbm5lY3Rpb24nO1xuaW1wb3J0IFJlbW90ZVVyaSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXJlY3RvcnkgYXMgTG9jYWxEaXJlY3Rvcnl9IGZyb20gJ2F0b20nO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxudHlwZSBEaXJlY3RvcnkgPSBMb2NhbERpcmVjdG9yeSB8IFJlbW90ZURpcmVjdG9yeTtcblxuZXhwb3J0IGNsYXNzIEN3ZEFwaSB7XG4gIF9jd2QkOiBSeC5PYnNlcnZhYmxlPD9EaXJlY3Rvcnk+O1xuICBfY3dkUGF0aCQ6IFJ4LkJlaGF2aW9yU3ViamVjdDw/c3RyaW5nPjtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKGluaXRpYWxDd2RQYXRoOiA/c3RyaW5nKSB7XG4gICAgdGhpcy5fY3dkUGF0aCQgPSBuZXcgUnguQmVoYXZpb3JTdWJqZWN0KGluaXRpYWxDd2RQYXRoKTtcbiAgICB0aGlzLl9jd2QkID0gdGhpcy5fY3dkUGF0aCRcbiAgICAgIC5kaXN0aW5jdFVudGlsQ2hhbmdlZCgpXG4gICAgICAubWFwKCgpID0+IHRoaXMuZ2V0Q3dkKCkpXG4gICAgICAubWFwKGRpcmVjdG9yeSA9PiBpc1ZhbGlkRGlyZWN0b3J5KGRpcmVjdG9yeSkgPyBkaXJlY3RvcnkgOiBudWxsKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICAvLyBJZiB0aGUgYWN0aXZlIGRpcmVjdG9yeSBpcyByZW1vdmVkLCBmYWxsIGJhY2sgdG8gdGhlIGRlZmF1bHQuXG4gICAgICBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRQYXRoID0gdGhpcy5fY3dkUGF0aCQuZ2V0VmFsdWUoKTtcbiAgICAgICAgaWYgKGN1cnJlbnRQYXRoID09IG51bGwgfHwgIWlzVmFsaWRDd2RQYXRoKGN1cnJlbnRQYXRoKSkge1xuICAgICAgICAgIHRoaXMuX2N3ZFBhdGgkLm9uTmV4dCh0aGlzLl9nZXREZWZhdWx0Q3dkUGF0aCgpKTtcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIHNldEN3ZChwYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIWlzVmFsaWRDd2RQYXRoKHBhdGgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFBhdGggaXMgbm90IGEgcHJvamVjdCByb290OiAke3BhdGh9YCk7XG4gICAgfVxuICAgIHRoaXMuX2N3ZFBhdGgkLm9uTmV4dChwYXRoKTtcbiAgfVxuXG4gIG9ic2VydmVDd2QoY2FsbGJhY2s6IChkaXJlY3Rvcnk6ID9EaXJlY3RvcnkpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2N3ZCQuc3Vic2NyaWJlKGRpcmVjdG9yeSA9PiB7IGNhbGxiYWNrKGRpcmVjdG9yeSk7IH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBfZ2V0RGVmYXVsdEN3ZFBhdGgoKTogP3N0cmluZyB7XG4gICAgY29uc3QgZGlyZWN0b3J5ID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClbMF07XG4gICAgcmV0dXJuIGRpcmVjdG9yeSA9PSBudWxsID8gbnVsbCA6IGRpcmVjdG9yeS5nZXRQYXRoKCk7XG4gIH1cblxuICBnZXRDd2QoKTogP0RpcmVjdG9yeSB7XG4gICAgcmV0dXJuIGdldERpcmVjdG9yeSh0aGlzLl9jd2RQYXRoJC5nZXRWYWx1ZSgpIHx8IHRoaXMuX2dldERlZmF1bHRDd2RQYXRoKCkpO1xuICB9XG5cbn1cblxuZnVuY3Rpb24gZ2V0RGlyZWN0b3J5KHBhdGg6ID9zdHJpbmcpOiA/RGlyZWN0b3J5IHtcbiAgaWYgKHBhdGggPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmIChSZW1vdGVVcmkuaXNSZW1vdGUocGF0aCkpIHtcbiAgICBjb25zdCBjb25uZWN0aW9uID0gUmVtb3RlQ29ubmVjdGlvbi5nZXRGb3JVcmkocGF0aCk7XG4gICAgaWYgKGNvbm5lY3Rpb24gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUmVtb3RlRGlyZWN0b3J5KGNvbm5lY3Rpb24sIHBhdGgpO1xuICB9XG4gIHJldHVybiBuZXcgTG9jYWxEaXJlY3RvcnkocGF0aCk7XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWREaXJlY3RvcnkoZGlyZWN0b3J5OiA/RGlyZWN0b3J5KTogYm9vbGVhbiB7XG4gIGlmIChkaXJlY3RvcnkgPT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBGaWxlVHJlZUhlbHBlcnMuaXNWYWxpZERpcmVjdG9yeShkaXJlY3RvcnkpO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkQ3dkUGF0aChwYXRoOiA/c3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmIChwYXRoID09IG51bGwpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBjb25zdCB2YWxpZFBhdGhzID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCkubWFwKGRpcmVjdG9yeSA9PiBkaXJlY3RvcnkuZ2V0UGF0aCgpKTtcbiAgcmV0dXJuIHZhbGlkUGF0aHMuaW5kZXhPZihwYXRoKSAhPT0gLTE7XG59XG4iXX0=