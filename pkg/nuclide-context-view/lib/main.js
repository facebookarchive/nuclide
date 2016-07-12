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
}

/**
 * This is the context view service that other Nuclide packages consume when they
 * want to provide context for a definition. A context provider must consume the
 * nuclide-context-view service and register themselves as a provider.
 */
);

exports.consumeDefinitionService = consumeDefinitionService;
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
var initialViewState = {};

function activate() {
  var activationState = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  initialViewState.width = activationState.width || INITIAL_PANEL_WIDTH;
  initialViewState.visible = activationState.visible || INITIAL_PANEL_VISIBILITY;
}

function deactivate() {
  currentService = null;
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
      contextViewManager.deregisterProvider(provider.id);
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

function provideNuclideContextView() {
  return Service;
}