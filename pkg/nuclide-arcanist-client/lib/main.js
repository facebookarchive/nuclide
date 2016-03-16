'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';
import typeof * as ArcanistBaseService from '../../nuclide-arcanist-base';

import invariant from 'assert';

const DIFFERENTIAL_REVISION_REGEX = /^Differential Revision:\s*(\D+\/[dD]([1-9][0-9]{5,}))/im;

export type PhabricatorRevisionInfo = {
  url: string;
  id: string;
}

function getService(fileName: NuclideUri): ArcanistBaseService {
  const {getServiceByNuclideUri} = require('../../nuclide-client');
  const service = getServiceByNuclideUri('ArcanistBaseService', fileName);
  invariant(service);
  return service;
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

async function findDiagnostics(
  fileNames: Iterable<NuclideUri>,
  skip: Array<string>,
): Promise<Array<Object>> {
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
    results.push(service.findDiagnostics(files, skip));
  }

  return [].concat(...(await Promise.all(results)));
}

function createPhabricatorRevision(filePath: NuclideUri): Promise<void> {
  return getService(filePath).createPhabricatorRevision(filePath);
}

function updatePhabricatorRevision(
  filePath: NuclideUri,
  message: string,
  allowUntracked: boolean,
): Promise<void> {
  return getService(filePath).updatePhabricatorRevision(filePath, message, allowUntracked);
}

function getPhabricatorRevisionFromCommitMessage(commitMessage: string): ?PhabricatorRevisionInfo {
  const match = DIFFERENTIAL_REVISION_REGEX.exec(commitMessage);
  if (match === null) {
    return null;
  } else {
    return {
      url: match[1],
      id: `D${match[2]}`,
    };
  }
}

module.exports = {
  findArcConfigDirectory,
  readArcConfig,
  findArcProjectIdOfPath,
  getProjectRelativePath,
  findDiagnostics,
  createPhabricatorRevision,
  updatePhabricatorRevision,
  getPhabricatorRevisionFromCommitMessage,
};
