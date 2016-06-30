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
  Definition,
  DefinitionService,
  DefinitionQueryResult,
} from '../../nuclide-definition-service';
import type {EditorPosition} from '../../commons-atom/debounced';

import invariant from 'assert';
import {CompositeDisposable} from 'atom';
import {React, ReactDOM} from 'react-for-atom';
import {observeTextEditorsPositions} from '../../commons-atom/debounced';
import {Observable} from 'rxjs';
import {getLogger} from '../../nuclide-logging';
import {ContextViewPanel} from './ContextViewPanel';
import {ProviderContainer} from './ProviderContainer';
import {NoProvidersView} from './NoProvidersView';

const EDITOR_DEBOUNCE_INTERVAL = 500;
const POSITION_DEBOUNCE_INTERVAL = 500;

export type ContextViewConfig = {
  width?: number;
  visible?: boolean;
};

export type ContextProvider = {
  /**
   * Context View uses element factories to render providers' React
   * components. This gives Context View the ability to set the props (which
   * contains the currentDefinition) of each provider.
   */
  getElementFactory: () => ((props: {definition: ?Definition}) => React.Element<any>);
  id: string; // Unique ID of the provider (suggested: use the package name of the provider)
  title: string; // Display name
  isEditorBased: boolean; // Whether the context provider displays an AtomTextEditor. This flag
  // allows context view to display editor-based providers more nicely.
};

const logger = getLogger();

/**
 * Manages registering/deregistering of definition service and context providers,
 * and manages re-rendering when a new definition is emitted from the definition
 * service.
 */
export class ContextViewManager {

  _atomPanel: atom$Panel;
  _contextProviders: Array<ContextProvider>;
  currentDefinition: ?Definition;
  _definitionService: ?DefinitionService;
  _disposables: CompositeDisposable;
  _panelDOMElement: ?HTMLElement;
  _defServiceSubscription: ?rx$ISubscription;
  _width: number;

  constructor(width: number, isVisible: boolean) {
    this._width = width;
    this._disposables = new CompositeDisposable();
    this._contextProviders = [];
    this.currentDefinition = null;
    this._definitionService = null;
    this._defServiceSubscription = null;

    this._panelDOMElement = document.createElement('div');

    // Otherwise it does not fill the whole panel, which might be alright except it means that the
    // resize-handle doesn't extend all the way to the bottom.
    //
    // Use 'flex' to fit Atom v1.6.0+ and `height: inherit` to fit Atom <v1.6.0. The latter uses
    // `height: 100%;` down the hierarchy and becomes innocuous in 1.6.0 because inheriting will
    // give `height: auto;`.
    this._panelDOMElement.style.display = 'flex';
    this._panelDOMElement.style.height = 'inherit';
    this.render();

    this._atomPanel = atom.workspace.addRightPanel({
      item: ((this._panelDOMElement: any): HTMLElement),
      visible: isVisible,
      priority: 200,
    });
    this._bindShortcuts();
  }

  dispose(): void {
    this.disposeView();
    this._disposables.dispose();
  }

  getWidth(): number {
    return this._width;
  }

  hide(): void {
    if (this._atomPanel.isVisible()) {
      this._atomPanel.hide();
    }
    this.updateSubscription();
  }

  isVisible(): boolean {
    return (this._atomPanel.isVisible());
  }

  registerProvider(newProvider: ContextProvider): boolean {
    // Ensure provider with given ID isn't already registered
    for (let i = 0; i < this._contextProviders.length; i++) {
      if (newProvider.id === this._contextProviders[i].id) {
        return false;
      }
    }

    this._contextProviders.push(newProvider);

    if (this.isVisible()) {
      this.render();
    }
    return true;
  }

  serialize(): ContextViewConfig {
    return {
      width: this._width,
      visible: this.isVisible(),
    };
  }

  /**
   * Sets handle to registered definition service, sets the subscriber
   * to the definition service to an Observable<Definition>, and
   * re-renders if necessary.
   */
  consumeDefinitionService(service: ?DefinitionService): void {
    // TODO (reesjones) handle case when definition service is deactivated
    this._definitionService = service;
    this.updateSubscription();

    if (this.isVisible()) {
      this.render();
    }
  }

