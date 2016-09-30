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
  RefactorProvider,
} from '..';

import type {Store} from './types';

import {createStore, applyMiddleware} from 'redux';

import type ProviderRegistry from '../../commons-atom/ProviderRegistry';
import {createEpicMiddleware, combineEpics} from '../../commons-node/redux-observable';

import refactorReducers from './refactorReducers';
import {getEpics} from './refactorEpics';

export function getStore(
  providers: ProviderRegistry<RefactorProvider>,
): Store {
  return createStore(
    refactorReducers,
    applyMiddleware(createEpicMiddleware(combineEpics(...getEpics(providers)))),
  );
}
