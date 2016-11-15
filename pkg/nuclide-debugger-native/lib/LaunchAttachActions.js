'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type LaunchAttachDispatcher from './LaunchAttachDispatcher';
import type {
  AttachTargetInfo,
  LaunchTargetInfo,
} from '../../nuclide-debugger-native-rpc/lib/NativeDebuggerServiceInterface';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {DebuggerProcessInfo} from '../../nuclide-debugger-base';
import typeof * as NativeDebuggerService
  from '../../nuclide-debugger-native-rpc/lib/NativeDebuggerServiceInterface';

import invariant from 'assert';
import {AttachProcessInfo} from './AttachProcessInfo';
import {LaunchProcessInfo} from './LaunchProcessInfo';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';
import {ActionTypes} from './LaunchAttachDispatcher';

const ATTACH_TARGET_LIST_REFRESH_INTERVAL = 2000;

export class LaunchAttachActions {
  _dispatcher: LaunchAttachDispatcher;
  _targetUri: NuclideUri;
  _refreshTimerId: ?number;
  _parentUIVisible: boolean;
  _attachUIVisible: boolean;

  constructor(dispatcher: LaunchAttachDispatcher, targetUri: NuclideUri) {
    this._dispatcher = dispatcher;
    this._targetUri = targetUri;
    this._refreshTimerId = null;
    this._parentUIVisible = true;   // Visible by default.
    this._attachUIVisible = false;
    (this: any).updateAttachTargetList = this.updateAttachTargetList.bind(this);
    (this: any).updateParentUIVisibility = this.updateParentUIVisibility.bind(this);
    (this: any).updateAttachUIVisibility = this.updateAttachUIVisibility.bind(this);
  }

  updateParentUIVisibility(visible: boolean): void {
    this._parentUIVisible = visible;
    this._updateAutoRefresh();
  }

  updateAttachUIVisibility(visible: boolean): void {
    this._attachUIVisible = visible;
    this._updateAutoRefresh();
  }

  _updateAutoRefresh(): void {
    if (this._parentUIVisible && this._attachUIVisible) {
      this._refreshTimerId = setInterval(
        this.updateAttachTargetList,
        ATTACH_TARGET_LIST_REFRESH_INTERVAL,
      );
    } else {
      this._killAutoRefreshTimer();
    }
  }

  _killAutoRefreshTimer(): void {
    if (this._refreshTimerId != null) {
      clearTimeout(this._refreshTimerId);
      this._refreshTimerId = null;
    }
  }

  attachDebugger(attachTarget: AttachTargetInfo): Promise<void> {
    const attachInfo = new AttachProcessInfo(this._targetUri, attachTarget);
    return this._startDebugging(attachInfo);
  }

  launchDebugger(launchTarget: LaunchTargetInfo): Promise<void> {
    const launchInfo = new LaunchProcessInfo(this._targetUri, launchTarget);
    return this._startDebugging(launchInfo);
  }

  toggleLaunchAttachDialog(): void {
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:toggle-launch-attach',
    );
  }

  showDebuggerPanel(): void {
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:show',
    );
  }

  async _startDebugging(processInfo: DebuggerProcessInfo): Promise<void> {
    const debuggerService = await consumeFirstProvider('nuclide-debugger.remote');
    await debuggerService.startDebugging(processInfo);
  }

  async updateAttachTargetList(): Promise<void> {
    const rpcService: ?NativeDebuggerService
      = getServiceByNuclideUri('NativeDebuggerService', this._targetUri);
    invariant(rpcService);
    const attachTargetList = await rpcService.getAttachTargetInfoList();
    this._dispatcher.dispatch({
      actionType: ActionTypes.UPDATE_ATTACH_TARGET_LIST,
      attachTargetInfos: attachTargetList,
    });
  }

  dispose(): void {
    this._killAutoRefreshTimer();
  }
}
