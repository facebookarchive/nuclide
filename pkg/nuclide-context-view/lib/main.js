'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeDefinitionService = consumeDefinitionService;
exports.consumeToolBar = consumeToolBar;
exports.provideNuclideContextView = provideNuclideContextView;
exports.getHomeFragments = getHomeFragments;
exports.deserializeContextViewPanelState = deserializeContextViewPanelState;
exports.consumeWorkspaceViewsService = consumeWorkspaceViewsService;

var _ContextViewManager;

function _load_ContextViewManager() {
  return _ContextViewManager = require('./ContextViewManager');
}

var _atom = require('atom');

let currentService = null; /**
                            * Copyright (c) 2015-present, Facebook, Inc.
                            * All rights reserved.
                            *
                            * This source code is licensed under the license found in the LICENSE file in
                            * the root directory of this source tree.
                            *
                            * 
                            */

let manager = null;
let disposables;

function activate() {
  disposables = new _atom.CompositeDisposable();
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

/** Returns the singleton ContextViewManager instance of this package, or null
 * if the user doesn't pass the Context View GK check. */
function getContextViewManager() {
  if (manager == null) {
    manager = new (_ContextViewManager || _load_ContextViewManager()).ContextViewManager();
  }
  return manager;
}

/**
 * This is the context view service that other Nuclide packages consume when they
 * want to provide context for a definition. A context provider must consume the
 * nuclide-context-view service and register themselves as a provider.
 */
const Service = {
  registerProvider(provider) {
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
  const { element } = toolBar.addButton({
    icon: 'info',
    callback: 'nuclide-context-view:toggle',
    tooltip: 'Toggle Context View',
    priority: 300
  });
  element.classList.add('nuclide-context-view-toolbar-button');
  const disposable = new _atom.Disposable(() => {
    toolBar.removeItems();
  });
  disposables.add(disposable);
  return disposable;
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

function deserializeContextViewPanelState() {
  return getContextViewManager();
}

function consumeWorkspaceViewsService(api) {
  disposables.add(api.addOpener(uri => {
    if (uri === (_ContextViewManager || _load_ContextViewManager()).WORKSPACE_VIEW_URI) {
      return getContextViewManager();
    }
  }), new _atom.Disposable(() => api.destroyWhere(item => item instanceof (_ContextViewManager || _load_ContextViewManager()).ContextViewManager)), atom.commands.add('atom-workspace', 'nuclide-context-view:toggle', event => {
    api.toggle((_ContextViewManager || _load_ContextViewManager()).WORKSPACE_VIEW_URI, event.detail);
  }));
}