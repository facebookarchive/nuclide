'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../remote-uri';
import typeof * as ArcanistBaseService from '../../arcanist-base';

function getService(fileName: NuclideUri): ArcanistBaseService {
  return require('../../client').getServiceByNuclideUri('ArcanistBaseService', fileName);
}

function findArcConfigDirectory(fileName: NuclideUri): Promise<?NuclideUri> {
  return getService(fileName).findArcConfigDirectory(fileName);
}

function readArcConfig(fileName: NuclideUri): Promise<?Object> {
  return getService(fileName).readArcConfig(fileName);
}

function findArcProjectIdOfPath(fileName: NuclideUri): Promise<?string> {
  return getService(fileName).findArcProjectIdOfPath(fileName);
}

function getProjectRelativePath(fileName: NuclideUri): Promise<?string> {
  return getService(fileName).getProjectRelativePath(fileName);
}

async function findDiagnostics(fileNames: Iterable<NuclideUri>): Promise<Array<Object>> {
  const serviceToFileNames: Map<ArcanistBaseService, Array<NuclideUri>> = new Map();
  for (const file of fileNames) {
    const service = getService(file);
    let files = serviceToFileNames.get(service);
    if (files == null) {
      files = [];
      serviceToFileNames.set(service, files);
    }
    files.push(file);
  }

  const results: Array<Promise<Array<Object>>> = [];
  for (const [service, files] of serviceToFileNames) {
    results.push(service.findDiagnostics(files));
  }

  return [].concat(...(await Promise.all(results)));
}

module.exports = {
  findArcConfigDirectory,
  readArcConfig,
  findArcProjectIdOfPath,
  getProjectRelativePath,
  findDiagnostics,
};
