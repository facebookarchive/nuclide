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

import type {AvailableRefactoring, RefactorRequest, RefactorProvider} from '..';

import type {
  ApplyAction,
  BackFromDiffPreviewAction,
  CloseAction,
  ConfirmAction,
  DisplayDiffPreviewAction,
  ErrorAction,
  ErrorSource,
  ExecuteAction,
  GotRefactoringsAction,
  OpenAction,
  Phase,
  ProgressAction,
  PickedRefactorAction,
  RefactorUI,
  LoadDiffPreviewAction,
  DisplayInlineRenameAction,
} from './types';

import type {RefactorEditResponse} from './rpc-types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

export function open(ui: RefactorUI): OpenAction {
  return {
    type: 'open',
    ui,
  };
}

export function gotRefactorings(
  editor: atom$TextEditor,
  originalRange: atom$Range,
  provider: RefactorProvider,
  availableRefactorings: Array<AvailableRefactoring>,
): GotRefactoringsAction {
  return {
    type: 'got-refactorings',
    payload: {
      editor,
      originalRange,
      provider,
      availableRefactorings,
    },
  };
}

export function error(source: ErrorSource, err: Error): ErrorAction {
  return {
    type: 'error',
    payload: {
      source,
      error: err,
    },
  };
}

export function backFromDiffPreview(phase: Phase): BackFromDiffPreviewAction {
  return {
    type: 'back-from-diff-preview',
    payload: {
      phase,
    },
  };
}

export function pickedRefactor(
  refactoring: AvailableRefactoring,
): PickedRefactorAction {
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

export function confirm(response: RefactorEditResponse): ConfirmAction {
  return {
    type: 'confirm',
    payload: {response},
  };
}

export function loadDiffPreview(
  previousPhase: Phase,
  uri: NuclideUri,
  response: RefactorEditResponse,
): LoadDiffPreviewAction {
  return {
    type: 'load-diff-preview',
    payload: {
      previousPhase,
      uri,
      response,
    },
  };
}

export function displayDiffPreview(
  diffs: Array<diffparser$FileDiff>,
): DisplayDiffPreviewAction {
  return {
    type: 'display-diff-preview',
    payload: {diffs},
  };
}

export function displayInlineRename(
  editor: TextEditor,
  provider: RefactorProvider,
  selectedText: string,
  mountPosition: atom$Point,
  symbolPosition: atom$Point,
): DisplayInlineRenameAction {
  return {
    type: 'display-inline-rename',
    payload: {
      editor,
      provider,
      selectedText,
      mountPosition,
      symbolPosition,
    },
  };
}

export function apply(response: RefactorEditResponse): ApplyAction {
  return {
    type: 'apply',
    payload: {response},
  };
}

export function progress(
  message: string,
  value: number,
  max: number,
): ProgressAction {
  return {
    type: 'progress',
    payload: {message, value, max},
  };
}

export function close(): CloseAction {
  return {
    type: 'close',
  };
}
