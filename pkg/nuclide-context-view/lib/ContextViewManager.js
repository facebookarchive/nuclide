"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContextViewManager = exports.WORKSPACE_VIEW_URI = void 0;

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _observePaneItemVisibility() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/observePaneItemVisibility"));

  _observePaneItemVisibility = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _debounced() {
  const data = require("../../../modules/nuclide-commons-atom/debounced");

  _debounced = function () {
    return data;
  };

  return data;
}

function _ProviderRegistry() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/ProviderRegistry"));

  _ProviderRegistry = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _ContextViewMessage() {
  const data = _interopRequireDefault(require("./ContextViewMessage"));

  _ContextViewMessage = function () {
    return data;
  };

  return data;
}

function _ContextViewPanel() {
  const data = require("./ContextViewPanel");

  _ContextViewPanel = function () {
    return data;
  };

  return data;
}

function _ProviderContainer() {
  const data = require("./ProviderContainer");

  _ProviderContainer = function () {
    return data;
  };

  return data;
}

function _NoProvidersView() {
  const data = require("./NoProvidersView");

  _NoProvidersView = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const WORKSPACE_VIEW_URI = 'atom://nuclide/context-view';
exports.WORKSPACE_VIEW_URI = WORKSPACE_VIEW_URI;
const logger = (0, _log4js().getLogger)('nuclide-context-view');
/**
 * Manages registering/unregistering of definition service and context providers,
 * and manages re-rendering when a new definition is emitted from the definition
 * service.
 */

class ContextViewManager {
  // Subscriptions to all changes in registered context providers' `priority` setting.
  //    Key: ID of the context provider
  //    Value: Disposable for the change event subscription on its priority setting
  // Whether Context View should keep displaying the current content even after the cursor moves
  constructor() {
    this.hide = () => {
      (0, _nuclideAnalytics().track)('nuclide-context-view:hide');

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
    this._definitionProviders = new (_ProviderRegistry().default)();
    this._isVisible = false;
    this._locked = false; // Should be unlocked by default

    this.currentDefinition = null;
    this._panelDOMElement = document.createElement('div');
    this._panelDOMElement.style.display = 'flex';
    this._disposables = new (_UniversalDisposable().default)((0, _observePaneItemVisibility().default)(this).subscribe(visible => {
      this.didChangeVisibility(visible);
    }));

    this._render();
  }

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

    const newPriority = _featureConfig().default.get(keyPath);

    const providers = this._contextProviders;

    for (let i = 0; i < providers.length; i++) {
      if (newProvider.id === providers[i].id) {
        return false;
      }

      const existingPriority = _featureConfig().default.get(providers[i].id + '.priority');

      if (!foundIndex && newPriority <= existingPriority) {
        insertIndex = i;
        foundIndex = true;
      }
    }

    if (insertIndex === -1) {
      insertIndex = providers.length;
    }

    this._contextProviders.splice(insertIndex, 0, newProvider);

    const disposable = _featureConfig().default.observe(keyPath, newValue => {
      this._sortProvidersBasedOnPriority();
    });

    this._settingDisposables.set(newProvider.id, disposable);

    this._render();

    return true;
  }

  _sortProvidersBasedOnPriority() {
    this._contextProviders.sort((provider1, provider2) => {
      const priority1 = _featureConfig().default.get(provider1.id + '.priority');

      const priority2 = _featureConfig().default.get(provider2.id + '.priority');

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
    } // Only subscribe if panel showing && there's something to subscribe to && not locked


    if (this._isVisible && !this._locked) {
      this._defServiceSubscription = (0, _debounced().observeTextEditorsPositions)(EDITOR_DEBOUNCE_INTERVAL, POSITION_DEBOUNCE_INTERVAL).filter(editorPos => editorPos != null).switchMap(editorPos => {
        return (0, _nuclideAnalytics().trackTiming)('nuclide-context-view:getDefinition', () => {
          if (!(editorPos != null)) {
            throw new Error("Invariant violation: \"editorPos != null\"");
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
          (0, _nuclideAnalytics().track)('nuclide-context-view:filterQueryResults', {
            definitionsReturned: queryResult.definitions.length
          }); // TODO (@reesjones) Handle case where multiple definitions are shown

          return queryResult.definitions[0];
        } // We do want to return null sometimes so providers can show "No definition selected"


        return null;
      }).subscribe(def => this.updateCurrentDefinition(def));
      return;
    }
  }

  show() {
    (0, _nuclideAnalytics().track)('nuclide-context-view:show');

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
        this._contextProviders.splice(i, 1); // Unsubscribe from change events on the removed provider's `priority` setting


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
    const providerElements = (0, _collection().arrayCompact)(this._contextProviders.map((prov, index) => {
      const createElementFn = prov.getElementFactory();
      const element = createElementFn({
        ContextViewMessage: _ContextViewMessage().default,
        definition: this.currentDefinition,
        setLocked: this._setLocked
      });

      if (element != null) {
        return React.createElement(_ProviderContainer().ProviderContainer, {
          title: prov.title,
          key: index
        }, element);
      }
    })); // If there are no context providers to show, show a message instead

    if (providerElements.length === 0) {
      providerElements.push(React.createElement(_NoProvidersView().NoProvidersView, {
        key: 0
      }));
    }

    _reactDom.default.render( // $FlowFixMe(>=0.53.0) Flow suppress
    React.createElement(_ContextViewPanel().ContextViewPanel, {
      definition: this.currentDefinition,
      locked: this._locked
    }, providerElements), this._panelDOMElement);
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