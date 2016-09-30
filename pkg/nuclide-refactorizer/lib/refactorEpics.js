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
          // TODO maybe include the editor in the open action, or just don't open if there isn't an
          // editor.
          invariant(editor != null);
          const cursor = editor.getLastCursor();
          const provider = providers.getProviderForEditor(editor);
          // TODO do something sane if there is no provider
          invariant(provider != null);
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
  ];
}
