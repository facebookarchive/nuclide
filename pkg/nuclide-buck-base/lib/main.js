'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof * as BuckService from './BuckProject';
import type {BuckProject} from './BuckProject';

import invariant from 'assert';
import nuclideUri from '../../commons-node/nuclideUri';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';

export {BuckProject} from './BuckProject';

const buckProjectDirectoryByPath: Map<string, string> = new Map();
const buckProjectForBuckProjectDirectory: Map<string, BuckProject> = new Map();

export function isBuckFile(filePath: string): boolean {
  // TODO(mbolin): Buck does have an option where the user can customize the
  // name of the build file: https://github.com/facebook/buck/issues/238.
  // This function will not work for those who use that option.
  return nuclideUri.basename(filePath) === 'BUCK';
}

/**
 * Cached, service-aware version of BuckProject.getRootForPath.
 */
export async function getBuckProjectRoot(filePath: string): Promise<?string> {
  let directory = buckProjectDirectoryByPath.get(filePath);
  if (!directory) {
    const service: ?BuckService = getServiceByNuclideUri('BuckProject', filePath);
    if (service == null) {
      return null;
    }
    directory = await service.BuckProject.getRootForPath(filePath);
    if (directory == null) {
      return null;
    } else {
      buckProjectDirectoryByPath.set(filePath, directory);
    }
  }
  return directory;
}

export function createBuckProject(rootPath: string): BuckProject {
  const buckService: ?BuckService = getServiceByNuclideUri('BuckProject', rootPath);
  invariant(buckService != null);
  return new buckService.BuckProject({rootPath});
}

/**
 * Given a file path, returns the BuckProject for its project root (if it exists).
 */
export async function getBuckProject(filePath: string): Promise<?BuckProject> {
  const rootPath = await getBuckProjectRoot(filePath);
  if (rootPath == null) {
    return null;
  }

  let buckProject = buckProjectForBuckProjectDirectory.get(rootPath);
  if (buckProject != null) {
    return buckProject;
  }
  buckProject = createBuckProject(rootPath);
  buckProjectForBuckProjectDirectory.set(rootPath, buckProject);
  return buckProject;
}
