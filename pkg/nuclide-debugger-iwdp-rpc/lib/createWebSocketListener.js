'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import WS from 'ws';
import {Subject} from 'rxjs';

import type {Observable} from 'rxjs';

export function createWebSocketListener(webSocket: WS): Observable<string> {
  const subject = new Subject();
  webSocket.on('message', message => subject.next(message));
  webSocket.on('error', error => subject.error(error));
  webSocket.on('close', () => subject.complete());
  return subject.asObservable();
}
