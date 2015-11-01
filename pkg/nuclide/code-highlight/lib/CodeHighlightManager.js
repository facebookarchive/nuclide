'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import type {CodeHighlightProvider} from './types';
import {CompositeDisposable} from 'atom';
import {debounce} from 'nuclide-commons';

const HIGHLIGHT_DELAY_MS = 250;

export default class CodeHighlightManager {
  _subscriptions: ?CompositeDisposable;
  _providers: Array<CodeHighlightProvider>;
  _markers: Array<atom$Marker>;

  constructor() {
    this._providers = [];
    this._markers = [];
    const subscriptions = this._subscriptions = new CompositeDisposable();
    const debouncedCallback = debounce(
      this._highlightInEditor.bind(this),
      HIGHLIGHT_DELAY_MS,
      false,
    );
    atom.workspace.observeTextEditors(editor => {
      subscriptions.add(editor.onDidChangeCursorPosition(event => {
        debouncedCallback(editor, event.newBufferPosition);
      }));
    });
  }

  async _highlightInEditor(editor: atom$TextEditor, position: atom$Point): Promise<void> {
    if (this._isPositionInHighlightedRanges(position)) {
      return;
    }

    const {scopeName} = editor.getGrammar();
    const [provider] = this._getMatchingProvidersForScopeName(scopeName);
    if (!provider) {
      return;
    }

    // Call out to hack to get highlighting ranges.  This can take some time
    const highlightedRanges = await provider.highlight(editor, position);

    // If the cursor has moved the highlighted ranges we just computed are useless, so abort
    if (this._hasCursorMoved(editor, position)) {
      return;
    }

    // Destroy old highlighted sections and highlight new ones
    this._destroyMarkers();
    this._markers = highlightedRanges.map(
      range => editor.markBufferRange(range, {})
    );
    this._markers.forEach(marker => {
      editor.decorateMarker(
        marker,
        {type: 'highlight', class: 'nuclide-code-highlight-marker'},
      );
    });
  }

  _hasCursorMoved(editor: atom$TextEditor, position: atom$Point): boolean {
    return !editor.getCursorBufferPosition().isEqual(position);
  }

  _isPositionInHighlightedRanges(position: atom$Point): boolean {
    return this._markers
      .map(marker => marker.getBufferRange())
      .some(range => range.containsPoint(position));
  }

  _getMatchingProvidersForScopeName(scopeName: string): Array<CodeHighlightProvider> {
    const matchingProviders = this._providers.filter(provider => {
      const providerGrammars = provider.selector.split(/, ?/);
      return provider.inclusionPriority > 0 && providerGrammars.indexOf(scopeName) !== -1;
    });
    return matchingProviders.sort((providerA, providerB) => {
      return providerB.inclusionPriority - providerA.inclusionPriority;
    });
  }

  _destroyMarkers(): void {
    this._markers.splice(0).forEach(marker => marker.destroy());
  }

  addProvider(provider: CodeHighlightProvider) {
    this._providers.push(provider);
  }

  dispose() {
    if (this._subscriptions) {
      this._subscriptions.dispose();
      this._subscriptions = null;
    }
    this._providers = [];
    this._markers = [];
  }
}
