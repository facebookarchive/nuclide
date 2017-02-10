/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../commons-node/nuclideUri';

import {Directory} from 'atom';
import nuclideUri from '../commons-node/nuclideUri';

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

export function getAtomProjectRelativePath(path: NuclideUri): ?string {
  const [projectPath, relativePath] = atom.project.relativizePath(path);
  if (!projectPath) {
    return null;
  }
  return relativePath;
}

export function getAtomProjectRootPath(path: NuclideUri): ?string {
  const [projectPath] = atom.project.relativizePath(path);
  return projectPath;
}

export function observeProjectPaths(callback: (projectPath: string) => any): IDisposable {
  getValidProjectPaths().forEach(callback);
  return onDidAddProjectPath(callback);
}

export function onDidAddProjectPath(callback: (projectPath: string) => void): IDisposable {
  let projectPaths: Array<string> = getValidProjectPaths();
  let changing: boolean = false;
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

export function onDidRemoveProjectPath(callback: (projectPath: string) => void): IDisposable {
  let projectPaths: Array<string> = getValidProjectPaths();
  let changing: boolean = false;
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
