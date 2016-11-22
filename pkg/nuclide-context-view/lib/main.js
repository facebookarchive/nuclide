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
exports.getHomeFragments = getHomeFragments;

var _ContextViewManager;

function _load_ContextViewManager() {
  return _ContextViewManager = require('./ContextViewManager');
}

var _atom = require('atom');

const INITIAL_PANEL_WIDTH = 300;
const INITIAL_PANEL_VISIBILITY = false;

let currentService = null;
let manager = null;
let disposables;
const initialViewState = {};

function activate() {
  let state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  initialViewState.width = state.width || INITIAL_PANEL_WIDTH;
  initialViewState.visible = state.visible || INITIAL_PANEL_VISIBILITY;
  disposables = new _atom.CompositeDisposable();
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
const Service = {
  registerProvider: function (provider) {
    if (!(provider != null)) {
      throw new Error('Cannot register null context provider');
    }

    const contextViewManager = getContextViewManager();
    contextViewManager.registerProvider(provider);
    return new _atom.Disposable(() => {
      contextViewManager.unregisterProvider(provider.id);
    });
  }
};

function consumeDefinitionService(service) {
  if (service !== currentService) {
    currentService = service;
    getContextViewManager().consumeDefinitionService(currentService);
  }
  return new _atom.Disposable(() => {
    currentService = null;
    if (manager != null) {
      manager.consumeDefinitionService(null);
    }
  });
}

function consumeToolBar(getToolBar) {
  const toolBar = getToolBar('nuclide-context-view');

  var _toolBar$addButton = toolBar.addButton({
    icon: 'info',
    callback: 'nuclide-context-view:toggle',
    tooltip: 'Toggle Context View',
    priority: 300
  });

  const element = _toolBar$addButton.element;

  element.classList.add('nuclide-context-view-toolbar-button');
  const disposable = new _atom.Disposable(() => {
    toolBar.removeItems();
  });
  disposables.add(disposable);
  return disposable;
}

function getDistractionFreeModeProvider() {
  return {
    name: 'nuclide-context-view',
    isVisible: function () {
      return manager != null && manager._isVisible;
    },
    toggle: function () {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-context-view:toggle');
    }
  };
}

function provideNuclideContextView() {
  return Service;
}

function getHomeFragments() {
  return {
    feature: {
      title: 'Context View',
      icon: 'info',
      description: 'Easily navigate between symbols and their definitions in your code',
      command: () => {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-context-view:toggle', { visible: true });
      }
    },
    priority: 2
  };
}