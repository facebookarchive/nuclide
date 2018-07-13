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

/*
 * WARNING: This package is still experimental and in early development. Use it at your own risk.
 */

import type {
  AvailableRefactoring,
  FreeformRefactoring,
  FreeformRefactoringArgument,
  RefactorResponse,
  RenameRefactoring,
} from './rpc-types';
import type {TextEdit} from 'nuclide-commons-atom/text-edit';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Store} from './types';

import invariant from 'assert';

import {Observable} from 'rxjs';
import {getLogger} from 'log4js';
import ProviderRegistry from 'nuclide-commons-atom/ProviderRegistry';
import createPackage from 'nuclide-commons-atom/createPackage';
import observeGrammarForTextEditors from 'nuclide-commons-atom/observe-grammar-for-text-editors';
import {bufferPositionForMouseEvent} from 'nuclide-commons-atom/mouse-to-position';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import ContextMenu from 'nuclide-commons-atom/ContextMenu';

import * as Actions from './refactorActions';
import {getStore} from './refactorStore';
import {initRefactorUIs} from './refactorUIs';

export type {
  AvailableRefactoring,
  FreeformRefactoring,
  FreeformRefactoringArgument,
  RefactorResponse,
  RenameRefactoring,
};

export type RenameRefactorKind = 'rename';
export type FreeformRefactorKind = 'freeform';
export type InlineRenameRefactorKind = 'inline-rename';

export type RefactorKind = RenameRefactorKind | FreeformRefactorKind;

export type InlineRenameRequest = {
  kind: InlineRenameRefactorKind,
  newName: string,
  editor: TextEditor,
  position: atom$Point,
};

export type RenameRequest = {
  kind: RenameRefactorKind,
  editor: atom$TextEditor,
  originalPoint: atom$Point,
  symbolAtPoint: {
    text: string,
    range: atom$Range,
  },
  newName: string,
};

export type FreeformRefactorRequest = {|
  kind: FreeformRefactorKind,
  editor: atom$TextEditor,
  originalRange: atom$Range,
  // Echoes FreeformRefactoring.id.
  id: string,
  // Echoes FreeformRefactoring.range.
  range: atom$Range,
  // Arguments provided by the user.
  arguments: Map<string, mixed>,
|};

export type RefactorRequest =
  | InlineRenameRequest
  | RenameRequest
  | FreeformRefactorRequest;

export type RefactorProvider = {
  priority: number,
  grammarScopes: Array<string>,

  refactorings?: (
    editor: atom$TextEditor,
    range: atom$Range,
  ) => Promise<Array<AvailableRefactoring>>,

  // Providers may stream back progress responses.
  // Note that the stream will terminate once an edit response is received.
  // If no edit response is received, an error will be raised.
  refactor?: (request: RefactorRequest) => Observable<RefactorResponse>,

  // This method is linked to LSP in the LSP version of RefactorProvider
  // Obtains a mapping of document paths to their text edits.
  //  Each text edit is a rename of the same subject
  rename?: (
    editor: TextEditor,
    position: atom$Point,
    newName: string,
  ) => Promise<?Map<NuclideUri, Array<TextEdit>>>,
};

const CONTEXT_MENU_CLASS = 'enable-nuclide-refactorizer';

class Activation {
  _disposables: UniversalDisposable;
  _store: Store;
  _providerRegistry: ProviderRegistry<RefactorProvider>;

  constructor() {
    this._providerRegistry = new ProviderRegistry();

    this._store = getStore(this._providerRegistry);

    let lastMouseEvent = null;
    this._disposables = new UniversalDisposable(
      initRefactorUIs(this._store),
      atom.commands.add(
        'atom-workspace',
        'nuclide-refactorizer:refactorize',
        () => {
          this._store.dispatch(Actions.open('generic'));
        },
      ),
      atom.commands.add(
        'atom-text-editor',
        // We don't actually want people calling this directly.
        // eslint-disable-next-line nuclide-internal/atom-commands
        'nuclide-refactorizer:refactorize-from-context-menu',
        () => {
          const mouseEvent = lastMouseEvent;
          lastMouseEvent = null;
          invariant(
            mouseEvent != null,
            'No mouse event found. Do not invoke this command directly. ' +
              'If you did use the context menu, please report this issue.',
          );
          const editor = atom.workspace.getActiveTextEditor();
          invariant(editor != null);
          const bufferPosition = bufferPositionForMouseEvent(
            mouseEvent,
            editor,
          );
          // If the user selected some text and clicked within it,
          // we'll treat it as a 'range refactor'.
          const currentSelection = editor.getSelectedBufferRange();
          if (!currentSelection.containsPoint(bufferPosition)) {
            editor.setCursorBufferPosition(bufferPosition);
          }

          this._store.dispatch(Actions.open('generic'));
        },
      ),
      atom.contextMenu.add({
        'atom-text-editor:not(.mini).enable-nuclide-refactorizer': [
          {
            label: 'Refactor',
            command: 'nuclide-refactorizer:refactorize-from-context-menu',
            created: event => {
              lastMouseEvent = event;
            },
          },
        ],
      }),
      atom.commands.add('atom-workspace', 'nuclide-refactorizer:rename', () => {
        this._store.dispatch(Actions.open('rename'));
      }),
      atom.commands.add(
        'atom-text-editor',
        'nuclide-refactorizer:inline-rename',
        event => {
          const editor = atom.workspace.getActiveTextEditor();
          if (!editor) {
            return null;
          }
          const mouseEvent = ContextMenu.isEventFromContextMenu(event)
            ? lastMouseEvent
            : null;

          const position =
            mouseEvent != null
              ? bufferPositionForMouseEvent(mouseEvent, editor)
              : editor.getCursorBufferPosition();

          editor.setCursorBufferPosition(position);
          editor.selectWordsContainingCursors();
          const selectedText = editor.getSelectedText();
          const mountPosition = editor.getSelectedBufferRange().start;

          const provider = Array.from(
            this._providerRegistry.getAllProvidersForEditor(editor),
          ).find(p => p.rename != null);

          if (provider == null) {
            getLogger('rename').error('Rename Provider Not Found');
            return null;
          }

          this._store.dispatch(
            Actions.displayInlineRename(
              editor,
              provider,
              selectedText,
              mountPosition,
              position,
            ),
          );
        },
      ),
      atom.contextMenu.add({
        'atom-text-editor': [
          {
            label: 'Rename',
            command: 'nuclide-refactorizer:inline-rename',
            created: event => {
              lastMouseEvent = event;
            },
          },
        ],
      }),
      observeGrammarForTextEditors(editor =>
        this._addContextMenuIfEligible(editor),
      ),
    );
  }

  dispose() {
    this._disposables.dispose();
  }

  _addContextMenuIfEligible(editor: atom$TextEditor): void {
    const element = atom.views.getView(editor);
    if (this._providerRegistry.getProviderForEditor(editor) != null) {
      element.classList.add(CONTEXT_MENU_CLASS);
    } else {
      element.classList.remove(CONTEXT_MENU_CLASS);
    }
  }

  _checkAllEditorContextMenus(): void {
    atom.workspace
      .getTextEditors()
      .forEach(editor => this._addContextMenuIfEligible(editor));
  }

  consumeRefactorProvider(provider: RefactorProvider): IDisposable {
    this._providerRegistry.addProvider(provider);
    this._checkAllEditorContextMenus();
    return new UniversalDisposable(() => {
      this._providerRegistry.removeProvider(provider);
      this._checkAllEditorContextMenus();
    });
  }
}

createPackage(module.exports, Activation);
