'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {getServiceByNuclideUri} from 'nuclide-client';
import type {BuckProject} from 'nuclide-buck-base/lib/BuckProject';
const {getPath} = require('nuclide-remote-uri');

const buckProjectForBuckProjectDirectory: {[key: string]: mixed} = {};

/**
 * @return Promise that resolves to buck project or null if the
 *     specified filePath is not part of a Buck project.
 */
async function buckProjectRootForPath(filePath: string): Promise<?BuckProject> {
  const service = getServiceByNuclideUri('BuckUtils', filePath);
  const buckUtils = new service.BuckUtils();
  let directory = await buckUtils.getBuckProjectRoot(filePath);

  if (!directory) {
    return null;
  }

  let buckProject = buckProjectForBuckProjectDirectory[directory];
  if (buckProject) {
    return buckProject;
  }

  directory = getPath(directory);

  const buckService = getServiceByNuclideUri('BuckProject', filePath);
  if (buckService) {
    buckProject = new buckService.BuckProject({rootPath: directory});
    buckProjectForBuckProjectDirectory[directory] = buckProject;
  }
  return buckProject;
}

module.exports = buckProjectRootForPath;
