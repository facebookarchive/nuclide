'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

class ProjectManager {

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
}

function getProjectManager() {
  return (_singleton || _load_singleton()).default.get(PROJECT_PATH_WATCHER_INSTANCE_KEY, () => new ProjectManager());
}

function getAtomProjectRelativePath(path) {
  const [projectPath, relativePath] = atom.project.relativizePath(path);
  if (!projectPath) {
    return null;
  }
  return relativePath;
}

function getAtomProjectRootPath(path) {
  const [projectPath] = atom.project.relativizePath(path);
  return projectPath;
}

module.exports = {
  getAtomProjectRelativePath,

  getAtomProjectRootPath,

  observeProjectPaths(callback) {
    return getProjectManager().observeProjectPaths(callback);
  },

  onDidAddProjectPath(callback) {
    return getProjectManager().onDidAddProjectPath(callback);
  },

  onDidRemoveProjectPath(callback) {
    return getProjectManager().onDidRemoveProjectPath(callback);
  },

  __test__: {
    PROJECT_PATH_WATCHER_INSTANCE_KEY
  }
};