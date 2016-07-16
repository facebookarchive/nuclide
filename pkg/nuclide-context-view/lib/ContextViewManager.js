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
import {trackOperationTiming} from '../../nuclide-analytics';
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

  _atomPanel: ?atom$Panel;
  _contextProviders: Array<ContextProvider>;
  _defServiceSubscription: ?rx$ISubscription;
  _definitionService: ?DefinitionService;
  _disposables: CompositeDisposable;
  _isVisible: boolean;
  _panelDOMElement: ?HTMLElement;
  _width: number;
  currentDefinition: ?Definition;

  constructor(width: number, isVisible: boolean) {
    this._atomPanel = null;
    this._contextProviders = [];
    this._defServiceSubscription = null;
    this._definitionService = null;
    this._disposables = new CompositeDisposable();
    this._isVisible = isVisible;
    this._panelDOMElement = null;
    this._width = width;
    this.currentDefinition = null;

    (this: any).hide = this.hide.bind(this);
    (this: any)._onResize = this._onResize.bind(this);

    this._render();
  }

  dispose(): void {
    this._disposeView();
    this._disposables.dispose();
  }

  hide(): void {
    if (this._isVisible) {
      this._isVisible = false;
      this._render();
    }
    this.updateSubscription();
  }

  registerProvider(newProvider: ContextProvider): boolean {
    // Ensure provider with given ID isn't already registered
    for (let i = 0; i < this._contextProviders.length; i++) {
      if (newProvider.id === this._contextProviders[i].id) {
        return false;
      }
    }
    this._contextProviders.push(newProvider);
    this._render();
    return true;
  }

  serialize(): ContextViewConfig {
    return {
      width: this._width,
      visible: this._isVisible,
    };
  }

  /**
   * Sets handle to registered definition service, sets the subscriber
   * to the definition service to an Observable<Definition>, and
   * re-renders if necessary.
   */
  consumeDefinitionService(service: ?DefinitionService): void {
    this._definitionService = service;
    this.updateSubscription();
    this._render();
  }

  updateSubscription(): void {
    // Only subscribe if panel showing and there's something to subscribe to
    if (this._isVisible && this._definitionService != null) {
      this._defServiceSubscription = observeTextEditorsPositions(
        EDITOR_DEBOUNCE_INTERVAL, POSITION_DEBOUNCE_INTERVAL)
        .filter((editorPos: ?EditorPosition) => editorPos != null)
        .map((editorPos: ?EditorPosition) => {
          return trackOperationTiming('nuclide-context-view:getDefinition', () => {
            invariant(editorPos != null);
            invariant(this._definitionService != null);
            return this._definitionService.getDefinition(editorPos.editor, editorPos.position)
              .catch(error => {
                logger.error('Error querying definition service: ', error);
                return null;
              });
          });
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
    if (this._defServiceSubscription != null) {
      this._defServiceSubscription.unsubscribe();
      this._defServiceSubscription = null;
    }
  }

  show(): void {
    if (!this._isVisible) {
      this._isVisible = true;
      this._render();
    }
    this.updateSubscription();
  }

  toggle(): void {
    if (this._isVisible) {
      this.hide();
    } else {
      this.show();
    }
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
    this._render();
    return wasRemoved;
  }

  updateCurrentDefinition(newDefinition: ?Definition) {
    if (newDefinition === this.currentDefinition) {
      return;
    }

    this.currentDefinition = newDefinition;
    this._render();
  }

  _disposeView(): void {
    if (this._panelDOMElement != null) {
      ReactDOM.unmountComponentAtNode(this._panelDOMElement);
      this._panelDOMElement = null;
    }
    if (this._atomPanel != null) {
      this._atomPanel.destroy();
      this._atomPanel = null;
    }
  }

  _onResize(newWidth: number): void {
    this._width = newWidth;
  }

  _renderProviders(): void {
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
      },
    );

    // If there are no context providers to show, show a message instead
    if (providerElements.length === 0) {
      providerElements.push(<NoProvidersView key={0} />);
    }

    // Render the panel in atom workspace
    if (!this._panelDOMElement) {
      this._panelDOMElement = document.createElement('div');
      this._panelDOMElement.style.display = 'flex';
    }

    ReactDOM.render(
      <ContextViewPanel
        initialWidth={this._width}
        onResize={this._onResize}
        definition={this.currentDefinition}
        onHide={this.hide}>
        {providerElements}
      </ContextViewPanel>,
      this._panelDOMElement,
    );

    if (!this._atomPanel) {
      invariant(this._panelDOMElement != null);
      this._atomPanel = atom.workspace.addRightPanel({
        item: this._panelDOMElement,
        visible: true,
        priority: 200,
      });
    }
  }

  _render(): void {
    if (this._isVisible) {
      this._renderProviders();
    } else {
      this._disposeView();
    }
  }

}
