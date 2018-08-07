"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getValidProjectPaths = getValidProjectPaths;
exports.getAtomProjectRelativePath = getAtomProjectRelativePath;
exports.getAtomProjectRootPath = getAtomProjectRootPath;
exports.relativizePathWithDirectory = relativizePathWithDirectory;
exports.getDirectoryForPath = getDirectoryForPath;
exports.getFileForPath = getFileForPath;
exports.observeProjectPaths = observeProjectPaths;
exports.observeProjectPathsAll = observeProjectPathsAll;
exports.onDidChangeProjectPath = onDidChangeProjectPath;
exports.onDidAddProjectPath = onDidAddProjectPath;
exports.onDidRemoveProjectPath = onDidRemoveProjectPath;
exports.observeRemovedHostnames = observeRemovedHostnames;
exports.observeAddedHostnames = observeAddedHostnames;

var _atom = require("atom");

function _event() {
  const data = require("../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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
function getValidProjectPaths() {
  return atom.project.getDirectories().filter(directory => {
    // If a remote directory path is a local `Directory` instance, the project path
    // isn't yet ready for consumption.
    if (_nuclideUri().default.isRemote(directory.getPath()) && directory instanceof _atom.Directory) {
      return false;
    }

    return true;
  }).map(directory => directory.getPath());
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
      const relativePath = _nuclideUri().default.relative(directory.getPath(), path);

      return [directory, relativePath];
    } catch (e) {// We have a remote-local mismatch or hostname mismatch.
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
  getValidProjectPaths().forEach(existingPath => callback(existingPath, true));
  return onDidChangeProjectPath(callback);
}

function observeProjectPathsAll(callback) {
  let projectPaths = getValidProjectPaths();
  let changing = false;
  callback(projectPaths);
  return atom.project.onDidChangePaths(() => {
    if (changing) {
      throw new Error('Cannot update projects in the middle of an update');
    }

    changing = true;
    projectPaths = getValidProjectPaths();
    callback(projectPaths);
    changing = false;
  });
}

function onDidChangeProjectPath(callback) {
  let projectPaths = getValidProjectPaths();
  let changing = false;
  return observeProjectPathsAll(newProjectPaths => {
    if (changing) {
      throw new Error('Cannot update projects in the middle of an update');
    }

    changing = true; // Check to see if the change was the addition of a project.

    for (const newProjectPath of newProjectPaths) {
      if (!projectPaths.includes(newProjectPath)) {
        callback(newProjectPath, true);
      }
    } // Check to see if the change was the deletion of a project.


    for (const projectPath of projectPaths) {
      if (!newProjectPaths.includes(projectPath)) {
        callback(projectPath, false);
      }
    }

    changing = false;
    projectPaths = newProjectPaths;
  });
}

function onDidAddProjectPath(callback) {
  return onDidChangeProjectPath((projectPath, added) => {
    if (added) {
      callback(projectPath);
    }
  });
}

function onDidRemoveProjectPath(callback) {
  return onDidChangeProjectPath((projectPath, added) => {
    if (!added) {
      callback(projectPath);
    }
  });
}

function observeHostnames() {
  return (atom.packages.initialPackagesActivated ? _RxMin.Observable.of(null) : (0, _event().observableFromSubscribeFunction)(atom.packages.onDidActivateInitialPackages.bind(atom.packages))).switchMap(() => (0, _event().observableFromSubscribeFunction)(atom.project.onDidChangePaths.bind(atom.project)).startWith(null).map(() => new Set(atom.project.getPaths().filter(_nuclideUri().default.isRemote).map(_nuclideUri().default.getHostname))).let((0, _observable().diffSets)()));
}

function observeRemovedHostnames() {
  return observeHostnames().flatMap(diff => _RxMin.Observable.from(diff.removed));
}

function observeAddedHostnames() {
  return observeHostnames().flatMap(diff => _RxMin.Observable.from(diff.added));
}