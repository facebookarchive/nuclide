'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Emitter, Directory} = require('atom');
var {isRemote} = require('nuclide-remote-uri');
var {singleton} = require('nuclide-commons');

var REMOVE_PROJECT_EVENT = 'did-remove-project';
var ADD_PROJECT_EVENT = 'did-add-project';
var PROJECT_PATH_WATCHER_INSTANCE_KEY = '_nuclide_project_path_watcher';

function getValidProjectPaths(): Array<string> {
  return atom.project.getDirectories().filter(directory => {
    // If a remote directory path is a local `Directory` instance, the project path
    // isn't yet ready for consumption.
    if (isRemote(directory.getPath()) && directory instanceof Directory) {
      return false;
    }
    return true;
  }).map(directory => directory.getPath());
}

class ProjectManager {

  _emitter: Emitter;
  _projectPaths: Set<string>;

  constructor() {
    this._emitter = new Emitter();
    this._projectPaths = new Set(getValidProjectPaths());
    atom.project.onDidChangePaths(this._updateProjectPaths.bind(this));
  }

  _updateProjectPaths(newProjectPaths: Array<string>): void {
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

  observeProjectPaths(callback: (projectPath: string) => void): atom$Disposable {
    for (var projectPath of this._projectPaths) {
      callback(projectPath);
    }
    return this._emitter.on(ADD_PROJECT_EVENT, callback);
  }

  onDidAddProjectPath(callback: (projectPath: string) => void): atom$Disposable {
    return this._emitter.on(ADD_PROJECT_EVENT, callback);
  }

  onDidRemoveProjectPath(callback: (projectPath: string) => void): atom$Disposable {
    return this._emitter.on(REMOVE_PROJECT_EVENT, callback);
  }
}

function getProjectManager(): ProjectManager {
  return singleton.get(
    PROJECT_PATH_WATCHER_INSTANCE_KEY,
    () => new ProjectManager(),
  );
}

module.exports = {
  observeProjectPaths(callback: (projectPath: string) => void): atom$Disposable {
    return getProjectManager().observeProjectPaths(callback);
  },

  onDidAddProjectPath(callback: (projectPath: string) => void): atom$Disposable {
    return getProjectManager().onDidAddProjectPath(callback);
  },

  onDidRemoveProjectPath(callback: (projectPath: string) => void): atom$Disposable {
    return getProjectManager().onDidRemoveProjectPath(callback);
  },

  __test__: {
    PROJECT_PATH_WATCHER_INSTANCE_KEY,
  },
};
