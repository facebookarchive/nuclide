/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type LaunchAttachDispatcher from './LaunchAttachDispatcher';
import type {
  AttachTargetInfo,
  LaunchTargetInfo,
} from '../../nuclide-debugger-native-rpc/lib/NativeDebuggerServiceInterface';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {DebuggerProcessInfo} from 'nuclide-debugger-common';
import typeof * as NativeDebuggerService from '../../nuclide-debugger-native-rpc/lib/NativeDebuggerServiceInterface';

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
  _refreshTimerId: ?IntervalID;
  _parentUIVisible: boolean;
  _attachUIVisible: boolean;

  constructor(dispatcher: LaunchAttachDispatcher, targetUri: NuclideUri) {
    this._dispatcher = dispatcher;
    this._targetUri = targetUri;
    this._refreshTimerId = null;
    this._parentUIVisible = true; // Visible by default.
    this._attachUIVisible = false;
    (this: any).updateAttachUIVisibility = this.updateAttachUIVisibility.bind(
      this,
    );
    (this: any).updateParentUIVisibility = this.updateParentUIVisibility.bind(
      this,
    );
    (this: any).updateAttachTargetList = this.updateAttachTargetList.bind(this);
  }

  attachDebugger(attachTarget: AttachTargetInfo): Promise<void> {
    const attachInfo = new AttachProcessInfo(this.getTargetUri(), attachTarget);
    return this._startDebugging(attachInfo);
  }

  launchDebugger(launchTarget: LaunchTargetInfo): Promise<void> {
    const launchInfo = new LaunchProcessInfo(this.getTargetUri(), launchTarget);
    return this._startDebugging(launchInfo);
  }

  async _startDebugging(processInfo: DebuggerProcessInfo): Promise<void> {
    const debuggerService = await consumeFirstProvider(
      'nuclide-debugger.remote',
    );
    await debuggerService.startDebugging(processInfo);
  }

  // Override.
  async updateAttachTargetList(): Promise<void> {
    const rpcService: ?NativeDebuggerService = getServiceByNuclideUri(
      'NativeDebuggerService',
      this.getTargetUri(),
    );
    invariant(rpcService);
    const attachTargetList = await rpcService.getAttachTargetInfoList();
    this._dispatcher.dispatch({
      actionType: ActionTypes.UPDATE_ATTACH_TARGET_LIST,
      attachTargetInfos: attachTargetList,
    });
  }

  getTargetUri(): NuclideUri {
    return this._targetUri;
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
    this._killAutoRefreshTimer();
    if (this._parentUIVisible && this._attachUIVisible) {
      this.updateAttachTargetList();
      this._refreshTimerId = setInterval(
        this.updateAttachTargetList,
        ATTACH_TARGET_LIST_REFRESH_INTERVAL,
      );
    }
  }

  _killAutoRefreshTimer(): void {
    if (this._refreshTimerId != null) {
      clearInterval(this._refreshTimerId);
      this._refreshTimerId = null;
    }
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

  dispose(): void {
    this._killAutoRefreshTimer();
  }
}
