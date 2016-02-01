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

async function getProcessInfoList(): Promise<Array<DebuggerProcessInfo>> {
  const {LldbDebuggerProcessInfo} = require('./LldbDebuggerProcessInfo');
  // TODO: Currently first local dir only.
  const remoteUri = require('../../../remote-uri');
  const localDirectory = atom.project.getDirectories()
    .filter(directory => remoteUri.isLocal(directory.getPath()))[0];

  if (!localDirectory) {
    return [];
  }

  const localService = require('../../../client').
      getServiceByNuclideUri('LLDBDebuggerRpcService', localDirectory.getPath());
  const targetInfoList = await localService.getAttachTargetInfoList();

  const processes = [];
  for (const targetInfo of targetInfoList) {
    processes.push(new LldbDebuggerProcessInfo(localDirectory.getPath(), targetInfo));
  }
  return processes;
}

module.exports = {
  name: 'lldb',
  getProcessInfoList,
};
