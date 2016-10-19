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
exports.toggleContextView = toggleContextView;
exports.showContextView = showContextView;
exports.hideContextView = hideContextView;
exports.consumeDefinitionService = consumeDefinitionService;
exports.consumeToolBar = consumeToolBar;
exports.getDistractionFreeModeProvider = getDistractionFreeModeProvider;
exports.provideNuclideContextView = provideNuclideContextView;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ContextViewManager;

function _load_ContextViewManager() {
  return _ContextViewManager = require('./ContextViewManager');
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var INITIAL_PANEL_WIDTH = 300;
var INITIAL_PANEL_VISIBILITY = false;

var currentService = null;
var manager = null;
var disposables = undefined;
var initialViewState = {};

function activate() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  initialViewState.width = state.width || INITIAL_PANEL_WIDTH;
  initialViewState.visible = state.visible || INITIAL_PANEL_VISIBILITY;
  disposables = new (_atom || _load_atom()).CompositeDisposable();
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

/** Returns the singleton ContextViewManager instance of this package, or null
 * if the user doesn't pass the Context View GK check. */
function getContextViewManager() {
  if (manager == null) {
    manager = new (_ContextViewManager || _load_ContextViewManager()).ContextViewManager(initialViewState.width, initialViewState.visible);
  }
  return manager;
}

function toggleContextView() {
  getContextViewManager().toggle();
}

function showContextView() {
  getContextViewManager().show();
}

function hideContextView() {
  getContextViewManager().hide();
}

/**
 * This is the context view service that other Nuclide packages consume when they
 * want to provide context for a definition. A context provider must consume the
 * nuclide-context-view service and register themselves as a provider.
 */
var Service = {
  registerProvider: function registerProvider(provider) {
    (0, (_assert || _load_assert()).default)(provider != null, 'Cannot register null context provider');
    var contextViewManager = getContextViewManager();
    contextViewManager.registerProvider(provider);
    return new (_atom || _load_atom()).Disposable(function () {
      contextViewManager.unregisterProvider(provider.id);
    });
  }
};

function consumeDefinitionService(service) {
  if (service !== currentService) {
    currentService = service;
    getContextViewManager().consumeDefinitionService(currentService);
  }
  return new (_atom || _load_atom()).Disposable(function () {
    currentService = null;
    if (manager != null) {
      manager.consumeDefinitionService(null);
    }
  });
}

function consumeToolBar(getToolBar) {
  var toolBar = getToolBar('nuclide-context-view');

  var _toolBar$addButton = toolBar.addButton({
    icon: 'info',
    callback: 'nuclide-context-view:toggle',
    tooltip: 'Toggle Context View',
    priority: 300
  });

  var element = _toolBar$addButton.element;

  element.classList.add('nuclide-context-view-toolbar-button');
  var disposable = new (_atom || _load_atom()).Disposable(function () {
    toolBar.removeItems();
  });
  disposables.add(disposable);
  return disposable;
}

function getDistractionFreeModeProvider() {
  return {
    name: 'nuclide-context-view',
    isVisible: function isVisible() {
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