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

import {Observable} from 'rxjs';
import type {Executor} from '../lib/types';
import getCurrentExecutorId from '../lib/getCurrentExecutorId';
import * as Immutable from 'immutable';

export function createDummyExecutor(id: string): Executor {
  return {
    id,
    name: id,
    scopeName: 'text.plain',
    send: (code: string) => {},
    output: Observable.create(observer => {}),
  };
}

const baseAppState = {
  createPasteFunction: null,
  currentExecutorId: 'a',
  maxMessageCount: Number.POSITIVE_INFINITY,
  executors: new Map([['a', createDummyExecutor('a')]]),
  providers: new Map(),
  providerStatuses: new Map(),
  records: Immutable.List(),
  history: [],
};

describe('getCurrentExecutorId', () => {
  it('gets the current executor', () => {
    expect(getCurrentExecutorId(baseAppState)).toBe('a');
  });

  it('returns an executor even if the current id is null', () => {
    const appState = {
      ...baseAppState,
      currentExecutorId: null,
    };
    expect(getCurrentExecutorId(appState)).toBe('a');
  });
});
