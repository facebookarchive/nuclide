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

import type {AppState, Action, Store} from './types';

import {createStore as _createStore} from 'redux';

export default function createStore(initialState: AppState): Store {
  return _createStore(reducer, initialState);
}

function reducer(state: AppState, action: Action) {
  state.dispatch(action);
  return state;
}
