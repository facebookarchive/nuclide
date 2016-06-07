'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type Rx from 'rxjs';
import type {EvaluationResult, ExpansionResult} from '../../nuclide-debugger-atom/lib/Bridge';

export type Level = 'info' | 'log' | 'warning' | 'error' | 'debug' | Color;
type Color = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'violet';

type MessageKind = 'message' | 'request' | 'response';

// A regular message, emitted by output providers.
export type Message = {
  text: string;
  level: Level;
};

// A normalized type used internally to represent all possible kinds of messages. Responses and
// Messages are transformed into these.
export type Record = Message & {
  kind: MessageKind;
  sourceId: string;
  scopeName: ?string;
  result: ?EvaluationResult;
};

export type AppState = {
  currentExecutorId: ?string;
  executors: Map<string, Executor>;
  maxMessageCount: number;
  records: Array<Record>;
  providers: Map<string, OutputProvider>;
  providerSubscriptions: Map<string, rx$ISubscription>;
};

export type OutputProvider = {
  messages: Rx.Observable<Message>;

  // The source can't be part of the message because we want to be able to populate a filter menu
  // before we even have any messages.
  id: string;
};

export type RecordProvider = {
  records: Rx.Observable<Record>;
  id: string;
};

export type OutputService = {
  registerOutputProvider(outputProvider: OutputProvider): IDisposable;
};

export type Executor = {
  id: string;
  name: string;
  send(message: string): void;
  output: Rx.Observable<Message> | Rx.Observable<{result: EvaluationResult}>;
  scopeName?: string;
  getProperties?: (objectId: string) => Rx.Observable<?ExpansionResult>;
  renderValue?: ReactClass;
};

export type RegisterExecutorFunction = (executor: Executor) => IDisposable;
