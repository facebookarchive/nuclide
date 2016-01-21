'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TypeHintProvider} from '../../type-hint-interfaces';

import invariant from 'assert';
import {CompositeDisposable, Disposable} from 'atom';
import React from 'react-for-atom';

import {array} from '../../commons';
import {track, trackOperationTiming} from '../../analytics';

import {TypeHintComponent} from './TypeHintComponent';

const TYPEHINT_DELAY_MS = 200;

class TypeHintManager {

  _subscriptions: atom$CompositeDisposable;
  _marker: ?atom$Marker;
  _typeHintTimer: ?number;
  _typeHintToggle: boolean;
  _typeHintElement: HTMLElement;
  _previousTypeHintSerialized: string;

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
          const editor = atom.workspace.getActiveTextEditor();
          if (editor != null) {
            const position = editor.getCursorScreenPosition();
            this._typeHintInEditor(editor, position);
          }
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

      const editorView = atom.views.getView(editor);
      const mouseMoveListener = (e) => {
        this._delayedTypeHint(((e: any): MouseEvent), editor, editorView);
      };
      editorView.addEventListener('mousemove', mouseMoveListener);
      const mouseListenerSubscription = new Disposable(() =>
          editorView.removeEventListener('mousemove', mouseMoveListener));
      const destroySubscription = editor.onDidDestroy(() => {
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
    this._previousTypeHintSerialized = '';
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
      const screenPosition = editorView.component.screenPositionForMouseEvent(e);
      const position = editor.bufferPositionForScreenPosition(screenPosition);
      this._typeHintInEditor(editor, position);
    }, TYPEHINT_DELAY_MS);
  }

  async _typeHintInEditor(editor: TextEditor, position: atom$Point): Promise {
    const {scopeName} = editor.getGrammar();
    const matchingProviders = this._getMatchingProvidersForScopeName(scopeName);

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
      const logger = require('../../logging').getLogger();
      logger.error('Type hint provider has no name', provider);
    }

    const typeHint = await trackOperationTiming(
      name + '.typeHint',
      () => provider.typeHint(editor, position),
    );
    if (!typeHint || this._marker) {
      return;
    }

    const {hint, range} = typeHint;

    // For now, actual hint text is required.
    invariant(hint != null);


    // Only (re)-create the typehint if its contents differ from the currently rendered one.
    const serializedTypeHint = hint + range.serialize().toString();
    if (this._marker !== null && serializedTypeHint === this._previousTypeHintSerialized) {
      return;
    }
    this._previousTypeHintSerialized = serializedTypeHint;

    // We track the timing above, but we still want to know the number of popups that are shown.
    track('type-hint-popup', {
      'scope': scopeName,
      'message': hint,
    });

    // Transform the matched element range to the hint range.
    const marker: atom$Marker = editor.markBufferRange(range, {invalidate: 'never'});
    this._marker = marker;

    React.render(<TypeHintComponent content={hint} />, this._typeHintElement);
    const hintHeight = this._typeHintElement.clientHeight;
    // This relative positioning is to work around the issue that `position: 'head'`
    // doesn't work for overlay decorators are rendered on the bottom right of the given range.
    // Atom issue: https://github.com/atom/atom/issues/6695
    const expressionLength = range.end.column - range.start.column;
    this._typeHintElement.style.left = -(expressionLength * editor.getDefaultCharWidth()) +  'px';
    this._typeHintElement.style.bottom = hintHeight + 'px';
    this._typeHintElement.style.display = 'block';

    editor.decorateMarker(
      marker,
      {type: 'overlay', position: 'head', item: this._typeHintElement}
    );
  }

  _getMatchingProvidersForScopeName(scopeName: string): Array<TypeHintProvider> {
    return this._typeHintProviders.filter((provider: TypeHintProvider) => {
      const providerGrammars = provider.selector.split(/, ?/);
      return provider.inclusionPriority > 0 && providerGrammars.indexOf(scopeName) !== -1;
    }).sort((providerA: TypeHintProvider, providerB: TypeHintProvider) => {
      return providerA.inclusionPriority - providerB.inclusionPriority;
    });
  }

  addProvider(provider: TypeHintProvider) {
    this._typeHintProviders.push(provider);
  }

  removeProvider(provider: TypeHintProvider): void {
    array.remove(this._typeHintProviders, provider);
  }

  dispose() {
    this._subscriptions.dispose();
  }
}

module.exports = TypeHintManager;
