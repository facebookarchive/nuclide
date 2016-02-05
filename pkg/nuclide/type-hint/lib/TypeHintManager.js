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
import {
  React,
  ReactDOM,
} from 'react-for-atom';

import {array, debounce} from '../../commons';
import {track, trackOperationTiming} from '../../analytics';

import {TypeHintComponent} from './TypeHintComponent';

const TYPEHINT_DELAY_MS = 50;

class TypeHintManager {

  _subscriptions: atom$CompositeDisposable;
  _marker: ?atom$Marker;
  _typeHintElement: HTMLElement;
  _currentRange: ?atom$Range;
  _isHoveringTypehint: boolean;
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
      this.toggleTypehint.bind(this)
    ));
    this._subscriptions.add(atom.commands.add(
      'atom-text-editor',
      'core:cancel',
      this.hideTypehint.bind(this)
    ));

    // TODO(most): Replace with @jjiaa's mouseListenerForTextEditor introduced in D2005545.
    this._subscriptions.add(atom.workspace.observeTextEditors(editor => {
      // When the cursor moves the next time we do a toggle we should show the
      // new type hint
      this._subscriptions.add(editor.onDidChangeCursorPosition(() => {
        this._typeHintToggle = false;
      }));

      const editorView = atom.views.getView(editor);
      const mouseMoveListener = debounce(
        e => {this._typehintForMouseEvent(((e: any): MouseEvent), editor, editorView);},
        TYPEHINT_DELAY_MS,
        /* immediate */ false,
      );
      editorView.addEventListener('mousemove', mouseMoveListener);
      const mouseListenerSubscription = new Disposable(() =>
          editorView.removeEventListener('mousemove', mouseMoveListener));
      const destroySubscription = editor.onDidDestroy(() => {
        mouseListenerSubscription.dispose();
        this._subscriptions.remove(mouseListenerSubscription);
        this._subscriptions.remove(destroySubscription);
      });
      this._subscriptions.add(mouseListenerSubscription);
      this._subscriptions.add(destroySubscription);
    }));
    this._typeHintElement = document.createElement('div');
    this._typeHintElement.className = 'nuclide-type-hint-overlay';

    const typehintMouseEnter = event => this._handleElementMouseEnter(event);
    const typehintMouseLeave = event => this._handleElementMouseLeave(event);
    this._typeHintElement.addEventListener('mouseenter', typehintMouseEnter);
    this._typeHintElement.addEventListener('mouseleave', typehintMouseLeave);

    this._typeHintProviders = [];
    this._marker = null;
    this._typeHintToggle = false;
    this._currentRange = null;
    this._isHoveringTypehint = false;
  }

  toggleTypehint(): void {
    this._typeHintToggle = !this._typeHintToggle;
    if (this._typeHintToggle) {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor != null) {
        const position = editor.getCursorScreenPosition();
        this._typeHintInEditor(editor, position);
      }
    } else {
      this.hideTypehint();
    }
  }

  hideTypehint(): void {
    if (this._marker == null) {
      return;
    }
    this._typeHintElement.style.display = 'none';
    this._marker.destroy();
    this._marker = null;
    this._currentRange = null;
    this._isHoveringTypehint = false;
  }

  _handleElementMouseEnter(event: SyntheticEvent): void {
    this._isHoveringTypehint = true;
  }

  _handleElementMouseLeave(event: Event): void {
    this._isHoveringTypehint = false;
  }

  _typehintForMouseEvent(e: MouseEvent, editor: TextEditor, editorView: HTMLElement) {
    if (!editorView.component) {
      // The editor was destroyed, but the destroy handler haven't yet been called to cancel
      // the timer.
      return;
    }
    const screenPosition = editorView.component.screenPositionForMouseEvent(e);
    const position = editor.bufferPositionForScreenPosition(screenPosition);
    this._typeHintInEditor(editor, position);
  }

  async _typeHintInEditor(editor: TextEditor, position: atom$Point): Promise {
    if (this._isHoveringTypehint) {
      return;
    }

    if (this._currentRange != null && this._currentRange.containsPoint(position)) {
      return;
    }

    if (this._marker != null) {
      this.hideTypehint();
    }

    const {scopeName} = editor.getGrammar();
    const [provider] = this._getMatchingProvidersForScopeName(scopeName);
    if (provider == null) {
      return;
    }
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

    const {hint, hintTree, range} = typeHint;
    // For now, actual hint text is required.
    invariant(hint != null);
    // We track the timing above, but we still want to know the number of popups that are shown.
    track('type-hint-popup', {
      'scope': scopeName,
      'message': hint,
    });
    this._currentRange = range;

    // Transform the matched element range to the hint range.
    const marker: atom$Marker = editor.markBufferRange(range, {invalidate: 'never'});
    this._marker = marker;

    ReactDOM.render(
      <TypeHintComponent content={hintTree || hint} />,
      this._typeHintElement
    );
    // This relative positioning is to work around the issue that `position: 'head'`
    // doesn't work for overlay decorators are rendered on the bottom right of the given range.
    // Atom issue: https://github.com/atom/atom/issues/6695
    const expressionLength = range.end.column - range.start.column;
    this._typeHintElement.style.left = -(expressionLength * editor.getDefaultCharWidth()) +  'px';
    this._typeHintElement.style.display = 'block';

    editor.decorateMarker(
      marker,
      {
        type: 'overlay',
        position: 'head',
        item: this._typeHintElement,
      }
    );
    editor.decorateMarker(
      marker,
      {
        type: 'highlight',
        class: 'nuclide-type-hint-highlight-region',
      }
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
    this.hideTypehint();
    ReactDOM.unmountComponentAtNode(this._typeHintElement);
    this._typeHintElement.remove();
    this._subscriptions.dispose();
  }
}

module.exports = TypeHintManager;
