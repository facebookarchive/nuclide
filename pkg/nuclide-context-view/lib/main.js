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

exports.activate = activate;
exports.deactivate = deactivate;
exports.serialize = serialize;

/** Returns the singleton ContextViewManager instance of this package, or null
 * if the user doesn't pass the Context View GK check. */

var getContextViewManager = _asyncToGenerator(function* () {
  if (!(yield (0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).default)(CONTEXT_VIEW_GK))) {
    return null;
  }
  if (manager == null) {
    manager = new (_ContextViewManager2 || _ContextViewManager()).ContextViewManager(initialViewState.width, initialViewState.visible);
  }
  return manager;
});

var toggleContextView = _asyncToGenerator(function* () {
  var contextViewManager = yield getContextViewManager();
  if (contextViewManager != null) {
    contextViewManager.toggle();
  }
});

exports.toggleContextView = toggleContextView;

var showContextView = _asyncToGenerator(function* () {
  var contextViewManager = yield getContextViewManager();
  if (contextViewManager != null) {
    contextViewManager.show();
  }
});

exports.showContextView = showContextView;

var hideContextView = _asyncToGenerator(function* () {
  var contextViewManager = yield getContextViewManager();
  if (contextViewManager != null) {
    contextViewManager.hide();
  }
}

/**
 * This is the context view service that other Nuclide packages consume when they
 * want to provide context for a definition. A context provider must consume the
 * nuclide-context-view service and register themselves as a provider.
 */
);

exports.hideContextView = hideContextView;
exports.consumeDefinitionService = consumeDefinitionService;

var consumeToolBar = _asyncToGenerator(function* (getToolBar) {
  var contextViewManager = yield getContextViewManager();
  if (contextViewManager != null) {
    var _ret = (function () {
      var toolBar = getToolBar('nuclide-context-view');

      var _toolBar$addButton = toolBar.addButton({
        icon: 'info',
        callback: 'nuclide-context-view:toggle',
        tooltip: 'Toggle Context View'
      });

      var element = _toolBar$addButton.element;

      element.classList.add('nuclide-context-view-toolbar-button');
      var disposable = new (_atom2 || _atom()).Disposable(function () {
        toolBar.removeItems();
      });
      disposables.add(disposable);
      return {
        v: disposable
      };
    })();

    if (typeof _ret === 'object') return _ret.v;
  }
  return new (_atom2 || _atom()).Disposable();
});

exports.consumeToolBar = consumeToolBar;
exports.getDistractionFreeModeProvider = getDistractionFreeModeProvider;
exports.provideNuclideContextView = provideNuclideContextView;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ContextViewManager2;

function _ContextViewManager() {
  return _ContextViewManager2 = require('./ContextViewManager');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsNodePassesGK2;

function _commonsNodePassesGK() {
  return _commonsNodePassesGK2 = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var INITIAL_PANEL_WIDTH = 300;
var INITIAL_PANEL_VISIBILITY = false;
var CONTEXT_VIEW_GK = 'nuclide_context_view';

var currentService = null;
var manager = null;
var disposables = undefined;
var initialViewState = {};

function activate() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  initialViewState.width = state.width || INITIAL_PANEL_WIDTH;
  initialViewState.visible = state.visible || INITIAL_PANEL_VISIBILITY;
  disposables = new (_atom2 || _atom()).CompositeDisposable();
  // Toggle
  disposables.add(atom.commands.add('atom-workspace', 'nuclide-context-view:toggle', this.toggleContextView.bind(this)));

  // Show
  disposables.add(atom.commands.add('atom-workspace', 'nuclide-context-view:show', this.showContextView.bind(this)));

  // Hide
  disposables.add(atom.commands.add('atom-workspace', 'nuclide-context-view:hide', this.hideContextView.bind(this)));
}

function deactivate() {
  currentService = null;
  disposables.dispose();
  if (manager != null) {
    manager.consumeDefinitionService(null);
    manager.dispose();
    manager = null;
  }
}

function serialize() {
  if (manager != null) {
    return manager.serialize();
  }
}

var Service = {
  registerProvider: _asyncToGenerator(function* (provider) {
    (0, (_assert2 || _assert()).default)(provider != null, 'Cannot register null context provider');
    var contextViewManager = yield getContextViewManager();
    if (contextViewManager == null) {
      return new (_atom2 || _atom()).Disposable();
    }
    contextViewManager.registerProvider(provider);
    return new (_atom2 || _atom()).Disposable(function () {
      contextViewManager.unregisterProvider(provider.id);
    });
  })
};

function consumeDefinitionService(service) {
  getContextViewManager().then(function (contextViewManager) {
    if (contextViewManager == null) {
      return;
    }
    if (service !== currentService) {
      currentService = service;
      contextViewManager.consumeDefinitionService(currentService);
    }
  });
  return new (_atom2 || _atom()).Disposable(function () {
    currentService = null;
    if (manager != null) {
      manager.consumeDefinitionService(null);
    }
  });
}

function getDistractionFreeModeProvider() {
  return {
    name: 'nuclide-context-view',
    isVisible: function isVisible() {
      // IMPORTANT: The `manager != null && manager._isVisible check is an antipattern.
      // Since distraction free mode requires a *synchronous* isVisible, this
      // checks manager != null rather than using the GK-safe but async getContextViewManager().
      // If you're modifying nuclide-context-view, use async getContextViewManager() unless
      // you have a really good reason to directly reference `manager`.
      return manager != null && manager._isVisible;
    },
    toggle: function toggle() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-context-view:toggle');
    }
  };
}

function provideNuclideContextView() {
  return Service;
}