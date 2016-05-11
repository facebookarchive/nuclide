'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BuckProject} from './BuckProject';
import typeof * as BuckUtilsService from './BuckUtils';
import typeof * as BuckProjectService from './BuckProject';

import invariant from 'assert';
import {getPath} from '../../nuclide-remote-uri';
import {getServiceByNuclideUri} from '../../nuclide-client';

const buckProjectForBuckProjectDirectory: {[key: string]: BuckProject} = {};

/**
 * @return Promise that resolves to buck project or null if the
 *     specified filePath is not part of a Buck project.
 */
export default async function buckProjectRootForPath(filePath: string): Promise<?BuckProject> {
  const service: ?BuckUtilsService = getServiceByNuclideUri('BuckUtils', filePath);
  invariant(service);
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

  const buckService: ?BuckProjectService = getServiceByNuclideUri('BuckProject', filePath);
  if (buckService) {
    buckProject = new buckService.BuckProject({rootPath: directory});
    buckProjectForBuckProjectDirectory[directory] = buckProject;
  }
  return buckProject;
}
