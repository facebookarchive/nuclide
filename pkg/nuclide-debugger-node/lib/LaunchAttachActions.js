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
  NodeAttachTargetInfo,
} from '../../nuclide-debugger-node-rpc/lib/NodeDebuggerService';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {DebuggerProcessInfo} from '../../nuclide-debugger-base';

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {ActionTypes} from './LaunchAttachDispatcher';
import {NodeAttachProcessInfo} from './NodeAttachProcessInfo';
import {getNodeDebuggerServiceByNuclideUri} from '../../nuclide-remote-connection';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';

const ATTACH_TARGET_LIST_REFRESH_INTERVAL = 2000;

export class LaunchAttachActions {
  _dispatcher: LaunchAttachDispatcher;
  _targetUri: NuclideUri;
  _refreshTimerId: ?number;
  _dialogVisible: boolean;
  _subscriptions: IDisposable;

  constructor(dispatcher: LaunchAttachDispatcher, targetUri: NuclideUri) {
    this._dispatcher = dispatcher;
    this._targetUri = targetUri;
    this._refreshTimerId = null;
    this._dialogVisible = true; // visible by default.
    (this: any).updateAttachTargetList = this.updateAttachTargetList.bind(this);
    (this: any)._handleLaunchAttachDialogToggle = this._handleLaunchAttachDialogToggle.bind(this);
    this._subscriptions = new UniversalDisposable(
      atom.commands.add('atom-workspace', {
        // eslint-disable-next-line nuclide-internal/atom-commands
        'nuclide-debugger:toggle-launch-attach': this._handleLaunchAttachDialogToggle,
      }),
      () => {
        if (this._refreshTimerId != null) {
          clearTimeout(this._refreshTimerId);
          this._refreshTimerId = null;
        }
      },
    );
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

  attachDebugger(attachTarget: NodeAttachTargetInfo): Promise<void> {
    const attachInfo = new NodeAttachProcessInfo(this._targetUri, attachTarget);
    return this._startDebugging(attachInfo);
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
    const rpcService = getNodeDebuggerServiceByNuclideUri(this._targetUri);
    const attachTargetList = await rpcService.getAttachTargetInfoList();
    this._dispatcher.dispatch({
      actionType: ActionTypes.UPDATE_ATTACH_TARGET_LIST,
      attachTargetInfos: attachTargetList,
    });
  }

  dispose(): void {
    this._subscriptions.dispose();
  }
}
