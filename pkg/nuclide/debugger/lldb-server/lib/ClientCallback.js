'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Observable, Subject} from 'rx';

export class ClientCallback {
  _serverMessageObservable: Subject;  // For server messages.

  constructor() {
    this._serverMessageObservable = new Subject();
  }

  getServerMessageObservable(): Observable<string> {
    return this._serverMessageObservable;
  }

  sendMessage(message: string): void {
    this._serverMessageObservable.onNext(message);
  }

  dispose(): void {
    this._serverMessageObservable.onCompleted();
  }
}
