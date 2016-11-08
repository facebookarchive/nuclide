'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

var _singleton;

function _load_singleton() {
  return _singleton = _interopRequireDefault(require('../commons-node/singleton'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const REMOVE_PROJECT_EVENT = 'did-remove-project';
const ADD_PROJECT_EVENT = 'did-add-project';
const PROJECT_PATH_WATCHER_INSTANCE_KEY = '_nuclide_project_path_watcher';

function getValidProjectPaths() {
  return atom.project.getDirectories().filter(directory => {
    // If a remote directory path is a local `Directory` instance, the project path
    // isn't yet ready for consumption.
    if ((_nuclideUri || _load_nuclideUri()).default.isRemote(directory.getPath()) && directory instanceof _atom.Directory) {
      return false;
    }
    return true;
  }).map(directory => directory.getPath());
}

let ProjectManager = class ProjectManager {

  constructor() {
    this._emitter = new _atom.Emitter();
    this._projectPaths = new Set(getValidProjectPaths());
    atom.project.onDidChangePaths(this._updateProjectPaths.bind(this));
  }

  _updateProjectPaths(newProjectPaths) {
    const oldProjectPathSet = this._projectPaths;
    const newProjectPathSet = new Set(getValidProjectPaths());
    for (const oldProjectPath of oldProjectPathSet) {
      if (!newProjectPathSet.has(oldProjectPath)) {
        this._emitter.emit(REMOVE_PROJECT_EVENT, oldProjectPath);
      }
    }
    for (const newProjectPath of newProjectPathSet) {
      if (!oldProjectPathSet.has(newProjectPath)) {
        this._emitter.emit(ADD_PROJECT_EVENT, newProjectPath);
      }
    }
    this._projectPaths = newProjectPathSet;
  }

  observeProjectPaths(callback) {
    for (const projectPath of this._projectPaths) {
      callback(projectPath);
    }
    return this._emitter.on(ADD_PROJECT_EVENT, callback);
  }

  onDidAddProjectPath(callback) {
    return this._emitter.on(ADD_PROJECT_EVENT, callback);
  }

  onDidRemoveProjectPath(callback) {
    return this._emitter.on(REMOVE_PROJECT_EVENT, callback);
  }
};


function getProjectManager() {
  return (_singleton || _load_singleton()).default.get(PROJECT_PATH_WATCHER_INSTANCE_KEY, () => new ProjectManager());
}

function getAtomProjectRelativePath(path) {
  var _atom$project$relativ = atom.project.relativizePath(path),
      _atom$project$relativ2 = _slicedToArray(_atom$project$relativ, 2);

  const projectPath = _atom$project$relativ2[0],
        relativePath = _atom$project$relativ2[1];

  if (!projectPath) {
    return null;
  }
  return relativePath;
}

function getAtomProjectRootPath(path) {
  var _atom$project$relativ3 = atom.project.relativizePath(path),
      _atom$project$relativ4 = _slicedToArray(_atom$project$relativ3, 1);

  const projectPath = _atom$project$relativ4[0];

  return projectPath;
}

module.exports = {
  getAtomProjectRelativePath: getAtomProjectRelativePath,

  getAtomProjectRootPath: getAtomProjectRootPath,

  observeProjectPaths: function (callback) {
    return getProjectManager().observeProjectPaths(callback);
  },
  onDidAddProjectPath: function (callback) {
    return getProjectManager().onDidAddProjectPath(callback);
  },
  onDidRemoveProjectPath: function (callback) {
    return getProjectManager().onDidRemoveProjectPath(callback);
  },


  __test__: {
    PROJECT_PATH_WATCHER_INSTANCE_KEY: PROJECT_PATH_WATCHER_INSTANCE_KEY
  }
};