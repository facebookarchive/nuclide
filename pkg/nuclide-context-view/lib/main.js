'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeDefinitionProvider = consumeDefinitionProvider;
exports.provideNuclideContextView = provideNuclideContextView;
exports.getHomeFragments = getHomeFragments;
exports.deserializeContextViewPanelState = deserializeContextViewPanelState;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _ContextViewManager;

function _load_ContextViewManager() {
  return _ContextViewManager = require('./ContextViewManager');
}

var _atom = require('atom');

var _destroyItemWhere;

function _load_destroyItemWhere() {
  return _destroyItemWhere = require('nuclide-commons-atom/destroyItemWhere');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let manager = null; /**
                     * Copyright (c) 2015-present, Facebook, Inc.
                     * All rights reserved.
                     *
                     * This source code is licensed under the license found in the LICENSE file in
                     * the root directory of this source tree.
                     *
                     * 
                     * @format
                     */

let disposables;

function activate() {
  disposables = new _atom.CompositeDisposable(_registerCommandAndOpener());
}

function deactivate() {
  disposables.dispose();
  if (manager != null) {
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

function consumeDefinitionProvider(provider) {
  return getContextViewManager().consumeDefinitionProvider(provider);
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
        // eslint-disable-next-line nuclide-internal/atom-apis
        atom.workspace.open((_ContextViewManager || _load_ContextViewManager()).WORKSPACE_VIEW_URI, { searchAllPanes: true });
      }
    },
    priority: 2
  };
}

function deserializeContextViewPanelState() {
  return getContextViewManager();
}

function _registerCommandAndOpener() {
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.workspace.addOpener(uri => {
    if (uri === (_ContextViewManager || _load_ContextViewManager()).WORKSPACE_VIEW_URI) {
      return getContextViewManager();
    }
  }), () => (0, (_destroyItemWhere || _load_destroyItemWhere()).destroyItemWhere)(item => item instanceof (_ContextViewManager || _load_ContextViewManager()).ContextViewManager), atom.commands.add('atom-workspace', 'nuclide-context-view:toggle', () => {
    atom.workspace.toggle((_ContextViewManager || _load_ContextViewManager()).WORKSPACE_VIEW_URI);
  }));
}