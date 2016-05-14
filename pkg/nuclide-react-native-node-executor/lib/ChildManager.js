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
  RnRequest,
  ExecutorResponse,
  ServerReplyCallback,
} from './types';
import type {EventEmitter} from 'events';

import formatEnoentNotification from '../../commons-atom/format-enoent-notification';
import {executeRnRequests} from './executeRnRequests';
import {Observable, Subject} from 'rxjs';

let logger;
function getLogger() {
  if (!logger) {
    logger = require('../../nuclide-logging').getLogger();
  }
  return logger;
}

export default class ChildManager {

  _onReply: ServerReplyCallback;
  _emitter: EventEmitter;

  _executorSubscription: ?rx$ISubscription;
  _executorResponses: Observable<ExecutorResponse>;
  _rnRequests: Subject<RnRequest>;

  constructor(onReply: ServerReplyCallback, emitter: EventEmitter) {
    this._onReply = onReply;
    this._emitter = emitter;
    this._rnRequests = new Subject();
    this._executorResponses = executeRnRequests(this._rnRequests);
  }

  _createChild(): void {
    if (this._executorSubscription != null) {
      return;
    }

    this._executorSubscription = this._executorResponses.subscribe(
      response => {
        switch (response.kind) {
          case 'result':
            this._onReply(response.replyId, response.result);
            return;
          case 'error':
            getLogger().error(response.message);
            return;
          case 'pid':
            this._emitter.emit('eval_application_script', response.pid);
            return;
        }
      },
      err => {
        if (err.code === 'ENOENT') {
          const {message, meta} = formatEnoentNotification({
            feature: 'React Native debugging',
            toolName: 'node',
            pathSetting: 'nuclide-react-native.pathToNode',
          });
          atom.notifications.addError(message, meta);
          return;
        }
        getLogger().error(err);
      },
    );
  }

  killChild(): void {
    if (!this._executorSubscription) {
      return;
    }
    this._executorSubscription.unsubscribe();
    this._executorSubscription = null;
  }

  handleMessage(request: RnRequest): void {
    if (request.replyID) {
      // getting cross-talk from another executor (probably Chrome)
      return;
    }

    // Make sure we have a worker to run the JS.
    this._createChild();

    this._rnRequests.next(request);
  }

}
