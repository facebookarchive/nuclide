'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  DatatipProvider,
} from '../../datatip-interfaces';

import {CompositeDisposable, Disposable} from 'atom';
import {
  ReactDOM,
} from 'react-for-atom';

import {array, debounce} from '../../commons';
import {track, trackOperationTiming} from '../../analytics';

const DATATIP_DELAY_MS = 50;

export class DatatipManager {
  _subscriptions: CompositeDisposable;
  _marker: ?atom$Marker;
  _ephemeralDatatipElement: HTMLElement;
  _currentRange: ?atom$Range;
  _isHoveringDatatip: boolean;
  _datatipProviders: Array<DatatipProvider>;
  /**
   * This helps determine if we should show the datatip when toggling it via
   * command. The toggle command first negates this, and then if this is true
   * shows a datatip, otherwise it hides the current datatip.
   */
  _datatipToggle: boolean;

  constructor() {
    this._subscriptions = new CompositeDisposable();
    this._subscriptions.add(atom.commands.add(
      'atom-text-editor',
      'nuclide-datatip:toggle',
      this.toggleDatatip.bind(this)
    ));
    this._subscriptions.add(atom.commands.add(
      'atom-text-editor',
      'core:cancel',
      this.hideDatatip.bind(this)
    ));

    // TODO(most): Replace with @jjiaa's mouseListenerForTextEditor introduced in D2005545.
    this._subscriptions.add(atom.workspace.observeTextEditors(editor => {
      // When the cursor moves the next time we do a toggle we should show the
      // new datatip
      this._subscriptions.add(editor.onDidChangeCursorPosition(() => {
        this._datatipToggle = false;
      }));

      const editorView = atom.views.getView(editor);
      const mouseMoveListener = debounce(
        e => {this._datatipForMouseEvent(((e: any): MouseEvent), editor, editorView);},
        DATATIP_DELAY_MS,
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
    this._ephemeralDatatipElement = document.createElement('div');
    this._ephemeralDatatipElement.className = 'nuclide-datatip-overlay';

    const datatipMouseEnter = event => this._handleElementMouseEnter(event);
    const datatipMouseLeave = event => this._handleElementMouseLeave(event);
    this._ephemeralDatatipElement.addEventListener('mouseenter', datatipMouseEnter);
    this._ephemeralDatatipElement.addEventListener('mouseleave', datatipMouseLeave);

    this._datatipProviders = [];
    this._marker = null;
    this._datatipToggle = false;
    this._currentRange = null;
    this._isHoveringDatatip = false;
  }

  toggleDatatip(): void {
    this._datatipToggle = !this._datatipToggle;
    if (this._datatipToggle) {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor != null) {
        const position = editor.getCursorScreenPosition();
        this._datatipInEditor(editor, position);
      }
    } else {
      this.hideDatatip();
    }
  }

  hideDatatip(): void {
    if (this._marker == null) {
      return;
    }
    this._ephemeralDatatipElement.style.display = 'none';
    this._marker.destroy();
    this._marker = null;
    this._currentRange = null;
    this._isHoveringDatatip = false;
  }

  _handleElementMouseEnter(event: SyntheticEvent): void {
    this._isHoveringDatatip = true;
  }

  _handleElementMouseLeave(event: Event): void {
    this._isHoveringDatatip = false;
  }

  _datatipForMouseEvent(e: MouseEvent, editor: TextEditor, editorView: HTMLElement) {
    if (!editorView.component) {
      // The editor was destroyed, but the destroy handler haven't yet been called to cancel
      // the timer.
      return;
    }
    const screenPosition = editorView.component.screenPositionForMouseEvent(e);
    const position = editor.bufferPositionForScreenPosition(screenPosition);
    this._datatipInEditor(editor, position);
  }

  async _datatipInEditor(editor: TextEditor, position: atom$Point): Promise {
    if (this._isHoveringDatatip) {
      return;
    }

    if (this._currentRange != null && this._currentRange.containsPoint(position)) {
      return;
    }

    if (this._marker != null) {
      this.hideDatatip();
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
      logger.error('Datatip provider has no name', provider);
    }
    const datatip = await trackOperationTiming(
      name + '.datatip',
      () => provider.datatip(editor, position),
    );
    if (!datatip || this._marker) {
      return;
    }

    const {component, range} = datatip;
    // We track the timing above, but we still want to know the number of popups that are shown.
    track('datatip-popup', {
      'scope': scopeName,
      //TODO add more data to track call
    });
    this._currentRange = range;

    // Transform the matched element range to the hint range.
    const marker: atom$Marker = editor.markBufferRange(range, {invalidate: 'never'});
    this._marker = marker;

    ReactDOM.render(
      component,
      this._ephemeralDatatipElement
    );
    // This relative positioning is to work around the issue that `position: 'head'`
    // doesn't work for overlay decorators are rendered on the bottom right of the given range.
    // Atom issue: https://github.com/atom/atom/issues/6695
    const expressionLength = range.end.column - range.start.column;
    this._ephemeralDatatipElement.style.left =
      -(expressionLength * editor.getDefaultCharWidth()) +  'px';
    this._ephemeralDatatipElement.style.display = 'block';

    editor.decorateMarker(
      marker,
      {
        type: 'overlay',
        position: 'head',
        item: this._ephemeralDatatipElement,
      }
    );
    editor.decorateMarker(
      marker,
      {
        type: 'highlight',
        class: 'nuclide-datatip-highlight-region',
      }
    );
  }

  _getMatchingProvidersForScopeName(scopeName: string): Array<DatatipProvider> {
    return this._datatipProviders.filter((provider: DatatipProvider) => {
      return provider.inclusionPriority > 0 && provider.validForScope(scopeName);
    }).sort((providerA: DatatipProvider, providerB: DatatipProvider) => {
      return providerA.inclusionPriority - providerB.inclusionPriority;
    });
  }

  addProvider(provider: DatatipProvider) {
    this._datatipProviders.push(provider);
  }

  removeProvider(provider: DatatipProvider): void {
    array.remove(this._datatipProviders, provider);
  }

  dispose() {
    this.hideDatatip();
    ReactDOM.unmountComponentAtNode(this._ephemeralDatatipElement);
    this._ephemeralDatatipElement.remove();
    this._subscriptions.dispose();
  }
}
