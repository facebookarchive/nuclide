'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type Rx from 'rx';

export type Level = 'info' | 'warn' | 'error';

export type Message = {
  text: string;
  level: Level;
};

export type Record = Message;

export type AppState = {
  records: Array<Record>;
};

export type OutputProvider = {
  messages: Rx.Observable<Message>;
};