  updateSubscription(): void {
    // Only subscribe if panel showing and there's something to subscribe to
    if (this.isVisible() && this._definitionService !== null) {
      this._defServiceSubscription = observeTextEditorsPositions(
        EDITOR_DEBOUNCE_INTERVAL, POSITION_DEBOUNCE_INTERVAL)
        .filter((pos: ?EditorPosition) => pos != null)
        .map(async (editorPos: ?EditorPosition) => {
          invariant(editorPos != null);
          invariant(this._definitionService != null);
          try {
            return await this._definitionService.getDefinition(
              editorPos.editor,
              editorPos.position
            );
          } catch (err) {
            logger.error('nuclide-context-view: Error calling definition service: ', err);
            return null;
          }
        }).switchMap((queryResult: Promise<?DefinitionQueryResult>) => {
          return (queryResult != null)
            ? Observable.fromPromise(queryResult)
            : Observable.empty();
        })
        .map((queryResult: ?DefinitionQueryResult) => {
          return (queryResult != null)
            ? queryResult.definitions[0]
            : null; // We do want to return null sometimes so providers can show "No definition selected"
        })
        .subscribe((def: ?Definition) => this.updateCurrentDefinition(def));
      return;
    }
    // Otherwise, unsubscribe if there is a subscription
    if (this._defServiceSubscription !== null) {
      invariant(this._defServiceSubscription != null);
      this._defServiceSubscription.unsubscribe();
      this._defServiceSubscription = null;
    }
  }

  show(): void {
    if (!this.isVisible()) {
      this.render();
      this._atomPanel.show();
    }
    this.updateSubscription();
  }

  toggle(): void {
    (this.isVisible())
      ? this.hide()
      : this.show();
  }

  deregisterProvider(idToRemove: string): boolean {
    let wasRemoved: boolean = false;
    for (let i = 0; i < this._contextProviders.length; i++) {
      if (this._contextProviders[i].id === idToRemove) {
        // Remove from array
        this._contextProviders.splice(i, 1);
        wasRemoved = true;
      }
    }

    if (this.isVisible()) {
      this.render();
    }
    return wasRemoved;
  }

  updateCurrentDefinition(newDefinition: ?Definition) {
    if (newDefinition === this.currentDefinition) {
      return;
    }

    this.currentDefinition = newDefinition;
    if (this.isVisible()) {
      this.render();
    }
  }

  _bindShortcuts() {
    // Toggle
    this._disposables.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-context-view:toggle',
        this.toggle.bind(this)
      )
    );

    // Show
    this._disposables.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-context-view:show',
        this.show.bind(this)
      )
    );

    // Hide
    this._disposables.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-context-view:hide',
        this.hide.bind(this)
      )
    );
  }

  disposeView(): void {
    const tempHandle = this._panelDOMElement;
    if (tempHandle != null) {
      ReactDOM.unmountComponentAtNode(this._panelDOMElement);
      this._atomPanel.destroy();
    }

    this._panelDOMElement = null;
  }

  _onResize(newWidth: number): void {
    this._width = newWidth;
  }

  render(): void {
    // Create collection of provider React elements to render, and
    // display them in order
    const providerElements: Array<React.Element<any>> =
      this._contextProviders.map((prov, index) => {
        const createElementFn = prov.getElementFactory();
        return (
          <ProviderContainer title={prov.title} key={index} isEditorBased={prov.isEditorBased}>
            {createElementFn({definition: this.currentDefinition})}
          </ProviderContainer>
        );
      }
    );

    // If there are no context providers to show, show a message instead
    if (providerElements.length === 0) {
      providerElements.push(<NoProvidersView key={0} />);
    }

    // Render the panel in atom workspace
    ReactDOM.render(
      <ContextViewPanel
        initialWidth={this._width}
        onResize={this._onResize.bind(this)}
        definition={this.currentDefinition}
        onHide={this.hide.bind(this)}>
        {providerElements}
      </ContextViewPanel>,
      this._panelDOMElement
    );
  }

}
