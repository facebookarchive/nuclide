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
import type {RefactorAction, RefactorState} from './types';
import type {RefactorProvider} from '..';

import invariant from 'assert';
import {Observable} from 'rxjs';

import applyTextEdits from '../../nuclide-textedit';

export function getEpics(
  providers: ProviderRegistry<RefactorProvider>,
): Array<Epic<RefactorAction, RefactorState>> {
  return [
    function getRefactorings(
      actions: ActionsObservable<RefactorAction>,
    ): Observable<RefactorAction> {
      // TODO cancel if another action comes along
      return actions
        .ofType('open')
        .switchMap(async () => {
          const editor = atom.workspace.getActiveTextEditor();
          if (editor == null) {
            return {
              type: 'got-refactorings',
              error: true,
            };
          }
          const cursor = editor.getLastCursor();
          const provider = providers.getProviderForEditor(editor);
          if (provider == null) {
            return {
              type: 'got-refactorings',
              error: true,
            };
          }
          const availableRefactorings =
            await provider.refactoringsAtPoint(editor, cursor.getBufferPosition());
          return {
            type: 'got-refactorings',
            payload: {
              editor,
              provider,
              availableRefactorings,
            },
          };
        });
    },

    function executeRefactoring(
      actions: ActionsObservable<RefactorAction>,
    ): Observable<RefactorAction> {
      return actions
        .ofType('execute')
        .switchMap(async action => {
          // Flow doesn't understand the implications of ofType :(
          invariant(action.type === 'execute');
          const {refactoring, provider} = action.payload;
          const response = await provider.refactor(refactoring);
          invariant(response != null);
          const editor = atom.workspace.getActiveTextEditor();
          invariant(editor != null);
          const path = editor.getPath();
          invariant(path != null);
          // TODO also apply edits to other files
          const fileEdits = response.edits.get(path);
          invariant(fileEdits != null);
          applyTextEdits(path, ...fileEdits);
          return {
            type: 'close',
          };
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
          return {
            type: 'close',
          };
        });
    },
  ];
}
