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
  Datatip,
  DatatipProvider,
} from '../../nuclide-datatip-interfaces';

import {CompositeDisposable, Disposable} from 'atom';
import {
  React,
  ReactDOM,
} from 'react-for-atom';

import {array, debounce} from '../../nuclide-commons';
import {track, trackOperationTiming} from '../../nuclide-analytics';

import {DatatipComponent, DATATIP_ACTIONS} from './DatatipComponent';
import {PinnedDatatip} from './PinnedDatatip';

import featureConfig from '../../nuclide-feature-config';

export class DatatipManager {
  _subscriptions: CompositeDisposable;
  _debouncedMouseMove:
    (event: MouseEvent, editor: TextEditor, editorView: atom$TextEditorElement) => void;
  _boundHideDatatip: Function;
  _globalKeydownSubscription: ?IDisposable;
  _marker: ?atom$Marker;
  _ephemeralDatatipElement: HTMLElement;
  _currentRange: ?atom$Range;
  _isHoveringDatatip: boolean;
  _datatipProviders: Array<DatatipProvider>;
  _pinnedDatatips: Set<PinnedDatatip>;
  /**
   * This helps determine if we should show the datatip when toggling it via
   * command. The toggle command first negates this, and then if this is true
   * shows a datatip, otherwise it hides the current datatip.
   */
  _datatipToggle: boolean;

