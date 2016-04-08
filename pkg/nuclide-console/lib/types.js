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

type MessageKind = 'message' | 'request' | 'response';

// Represents the result of an executor executing code.
type Response = {
  text: string;
  level: Level;
};

// A regular message, emitted by output providers.
export type Message = {
  text: string;
  level: Level;
};

// A normalized type used internally to represent all possible kinds of messages. Responses and
// Messages are transformed into these.
export type Record = {
  kind: MessageKind;
  text: string;
  level: Level;
  source: string;
  scopeName: ?string;
};

export type AppState = {
  currentExecutorId: ?string;
  executors: Map<string, Executor>;
  maxMessageCount: number;
  records: Array<Record>;
  providers: Map<string, OutputProvider>;
  providerSubscriptions: Map<string, IDisposable>;
};

export type OutputProvider = {
  messages: Rx.Observable<Message>;

  // The source can't be part of the message because we want to be able to populate a filter menu
  // before we even have any messages.
  source: string;
};

export type RecordProvider = {
  records: Rx.Observable<Record>;
  source: string;
};

export type Executor = {
  id: string;
  name: string;
  execute(code: string): void;
  output: Rx.Observable<Response>;
  scopeName?: string;
};

export type RegisterExecutorFunction = (executor: Executor) => IDisposable;
