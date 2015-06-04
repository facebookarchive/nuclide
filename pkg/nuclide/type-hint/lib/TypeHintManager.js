'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable, Disposable} = require('atom');

const TYPEHINT_DELAY_MS = 200;

type TypeHint = {
  hint: string;
  range: Range;
};

type TypeHintProvider = {
  typeHint(editor: TextEditor, bufferPosition: Point): Promise<TypeHint>;
};

class TypeHintManager {

  _typeHintProviders: Array<TypeHintProvider>;

  constructor() {
    this._subscriptions = new CompositeDisposable();
    // TODO(most): Replace with @jjiaa's mouseListenerForTextEditor introduced in D2005545.
    this._subscriptions.add(atom.workspace.observeTextEditors(editor => {
      var editorView = atom.views.getView(editor);
      var mouseMoveListener = (e) => this._delayedTypeHint(e, editor, editorView);
      editorView.addEventListener('mousemove', mouseMoveListener);
      var mouseListenerSubscription = new Disposable(() =>
          editorView.removeEventListener('mousemove', mouseMoveListener));
      var destroySubscription = editor.onDidDestroy(() => {
        this._clearTypeHintTimer();
        mouseListenerSubscription.dispose();
        this._subscriptions.remove(mouseListenerSubscription);
        this._subscriptions.remove(destroySubscription);
      });
      this._subscriptions.add(mouseListenerSubscription);
      this._subscriptions.add(destroySubscription);
    }));
    this._typeHintProviders = [];
    this._typeHintElement = document.createElement('div');
    this._typeHintElement.className = 'nuclide-type-hint-overlay';
    this._marker = null;
    this._typeHintTimer = null;
  }

  _clearTypeHintTimer() {
    clearTimeout(this._typeHintTimer);
    this._typeHintTimer = null;
  }

  _delayedTypeHint(e: MouseEvent, editor: TextEditor, editorView: DOMNode) {
    if (this._typeHintTimer) {
      this._clearTypeHintTimer();
    }
    this._typeHintTimer = setTimeout(() => {
      this._typeHintTimer = null;
      if (!editorView.component) {
        // The editor was destroyed, but the destroy handler haven't yet been called to cancel the timer.
        return;
      }
      // Delay a bit + Cancel and schedule another update if the mouse keeps moving.
      var screenPosition = editorView.component.screenPositionForMouseEvent(e);
      var position = editor.bufferPositionForScreenPosition(screenPosition);
      this._typeHintInEditor(editor, position);
    }, TYPEHINT_DELAY_MS);
  }

  async _typeHintInEditor(editor: TextEditor, position: Point): Promise {
    var {scopeName} = editor.getGrammar();
    var matchingProviders = this._getMatchingProvidersForScopeName(scopeName);

    if (this._marker) {
      this._marker.destroy();
      this._marker = null;
    }

    if (!matchingProviders.length) {
      return;
    }

    var typeHint = await matchingProviders[0].typeHint(editor, position);
    if (!typeHint || this._marker) {
      return;
    }

    var {hint, range} = typeHint;
    // Transform the matched element range to the hint range.
    this._marker = editor.markBufferRange(range, {invalidate: 'never'});

    // This relative positioning is to work around the issue that `position: 'head'`
    // doesn't work for overlay decorators are rendered on the bottom right of the given range.
    // Atom issue: https://github.com/atom/atom/issues/6695
    var expressionLength = range.end.column - range.start.column;
    this._typeHintElement.style.left = - (expressionLength * editor.getDefaultCharWidth()) +  'px';
    this._typeHintElement.style.top = - (2 * editor.getLineHeightInPixels()) + 'px';
    this._typeHintElement.textContent = hint;
    editor.decorateMarker(this._marker, {type: 'overlay', position: 'head', item: this._typeHintElement});
  }

  _getMatchingProvidersForScopeName(scopeName: string): Array<TypeHintProvider> {
    return this._typeHintProviders.filter((provider: TypeHintProvider) => {
      var providerGrammars = provider.selector.split(/, ?/);
      return provider.inclusionPriority > 0 && providerGrammars.indexOf(scopeName) !== -1;
    }).sort((providerA: TypeHintProvider, providerB: TypeHintProvider) => {
      return providerA.inclusionPriority < providerB.inclusionPriority;
    });
  }

  addProvider(provider: TypeHintProvider) {
    this._typeHintProviders.push(provider);
  }

  dispose() {
    if (this._subscriptions) {
      this._subscriptions.dispose();
      this._subscriptions = null;
    }
  }
}

module.exports = TypeHintManager;