  constructor() {
    this._boundHideDatatip = this.hideDatatip.bind(this);
    this._subscriptions = new CompositeDisposable();
    this._subscriptions.add(atom.commands.add(
      'atom-text-editor',
      'nuclide-datatip:toggle',
      this.toggleDatatip.bind(this)
    ));
    this._subscriptions.add(atom.commands.add(
      'atom-text-editor',
      'core:cancel',
      this._boundHideDatatip
    ));
    this._debouncedMouseMove = () => {};
    this._subscriptions.add(
      featureConfig.observe(
        'nuclide-datatip.datatipDebounceDelay',
        debounceDelay => this.updateDebounceDelay(debounceDelay),
      )
    );
    // TODO(most): Replace with @jjiaa's mouseListenerForTextEditor introduced in D2005545.
    this._subscriptions.add(atom.workspace.observeTextEditors(editor => {
      // When the cursor moves the next time we do a toggle we should show the
      // new datatip
      this._subscriptions.add(editor.onDidChangeCursorPosition(() => {
        this._datatipToggle = false;
      }));

      const editorView = atom.views.getView(editor);
      const mouseMoveListener = event => {this.handleMouseMove(event, editor, editorView);};
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
    this._pinnedDatatips = new Set();
    this._globalKeydownSubscription = null;
  }

  updateDebounceDelay(debounceDelay: number): void {
    this._debouncedMouseMove = debounce(
      (event, editor, editorView) => {
        this._datatipForMouseEvent(event, editor, editorView);
      },
      debounceDelay,
      /* immediate */ false
    );
  }

  handleMouseMove(event: MouseEvent, editor: TextEditor, editorView: atom$TextEditorElement): void {
    this._debouncedMouseMove(event, editor, editorView);
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
    if (this._globalKeydownSubscription != null) {
      this._globalKeydownSubscription.dispose();
      this._globalKeydownSubscription = null;
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

  _datatipForMouseEvent(e: MouseEvent, editor: TextEditor, editorView: HTMLElement): void {
    if (!editorView.component) {
      // The editor was destroyed, but the destroy handler haven't yet been called to cancel
      // the timer.
      return;
    }
    const textEditorComponent = editorView.component;
    const screenPosition = textEditorComponent.screenPositionForMouseEvent(e);
    const pixelPosition = textEditorComponent.pixelPositionForMouseEvent(e);
    const pixelPositionFromScreenPosition =
      textEditorComponent.pixelPositionForScreenPosition(screenPosition);
    // Distance (in pixels) between screenPosition and the cursor.
    const horizontalDistance = pixelPosition.left - pixelPositionFromScreenPosition.left;
    // `screenPositionForMouseEvent.column` cannot exceed the current line length.
    // This is essentially a heuristic for "mouse cursor is to the left or right of text content".
    if (pixelPosition.left < 0 || horizontalDistance > editor.getDefaultCharWidth()) {
      this.hideDatatip();
      return;
    }
    const bufferPosition = editor.bufferPositionForScreenPosition(screenPosition);
    this._datatipInEditor(editor, bufferPosition);
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
    const providers = this._getMatchingProvidersForScopeName(scopeName);
    if (providers.length === 0) {
      return;
    }
    const datatips = await Promise.all(
      providers.map(async (provider: DatatipProvider): Promise<Object> => {
        let name;
        if (provider.providerName != null) {
          name = provider.providerName;
        } else {
          name = 'unknown';
          const logger = require('../../nuclide-logging').getLogger();
          logger.error('Datatip provider has no name', provider);
        }
        const datatip = await trackOperationTiming(
          name + '.datatip',
          () => provider.datatip(editor, position),
        );
        if (!datatip || this._marker) {
          return;
        }
        const {pinnable, component, range} = datatip;
        // We track the timing above, but we still want to know the number of popups that are shown.
        track('datatip-popup', {
          'scope': scopeName,
          'providerName': name,
          rangeStartRow: String(range.start.row),
          rangeStartColumn: String(range.start.column),
          rangeEndRow: String(range.end.row),
          rangeEndColumn: String(range.end.column),
        });
        this._currentRange = range;
        let action, actionTitle;
        // Datatips are pinnable by default, unless explicitly specified otherwise.
        if (pinnable !== false) {
          action = DATATIP_ACTIONS.PIN;
          actionTitle = 'Pin this Datatip';
        }

        return {
          range,
          component,
          pinnable,
          name,
          action,
          actionTitle,
        };
      })
    );
    const nonEmptyDatatips = datatips.filter(datatip => datatip != null);
    if (nonEmptyDatatips.length === 0) {
      return;
    }
    const renderedProviders = nonEmptyDatatips.map(datatip => {
      const {
        component,
        name,
        action,
        actionTitle,
      } = datatip;
      return (
        <DatatipComponent
          action={action}
          actionTitle={actionTitle}
          onActionClick={this._handlePinClicked.bind(this, editor, datatip)}
          key={name}>
          {component}
        </DatatipComponent>
      );
    });

    let combinedRange = nonEmptyDatatips[0].range;
    for (let i = 1; i < nonEmptyDatatips.length; i++) {
      combinedRange = combinedRange.union(nonEmptyDatatips[i].range);
    }

    // Transform the matched element range to the hint range.
    const marker: atom$Marker = editor.markBufferRange(combinedRange, {invalidate: 'never'});
    this._marker = marker;

    ReactDOM.render(
      <div>{renderedProviders}</div>,
      this._ephemeralDatatipElement
    );
    // This relative positioning is to work around the issue that `position: 'head'`
    // doesn't work for overlay decorators are rendered on the bottom right of the given range.
    // Atom issue: https://github.com/atom/atom/issues/6695
    const expressionLength = combinedRange.end.column - combinedRange.start.column;
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
    this._subscribeToGlobalKeydown();
  }

  _subscribeToGlobalKeydown(): void {
    const editor = atom.views.getView(atom.workspace);
    editor.addEventListener('keydown', this._boundHideDatatip);
    this._globalKeydownSubscription = new Disposable(() => {
      editor.removeEventListener('keydown', this._boundHideDatatip);
    });
  }

  _handlePinClicked(editor: TextEditor, datatip: Datatip): void {
    this.hideDatatip();
    this._pinnedDatatips.add(new PinnedDatatip(datatip, editor, pinnedDatatip => {
      this._pinnedDatatips.delete(pinnedDatatip);
    }));
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
    this._pinnedDatatips.forEach(pinnedDatatip => pinnedDatatip.dispose());
    this._subscriptions.dispose();
  }
}
