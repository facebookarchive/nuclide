var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var Emitter = _require.Emitter;
var Directory = _require.Directory;

var _require2 = require('../../nuclide-remote-uri');

var isRemote = _require2.isRemote;

var _require3 = require('../../nuclide-commons');

var singleton = _require3.singleton;

var REMOVE_PROJECT_EVENT = 'did-remove-project';
var ADD_PROJECT_EVENT = 'did-add-project';
var PROJECT_PATH_WATCHER_INSTANCE_KEY = '_nuclide_project_path_watcher';

function getValidProjectPaths() {
  return atom.project.getDirectories().filter(function (directory) {
    // If a remote directory path is a local `Directory` instance, the project path
    // isn't yet ready for consumption.
    if (isRemote(directory.getPath()) && directory instanceof Directory) {
      return false;
    }
    return true;
  }).map(function (directory) {
    return directory.getPath();
  });
}

var ProjectManager = (function () {
  function ProjectManager() {
    _classCallCheck(this, ProjectManager);

    this._emitter = new Emitter();
    this._projectPaths = new Set(getValidProjectPaths());
    atom.project.onDidChangePaths(this._updateProjectPaths.bind(this));
  }

  _createClass(ProjectManager, [{
    key: '_updateProjectPaths',
    value: function _updateProjectPaths(newProjectPaths) {
      var oldProjectPathSet = this._projectPaths;
      var newProjectPathSet = new Set(getValidProjectPaths());
      for (var oldProjectPath of oldProjectPathSet) {
        if (!newProjectPathSet.has(oldProjectPath)) {
          this._emitter.emit(REMOVE_PROJECT_EVENT, oldProjectPath);
        }
      }
      for (var newProjectPath of newProjectPathSet) {
        if (!oldProjectPathSet.has(newProjectPath)) {
          this._emitter.emit(ADD_PROJECT_EVENT, newProjectPath);
        }
      }
      this._projectPaths = newProjectPathSet;
    }
  }, {
    key: 'observeProjectPaths',
    value: function observeProjectPaths(callback) {
      for (var _projectPath of this._projectPaths) {
        callback(_projectPath);
      }
      return this._emitter.on(ADD_PROJECT_EVENT, callback);
    }
  }, {
    key: 'onDidAddProjectPath',
    value: function onDidAddProjectPath(callback) {
      return this._emitter.on(ADD_PROJECT_EVENT, callback);
    }
  }, {
    key: 'onDidRemoveProjectPath',
    value: function onDidRemoveProjectPath(callback) {
      return this._emitter.on(REMOVE_PROJECT_EVENT, callback);
    }
  }]);

  return ProjectManager;
})();

function getProjectManager() {
  return singleton.get(PROJECT_PATH_WATCHER_INSTANCE_KEY, function () {
    return new ProjectManager();
  });
}

