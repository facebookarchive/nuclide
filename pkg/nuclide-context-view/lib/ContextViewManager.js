Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _commonsAtomDebounced2;

function _commonsAtomDebounced() {
  return _commonsAtomDebounced2 = require('../../commons-atom/debounced');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _ContextViewMessage2;

function _ContextViewMessage() {
  return _ContextViewMessage2 = _interopRequireDefault(require('./ContextViewMessage'));
}

var _ContextViewPanel2;

function _ContextViewPanel() {
  return _ContextViewPanel2 = require('./ContextViewPanel');
}

var _ProviderContainer2;

function _ProviderContainer() {
  return _ProviderContainer2 = require('./ProviderContainer');
}

var _NoProvidersView2;

function _NoProvidersView() {
  return _NoProvidersView2 = require('./NoProvidersView');
}

var EDITOR_DEBOUNCE_INTERVAL = 500;
var POSITION_DEBOUNCE_INTERVAL = 500;

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

/**
 * Manages registering/deregistering of definition service and context providers,
 * and manages re-rendering when a new definition is emitted from the definition
 * service.
 */

var ContextViewManager = (function () {
  function ContextViewManager(width, isVisible) {
    _classCallCheck(this, ContextViewManager);

    this._atomPanel = null;
    this._contextProviders = [];
    this._defServiceSubscription = null;
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

  _createClass(ContextViewManager, [{
    key: 'dispose',
    value: function dispose() {
      this._disposeView();
    }
  }, {
    key: 'hide',
    value: function hide() {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-context-view:hide');
      if (this._isVisible) {
        this._isVisible = false;
        this._render();
      }
      this.updateSubscription();
    }
  }, {
    key: 'registerProvider',
    value: function registerProvider(newProvider) {
      // Ensure provider with given ID isn't already registered,
      // and find index to insert at based on priority
      var insertIndex = -1;
      var foundIndex = false;
      var providers = this._contextProviders;
      for (var i = 0; i < providers.length; i++) {
        if (newProvider.id === providers[i].id) {
          return false;
        }
        if (!foundIndex && newProvider.priority <= providers[i].priority) {
          insertIndex = i;
          foundIndex = true;
        }
      }
      if (insertIndex === -1) {
        insertIndex = providers.length;
      }
      this._contextProviders.splice(insertIndex, 0, newProvider);
      this._render();
      return true;
    }
  }, {
    key: 'serialize',
    value: function serialize() {
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
  }, {
    key: 'consumeDefinitionService',
    value: function consumeDefinitionService(service) {
      this._definitionService = service;
      this.updateSubscription();
      this._render();
    }

    /**
     * Subscribes or unsubscribes to definition service based on the current state.
     */
  }, {
    key: 'updateSubscription',
    value: function updateSubscription() {
      var _this = this;

      // Only subscribe if panel showing && there's something to subscribe to && not locked
      if (this._isVisible && this._definitionService != null && !this._locked) {
        this._defServiceSubscription = (0, (_commonsAtomDebounced2 || _commonsAtomDebounced()).observeTextEditorsPositions)(EDITOR_DEBOUNCE_INTERVAL, POSITION_DEBOUNCE_INTERVAL).filter(function (editorPos) {
          return editorPos != null;
        }).map(function (editorPos) {
          return (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackOperationTiming)('nuclide-context-view:getDefinition', function () {
            (0, (_assert2 || _assert()).default)(editorPos != null);
            (0, (_assert2 || _assert()).default)(_this._definitionService != null);
            return _this._definitionService.getDefinition(editorPos.editor, editorPos.position).catch(function (error) {
              logger.error('Error querying definition service: ', error);
              return null;
            });
          });
        }).switchMap(function (queryResult) {
          return queryResult != null ? (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromPromise(queryResult) : (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
        }).map(function (queryResult) {
          if (queryResult != null) {
            (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-context-view:filterQueryResults', {
              definitionsReturned: queryResult.definitions.length
            });
            // TODO (@reesjones) Handle case where multiple definitions are shown
            return queryResult.definitions[0];
          }
          // We do want to return null sometimes so providers can show "No definition selected"
          return null;
        }).subscribe(function (def) {
          return _this.updateCurrentDefinition(def);
        });
        return;
      }
      // Otherwise, unsubscribe if there is a subscription
      if (this._defServiceSubscription != null) {
        this._defServiceSubscription.unsubscribe();
        this._defServiceSubscription = null;
      }
    }
  }, {
    key: 'show',
    value: function show() {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-context-view:show');
      if (!this._isVisible) {
        this._isVisible = true;
        this._render();
      }
      this.updateSubscription();
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      if (this._isVisible) {
        this.hide();
      } else {
        this.show();
      }
    }
  }, {
    key: 'deregisterProvider',
    value: function deregisterProvider(idToRemove) {
      var wasRemoved = false;
      for (var i = 0; i < this._contextProviders.length; i++) {
        if (this._contextProviders[i].id === idToRemove) {
          // Remove from array
          this._contextProviders.splice(i, 1);
          wasRemoved = true;
        }
      }
      this._render();
      return wasRemoved;
    }
  }, {
    key: 'updateCurrentDefinition',
    value: function updateCurrentDefinition(newDefinition) {
      if (newDefinition === this.currentDefinition) {
        return;
      }

      this.currentDefinition = newDefinition;
      this._render();
    }
  }, {
    key: '_setLocked',
    value: function _setLocked(locked) {
      if (locked !== this._locked) {
        this._locked = locked;
        this.updateSubscription();
        this._render();
      }
    }
  }, {
    key: '_disposeView',
    value: function _disposeView() {
      if (this._panelDOMElement != null) {
        (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(this._panelDOMElement);
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
  }, {
    key: '_onResize',
    value: function _onResize(newWidth) {
      this._width = newWidth;
    }
  }, {
    key: '_renderProviders',
    value: function _renderProviders() {
      var _this2 = this;

      // Create collection of provider React elements to render, and

      var providerElements = this._contextProviders.map(function (prov, index) {
        var createElementFn = prov.getElementFactory();
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_ProviderContainer2 || _ProviderContainer()).ProviderContainer,
          { title: prov.title, key: index, isEditorBased: prov.isEditorBased },
          createElementFn({
            ContextViewMessage: (_ContextViewMessage2 || _ContextViewMessage()).default,
            definition: _this2.currentDefinition,
            setLocked: _this2._setLocked
          })
        );
      });

      // If there are no context providers to show, show a message instead
      if (providerElements.length === 0) {
        providerElements.push((_reactForAtom2 || _reactForAtom()).React.createElement((_NoProvidersView2 || _NoProvidersView()).NoProvidersView, { key: 0 }));
      }

      // Render the panel in atom workspace
      if (!this._panelDOMElement) {
        this._panelDOMElement = document.createElement('div');
        this._panelDOMElement.style.display = 'flex';
      }

      (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement(
        (_ContextViewPanel2 || _ContextViewPanel()).ContextViewPanel,
        {
          initialWidth: this._width,
          onResize: this._onResize,
          definition: this.currentDefinition,
          locked: this._locked,
          onHide: this.hide },
        providerElements
      ), this._panelDOMElement);

      if (!this._atomPanel) {
        (0, (_assert2 || _assert()).default)(this._panelDOMElement != null);
        this._atomPanel = atom.workspace.addRightPanel({
          item: this._panelDOMElement,
          visible: true,
          priority: 200
        });
      }
    }
  }, {
    key: '_render',
    value: function _render() {
      if (this._isVisible) {
        this._renderProviders();
      } else {
        this._disposeView();
      }
    }
  }]);

  return ContextViewManager;
})();

exports.ContextViewManager = ContextViewManager;

// Whether Context View should keep displaying the current content even after the cursor moves
// display them in order