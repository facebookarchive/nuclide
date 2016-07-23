'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../commons-node/nuclideUri';

import {Emitter, Directory} from 'atom';
import nuclideUri from '../commons-node/nuclideUri';
import singleton from '../commons-node/singleton';

const REMOVE_PROJECT_EVENT = 'did-remove-project';
const ADD_PROJECT_EVENT = 'did-add-project';
const PROJECT_PATH_WATCHER_INSTANCE_KEY = '_nuclide_project_path_watcher';

function getValidProjectPaths(): Array<string> {
  return atom.project.getDirectories().filter(directory => {
    // If a remote directory path is a local `Directory` instance, the project path
    // isn't yet ready for consumption.
    if (nuclideUri.isRemote(directory.getPath()) && directory instanceof Directory) {
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

  observeProjectPaths(callback: (projectPath: string) => void): IDisposable {
    for (const projectPath of this._projectPaths) {
      callback(projectPath);
    }
    return this._emitter.on(ADD_PROJECT_EVENT, callback);
  }

  onDidAddProjectPath(callback: (projectPath: string) => void): IDisposable {
    return this._emitter.on(ADD_PROJECT_EVENT, callback);
  }

  onDidRemoveProjectPath(callback: (projectPath: string) => void): IDisposable {
    return this._emitter.on(REMOVE_PROJECT_EVENT, callback);
  }
}

function getProjectManager(): ProjectManager {
  return singleton.get(
    PROJECT_PATH_WATCHER_INSTANCE_KEY,
    () => new ProjectManager(),
  );
}

function getAtomProjectRelativePath(path: NuclideUri): ?string {
  const [projectPath, relativePath] = atom.project.relativizePath(path);
  if (!projectPath) {
    return null;
  }
  return relativePath;
}

function getAtomProjectRootPath(path: NuclideUri): ?string {
  const [projectPath] = atom.project.relativizePath(path);
  return projectPath;
}

module.exports = {
  getAtomProjectRelativePath,

  getAtomProjectRootPath,

  observeProjectPaths(callback: (projectPath: string) => void): IDisposable {
    return getProjectManager().observeProjectPaths(callback);
  },

  onDidAddProjectPath(callback: (projectPath: string) => void): IDisposable {
    return getProjectManager().onDidAddProjectPath(callback);
  },

  onDidRemoveProjectPath(callback: (projectPath: string) => void): IDisposable {
    return getProjectManager().onDidRemoveProjectPath(callback);
  },

  __test__: {
    PROJECT_PATH_WATCHER_INSTANCE_KEY,
  },
};
