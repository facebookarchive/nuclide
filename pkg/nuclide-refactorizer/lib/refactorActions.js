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
  AvailableRefactoring,
  RefactorRequest,
  RefactorProvider,
} from '..';

import type {
  OpenAction,
  GotRefactoringsAction,
  GotRefactoringsErrorAction,
  CloseAction,
  PickedRefactorAction,
  ExecuteAction,
} from './types';

export function open(): OpenAction {
  return {
    type: 'open',
  };
}

export function gotRefactorings(
  editor: atom$TextEditor,
  provider: RefactorProvider,
  availableRefactorings: Array<AvailableRefactoring>,
): GotRefactoringsAction {
  return {
    type: 'got-refactorings',
    payload: {
      editor,
      provider,
      availableRefactorings,
    },
  };
}

export function gotRefactoringsError(): GotRefactoringsErrorAction {
  return {
    type: 'got-refactorings',
    error: true,
  };
}

export function pickedRefactor(refactoring: AvailableRefactoring): PickedRefactorAction {
  return {
    type: 'picked-refactor',
    payload: {
      refactoring,
    },
  };
}

export function execute(
  provider: RefactorProvider,
  refactoring: RefactorRequest,
): ExecuteAction {
  return {
    type: 'execute',
    payload: {
      provider,
      refactoring,
    },
  };
}

export function close(): CloseAction {
  return {
    type: 'close',
  };
}
