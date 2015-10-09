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

var {remove} = require('nuclide-commons').array;

import {track, trackOperationTiming} from 'nuclide-analytics';

var TYPEHINT_DELAY_MS = 200;

type HintTree = {
  value: string;
  children?: Array<HintTree>;
}

type TypeHint = {
  /**
   * A type hint string to display. One of hint and hintTree must be provided.
   */
  hint?: string;
  /**
   * A hint tree to display. If specified, overrides hint. The top-level value will be displayed,
   * and it can be expanded to reveal its children.
   */
  hintTree?: HintTree;
  range: atom$Range;
};

export type TypeHintProvider = {
  typeHint(editor: TextEditor, bufferPosition: atom$Point): Promise<TypeHint>;
  inclusionPriority: number;
  selector: string;
  // A unique name for the provider to be used for analytics. It is recommended that it be the name
  // of the provider's package.
  providerName: string;
};

class TypeHintManager {

  _subscriptions: atom$CompositeDisposable;
  _marker: ?atom$Marker;
  _typeHintTimer: ?number;
  _typeHintToggle: boolean;
  _typeHintElement: HTMLElement;

  _typeHintProviders: Array<TypeHintProvider>;
  /**
   * This helps determine if we should show the type hint when toggling it via
   * command. The toggle command first negates this, and then if this is true
   * shows a type hint, otherwise it hides the current typehint.
   */
  _typeHintToggle: boolean;

  constructor() {
    this._subscriptions = new CompositeDisposable();
    this._subscriptions.add(atom.commands.add(
      'atom-text-editor',
      'nuclide-type-hint:toggle',
      () => {
        this._typeHintToggle = !this._typeHintToggle;
        if (this._typeHintToggle) {
          var editor = atom.workspace.getActiveTextEditor();
          var position = editor.getCursorScreenPosition();
          this._typeHintInEditor(editor, position);
        } else {
          this._typeHintElement.style.display = 'none';
        }
      }
    ));

    // TODO(most): Replace with @jjiaa's mouseListenerForTextEditor introduced in D2005545.
    this._subscriptions.add(atom.workspace.observeTextEditors(editor => {
      // When the cursor moves the next time we do a toggle we should show the
      // new type hint
      this._subscriptions.add(editor.onDidChangeCursorPosition(() => {
        this._typeHintToggle = false;
      }));

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
    this._typeHintToggle = false;
  }

  _clearTypeHintTimer() {
    clearTimeout(this._typeHintTimer);
    this._typeHintTimer = null;
  }

  _delayedTypeHint(e: MouseEvent, editor: TextEditor, editorView: HTMLElement) {
    if (this._typeHintTimer) {
      this._clearTypeHintTimer();
    }
    this._typeHintTimer = setTimeout(() => {
      this._typeHintTimer = null;
      if (!editorView.component) {
        // The editor was destroyed, but the destroy handler haven't yet been called to cancel
        // the timer.
        return;
      }
      // Delay a bit + Cancel and schedule another update if the mouse keeps moving.
      var screenPosition = editorView.component.screenPositionForMouseEvent(e);
      var position = editor.bufferPositionForScreenPosition(screenPosition);
      this._typeHintInEditor(editor, position);
    }, TYPEHINT_DELAY_MS);
  }

  async _typeHintInEditor(editor: TextEditor, position: atom$Point): Promise {
    var {scopeName} = editor.getGrammar();
    var matchingProviders = this._getMatchingProvidersForScopeName(scopeName);

    if (this._marker) {
      this._marker.destroy();
      this._marker = null;
    }

    if (!matchingProviders.length) {
      return;
    }

    const provider = matchingProviders[0];
    let name;
    if (provider.providerName != null) {
      name = provider.providerName;
    } else {
      name = 'unknown';
      const logger = require('nuclide-logging').getLogger();
      logger.error('Type hint provider has no name', provider);
    }

    // $FlowFixMe
    const typeHint = await trackOperationTiming(
      name + '.typeHint',
      () => provider.typeHint(editor, position),
    );
    if (!typeHint || this._marker) {
      return;
    }

    var {hint, range} = typeHint;

    // We track the timing above, but we still want to know the number of popups that are shown.
    track('type-hint-popup', {
      'scope': scopeName,
      'message': hint,
    });

    // Transform the matched element range to the hint range.
    var marker: atom$Marker = editor.markBufferRange(range, {invalidate: 'never'});
    this._marker = marker;

    // This relative positioning is to work around the issue that `position: 'head'`
    // doesn't work for overlay decorators are rendered on the bottom right of the given range.
    // Atom issue: https://github.com/atom/atom/issues/6695
    var expressionLength = range.end.column - range.start.column;
    this._typeHintElement.style.left = -(expressionLength * editor.getDefaultCharWidth()) +  'px';
    this._typeHintElement.style.top = -(2 * editor.getLineHeightInPixels()) + 'px';
    this._typeHintElement.textContent = hint;
    this._typeHintElement.style.display = 'block';
    editor.decorateMarker(
      marker,
      {type: 'overlay', position: 'head', item: this._typeHintElement}
    );
  }

  _getMatchingProvidersForScopeName(scopeName: string): Array<TypeHintProvider> {
    return this._typeHintProviders.filter((provider: TypeHintProvider) => {
      var providerGrammars = provider.selector.split(/, ?/);
      return provider.inclusionPriority > 0 && providerGrammars.indexOf(scopeName) !== -1;
    }).sort((providerA: TypeHintProvider, providerB: TypeHintProvider) => {
      return providerA.inclusionPriority - providerB.inclusionPriority;
    });
  }

  addProvider(provider: TypeHintProvider) {
    this._typeHintProviders.push(provider);
  }

  removeProvider(provider: TypeHintProvider): void {
    remove(this._typeHintProviders, provider);
  }

  dispose() {
    this._subscriptions.dispose();
  }
}

module.exports = TypeHintManager;
