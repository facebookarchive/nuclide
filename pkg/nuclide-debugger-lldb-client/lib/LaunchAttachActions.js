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
} from '../../nuclide-debugger-lldb-server/lib/DebuggerRpcServiceInterface';
import type {NuclideUri} from '../../nuclide-remote-uri';
import type DebuggerProcessInfo from '../../nuclide-debugger-atom/lib/DebuggerProcessInfo';

import invariant from 'assert';
import {CompositeDisposable} from 'atom';
import {LaunchAttachActionCode} from './Constants';
import {AttachProcessInfo} from './AttachProcessInfo';
import {LaunchProcessInfo} from './LaunchProcessInfo';
import {getServiceByNuclideUri} from '../../nuclide-client';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';

const ATTACH_TARGET_LIST_REFRESH_INTERVAL = 2000;

export class LaunchAttachActions {
  _dispatcher: Dispatcher;
  _targetUri: NuclideUri;
  _refreshTimerId: ?number;
  _dialogVisible: boolean;
  _subscriptions: atom$CompositeDisposable;

  constructor(dispatcher: Dispatcher, targetUri: NuclideUri) {
    this._dispatcher = dispatcher;
    this._targetUri = targetUri;
    this._refreshTimerId = null;
    this._dialogVisible = true; // visible by default.
    (this: any).updateAttachTargetList = this.updateAttachTargetList.bind(this);
    (this: any)._handleLaunchAttachDialogToggle = this._handleLaunchAttachDialogToggle.bind(this);
    this._subscriptions = new CompositeDisposable(atom.commands.add('atom-workspace', {
      // eslint-disable-next-line nuclide-internal/command-menu-items
      'nuclide-debugger:toggle-launch-attach': this._handleLaunchAttachDialogToggle,
    }));
    this._setTimerEnabledState(true);
  }

  _handleLaunchAttachDialogToggle(): void {
    this._dialogVisible = !this._dialogVisible;
    this._setTimerEnabledState(this._dialogVisible);
    // Fire and forget.
    this.updateAttachTargetList();
  }

  _setTimerEnabledState(enabled: boolean): void {
    if (enabled) {
      this._refreshTimerId = setInterval(
        this.updateAttachTargetList,
        ATTACH_TARGET_LIST_REFRESH_INTERVAL,
      );
    } else if (this._refreshTimerId != null) {
      clearTimeout(this._refreshTimerId);
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
      'nuclide-debugger:toggle-launch-attach'
    );
  }

  showDebuggerPanel(): void {
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:show'
    );
  }

  async _startDebugging(processInfo: DebuggerProcessInfo): Promise<void> {
    const debuggerService = await consumeFirstProvider('nuclide-debugger.remote');
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

  dispose(): void {
    this._subscriptions.dispose();
  }
}
