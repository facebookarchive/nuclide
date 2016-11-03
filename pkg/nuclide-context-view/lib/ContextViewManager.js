'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContextViewManager = undefined;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _reactForAtom = require('react-for-atom');

var _debounced;

function _load_debounced() {
  return _debounced = require('../../commons-atom/debounced');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _ContextViewMessage;

function _load_ContextViewMessage() {
  return _ContextViewMessage = _interopRequireDefault(require('./ContextViewMessage'));
}

var _ContextViewPanel;

function _load_ContextViewPanel() {
  return _ContextViewPanel = require('./ContextViewPanel');
}

var _ProviderContainer;

function _load_ProviderContainer() {
  return _ProviderContainer = require('./ProviderContainer');
}

var _NoProvidersView;

function _load_NoProvidersView() {
  return _NoProvidersView = require('./NoProvidersView');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const EDITOR_DEBOUNCE_INTERVAL = 500;
const POSITION_DEBOUNCE_INTERVAL = 500;

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

/**
 * Manages registering/unregistering of definition service and context providers,
 * and manages re-rendering when a new definition is emitted from the definition
 * service.
 */
let ContextViewManager = exports.ContextViewManager = class ContextViewManager {
  // Whether Context View should keep displaying the current content even after the cursor moves
  constructor(width, isVisible) {
    this._atomPanel = null;
    this._contextProviders = [];
    this._defServiceSubscription = null;
    this._settingDisposables = new Map();
    this._definitionService = null;
    this._isVisible = isVisible;
    this._locked = false; // Should be unlocked by default
    this._panelDOMElement = null;
    this._width = width;
    this.currentDefinition = null;

    this.hide = this.hide.bind(this);
    this._onResize = this._onResize.bind(this);
    this._setLocked = this._setLocked.bind(this);

    this._render();
  }
  // Subscriptions to all changes in registered context providers' `priority` setting.
  //    Key: ID of the context provider
  //    Value: Disposable for the change event subscription on its priority setting


  dispose() {
    this._disposeView();
    this._settingDisposables.forEach(disposable => {
      disposable.dispose();
    });
  }

  hide() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-context-view:hide');
    if (this._isVisible) {
      this._isVisible = false;
      this._render();
    }
    this.updateSubscription();
  }

  registerProvider(newProvider) {
    // Ensure provider with given ID isn't already registered,
    // and find index to insert at based on priority
    let insertIndex = -1;
    let foundIndex = false;
    const keyPath = newProvider.id + '.priority';
    const newPriority = (_featureConfig || _load_featureConfig()).default.get(keyPath);
    const providers = this._contextProviders;
    for (let i = 0; i < providers.length; i++) {
      if (newProvider.id === providers[i].id) {
        return false;
      }
      const existingPriority = (_featureConfig || _load_featureConfig()).default.get(providers[i].id + '.priority');
      if (!foundIndex && newPriority <= existingPriority) {
        insertIndex = i;
        foundIndex = true;
      }
    }
    if (insertIndex === -1) {
      insertIndex = providers.length;
    }
    this._contextProviders.splice(insertIndex, 0, newProvider);
    const disposable = (_featureConfig || _load_featureConfig()).default.observe(keyPath, newValue => {
      this._sortProvidersBasedOnPriority();
    });
    this._settingDisposables.set(newProvider.id, disposable);
    this._render();
    return true;
  }

  _sortProvidersBasedOnPriority() {
    this._contextProviders.sort((provider1, provider2) => {
      const priority1 = (_featureConfig || _load_featureConfig()).default.get(provider1.id + '.priority');
      const priority2 = (_featureConfig || _load_featureConfig()).default.get(provider2.id + '.priority');
      return priority1 - priority2;
    });
    this._render();
  }

  serialize() {
    return {
      width: this._width,
      visible: this._isVisible
    };
  }

  /**
   * Sets handle to registered definition service, sets the subscriber
   * to the definition service to an Observable<Definition>, and
   * re-renders if necessary.
   */
  consumeDefinitionService(service) {
    this._definitionService = service;
    this.updateSubscription();
    this._render();
  }

  /**
   * Subscribes or unsubscribes to definition service based on the current state.
   */
  updateSubscription() {
    // Only subscribe if panel showing && there's something to subscribe to && not locked
    if (this._isVisible && this._definitionService != null && !this._locked) {
      this._defServiceSubscription = (0, (_debounced || _load_debounced()).observeTextEditorsPositions)(EDITOR_DEBOUNCE_INTERVAL, POSITION_DEBOUNCE_INTERVAL).filter(editorPos => editorPos != null).map(editorPos => {
        return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)('nuclide-context-view:getDefinition', () => {
          if (!(editorPos != null)) {
            throw new Error('Invariant violation: "editorPos != null"');
          }

          if (!(this._definitionService != null)) {
            throw new Error('Invariant violation: "this._definitionService != null"');
          }

          return this._definitionService.getDefinition(editorPos.editor, editorPos.position).catch(error => {
            logger.error('Error querying definition service: ', error);
            return null;
          });
        });
      }).switchMap(queryResult => {
        return queryResult != null ? _rxjsBundlesRxMinJs.Observable.fromPromise(queryResult) : _rxjsBundlesRxMinJs.Observable.empty();
      }).map(queryResult => {
        if (queryResult != null) {
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-context-view:filterQueryResults', {
            definitionsReturned: queryResult.definitions.length
          });
          // TODO (@reesjones) Handle case where multiple definitions are shown
          return queryResult.definitions[0];
        }
        // We do want to return null sometimes so providers can show "No definition selected"
        return null;
      }).subscribe(def => this.updateCurrentDefinition(def));
      return;
    }
    // Otherwise, unsubscribe if there is a subscription
    if (this._defServiceSubscription != null) {
      this._defServiceSubscription.unsubscribe();
      this._defServiceSubscription = null;
    }
  }

  show() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-context-view:show');
    if (!this._isVisible) {
      this._isVisible = true;
      this._render();
    }
    this.updateSubscription();
  }

  toggle() {
    if (this._isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  unregisterProvider(idToRemove) {
    let wasRemoved = false;
    for (let i = 0; i < this._contextProviders.length; i++) {
      if (this._contextProviders[i].id === idToRemove) {
        // Remove from array
        this._contextProviders.splice(i, 1);
        // Unsubscribe from change events on the removed provider's `priority` setting
        const settingChangeListener = this._settingDisposables.get(idToRemove);
        if (settingChangeListener != null) {
          settingChangeListener.dispose();
        }
        this._settingDisposables.delete(idToRemove);
        wasRemoved = true;
      }
    }
    this._render();
    return wasRemoved;
  }

  updateCurrentDefinition(newDefinition) {
    if (newDefinition === this.currentDefinition) {
      return;
    }

    this.currentDefinition = newDefinition;
    this._render();
  }

  _setLocked(locked) {
    if (locked !== this._locked) {
      this._locked = locked;
      this.updateSubscription();
      this._render();
    }
  }

  _disposeView() {
    if (this._panelDOMElement != null) {
      _reactForAtom.ReactDOM.unmountComponentAtNode(this._panelDOMElement);
      this._panelDOMElement = null;
    }
    if (this._atomPanel != null) {
      this._atomPanel.destroy();
      this._atomPanel = null;
    }
    if (this._defServiceSubscription != null) {
      this._defServiceSubscription.unsubscribe();
      this._defServiceSubscription = null;
    }
  }

  _onResize(newWidth) {
    this._width = newWidth;
  }

  _renderProviders() {
    // Create collection of provider React elements to render, and
    const providerElements = this._contextProviders.map((prov, index) => {
      const createElementFn = prov.getElementFactory();
      return _reactForAtom.React.createElement(
        (_ProviderContainer || _load_ProviderContainer()).ProviderContainer,
        { title: prov.title, key: index },
        createElementFn({
          ContextViewMessage: (_ContextViewMessage || _load_ContextViewMessage()).default,
          definition: this.currentDefinition,
          setLocked: this._setLocked
        })
      );
    });

    // If there are no context providers to show, show a message instead
    if (providerElements.length === 0) {
      providerElements.push(_reactForAtom.React.createElement((_NoProvidersView || _load_NoProvidersView()).NoProvidersView, { key: 0 }));
    }

    // Render the panel in atom workspace
    if (!this._panelDOMElement) {
      this._panelDOMElement = document.createElement('div');
      this._panelDOMElement.style.display = 'flex';
    }

    _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(
      (_ContextViewPanel || _load_ContextViewPanel()).ContextViewPanel,
      {
        initialWidth: this._width,
        onResize: this._onResize,
        definition: this.currentDefinition,
        locked: this._locked,
        onHide: this.hide },
      providerElements
    ), this._panelDOMElement);

    if (!this._atomPanel) {
      if (!(this._panelDOMElement != null)) {
        throw new Error('Invariant violation: "this._panelDOMElement != null"');
      }

      this._atomPanel = atom.workspace.addRightPanel({
        item: this._panelDOMElement,
        visible: true,
        priority: 200
      });
    }
  }

  _render() {
    if (this._isVisible) {
      this._renderProviders();
    } else {
      this._disposeView();
    }
  }

};