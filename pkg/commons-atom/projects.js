var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../nuclide-remote-uri'));
}

var _commonsNodeSingleton2;

function _commonsNodeSingleton() {
  return _commonsNodeSingleton2 = _interopRequireDefault(require('../commons-node/singleton'));
}

var REMOVE_PROJECT_EVENT = 'did-remove-project';
var ADD_PROJECT_EVENT = 'did-add-project';
var PROJECT_PATH_WATCHER_INSTANCE_KEY = '_nuclide_project_path_watcher';

function getValidProjectPaths() {
  return atom.project.getDirectories().filter(function (directory) {
    // If a remote directory path is a local `Directory` instance, the project path
    // isn't yet ready for consumption.
    if ((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isRemote(directory.getPath()) && directory instanceof (_atom2 || _atom()).Directory) {
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

    this._emitter = new (_atom2 || _atom()).Emitter();
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
  return (_commonsNodeSingleton2 || _commonsNodeSingleton()).default.get(PROJECT_PATH_WATCHER_INSTANCE_KEY, function () {
    return new ProjectManager();
  });
}

function getAtomProjectRelativePath(path) {
  var _atom$project$relativizePath = atom.project.relativizePath(path);

  var _atom$project$relativizePath2 = _slicedToArray(_atom$project$relativizePath, 2);

  var projectPath = _atom$project$relativizePath2[0];
  var relativePath = _atom$project$relativizePath2[1];

  if (!projectPath) {
    return null;
  }
  return relativePath;
}

function getAtomProjectRootPath(path) {
  var _atom$project$relativizePath3 = atom.project.relativizePath(path);

  var _atom$project$relativizePath32 = _slicedToArray(_atom$project$relativizePath3, 1);

  var projectPath = _atom$project$relativizePath32[0];

  return projectPath;
}

module.exports = {
  getAtomProjectRelativePath: getAtomProjectRelativePath,

  getAtomProjectRootPath: getAtomProjectRootPath,

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