'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAtomProjectRelativePath = getAtomProjectRelativePath;
exports.getAtomProjectRootPath = getAtomProjectRootPath;
exports.observeProjectPaths = observeProjectPaths;
exports.onDidAddProjectPath = onDidAddProjectPath;
exports.onDidRemoveProjectPath = onDidRemoveProjectPath;

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getValidProjectPaths() {
  return atom.project.getDirectories().filter(directory => {
    // If a remote directory path is a local `Directory` instance, the project path
    // isn't yet ready for consumption.
    if ((_nuclideUri || _load_nuclideUri()).default.isRemote(directory.getPath()) && directory instanceof _atom.Directory) {
      return false;
    }
    return true;
  }).map(directory => directory.getPath());
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

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

function observeProjectPaths(callback) {
  getValidProjectPaths().forEach(callback);
  return onDidAddProjectPath(callback);
}

function onDidAddProjectPath(callback) {
  let projectPaths = getValidProjectPaths();
  let changing = false;
  return atom.project.onDidChangePaths(() => {
    if (changing) {
      throw new Error('Cannot update projects in the middle of an update');
    }
    changing = true;
    const newProjectPaths = getValidProjectPaths();
    for (const newProjectPath of newProjectPaths) {
      if (!projectPaths.includes(newProjectPath)) {
        callback(newProjectPath);
      }
    }
    changing = false;
    projectPaths = newProjectPaths;
  });
}

function onDidRemoveProjectPath(callback) {
  let projectPaths = getValidProjectPaths();
  let changing = false;
  return atom.project.onDidChangePaths(() => {
    if (changing) {
      throw new Error('Cannot update projects in the middle of an update');
    }
    changing = true;
    const newProjectPaths = getValidProjectPaths();
    for (const projectPath of projectPaths) {
      if (!newProjectPaths.includes(projectPath)) {
        callback(projectPath);
      }
    }
    changing = false;
    projectPaths = newProjectPaths;
  });
}