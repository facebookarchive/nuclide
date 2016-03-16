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
  _userOutputObservable: Subject;     // For user visible output messages.

  constructor() {
    this._serverMessageObservable = new Subject();
    this._userOutputObservable = new Subject();
  }

  getServerMessageObservable(): Observable<string> {
    return this._serverMessageObservable;
  }

  getOutputWindowObservable(): Observable<string> {
    return this._userOutputObservable;
  }

  sendChromeMessage(message: string): void {
    this._serverMessageObservable.onNext(message);
  }

  sendUserOutputMessage(message: string): void {
    this._userOutputObservable.onNext(message);
  }

  dispose(): void {
    this._serverMessageObservable.onCompleted();
    this._userOutputObservable.onCompleted();
  }
}
