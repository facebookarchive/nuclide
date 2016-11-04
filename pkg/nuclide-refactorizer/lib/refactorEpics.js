'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ActionsObservable, Epic} from '../../commons-node/redux-observable';
import type ProviderRegistry from '../../commons-atom/ProviderRegistry';
import type {
  RefactorAction,
  RefactorState,
  ExecuteAction,
} from './types';
import type {RefactorProvider} from '..';

import invariant from 'assert';
import {Observable} from 'rxjs';

import {track} from '../../nuclide-analytics';
import applyTextEdits from '../../nuclide-textedit';

import * as Actions from './refactorActions';

export function getEpics(
  providers: ProviderRegistry<RefactorProvider>,
): Array<Epic<RefactorAction, RefactorState>> {
  return [
    function getRefactoringsEpic(
      actions: ActionsObservable<RefactorAction>,
    ): Observable<RefactorAction> {
      return actions
        .ofType('open')
        .switchMap(() => {
          return Observable.fromPromise(getRefactorings(providers)).takeUntil(actions);
        });
    },

    function executeRefactoringEpic(
      actions: ActionsObservable<RefactorAction>,
    ): Observable<RefactorAction> {
      return actions
        .ofType('execute')
        .switchMap(action => {
          // Flow doesn't understand the implications of ofType :(
          invariant(action.type === 'execute');
          return Observable.fromPromise(executeRefactoring(action)).takeUntil(actions);
        });
    },

    function handleErrors(
      actions: ActionsObservable<RefactorAction>,
    ): Observable<RefactorAction> {
      return actions
        // This is weird but Flow won't accept `action.error` or even `Boolean(action.error)`
        .filter(action => (action.error ? true : false))
        // TODO provide some feedback to the user that an error has occurred
        .map(action => {
          invariant(action.error);
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
  if (editor == null) {
    return Actions.gotRefactoringsError();
  }
  if (editor.getPath() == null) {
    return Actions.gotRefactoringsError();
  }
  const cursor = editor.getLastCursor();
  const provider = providers.getProviderForEditor(editor);
  if (provider == null) {
    return Actions.gotRefactoringsError();
  }
  try {
    const cursorPosition = cursor.getBufferPosition();
    const availableRefactorings =
      await provider.refactoringsAtPoint(editor, cursorPosition);
    return Actions.gotRefactorings(editor, cursorPosition, provider, availableRefactorings);
  } catch (e) {
    return Actions.gotRefactoringsError();
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
    // TODO use an error action here
    return Actions.close();
  }
  if (response == null) {
    // TODO use an error action here
    return Actions.close();
  }
  const editor = atom.workspace.getActiveTextEditor();
  // TODO handle it if the editor has gone away
  invariant(editor != null);
  const path = editor.getPath();
  // TODO handle editors with no path
  invariant(path != null);
  // TODO also apply edits to other files
  const fileEdits = response.edits.get(path);
  invariant(fileEdits != null);
  // TODO check the return value to see if the edits were applied correctly. if not, display an
  // appropriate message.
  applyTextEdits(path, ...fileEdits);
  track('nuclide-refactorizer:success');
  return Actions.close();
}
