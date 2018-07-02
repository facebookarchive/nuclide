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
import type {TextEdit} from 'nuclide-commons-atom/text-edit';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {RenameProvider} from './types';

import {Range} from 'atom';
import ReactMountRootElement from 'nuclide-commons-ui/ReactMountRootElement';
import ReactDOM from 'react-dom';
import * as React from 'react';
import {getLogger} from 'log4js';
import ContextMenu from 'nuclide-commons-atom/ContextMenu';
import {bufferPositionForMouseEvent} from 'nuclide-commons-atom/mouse-to-position';
import ProviderRegistry from 'nuclide-commons-atom/ProviderRegistry';
import {asyncFind} from 'nuclide-commons/promise';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import createPackage from 'nuclide-commons-atom/createPackage';
import {applyTextEditsForMultipleFiles} from 'nuclide-commons-atom/text-edit';
import {Observable} from 'rxjs';
import RenameComponent from './RenameComponent';

class Activation {
  _providers: ProviderRegistry<RenameProvider>;
  _subscriptions: UniversalDisposable;
  lastMouseEvent: MouseEvent;

  constructor() {
    this._providers = new ProviderRegistry();
    this._subscriptions = new UniversalDisposable();
    this._subscriptions.add(this.registerOpenerAndCommand());
  }

  dispose(): void {
    this._subscriptions.dispose();
  }

  consumeRenameProvider(provider: RenameProvider): IDisposable {
    const disposable = this._providers.addProvider(provider);
    this._subscriptions.add(disposable);
    // $FlowFixMe
    return () => {
      disposable.dispose();
      this._subscriptions.remove(disposable);
    };
  }

  registerOpenerAndCommand(): IDisposable {
    return new UniversalDisposable(
      atom.commands.add('atom-text-editor', 'rename:activate', async event => {
        const editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
          return null;
        }

        await this._doRename(
          this._getProviderData(
            editor,
            ContextMenu.isEventFromContextMenu(event)
              ? this.lastMouseEvent
              : null,
          ),
        );
      }),
      atom.contextMenu.add({
        'atom-text-editor': [
          {
            label: 'Rename',
            command: 'rename:activate',
            created: event => {
              this.lastMouseEvent = event;
            },
          },
        ],
      }),
    );
  }

  renderRenameInput(
    editor: atom$TextEditor,
    selectedText: string,
    resolveNewName: (string | void) => void,
  ): React.Element<$FlowFixMe> {
    return (
      <RenameComponent
        selectedText={selectedText}
        submitNewName={resolveNewName}
      />
    );
  }

  mountRenameInput(
    editor: atom$TextEditor,
    mountPosition: atom$Point,
    container: ReactMountRootElement,
    element: React.Element<$FlowFixMe>,
  ): IDisposable {
    const overlayMarker = editor.markBufferRange(
      new Range(mountPosition, mountPosition),
      {
        invalidate: 'never',
      },
    );

    editor.decorateMarker(overlayMarker, {
      type: 'overlay',
      position: 'tail',
      item: container,
    });

    return new UniversalDisposable(
      () => overlayMarker.destroy(),
      () => ReactDOM.unmountComponentAtNode(container),

      // The editor may not mount the marker until the next update.
      // It's not safe to render anything until that point, as overlayed containers
      // often need to measure their size in the DOM.
      Observable.from(editor.getElement().getNextUpdatePromise()).subscribe(
        () => {
          container.style.display = 'block';
          ReactDOM.render(element, container);
        },
      ),
    );
  }

  async _getUserInput(
    position: atom$Point,
    editor: atom$TextEditor,
  ): Promise<?string> {
    // TODO: Should only be instantiated once.
    //       However, the node has trouble rendering at the correct position
    //       when it is instantiated once in the constructor and re-mounted
    const container = new ReactMountRootElement();
    container.className = 'rename-container';

    let disposable = null;

    const newName = await new Promise((resolve, reject) => {
      editor.setCursorBufferPosition(position);
      editor.selectWordsContainingCursors();
      const selectedText = editor.getSelectedText();
      const startOfWord = editor.getSelectedBufferRange().start;

      const renameElement = this.renderRenameInput(
        editor,
        selectedText,
        resolve,
      );

      disposable = this.mountRenameInput(
        editor,
        startOfWord,
        container,
        renameElement,
      );

      atom.commands.add(container, 'core:cancel', () => {
        resolve();
      });
    });

    if (disposable != null) {
      disposable.dispose();
    }
    return newName;
  }

  async _getProviderData(
    editor: atom$TextEditor,
    event: ?MouseEvent,
  ): Promise<?Map<NuclideUri, Array<TextEdit>>> {
    // Currently, when the UI is rendered, it pushes the cursor to the very end of the word.
    // However, the end position of the word does not count as a valid renaming position.
    //  Thus, if the keyboard shortcut is being used, the position of the cursor
    //    must be obtained BEFORE rendering the UI.
    const position =
      event != null
        ? bufferPositionForMouseEvent(event, editor)
        : editor.getCursorBufferPosition();

    const newName = await this._getUserInput(position, editor);
    if (newName == null) {
      return null;
    }

    const providers = this._providers.getAllProvidersForEditor(editor);
    const resultPromise = asyncFind(
      Array.from(providers).map(provider =>
        provider.rename(editor, position, newName).catch(err => {
          getLogger('rename').error('Error renaming', err);
          return new Map();
        }),
      ),
      x => x,
    );

    return resultPromise;
  }

  async _doRename(
    changes: Promise<?Map<NuclideUri, Array<TextEdit>>>,
  ): Promise<boolean> {
    const renameChanges = await changes;
    if (!renameChanges) {
      return false;
    }
    return applyTextEditsForMultipleFiles(renameChanges);
  }
}

createPackage(module.exports, Activation);
