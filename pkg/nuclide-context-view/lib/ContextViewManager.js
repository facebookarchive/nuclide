'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContextViewManager = exports.WORKSPACE_VIEW_URI = undefined;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _observePaneItemVisibility;

function _load_observePaneItemVisibility() {
  return _observePaneItemVisibility = _interopRequireDefault(require('nuclide-commons-atom/observePaneItemVisibility'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _debounced;

function _load_debounced() {
  return _debounced = require('nuclide-commons-atom/debounced');
}

var _ProviderRegistry;

function _load_ProviderRegistry() {
  return _ProviderRegistry = _interopRequireDefault(require('nuclide-commons-atom/ProviderRegistry'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const EDITOR_DEBOUNCE_INTERVAL = 500;
const POSITION_DEBOUNCE_INTERVAL = 500;
const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/context-view';

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-context-view');

/**
 * Manages registering/unregistering of definition service and context providers,
 * and manages re-rendering when a new definition is emitted from the definition
 * service.
 */
class ContextViewManager {
  // Whether Context View should keep displaying the current content even after the cursor moves
  constructor() {
    this.hide = () => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-context-view:hide');
      if (this._isVisible) {
        this._isVisible = false;
        this._render();
      }
      this.updateSubscription();
    };

    this._setLocked = locked => {
      if (locked !== this._locked) {
        this._locked = locked;
        this.updateSubscription();
        this._render();
      }
    };

    this._contextProviders = [];
    this._defServiceSubscription = null;
    this._settingDisposables = new Map();
    this._definitionProviders = new (_ProviderRegistry || _load_ProviderRegistry()).default();
    this._isVisible = false;
    this._locked = false; // Should be unlocked by default
    this.currentDefinition = null;

    this._panelDOMElement = document.createElement('div');
    this._panelDOMElement.style.display = 'flex';

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_observePaneItemVisibility || _load_observePaneItemVisibility()).default)(this).subscribe(visible => {
      this.didChangeVisibility(visible);
    }));
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
    this._disposables.dispose();
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

  /**
   * Sets handle to registered definition service, sets the subscriber
   * to the definition service to an Observable<Definition>, and
   * re-renders if necessary.
   */
  consumeDefinitionProvider(provider) {
    const disposable = this._definitionProviders.addProvider(provider);
    this._disposables.add(disposable);
    this.updateSubscription();
    this._render();
    return disposable;
  }

  /**
   * Subscribes or unsubscribes to definition service based on the current state.
   */
  updateSubscription() {
    if (this._defServiceSubscription != null) {
      this._defServiceSubscription.unsubscribe();
      this._defServiceSubscription = null;
    }
    // Only subscribe if panel showing && there's something to subscribe to && not locked
    if (this._isVisible && !this._locked) {
      this._defServiceSubscription = (0, (_debounced || _load_debounced()).observeTextEditorsPositions)(EDITOR_DEBOUNCE_INTERVAL, POSITION_DEBOUNCE_INTERVAL).filter(editorPos => editorPos != null).switchMap(editorPos => {
        return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-context-view:getDefinition', () => {
          if (!(editorPos != null)) {
            throw new Error('Invariant violation: "editorPos != null"');
          }

          const definitionProvider = this._definitionProviders.getProviderForEditor(editorPos.editor);
          if (definitionProvider == null) {
            return Promise.resolve(null);
          }
          return definitionProvider.getDefinition(editorPos.editor, editorPos.position).catch(error => {
            logger.error('Error querying definition service: ', error);
            return null;
          });
        });
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

  _disposeView() {
    _reactDom.default.unmountComponentAtNode(this._panelDOMElement);
    if (this._defServiceSubscription != null) {
      this._defServiceSubscription.unsubscribe();
      this._defServiceSubscription = null;
    }
  }

  _renderProviders() {
    // Create collection of provider React elements to render, and
    const providerElements = (0, (_collection || _load_collection()).arrayCompact)(this._contextProviders.map((prov, index) => {
      const createElementFn = prov.getElementFactory();
      const element = createElementFn({
        ContextViewMessage: (_ContextViewMessage || _load_ContextViewMessage()).default,
        definition: this.currentDefinition,
        setLocked: this._setLocked
      });
      if (element != null) {
        return _react.createElement(
          (_ProviderContainer || _load_ProviderContainer()).ProviderContainer,
          { title: prov.title, key: index },
          element
        );
      }
    }));

    // If there are no context providers to show, show a message instead
    if (providerElements.length === 0) {
      providerElements.push(_react.createElement((_NoProvidersView || _load_NoProvidersView()).NoProvidersView, { key: 0 }));
    }

    _reactDom.default.render(
    // $FlowFixMe(>=0.53.0) Flow suppress
    _react.createElement(
      (_ContextViewPanel || _load_ContextViewPanel()).ContextViewPanel,
      {
        definition: this.currentDefinition,
        locked: this._locked },
      providerElements
    ), this._panelDOMElement);
  }

  _render() {
    if (this._isVisible) {
      this._renderProviders();
    } else {
      this._disposeView();
    }
  }

  getTitle() {
    return 'Context View';
  }

  getIconName() {
    return 'info';
  }

  getPreferredWidth() {
    return 300;
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation() {
    return 'right';
  }

  didChangeVisibility(visible) {
    if (visible) {
      this.show();
    } else {
      this.hide();
    }
  }

  getElement() {
    return this._panelDOMElement;
  }

  serialize() {
    return {
      deserializer: 'nuclide.ContextViewPanelState'
    };
  }
}
exports.ContextViewManager = ContextViewManager;