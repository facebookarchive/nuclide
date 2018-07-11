"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeDefinitionProvider = consumeDefinitionProvider;
exports.provideNuclideContextView = provideNuclideContextView;
exports.getHomeFragments = getHomeFragments;
exports.deserializeContextViewPanelState = deserializeContextViewPanelState;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _ContextViewManager() {
  const data = require("./ContextViewManager");

  _ContextViewManager = function () {
    return data;
  };

  return data;
}

function _destroyItemWhere() {
  const data = require("../../../modules/nuclide-commons-atom/destroyItemWhere");

  _destroyItemWhere = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
let manager = null;
let disposables;

function activate() {
  disposables = new (_UniversalDisposable().default)(_registerCommandAndOpener());
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
    manager = new (_ContextViewManager().ContextViewManager)();
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
    return new (_UniversalDisposable().default)(() => {
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
        atom.workspace.open(_ContextViewManager().WORKSPACE_VIEW_URI, {
          searchAllPanes: true
        });
      }
    },
    priority: 2
  };
}

function deserializeContextViewPanelState() {
  return getContextViewManager();
}

function _registerCommandAndOpener() {
  return new (_UniversalDisposable().default)(atom.workspace.addOpener(uri => {
    if (uri === _ContextViewManager().WORKSPACE_VIEW_URI) {
      return getContextViewManager();
    }
  }), () => (0, _destroyItemWhere().destroyItemWhere)(item => item instanceof _ContextViewManager().ContextViewManager), atom.commands.add('atom-workspace', 'nuclide-context-view:toggle', () => {
    atom.workspace.toggle(_ContextViewManager().WORKSPACE_VIEW_URI);
  }));
}