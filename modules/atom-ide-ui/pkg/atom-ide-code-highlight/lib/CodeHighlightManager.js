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

import type {CodeHighlightProvider} from './types';

import debounce from 'nuclide-commons/debounce';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import ProviderRegistry from 'nuclide-commons-atom/ProviderRegistry';
import {observeTextEditors} from 'nuclide-commons-atom/text-editor';

const HIGHLIGHT_DELAY_MS = 250;

export default class CodeHighlightManager {
  _subscriptions: UniversalDisposable;
  _providers: ProviderRegistry<CodeHighlightProvider>;
  _markers: Array<atom$Marker>;

  constructor() {
    this._providers = new ProviderRegistry();
    this._markers = [];
    this._subscriptions = new UniversalDisposable();
    const debouncedCallback = debounce(
      this._onCursorMove.bind(this),
      HIGHLIGHT_DELAY_MS,
      false,
    );
    this._subscriptions.add(
      observeTextEditors(editor => {
        const editorSubscriptions = new UniversalDisposable();
        editorSubscriptions.add(
          editor.onDidChangeCursorPosition(event => {
            debouncedCallback(editor, event.newBufferPosition);
          }),
        );
        editorSubscriptions.add(
          editor.onDidChange(event => {
            this._destroyMarkers();
            debouncedCallback(editor, editor.getCursorBufferPosition());
          }),
        );
        editorSubscriptions.add(
          editor.onDidDestroy(() => {
            editorSubscriptions.dispose();
            this._subscriptions.remove(editorSubscriptions);
          }),
        );
        this._subscriptions.add(editorSubscriptions);
      }),
    );
  }

  async _onCursorMove(
    editor: atom$TextEditor,
    position: atom$Point,
  ): Promise<void> {
    if (editor.isDestroyed() || this._isPositionInHighlightedRanges(position)) {
      return;
    }

    // The cursor is outside the old markers, so they are now stale
    this._destroyMarkers();

    const originalChangeCount = editor.getBuffer().changeCount;
    const highlightedRanges = await this._getHighlightedRanges(
      editor,
      position,
    );
    if (highlightedRanges == null) {
      return;
    }

    // If the cursor has moved, or the file was edited
    // the highlighted ranges we just computed are useless, so abort
    if (this._hasEditorChanged(editor, position, originalChangeCount)) {
      return;
    }

    this._markers = highlightedRanges.map(range =>
      editor.markBufferRange(range, {}),
    );
    this._markers.forEach(marker => {
      editor.decorateMarker(marker, {
        type: 'highlight',
        class: 'atom-ide-code-highlight-marker',
      });
    });
  }

  async _getHighlightedRanges(
    editor: atom$TextEditor,
    position: atom$Point,
  ): Promise<?Array<atom$Range>> {
    const provider = this._providers.getProviderForEditor(editor);
    if (!provider) {
      return null;
    }

    return provider.highlight(editor, position);
  }

  _hasEditorChanged(
    editor: atom$TextEditor,
    position: atom$Point,
    originalChangeCount: number,
  ): boolean {
    return (
      !editor.getCursorBufferPosition().isEqual(position) ||
      editor.getBuffer().changeCount !== originalChangeCount
    );
  }

  _isPositionInHighlightedRanges(position: atom$Point): boolean {
    return this._markers
      .map(marker => marker.getBufferRange())
      .some(range => range.containsPoint(position));
  }

  _destroyMarkers(): void {
    this._markers.splice(0).forEach(marker => marker.destroy());
  }

  addProvider(provider: CodeHighlightProvider): IDisposable {
    return this._providers.addProvider(provider);
  }

  dispose() {
    this._subscriptions.dispose();
    this._markers = [];
  }
}
