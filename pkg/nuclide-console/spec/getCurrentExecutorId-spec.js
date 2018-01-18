/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import getCurrentExecutorId from '../lib/getCurrentExecutorId';
import * as Immutable from 'immutable';
import {createDummyExecutor} from './Reducers-spec';

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
