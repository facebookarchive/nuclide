'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AttachTargetInfo} from '../../lldb-server/lib/DebuggerRpcServiceInterface';
import type {Dispatcher} from 'flux';

import {Disposable} from 'atom';
import {EventEmitter} from 'events';
import {LaunchAttachActionCode} from './Constants';

const ATTACH_TARGET_LIST_CHANGE_EVENT = 'ATTACH_TARGET_LIST_CHANGE_EVENT';

export class LaunchAttachStore {
  _dispatcher: Dispatcher;
  _dispatcherToken: any;
  _attachTargetInfos: Array<AttachTargetInfo>;
  _eventEmitter: EventEmitter;

  constructor(dispatcher: Dispatcher) {
    this._dispatcher = dispatcher;
    this._dispatcherToken = this._dispatcher.register(this._handleActions.bind(this));
    this._eventEmitter = new EventEmitter();
    this._attachTargetInfos = [];
  }

  dispose() {
    this._dispatcher.unregister(this._dispatcherToken);
  }

  onAttachTargetListChanged(callback: () => void): IDisposable {
    this._eventEmitter.on(ATTACH_TARGET_LIST_CHANGE_EVENT, callback);
    return new Disposable(
      () => this._eventEmitter.removeListener(ATTACH_TARGET_LIST_CHANGE_EVENT, callback)
    );
  }

  _handleActions(args: {actionType: string; data: any}): void {
    switch (args.actionType) {
      case LaunchAttachActionCode.UPDATE_ATTACH_TARGET_LIST:
        this._attachTargetInfos = args.data;
        this._eventEmitter.emit(ATTACH_TARGET_LIST_CHANGE_EVENT);
        break;
    }
  }

  getAttachTargetInfos(): Array<AttachTargetInfo> {
    return this._attachTargetInfos;
  }
}
