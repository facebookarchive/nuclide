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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
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

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
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

// Display name

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

/**
 * Manages registering/deregistering of definition service and context providers,
 * and manages re-rendering when a new definition is emitted from the definition
 * service.
 */

var ContextViewManager = (function () {
  function ContextViewManager(width, isVisible) {
    _classCallCheck(this, ContextViewManager);

    this._width = width;
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
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
      item: this._panelDOMElement,
      visible: isVisible,
      priority: 200
    });
    this._bindShortcuts();
  }

  _createClass(ContextViewManager, [{
    key: 'dispose',
    value: function dispose() {
      this.disposeView();
      this._disposables.dispose();
    }
  }, {
    key: 'getWidth',
    value: function getWidth() {
      return this._width;
    }
  }, {
    key: 'hide',
    value: function hide() {
      if (this._atomPanel.isVisible()) {
        this._atomPanel.hide();
      }
      this.updateSubscription();
    }
  }, {
    key: 'isVisible',
    value: function isVisible() {
      return this._atomPanel.isVisible();
    }
  }, {
    key: 'registerProvider',
    value: function registerProvider(newProvider) {

      // Ensure provider with given ID isn't already registered
      for (var i = 0; i < this._contextProviders.length; i++) {
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
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        width: this._width,
        visible: this.isVisible()
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
      // TODO (reesjones) handle case when definition service is deactivated
      this._definitionService = service;
      this.updateSubscription();

      if (this.isVisible()) {
        this.render();
      }
    }
  }, {
    key: 'updateSubscription',
    value: function updateSubscription() {
      var _this = this;

      // Only subscribe if panel showing and there's something to subscribe to
      if (this.isVisible() && this._definitionService !== null) {
        this._defServiceSubscription = (0, (_commonsAtomDebounced2 || _commonsAtomDebounced()).observeTextEditorsPositions)(EDITOR_DEBOUNCE_INTERVAL, POSITION_DEBOUNCE_INTERVAL).filter(function (pos) {
          return pos != null;
        }).map(_asyncToGenerator(function* (editorPos) {
          (0, (_assert2 || _assert()).default)(editorPos != null);
          (0, (_assert2 || _assert()).default)(_this._definitionService != null);
          try {
            return yield _this._definitionService.getDefinition(editorPos.editor, editorPos.position);
          } catch (err) {
            logger.error('nuclide-context-view: Error calling definition service: ', err);
            return null;
          }
        })).switchMap(function (queryResult) {
          return queryResult != null ? (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromPromise(queryResult) : (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
        }).map(function (queryResult) {
          return queryResult != null ? queryResult.definitions[0] : null; // We do want to return null sometimes so providers can show "No definition selected"
        }).subscribe(function (def) {
          return _this.updateCurrentDefinition(def);
        });
        return;
      }
      // Otherwise, unsubscribe if there is a subscription
      if (this._defServiceSubscription !== null) {
        (0, (_assert2 || _assert()).default)(this._defServiceSubscription != null);
        this._defServiceSubscription.unsubscribe();
        this._defServiceSubscription = null;
      }
    }
  }, {
    key: 'show',
    value: function show() {
      if (!this.isVisible()) {
        this.render();
        this._atomPanel.show();
      }
      this.updateSubscription();
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      this.isVisible() ? this.hide() : this.show();
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

      if (this.isVisible()) {
        this.render();
      }
      return wasRemoved;
    }
  }, {
    key: 'updateCurrentDefinition',
    value: function updateCurrentDefinition(newDefinition) {
      if (newDefinition === this.currentDefinition) {
        return;
      }

      this.currentDefinition = newDefinition;
      if (this.isVisible()) {
        this.render();
      }
    }
  }, {
    key: '_bindShortcuts',
    value: function _bindShortcuts() {
      // Toggle
      this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-context-view:toggle', this.toggle.bind(this)));

      // Show
      this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-context-view:show', this.show.bind(this)));

      // Hide
      this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-context-view:hide', this.hide.bind(this)));
    }
  }, {
    key: 'disposeView',
    value: function disposeView() {
      var tempHandle = this._panelDOMElement;
      if (tempHandle != null) {
        (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(this._panelDOMElement);
        this._atomPanel.destroy();
      }

      this._panelDOMElement = null;
    }
  }, {
    key: '_onResize',
    value: function _onResize(newWidth) {
      this._width = newWidth;
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      // Create collection of provider React elements to render, and

      var providerElements = this._contextProviders.map(function (provider, index) {
        var createElementFn = provider.getElementFactory();
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_ProviderContainer2 || _ProviderContainer()).ProviderContainer,
          { title: provider.title, key: index },
          createElementFn({ definition: _this2.currentDefinition })
        );
      });

      // If there are no context providers to show, show a message instead
      if (providerElements.length === 0) {
        providerElements.push((_reactForAtom2 || _reactForAtom()).React.createElement((_NoProvidersView2 || _NoProvidersView()).NoProvidersView, { key: 0 }));
      }

      // Render the panel in atom workspace
      (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement(
        (_ContextViewPanel2 || _ContextViewPanel()).ContextViewPanel,
        {
          initialWidth: this._width,
          onResize: this._onResize.bind(this),
          definition: this.currentDefinition,
          onHide: this.hide.bind(this) },
        providerElements
      ), this._panelDOMElement);
    }
  }]);

  return ContextViewManager;
})();

exports.ContextViewManager = ContextViewManager;

/**
 * Context View uses element factories to render providers' React
 * components. This gives Context View the ability to set the props (which
 * contains the currentDefinition) of each provider.
 */
// Unique ID of the provider (suggested: use the package name of the provider)
// display them in order