'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAtomProjectRelativePath = getAtomProjectRelativePath;
exports.getAtomProjectRootPath = getAtomProjectRootPath;
exports.relativizePathWithDirectory = relativizePathWithDirectory;
exports.getDirectoryForPath = getDirectoryForPath;
exports.getFileForPath = getFileForPath;
exports.observeProjectPaths = observeProjectPaths;
exports.onDidAddProjectPath = onDidAddProjectPath;
exports.onDidRemoveProjectPath = onDidRemoveProjectPath;

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
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
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * 
   * @format
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

/**
 * Like `atom.project.relativizePath`, except it returns the `Directory` rather than the path.
 * It also works for non-children, i.e. this can return `../../x`.
 *
 * This is intended to be used as a way to get a File object for any path
 * without worrying about remote vs. local paths.
 */
function relativizePathWithDirectory(path) {
  for (const directory of atom.project.getDirectories()) {
    try {
      const relativePath = (_nuclideUri || _load_nuclideUri()).default.relative(directory.getPath(), path);
      return [directory, relativePath];
    } catch (e) {
      // We have a remote-local mismatch or hostname mismatch.
    }
  }
  return [null, path];
}

function getDirectoryForPath(path) {
  const [directory, relativePath] = relativizePathWithDirectory(path);
  if (directory == null) {
    return null;
  }
  return directory.getSubdirectory(relativePath);
}

function getFileForPath(path) {
  const [directory, relativePath] = relativizePathWithDirectory(path);
  if (directory == null) {
    return null;
  }
  return directory.getFile(relativePath);
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