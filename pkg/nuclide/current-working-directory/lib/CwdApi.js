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

var _fileTreeLibFileTreeHelpers = require('../../file-tree/lib/FileTreeHelpers');

var _fileTreeLibFileTreeHelpers2 = _interopRequireDefault(_fileTreeLibFileTreeHelpers);

var _remoteConnection = require('../../remote-connection');

var _remoteUri = require('../../remote-uri');

var _remoteUri2 = _interopRequireDefault(_remoteUri);

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
  if (_remoteUri2['default'].isRemote(path)) {
    var connection = _remoteConnection.RemoteConnection.getForUri(path);
    if (connection == null) {
      return null;
    }
    return new _remoteConnection.RemoteDirectory(connection, path);
  }
  return new _atom.Directory(path);
}

function isValidDirectory(directory) {
  if (directory == null) {
    return true;
  }
  return _fileTreeLibFileTreeHelpers2['default'].isValidDirectory(directory);
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
//# sourceMappingURL=data:application/json;base64,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QztHQUNiO0FBQ0QsU0FBTyx3Q0FBZ0IsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7Q0FDcEQ7O0FBRUQsU0FBUyxjQUFjLENBQUMsSUFBYSxFQUFXO0FBQzlDLE1BQUksSUFBSSxJQUFJLElBQUksRUFBRTtBQUNoQixXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBQSxTQUFTO1dBQUksU0FBUyxDQUFDLE9BQU8sRUFBRTtHQUFBLENBQUMsQ0FBQztBQUN2RixTQUFPLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Q0FDeEMiLCJmaWxlIjoiQ3dkQXBpLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IEZpbGVUcmVlSGVscGVycyBmcm9tICcuLi8uLi9maWxlLXRyZWUvbGliL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQge1JlbW90ZUNvbm5lY3Rpb24sIFJlbW90ZURpcmVjdG9yeX0gZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24nO1xuaW1wb3J0IFJlbW90ZVVyaSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlyZWN0b3J5IGFzIExvY2FsRGlyZWN0b3J5fSBmcm9tICdhdG9tJztcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5cbnR5cGUgRGlyZWN0b3J5ID0gTG9jYWxEaXJlY3RvcnkgfCBSZW1vdGVEaXJlY3Rvcnk7XG5cbmV4cG9ydCBjbGFzcyBDd2RBcGkge1xuICBfY3dkJDogUnguT2JzZXJ2YWJsZTw/RGlyZWN0b3J5PjtcbiAgX2N3ZFBhdGgkOiBSeC5CZWhhdmlvclN1YmplY3Q8P3N0cmluZz47XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcihpbml0aWFsQ3dkUGF0aDogP3N0cmluZykge1xuICAgIHRoaXMuX2N3ZFBhdGgkID0gbmV3IFJ4LkJlaGF2aW9yU3ViamVjdChpbml0aWFsQ3dkUGF0aCk7XG4gICAgdGhpcy5fY3dkJCA9IHRoaXMuX2N3ZFBhdGgkXG4gICAgICAuZGlzdGluY3RVbnRpbENoYW5nZWQoKVxuICAgICAgLm1hcCgoKSA9PiB0aGlzLmdldEN3ZCgpKVxuICAgICAgLm1hcChkaXJlY3RvcnkgPT4gaXNWYWxpZERpcmVjdG9yeShkaXJlY3RvcnkpID8gZGlyZWN0b3J5IDogbnVsbCk7XG5cbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgLy8gSWYgdGhlIGFjdGl2ZSBkaXJlY3RvcnkgaXMgcmVtb3ZlZCwgZmFsbCBiYWNrIHRvIHRoZSBkZWZhdWx0LlxuICAgICAgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMoKCkgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50UGF0aCA9IHRoaXMuX2N3ZFBhdGgkLmdldFZhbHVlKCk7XG4gICAgICAgIGlmIChjdXJyZW50UGF0aCA9PSBudWxsIHx8ICFpc1ZhbGlkQ3dkUGF0aChjdXJyZW50UGF0aCkpIHtcbiAgICAgICAgICB0aGlzLl9jd2RQYXRoJC5vbk5leHQodGhpcy5fZ2V0RGVmYXVsdEN3ZFBhdGgoKSk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBzZXRDd2QocGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCFpc1ZhbGlkQ3dkUGF0aChwYXRoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQYXRoIGlzIG5vdCBhIHByb2plY3Qgcm9vdDogJHtwYXRofWApO1xuICAgIH1cbiAgICB0aGlzLl9jd2RQYXRoJC5vbk5leHQocGF0aCk7XG4gIH1cblxuICBvYnNlcnZlQ3dkKGNhbGxiYWNrOiAoZGlyZWN0b3J5OiA/RGlyZWN0b3J5KSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9jd2QkLnN1YnNjcmliZShkaXJlY3RvcnkgPT4geyBjYWxsYmFjayhkaXJlY3RvcnkpOyB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX2dldERlZmF1bHRDd2RQYXRoKCk6ID9zdHJpbmcge1xuICAgIGNvbnN0IGRpcmVjdG9yeSA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpWzBdO1xuICAgIHJldHVybiBkaXJlY3RvcnkgPT0gbnVsbCA/IG51bGwgOiBkaXJlY3RvcnkuZ2V0UGF0aCgpO1xuICB9XG5cbiAgZ2V0Q3dkKCk6ID9EaXJlY3Rvcnkge1xuICAgIHJldHVybiBnZXREaXJlY3RvcnkodGhpcy5fY3dkUGF0aCQuZ2V0VmFsdWUoKSB8fCB0aGlzLl9nZXREZWZhdWx0Q3dkUGF0aCgpKTtcbiAgfVxuXG59XG5cbmZ1bmN0aW9uIGdldERpcmVjdG9yeShwYXRoOiA/c3RyaW5nKTogP0RpcmVjdG9yeSB7XG4gIGlmIChwYXRoID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAoUmVtb3RlVXJpLmlzUmVtb3RlKHBhdGgpKSB7XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IFJlbW90ZUNvbm5lY3Rpb24uZ2V0Rm9yVXJpKHBhdGgpO1xuICAgIGlmIChjb25uZWN0aW9uID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFJlbW90ZURpcmVjdG9yeShjb25uZWN0aW9uLCBwYXRoKTtcbiAgfVxuICByZXR1cm4gbmV3IExvY2FsRGlyZWN0b3J5KHBhdGgpO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkRGlyZWN0b3J5KGRpcmVjdG9yeTogP0RpcmVjdG9yeSk6IGJvb2xlYW4ge1xuICBpZiAoZGlyZWN0b3J5ID09IG51bGwpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gRmlsZVRyZWVIZWxwZXJzLmlzVmFsaWREaXJlY3RvcnkoZGlyZWN0b3J5KTtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZEN3ZFBhdGgocGF0aDogP3N0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAocGF0aCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgY29uc3QgdmFsaWRQYXRocyA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLm1hcChkaXJlY3RvcnkgPT4gZGlyZWN0b3J5LmdldFBhdGgoKSk7XG4gIHJldHVybiB2YWxpZFBhdGhzLmluZGV4T2YocGF0aCkgIT09IC0xO1xufVxuIl19