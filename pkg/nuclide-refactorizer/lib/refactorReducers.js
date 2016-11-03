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
  RefactorState,
  RefactorAction,
  OpenAction,
  PickedRefactorAction,
  GotRefactoringsAction,
  ExecuteAction,
} from './types';

import invariant from 'assert';

export default function refactorReducers(
  state_: ?RefactorState,
  action: RefactorAction,
): RefactorState {
  let state = state_;
  if (state == null) {
    state = {type: 'closed'};
  }

  if (action.error) {
    // We handle errors in epics, display an appropriate message, and then send an ordinary action
    // to update the state appropriately.
    return state;
  }

  switch (action.type) {
    case 'open':
      return open(state, action);
    case 'got-refactorings':
      return gotRefactorings(state, action);
    case 'close':
      return close(state);
    case 'picked-refactor':
      return pickedRefactor(state, action);
    case 'execute':
      return executeRefactor(state, action);
    default:
      return state;
  }
}

function open(state: RefactorState, action: OpenAction): RefactorState {
  invariant(state.type === 'closed');

  return {
    type: 'open',
    ui: action.ui,
    phase: {
      type: 'get-refactorings',
    },
  };
}

function gotRefactorings(state: RefactorState, action: GotRefactoringsAction): RefactorState {
  invariant(state.type === 'open');
  invariant(state.phase.type === 'get-refactorings');

  const {editor, originalPoint} = action.payload;

  return {
    type: 'open',
    ui: state.ui,
    phase: {
      type: 'pick',
      provider: action.payload.provider,
      editor,
      originalPoint,
      availableRefactorings: action.payload.availableRefactorings,
    },
  };
}

function close(state: RefactorState): RefactorState {
  invariant(state.type === 'open');
  return {
    type: 'closed',
  };
}

function pickedRefactor(state: RefactorState, action: PickedRefactorAction): RefactorState {
  invariant(state.type === 'open');
  invariant(state.phase.type === 'pick');

  const refactoring = action.payload.refactoring;
  const {editor, originalPoint} = state.phase;
  return {
    type: 'open',
    ui: state.ui,
    phase: {
      type: 'rename',
      provider: state.phase.provider,
      originalPoint,
      symbolAtPoint: refactoring.symbolAtPoint,
      editor,
    },
  };
}

function executeRefactor(state: RefactorState, action: ExecuteAction): RefactorState {
  invariant(state.type === 'open');
  return {
    type: 'open',
    ui: state.ui,
    phase: {
      type: 'execute',
    },
  };
}
