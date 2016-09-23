'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  NodeAttachTargetInfo,
} from '../../nuclide-debugger-node-rpc/lib/NodeDebuggerService';
import type {Dispatcher} from 'flux';

import {Emitter} from 'atom';
import {LaunchAttachActionCode} from './Constants';

const ATTACH_TARGET_LIST_CHANGE_EVENT = 'ATTACH_TARGET_LIST_CHANGE_EVENT';

export class LaunchAttachStore {
  _dispatcher: Dispatcher;
  _dispatcherToken: any;
  _attachTargetInfos: Array<NodeAttachTargetInfo>;
  _emitter: Emitter;

  constructor(dispatcher: Dispatcher) {
    this._dispatcher = dispatcher;
    this._dispatcherToken = this._dispatcher.register(this._handleActions.bind(this));
    this._emitter = new Emitter();
    this._attachTargetInfos = [];
  }

  dispose() {
    this._dispatcher.unregister(this._dispatcherToken);
  }

  onAttachTargetListChanged(callback: () => void): IDisposable {
    return this._emitter.on(ATTACH_TARGET_LIST_CHANGE_EVENT, callback);
  }

  _handleActions(args: {actionType: string, data: any}): void {
    switch (args.actionType) {
      case LaunchAttachActionCode.UPDATE_ATTACH_TARGET_LIST:
        this._attachTargetInfos = args.data;
        this._emitter.emit(ATTACH_TARGET_LIST_CHANGE_EVENT);
        break;
    }
  }

  getAttachTargetInfos(): Array<NodeAttachTargetInfo> {
    return this._attachTargetInfos;
  }
}
