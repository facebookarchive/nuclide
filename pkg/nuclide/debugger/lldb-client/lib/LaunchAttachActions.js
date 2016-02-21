'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Dispatcher} from 'flux';
import type {
  AttachTargetInfo,
  LaunchTargetInfo,
} from '../../lldb-server/lib/DebuggerRpcServiceInterface';
import type {NuclideUri} from '../../../remote-uri';
import type DebuggerProcessInfo from '../../atom/lib/DebuggerProcessInfo';

import invariant from 'assert';
import {LaunchAttachActionCode} from './Constants';
import {AttachProcessInfo} from './AttachProcessInfo';
import {LaunchProcessInfo} from './LaunchProcessInfo';
import {getServiceByNuclideUri} from '../../../client';

export class LaunchAttachActions {
  _dispatcher: Dispatcher;
  _targetUri: NuclideUri;

  constructor(dispatcher: Dispatcher, targetUri: NuclideUri) {
    this._dispatcher = dispatcher;
    this._targetUri = targetUri;
  }

  attachDebugger(attachTarget: AttachTargetInfo): Promise<void> {
    const attachInfo = new AttachProcessInfo(this._targetUri, attachTarget);
    return this._startDebugging(attachInfo);
  }

  launchDebugger(launchTarget: LaunchTargetInfo): Promise<void> {
    const launchInfo = new LaunchProcessInfo(this._targetUri, launchTarget);
    return this._startDebugging(launchInfo);
  }

  async _startDebugging(processInfo: DebuggerProcessInfo): Promise<void> {
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:toggle-launch-attach'
    );
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:show'
    );

    const debuggerService = await require('../../../service-hub-plus')
          .consumeFirstProvider('nuclide-debugger.remote');
    await debuggerService.startDebugging(processInfo);
  }

  async updateAttachTargetList(): Promise<void> {
    const rpcService = getServiceByNuclideUri('LLDBDebuggerRpcService', this._targetUri);
    invariant(rpcService);
    const attachTargetList = await rpcService.getAttachTargetInfoList();
    this._emitNewAction(LaunchAttachActionCode.UPDATE_ATTACH_TARGET_LIST, attachTargetList);
  }

  _emitNewAction(actionType: string, data: Object): void {
    this._dispatcher.dispatch({
      actionType,
      data,
    });
  }
}
