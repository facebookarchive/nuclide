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

import type {
  ActionsObservable,
  Epic,
} from '../../commons-node/redux-observable';
import type ProviderRegistry from 'nuclide-commons-atom/ProviderRegistry';
import {getFileForPath} from 'nuclide-commons-atom/projects';
import type {
  ApplyAction,
  RefactorAction,
  RefactorState,
  ExecuteAction,
} from './types';
import type {RefactorProvider} from '..';

import invariant from 'assert';
import {Observable} from 'rxjs';

import {existingEditorForUri} from 'nuclide-commons-atom/text-editor';
import {track} from '../../nuclide-analytics';
import {getLogger} from '../../nuclide-logging';
import {applyTextEditsToBuffer} from '../../nuclide-textedit';

import * as Actions from './refactorActions';

export function getEpics(
  providers: ProviderRegistry<RefactorProvider>,
): Array<Epic<RefactorAction, RefactorState, void>> {
  return [
    function getRefactoringsEpic(
      actions: ActionsObservable<RefactorAction>,
    ): Observable<RefactorAction> {
      return actions.ofType('open').switchMap(() => {
        return Observable.fromPromise(getRefactorings(providers)).takeUntil(
          actions,
        );
      });
    },

    function executeRefactoringEpic(
      actions: ActionsObservable<RefactorAction>,
    ): Observable<RefactorAction> {
      return actions.ofType('execute').switchMap(action => {
        // Flow doesn't understand the implications of ofType :(
        invariant(action.type === 'execute');
        return Observable.fromPromise(executeRefactoring(action)).takeUntil(
          actions,
        );
      });
    },

    function applyRefactoringEpic(
      actions: ActionsObservable<RefactorAction>,
    ): Observable<RefactorAction> {
      return actions.ofType('apply').switchMap(action => {
        invariant(action.type === 'apply');
        return applyRefactoring(action).takeUntil(actions.ofType('close'));
      });
    },

    function handleErrors(
      actions: ActionsObservable<RefactorAction>,
    ): Observable<RefactorAction> {
      return actions.ofType('error').map(action => {
        invariant(action.type === 'error');
        const {source, error} = action.payload;
        const sourceName = source === 'got-refactorings'
          ? 'getting refactors'
          : 'executing refactor';
        getLogger().error(`Error ${sourceName}:`, error);
        atom.notifications.addError(`Error ${sourceName}`, {
          detail: error.stack,
          dismissable: true,
        });
        return Actions.close();
      });
    },
  ];
}

async function getRefactorings(
  providers: ProviderRegistry<RefactorProvider>,
): Promise<RefactorAction> {
  track('nuclide-refactorizer:get-refactorings');
  const editor = atom.workspace.getActiveTextEditor();
  if (editor == null || editor.getPath() == null) {
    return Actions.error(
      'get-refactorings',
      Error('Must be run from a saved file.'),
    );
  }
  const cursor = editor.getLastCursor();
  const provider = providers.getProviderForEditor(editor);
  if (provider == null) {
    return Actions.error('get-refactorings', Error('No providers found.'));
  }
  try {
    const cursorPosition = cursor.getBufferPosition();
    const availableRefactorings = await provider.refactoringsAtPoint(
      editor,
      cursorPosition,
    );
    return Actions.gotRefactorings(
      editor,
      cursorPosition,
      provider,
      availableRefactorings,
    );
  } catch (e) {
    return Actions.error('get-refactorings', e);
  }
}

async function executeRefactoring(
  action: ExecuteAction,
): Promise<RefactorAction> {
  const {refactoring, provider} = action.payload;
  let response;
  try {
    response = await provider.refactor(refactoring);
  } catch (e) {
    return Actions.error('execute', e);
  }
  if (response == null) {
    // TODO use an error action here
    return Actions.close();
  }
  if (response.edits.size <= 1) {
    return Actions.apply(response);
  }
  return Actions.confirm(response);
}

const FILE_IO_CONCURRENCY = 4;

export function applyRefactoring(
  action: ApplyAction,
): Observable<RefactorAction> {
  return Observable.defer(() => {
    const {response} = action.payload;
    let editStream = Observable.empty();
    if (response.type === 'edit') {
      // Regular edits are applied directly to open buffers.
      // Note that all files must actually be open.
      for (const [path, edits] of response.edits) {
        const editor = existingEditorForUri(path);
        if (editor != null) {
          applyTextEditsToBuffer(editor.getBuffer(), edits);
        } else {
          return Observable.of(
            Actions.error(
              'execute',
              Error(`Expected file ${path} to be open.`),
            ),
          );
        }
      }
    } else {
      // External edits are applied directly to disk.
      editStream = Observable.from(response.edits)
        .mergeMap(async ([path, edits]) => {
          const file = getFileForPath(path);
          if (file == null) {
            throw new Error(`Could not read file ${path}`);
          }
          let data = await file.read();
          edits.sort((a, b) => a.startOffset - b.startOffset);
          edits.reverse().forEach(edit => {
            if (edit.oldText != null) {
              const oldText = data.substring(edit.startOffset, edit.endOffset);
              if (oldText !== edit.oldText) {
                throw new Error(
                  `Cannot apply refactor: file contents of ${path} have changed!`,
                );
              }
            }
            data =
              data.slice(0, edit.startOffset) +
              edit.newText +
              data.slice(edit.endOffset);
          });
          await file.write(data);
        }, FILE_IO_CONCURRENCY)
        .ignoreElements();
    }
    return Observable.concat(
      editStream,
      Observable.of(Actions.close()).do(() =>
        track('nuclide-refactorizer:success'),
      ),
    );
  });
}
