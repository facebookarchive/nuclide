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

export type Level = 'info' | 'log' | 'warning' | 'error' | 'debug';

export type Message = {
  text: string,
  level: Level,
};

export type Record = Message & {
  source: string,
};

export type AppState = {
  maxMessageCount: number,
  records: Array<Record>,
  providers: Map<string, OutputProvider>,
};

export type OutputProvider = {
  messages: Rx.Observable<Message>,

  // The source can't be part of the message because we want to be able to populate a filter menu
  // before we even have any messages.
  source: string,
};
