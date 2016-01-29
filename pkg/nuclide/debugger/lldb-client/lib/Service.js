'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DebuggerProcessInfo} from '../../atom';

async function getProcessInfoList():
    Promise<Array<DebuggerProcessInfo>> {
  const {ProcessInfo} = require('./ProcessInfo');
  // TODO: Currently first dir only.
  const debuggerServices = atom.project.getDirectories().map(directory => {
    return require('../../../client').
      getServiceByNuclideUri('LLDBDebuggerRpcService', directory.getPath());
  });

  // TODO: currently first dir only
  const targetUri = atom.project.getDirectories()[0].getPath();

  const processes = [];
  await Promise.all(debuggerServices.map(async (service) => {
    const targetInfoList = await service.getAttachTargetInfoList();
    for (const targetInfo of targetInfoList) {
      processes.push(new ProcessInfo(targetUri, targetInfo));
    }
  }));
  return processes;
}

module.exports = {
  name: 'lldb',
  getProcessInfoList,
};
