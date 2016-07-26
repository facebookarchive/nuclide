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
  ThreadItem,
  NuclideThreadData,
} from './types';
import type {
  PinnedDatatip,
  DatatipService,
} from '../../nuclide-datatip/lib/types';
import {
  Disposable,
  CompositeDisposable,
  Emitter,
} from 'atom';
import nuclideUri from '../../commons-node/nuclideUri';
import Constants from './Constants';
import passesGK from '../../commons-node/passesGK';

const GK_THREAD_SWITCH_UI = 'nuclide_debugger_thread_switch_ui';
const GK_TIMEOUT = 5000;

export default class ThreadStore {
  _disposables: IDisposable;
  _datatipService: ?DatatipService;
  _emitter: Emitter;
  _threadMap: Map<number, ThreadItem>;
  _owningProcessId: number;
  _selectedThreadId: number;
  _stopThreadId: number;
  _threadChangeDatatip: ?PinnedDatatip;

  constructor(dispatcher: Dispatcher) {
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new CompositeDisposable(
      new Disposable(() => {
        dispatcher.unregister(dispatcherToken);
      }),
    );
    this._datatipService = null;
    this._emitter = new Emitter();
    this._threadMap = new Map();
    this._owningProcessId = 0;
    this._selectedThreadId = 0;
    this._stopThreadId = 0;
  }

  setDatatipService(service: DatatipService) {
    this._datatipService = service;
  }

  _handlePayload(payload: Object): void {
    switch (payload.actionType) {
      case Constants.Actions.CLEAR_INTERFACE:
        this._handleClearInterface();
        break;
      case Constants.Actions.UPDATE_THREADS:
        this._updateThreads(payload.data.threadData);
        this._emitter.emit('change');
        break;
      case Constants.Actions.NOTIFY_THREAD_SWITCH:
        this._notifyThreadSwitch(payload.data.sourceURL, payload.data.lineNumber,
          payload.data.message);
        break;
      default:
        return;
    }
  }

  _updateThreads(threadData: NuclideThreadData): void {
    this._threadMap.clear();
    this._owningProcessId = threadData.owningProcessId;
    this._stopThreadId = threadData.stopThreadId;
    this._selectedThreadId = threadData.stopThreadId;
    threadData.threads.forEach(thread =>
      this._threadMap.set(Number(thread.id), thread),
    );
  }

  _handleClearInterface(): void {
    this._threadMap.clear();
    this._cleanUpDatatip();
  }

  _cleanUpDatatip(): void {
    if (this._threadChangeDatatip) {
      if (this._datatipService != null) {
        this._threadChangeDatatip.dispose();
      }
      this._threadChangeDatatip = null;
    }
  }

// TODO(dbonafilia): refactor this code along with the ui code in callstackStore to a ui controller.
  async _notifyThreadSwitch(sourceURL: string, lineNumber: number, message: string): Promise<void> {
    const notifyThreadSwitches = await passesGK(GK_THREAD_SWITCH_UI, GK_TIMEOUT);
    if (!notifyThreadSwitches) {
      return;
    }
    const path = nuclideUri.uriToNuclideUri(sourceURL);
    // we want to put the message one line above the current line unless the selected
    // line is the top line, in which case we will put the datatip next to the line.
    const notificationLineNumber = (lineNumber === 0) ? 0 : (lineNumber - 1);
    // only handle real files for now
    const datatipService = this._datatipService;
    if (datatipService != null && path != null && atom.workspace != null) {
      atom.workspace.open(path, {searchAllPanes: true}).then(editor => {
        const buffer = editor.getBuffer();
        const rowRange = buffer.rangeForRow(notificationLineNumber);
        this._threadChangeDatatip = datatipService.createSimplePinnedDataTip(
          message,
          rowRange,
          true, /* pinnable */
          editor,
          pinnedDatatip => {
            datatipService.deletePinnedDatatip(pinnedDatatip);
          },
        );
      });
    }
  }

  getThreadList(): Array<ThreadItem> {
    return Array.from(this._threadMap.values());
  }

  onChange(callback: () => void): IDisposable {
    return this._emitter.on('change', callback);
  }

  dispose(): void {
    this._cleanUpDatatip();
    this._disposables.dispose();
  }
}
