'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DebuggerProcessInfo} from '../../nuclide-debugger-base';

import utils from './utils';
import nuclideUri from '../../commons-node/nuclideUri';
import {AttachProcessInfo} from './AttachProcessInfo';

async function getProcessInfoList(): Promise<Array<DebuggerProcessInfo>> {
  const {log} = utils;
  log('Getting process info list');

  // TODO: Currently first remote dir only.
  const remoteDirectoryPath = atom.project.getDirectories()
    .map(directoryPath => directoryPath.getPath())
    .filter(directoryPath => nuclideUri.isRemote(directoryPath))[0];

  if (remoteDirectoryPath) {
    return [new AttachProcessInfo(remoteDirectoryPath)];
  } else {
    log('No remote dirs getting process info list');
    return [];
  }
}

module.exports = {
  name: 'hhvm',
  getProcessInfoList,
};
