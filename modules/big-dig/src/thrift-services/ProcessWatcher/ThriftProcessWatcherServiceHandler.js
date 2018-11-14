/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */
import type {ProcessMessage} from 'nuclide-commons/process';
import type {Subscription} from 'rxjs';

// $FlowIgnore
import ProcessWatcher_types from './gen-nodejs/ProcessWatcher_types';
import {
  ProcessExitError,
  ProcessSystemError,
  MaxBufferExceededError,
  ProcessTimeoutError,
} from 'nuclide-commons/process';
import {Observable, Subject} from 'rxjs';
import {getLogger} from 'log4js';
import {observeProcess} from 'nuclide-commons/process';

const logger = getLogger('thrift-process-watcher-handler');

type ProcessMeta = {
  messages: Array<ProcessMessage>,
  subscription: ?Subscription,
  resolveLongPoll: ?(Array<ProcessMessage>) => void,
};

export class ThriftProcessWatcherServiceHandler {
  _processes: {[id: number]: ProcessMeta};
  _numObservedProcesses: number;

  constructor() {
    this._numObservedProcesses = 0;
    this._processes = {};
  }

  dispose() {
    for (const id in this._processes) {
      this.unsubscribe(parseInt(id, 10));
    }
  }

  async nextMessages(
    processId: number,
    waitTimeSec: number,
  ): Promise<Array<ProcessWatcher_types.ProcessWatcherMessage>> {
    if (!this._processes[processId]) {
      throw new Error('no such process');
    }

    let messages = [];
    if (this._hasQueuedMessages(processId)) {
      messages = this._processes[processId].messages;
      this._clearQueuedMessages(processId);
    } else {
      messages = await this._waitForNewMessages(processId, waitTimeSec);
    }

    if (this._lastMessageExits(messages)) {
      this._deleteProcessMeta(processId);
    }

    return messages;
  }

  unsubscribe(id: number): void {
    if (this._processes[id] && this._processes[id].subscription) {
      logger.info('unsubscribing process with watcher id', id);
      if (this._processes[id].subscription) {
        this._processes[id].subscription.unsubscribe();
        this._enqueueProcessMessage(
          {kind: 'exit', exitCode: 1, signal: 'SIGKILL'},
          id,
        );
      }
    }
    this._deleteProcessMeta(id);
  }

  watchProcess(cmd: string, cmdArgs: Array<string>): number {
    const id = this._numObservedProcesses;
    this._numObservedProcesses++;

    const input = new Subject();
    const observable = observeProcess(cmd, cmdArgs, {
      isExitError: () => false,
      detached: false,
      killTreeWhenDone: true,
      env: process.env,
      dontLogInNuclide: true,
      input,
    }).catch(error => {
      const exitCode = error.exitCode ?? 1;
      const signal = error.signal;

      // emit synthetic events
      return Observable.of(
        {kind: 'stderr', data: this._getErrorMessage(error)},
        {kind: 'exit', exitCode, signal},
      );
    });

    this._processes[id] = {
      messages: [],
      subscription: null,
      resolveLongPoll: null,
      // input // TODO
    };

    this._processes[id].subscription = observable.subscribe(message => {
      this._enqueueProcessMessage(message, id);
    });
    return id;
  }

  _getErrorMessage(
    error:
      | ProcessExitError
      | ProcessSystemError
      | MaxBufferExceededError
      | ProcessTimeoutError,
  ) {
    return (
      [
        'name',
        'exitCode',
        'signal',
        'command',
        'args',
        'errno',
        'code',
        'path',
        'syscall',
      ]
        .map((prop: string) => {
          // $FlowIgnore
          if (error[prop] != null) {
            return `${prop}: ${error[prop]}`;
          } else {
            return null;
          }
        })
        .filter(el => el != null)
        .join('\n') + '\n'
    );
  }

  _clearQueuedMessages(processId: number) {
    this._processes[processId].messages = [];
  }

  _hasQueuedMessages(processId: number) {
    return this._processes[processId].messages.length > 0;
  }

  _lastMessageExits(messages: Array<ProcessMessage>) {
    const lastIndex = messages.length - 1;
    if (messages[lastIndex]) {
      return messages[lastIndex].kind === 'exit';
    }
    return false;
  }

  _deleteProcessMeta(id: number) {
    delete this._processes[id];
  }

  _enqueueProcessMessage = (msg: ProcessMessage, id: number): void => {
    if (!this._processes[id]) {
      logger.error('got new message', msg, 'for deleted process', id);
      return;
    }

    const hasLongPoll = this._processes[id].resolveLongPoll != null;

    if (hasLongPoll) {
      const resolveLongPoll = this._processes[id].resolveLongPoll;
      this._processes[id].resolveLongPoll = null;
      if (resolveLongPoll != null) {
        resolveLongPoll([msg]);
      }
    } else {
      this._processes[id].messages.push(msg);
    }
  };

  async _waitForNewMessages(
    processId: number,
    waitTimeSec: number,
  ): Promise<Array<ProcessMessage>> {
    const SEC_TO_MSEC = 1000;
    return new Promise((resolveLongPoll, rejectLongPoll) => {
      this._processes[processId].resolveLongPoll = resolveLongPoll;
      setTimeout(() => {
        resolveLongPoll([]);
      }, waitTimeSec * SEC_TO_MSEC);
    });
  }
}
