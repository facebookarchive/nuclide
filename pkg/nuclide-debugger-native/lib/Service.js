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
import typeof * as NativeDebuggerServiceInterface
  from '../../nuclide-debugger-native-rpc/lib/NativeDebuggerServiceInterface';

import invariant from 'assert';
import nuclideUri from '../../commons-node/nuclideUri';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';
import {AttachProcessInfo} from './AttachProcessInfo';

async function getProcessInfoList(): Promise<Array<DebuggerProcessInfo>> {
  // TODO: Currently first local dir only.
  const localDirectory = atom.project.getDirectories()
    .filter(directory => nuclideUri.isLocal(directory.getPath()))[0];

  if (!localDirectory) {
    return [];
  }

  const localService: ?NativeDebuggerServiceInterface
    = getServiceByNuclideUri('NativeDebuggerService', localDirectory.getPath());
  invariant(localService);
  const targetInfoList = await localService.getAttachTargetInfoList();

  const processes = [];
  for (const targetInfo of targetInfoList) {
    processes.push(new AttachProcessInfo(localDirectory.getPath(), targetInfo));
  }
  return processes;
}

module.exports = {
  name: 'lldb',
  getProcessInfoList,
};