module.exports = {
  observeProjectPaths: function observeProjectPaths(callback) {
    return getProjectManager().observeProjectPaths(callback);
  },

  onDidAddProjectPath: function onDidAddProjectPath(callback) {
    return getProjectManager().onDidAddProjectPath(callback);
  },

  onDidRemoveProjectPath: function onDidRemoveProjectPath(callback) {
    return getProjectManager().onDidRemoveProjectPath(callback);
  },

  __test__: {
    PROJECT_PATH_WATCHER_INSTANCE_KEY: PROJECT_PATH_WATCHER_INSTANCE_KEY
  }
};
//# sourceMappingURL=data:application/json;base64,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MkNwQixTQUFTLGlCQUFpQixHQUFtQjtBQUMzQyxTQUFPLFNBQVMsQ0FBQyxHQUFHLENBQ2xCLGlDQUFpQyxFQUNqQztXQUFNLElBQUksY0FBYyxFQUFFO0dBQUEsQ0FDM0IsQ0FBQztDQUNIOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixxQkFBbUIsRUFBQSw2QkFBQyxRQUF1QyxFQUFlO0FBQ3hFLFdBQU8saUJBQWlCLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUMxRDs7QUFFRCxxQkFBbUIsRUFBQSw2QkFBQyxRQUF1QyxFQUFlO0FBQ3hFLFdBQU8saUJBQWlCLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUMxRDs7QUFFRCx3QkFBc0IsRUFBQSxnQ0FBQyxRQUF1QyxFQUFlO0FBQzNFLFdBQU8saUJBQWlCLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUM3RDs7QUFFRCxVQUFRLEVBQUU7QUFDUixxQ0FBaUMsRUFBakMsaUNBQWlDO0dBQ2xDO0NBQ0YsQ0FBQyIsImZpbGUiOiJwcm9qZWN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtFbWl0dGVyLCBEaXJlY3Rvcnl9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge2lzUmVtb3RlfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaScpO1xuY29uc3Qge3NpbmdsZXRvbn0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcblxuY29uc3QgUkVNT1ZFX1BST0pFQ1RfRVZFTlQgPSAnZGlkLXJlbW92ZS1wcm9qZWN0JztcbmNvbnN0IEFERF9QUk9KRUNUX0VWRU5UID0gJ2RpZC1hZGQtcHJvamVjdCc7XG5jb25zdCBQUk9KRUNUX1BBVEhfV0FUQ0hFUl9JTlNUQU5DRV9LRVkgPSAnX251Y2xpZGVfcHJvamVjdF9wYXRoX3dhdGNoZXInO1xuXG5mdW5jdGlvbiBnZXRWYWxpZFByb2plY3RQYXRocygpOiBBcnJheTxzdHJpbmc+IHtcbiAgcmV0dXJuIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLmZpbHRlcihkaXJlY3RvcnkgPT4ge1xuICAgIC8vIElmIGEgcmVtb3RlIGRpcmVjdG9yeSBwYXRoIGlzIGEgbG9jYWwgYERpcmVjdG9yeWAgaW5zdGFuY2UsIHRoZSBwcm9qZWN0IHBhdGhcbiAgICAvLyBpc24ndCB5ZXQgcmVhZHkgZm9yIGNvbnN1bXB0aW9uLlxuICAgIGlmIChpc1JlbW90ZShkaXJlY3RvcnkuZ2V0UGF0aCgpKSAmJiBkaXJlY3RvcnkgaW5zdGFuY2VvZiBEaXJlY3RvcnkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0pLm1hcChkaXJlY3RvcnkgPT4gZGlyZWN0b3J5LmdldFBhdGgoKSk7XG59XG5cbmNsYXNzIFByb2plY3RNYW5hZ2VyIHtcblxuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX3Byb2plY3RQYXRoczogU2V0PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fcHJvamVjdFBhdGhzID0gbmV3IFNldChnZXRWYWxpZFByb2plY3RQYXRocygpKTtcbiAgICBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocyh0aGlzLl91cGRhdGVQcm9qZWN0UGF0aHMuYmluZCh0aGlzKSk7XG4gIH1cblxuICBfdXBkYXRlUHJvamVjdFBhdGhzKG5ld1Byb2plY3RQYXRoczogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIGNvbnN0IG9sZFByb2plY3RQYXRoU2V0ID0gdGhpcy5fcHJvamVjdFBhdGhzO1xuICAgIGNvbnN0IG5ld1Byb2plY3RQYXRoU2V0ID0gbmV3IFNldChnZXRWYWxpZFByb2plY3RQYXRocygpKTtcbiAgICBmb3IgKGNvbnN0IG9sZFByb2plY3RQYXRoIG9mIG9sZFByb2plY3RQYXRoU2V0KSB7XG4gICAgICBpZiAoIW5ld1Byb2plY3RQYXRoU2V0LmhhcyhvbGRQcm9qZWN0UGF0aCkpIHtcbiAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KFJFTU9WRV9QUk9KRUNUX0VWRU5ULCBvbGRQcm9qZWN0UGF0aCk7XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgbmV3UHJvamVjdFBhdGggb2YgbmV3UHJvamVjdFBhdGhTZXQpIHtcbiAgICAgIGlmICghb2xkUHJvamVjdFBhdGhTZXQuaGFzKG5ld1Byb2plY3RQYXRoKSkge1xuICAgICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQUREX1BST0pFQ1RfRVZFTlQsIG5ld1Byb2plY3RQYXRoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fcHJvamVjdFBhdGhzID0gbmV3UHJvamVjdFBhdGhTZXQ7XG4gIH1cblxuICBvYnNlcnZlUHJvamVjdFBhdGhzKGNhbGxiYWNrOiAocHJvamVjdFBhdGg6IHN0cmluZykgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgICBmb3IgKGNvbnN0IHByb2plY3RQYXRoIG9mIHRoaXMuX3Byb2plY3RQYXRocykge1xuICAgICAgY2FsbGJhY2socHJvamVjdFBhdGgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihBRERfUFJPSkVDVF9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWRBZGRQcm9qZWN0UGF0aChjYWxsYmFjazogKHByb2plY3RQYXRoOiBzdHJpbmcpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQUREX1BST0pFQ1RfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRGlkUmVtb3ZlUHJvamVjdFBhdGgoY2FsbGJhY2s6IChwcm9qZWN0UGF0aDogc3RyaW5nKSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKFJFTU9WRV9QUk9KRUNUX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UHJvamVjdE1hbmFnZXIoKTogUHJvamVjdE1hbmFnZXIge1xuICByZXR1cm4gc2luZ2xldG9uLmdldChcbiAgICBQUk9KRUNUX1BBVEhfV0FUQ0hFUl9JTlNUQU5DRV9LRVksXG4gICAgKCkgPT4gbmV3IFByb2plY3RNYW5hZ2VyKCksXG4gICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBvYnNlcnZlUHJvamVjdFBhdGhzKGNhbGxiYWNrOiAocHJvamVjdFBhdGg6IHN0cmluZykgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gZ2V0UHJvamVjdE1hbmFnZXIoKS5vYnNlcnZlUHJvamVjdFBhdGhzKGNhbGxiYWNrKTtcbiAgfSxcblxuICBvbkRpZEFkZFByb2plY3RQYXRoKGNhbGxiYWNrOiAocHJvamVjdFBhdGg6IHN0cmluZykgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gZ2V0UHJvamVjdE1hbmFnZXIoKS5vbkRpZEFkZFByb2plY3RQYXRoKGNhbGxiYWNrKTtcbiAgfSxcblxuICBvbkRpZFJlbW92ZVByb2plY3RQYXRoKGNhbGxiYWNrOiAocHJvamVjdFBhdGg6IHN0cmluZykgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gZ2V0UHJvamVjdE1hbmFnZXIoKS5vbkRpZFJlbW92ZVByb2plY3RQYXRoKGNhbGxiYWNrKTtcbiAgfSxcblxuICBfX3Rlc3RfXzoge1xuICAgIFBST0pFQ1RfUEFUSF9XQVRDSEVSX0lOU1RBTkNFX0tFWSxcbiAgfSxcbn07XG4iXX0=