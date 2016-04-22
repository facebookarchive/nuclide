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

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

var CwdApi = (function () {
  function CwdApi(initialCwdPath) {
    var _this = this;

    _classCallCheck(this, CwdApi);

    this._cwdPath$ = new _reactivexRxjs2['default'].BehaviorSubject(initialCwdPath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkN3ZEFwaS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OEJBV3FDLHVCQUF1Qjs7aURBQ2hDLDZDQUE2Qzs7Ozt1Q0FDekIsaUNBQWlDOztnQ0FDM0QsMEJBQTBCOzs7O29CQUNlLE1BQU07OzZCQUN0RCxpQkFBaUI7Ozs7SUFJbkIsTUFBTTtBQUtOLFdBTEEsTUFBTSxDQUtMLGNBQXVCLEVBQUU7OzswQkFMMUIsTUFBTTs7QUFNZixRQUFJLENBQUMsU0FBUyxHQUFHLElBQUksMkJBQUcsZUFBZSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3hELFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FDeEIsb0JBQW9CLEVBQUUsQ0FDdEIsR0FBRyxDQUFDO2FBQU0sTUFBSyxNQUFNLEVBQUU7S0FBQSxDQUFDLENBQ3hCLEdBQUcsQ0FBQyxVQUFBLFNBQVM7YUFBSSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFTLEdBQUcsSUFBSTtLQUFBLENBQUMsQ0FBQzs7QUFFcEUsUUFBSSxDQUFDLFlBQVksR0FBRzs7QUFFbEIsUUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFNO0FBQ2xDLFVBQU0sV0FBVyxHQUFHLE1BQUssU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQzlDLFVBQUksV0FBVyxJQUFJLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsRUFBRTtBQUN2RCxjQUFLLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBSyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7T0FDaEQ7S0FDRixDQUFDLENBQ0gsQ0FBQztHQUNIOztlQXJCVSxNQUFNOztXQXVCWCxnQkFBQyxJQUFZLEVBQVE7QUFDekIsVUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUN6QixjQUFNLElBQUksS0FBSyxrQ0FBZ0MsSUFBSSxDQUFHLENBQUM7T0FDeEQ7QUFDRCxVQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMzQjs7O1dBRVMsb0JBQUMsUUFBeUMsRUFBZTtBQUNqRSxhQUFPLDJDQUEyQixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFBLFNBQVMsRUFBSTtBQUFFLGdCQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7T0FBRSxDQUFDLENBQUMsQ0FBQztLQUNoRzs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFaUIsOEJBQVk7QUFDNUIsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuRCxhQUFPLFNBQVMsSUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN2RDs7O1dBRUssa0JBQWU7QUFDbkIsYUFBTyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO0tBQzdFOzs7U0E3Q1UsTUFBTTs7Ozs7QUFpRG5CLFNBQVMsWUFBWSxDQUFDLElBQWEsRUFBYztBQUMvQyxNQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDaEIsV0FBTyxJQUFJLENBQUM7R0FDYjtBQUNELE1BQUksOEJBQVUsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQzVCLFFBQU0sVUFBVSxHQUFHLDBDQUFpQixTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEQsUUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7QUFDRCxXQUFPLDZDQUFvQixVQUFVLENBQUMsYUFBYSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDOUQ7QUFDRCxTQUFPLG9CQUFtQixJQUFJLENBQUMsQ0FBQztDQUNqQzs7QUFFRCxTQUFTLGdCQUFnQixDQUFDLFNBQXFCLEVBQVc7QUFDeEQsTUFBSSxTQUFTLElBQUksSUFBSSxFQUFFO0FBQ3JCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7QUFDRCxTQUFPLCtDQUFnQixnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztDQUNwRDs7QUFFRCxTQUFTLGNBQWMsQ0FBQyxJQUFhLEVBQVc7QUFDOUMsTUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO0FBQ2hCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7QUFDRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFBLFNBQVM7V0FBSSxTQUFTLENBQUMsT0FBTyxFQUFFO0dBQUEsQ0FBQyxDQUFDO0FBQ3ZGLFNBQU8sVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztDQUN4QyIsImZpbGUiOiJDd2RBcGkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0Rpc3Bvc2FibGVTdWJzY3JpcHRpb259IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQgRmlsZVRyZWVIZWxwZXJzIGZyb20gJy4uLy4uL251Y2xpZGUtZmlsZS10cmVlL2xpYi9GaWxlVHJlZUhlbHBlcnMnO1xuaW1wb3J0IHtSZW1vdGVDb25uZWN0aW9uLCBSZW1vdGVEaXJlY3Rvcnl9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLWNvbm5lY3Rpb24nO1xuaW1wb3J0IFJlbW90ZVVyaSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXJlY3RvcnkgYXMgTG9jYWxEaXJlY3Rvcnl9IGZyb20gJ2F0b20nO1xuaW1wb3J0IFJ4IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5cbnR5cGUgRGlyZWN0b3J5ID0gTG9jYWxEaXJlY3RvcnkgfCBSZW1vdGVEaXJlY3Rvcnk7XG5cbmV4cG9ydCBjbGFzcyBDd2RBcGkge1xuICBfY3dkJDogUnguT2JzZXJ2YWJsZTw/RGlyZWN0b3J5PjtcbiAgX2N3ZFBhdGgkOiBSeC5CZWhhdmlvclN1YmplY3Q8P3N0cmluZz47XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcihpbml0aWFsQ3dkUGF0aDogP3N0cmluZykge1xuICAgIHRoaXMuX2N3ZFBhdGgkID0gbmV3IFJ4LkJlaGF2aW9yU3ViamVjdChpbml0aWFsQ3dkUGF0aCk7XG4gICAgdGhpcy5fY3dkJCA9IHRoaXMuX2N3ZFBhdGgkXG4gICAgICAuZGlzdGluY3RVbnRpbENoYW5nZWQoKVxuICAgICAgLm1hcCgoKSA9PiB0aGlzLmdldEN3ZCgpKVxuICAgICAgLm1hcChkaXJlY3RvcnkgPT4gaXNWYWxpZERpcmVjdG9yeShkaXJlY3RvcnkpID8gZGlyZWN0b3J5IDogbnVsbCk7XG5cbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgLy8gSWYgdGhlIGFjdGl2ZSBkaXJlY3RvcnkgaXMgcmVtb3ZlZCwgZmFsbCBiYWNrIHRvIHRoZSBkZWZhdWx0LlxuICAgICAgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMoKCkgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50UGF0aCA9IHRoaXMuX2N3ZFBhdGgkLmdldFZhbHVlKCk7XG4gICAgICAgIGlmIChjdXJyZW50UGF0aCA9PSBudWxsIHx8ICFpc1ZhbGlkQ3dkUGF0aChjdXJyZW50UGF0aCkpIHtcbiAgICAgICAgICB0aGlzLl9jd2RQYXRoJC5uZXh0KHRoaXMuX2dldERlZmF1bHRDd2RQYXRoKCkpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgc2V0Q3dkKHBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghaXNWYWxpZEN3ZFBhdGgocGF0aCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUGF0aCBpcyBub3QgYSBwcm9qZWN0IHJvb3Q6ICR7cGF0aH1gKTtcbiAgICB9XG4gICAgdGhpcy5fY3dkUGF0aCQubmV4dChwYXRoKTtcbiAgfVxuXG4gIG9ic2VydmVDd2QoY2FsbGJhY2s6IChkaXJlY3Rvcnk6ID9EaXJlY3RvcnkpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlU3Vic2NyaXB0aW9uKHRoaXMuX2N3ZCQuc3Vic2NyaWJlKGRpcmVjdG9yeSA9PiB7IGNhbGxiYWNrKGRpcmVjdG9yeSk7IH0pKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX2dldERlZmF1bHRDd2RQYXRoKCk6ID9zdHJpbmcge1xuICAgIGNvbnN0IGRpcmVjdG9yeSA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpWzBdO1xuICAgIHJldHVybiBkaXJlY3RvcnkgPT0gbnVsbCA/IG51bGwgOiBkaXJlY3RvcnkuZ2V0UGF0aCgpO1xuICB9XG5cbiAgZ2V0Q3dkKCk6ID9EaXJlY3Rvcnkge1xuICAgIHJldHVybiBnZXREaXJlY3RvcnkodGhpcy5fY3dkUGF0aCQuZ2V0VmFsdWUoKSB8fCB0aGlzLl9nZXREZWZhdWx0Q3dkUGF0aCgpKTtcbiAgfVxuXG59XG5cbmZ1bmN0aW9uIGdldERpcmVjdG9yeShwYXRoOiA/c3RyaW5nKTogP0RpcmVjdG9yeSB7XG4gIGlmIChwYXRoID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAoUmVtb3RlVXJpLmlzUmVtb3RlKHBhdGgpKSB7XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IFJlbW90ZUNvbm5lY3Rpb24uZ2V0Rm9yVXJpKHBhdGgpO1xuICAgIGlmIChjb25uZWN0aW9uID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFJlbW90ZURpcmVjdG9yeShjb25uZWN0aW9uLmdldENvbm5lY3Rpb24oKSwgcGF0aCk7XG4gIH1cbiAgcmV0dXJuIG5ldyBMb2NhbERpcmVjdG9yeShwYXRoKTtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZERpcmVjdG9yeShkaXJlY3Rvcnk6ID9EaXJlY3RvcnkpOiBib29sZWFuIHtcbiAgaWYgKGRpcmVjdG9yeSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIEZpbGVUcmVlSGVscGVycy5pc1ZhbGlkRGlyZWN0b3J5KGRpcmVjdG9yeSk7XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRDd2RQYXRoKHBhdGg6ID9zdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKHBhdGggPT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGNvbnN0IHZhbGlkUGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5tYXAoZGlyZWN0b3J5ID0+IGRpcmVjdG9yeS5nZXRQYXRoKCkpO1xuICByZXR1cm4gdmFsaWRQYXRocy5pbmRleE9mKHBhdGgpICE9PSAtMTtcbn1cbiJdfQ==