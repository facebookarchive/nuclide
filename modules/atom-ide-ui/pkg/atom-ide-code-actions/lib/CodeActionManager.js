/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import {observeActiveEditorsDebounced} from 'nuclide-commons-atom/debounced';
import ProviderRegistry from 'nuclide-commons-atom/ProviderRegistry';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {arrayFlatten} from 'nuclide-commons/collection';
import {Observable} from 'rxjs';

import type {
  RegisterIndieLinter,
  IndieLinterDelegate,
  LinterMessageV2,
} from '../../../index';
import type {DiagnosticMessage} from '../../atom-ide-diagnostics/lib/types';
import type {CodeAction, CodeActionProvider, CodeActionFetcher} from './types';

const TIP_DELAY_MS = 500;

async function actionsToMessage(
  location: {file: string, position: atom$RangeLike},
  actions: Array<CodeAction>,
): Promise<LinterMessageV2> {
  const titles = await Promise.all(actions.map(r => r.getTitle()));
  const solutions = titles.map((title, i) => ({
    title,
    position: location.position,
    apply: actions[i].apply.bind(actions[i]),
  }));
  return {
    location,
    solutions,
    excerpt: 'Select an action',
    severity: 'info',
    kind: 'action',
  };
}

export class CodeActionManager {
  _providerRegistry: ProviderRegistry<CodeActionProvider>;
  _disposables: UniversalDisposable;
  _linterDelegate: ?IndieLinterDelegate;

  constructor() {
    this._providerRegistry = new ProviderRegistry();
    this._disposables = new UniversalDisposable(this._selectionSubscriber());
  }

  dispose() {
    this._disposables.dispose();
  }

  addProvider(provider: CodeActionProvider): IDisposable {
    const disposable = this._providerRegistry.addProvider(provider);
    this._disposables.add(disposable);
    return disposable;
  }

  consumeIndie(register: RegisterIndieLinter): IDisposable {
    const linterDelegate = register({name: 'Code Actions'});
    this._disposables.add(linterDelegate);
    this._linterDelegate = linterDelegate;
    return new UniversalDisposable(() => {
      this._disposables.remove(linterDelegate);
      this._linterDelegate = null;
    });
  }

  async _genAllCodeActions(
    editor: atom$TextEditor,
    range: atom$Range,
    diagnostics: Array<DiagnosticMessage>,
  ): Promise<Array<CodeAction>> {
    const codeActionRequests = [];
    for (const provider of this._providerRegistry.getAllProvidersForEditor(
      editor,
    )) {
      codeActionRequests.push(
        provider.getCodeActions(editor, range, diagnostics),
      );
    }
    return arrayFlatten(await Promise.all(codeActionRequests));
  }

  createCodeActionFetcher(): CodeActionFetcher {
    return {
      getCodeActionForDiagnostic: (diagnostic, editor) => {
        if (diagnostic.range) {
          const {range} = diagnostic;
          return this._genAllCodeActions(editor, range, [diagnostic]);
        }
        return Promise.resolve([]);
      },
    };
  }

  // Listen to buffer range selection changes and trigger code action providers
  // when ranges change.
  _selectionSubscriber(): rxjs$Subscription {
    // Patterned after highlightEditors of CodeHighlightManager.
    return observeActiveEditorsDebounced(0)
      .switchMap(
        // Get selections for the active editor.
        editor => {
          if (editor == null) {
            return Observable.empty();
          }
          const destroyEvents = observableFromSubscribeFunction(
            editor.onDidDestroy.bind(editor),
          );
          const selections = observableFromSubscribeFunction(
            editor.onDidChangeSelectionRange.bind(editor),
          )
            .switchMap(
              event =>
                Observable.of(event.newBufferRange)
                  .delay(TIP_DELAY_MS) // Delay the emission of the range.
                  .startWith(null), // null the range immediately when selection changes.
            )
            .distinctUntilChanged()
            // Remove 0-character selections since it's just cursor movement.
            .filter(range => range == null || !range.isEmpty())
            .takeUntil(destroyEvents);
          return selections.map(
            range => (range == null ? null : {editor, range}),
          );
        },
      )
      .switchMap(
        // Get a message for the provided selection.
        (selection: ?{editor: atom$TextEditor, range: atom$Range}) => {
          if (selection == null) {
            return Observable.of(null);
          }
          const {editor, range} = selection;
          const file = editor.getBuffer().getPath();
          if (file == null) {
            return Observable.empty();
          }
          return Observable.fromPromise(
            this._genAllCodeActions(editor, range, []),
          ).switchMap(actions => {
            // Only produce a message if we have actions to display.
            if (actions.length > 0) {
              return actionsToMessage({file, position: range}, actions);
            } else {
              return Observable.empty();
            }
          });
        },
      )
      .distinctUntilChanged()
      .subscribe(message => {
        if (this._linterDelegate == null) {
          return;
        }
        if (message == null) {
          this._linterDelegate.clearMessages();
        } else {
          this._linterDelegate.setAllMessages([message]);
        }
      });
  }
}
