'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import utils from './utils';
const {log} = utils;

import type {DebuggerProcessInfo} from '../../atom';

async function getProcessInfoList(): Promise<Array<DebuggerProcessInfo>> {
  log('Getting process info list');

  const remoteUri = require('../../../remote-uri');
  // TODO: Currently first remote dir only.
  const remoteDirectoryPath = atom.project.getDirectories()
    .map(directoryPath => directoryPath.getPath())
    .filter(directoryPath => remoteUri.isRemote(directoryPath))[0];

  if (remoteDirectoryPath) {
    const {AttachProcessInfo} = require('./AttachProcessInfo');
    return [(new AttachProcessInfo(remoteDirectoryPath): DebuggerProcessInfo)];
  } else {
    log('No remote dirs getting process info list');
    return [];
  }
}

module.exports = {
  name: 'hhvm',
  getProcessInfoList,
};
