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
exports.consumeDefinitionService = consumeDefinitionService;
exports.provideNuclideContextView = provideNuclideContextView;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ContextViewManager2;

function _ContextViewManager() {
  return _ContextViewManager2 = require('./ContextViewManager');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var INITIAL_PANEL_WIDTH = 300;
var INITIAL_PANEL_VISIBILITY = false;

var currentService = null;
var manager = null;

function activate() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  if (manager === null) {
    manager = new (_ContextViewManager2 || _ContextViewManager()).ContextViewManager(state.width || INITIAL_PANEL_WIDTH, state.visible || INITIAL_PANEL_VISIBILITY);
  }
}

function deactivate() {
  if (manager != null) {
    manager.dispose();
    manager = null;
  }
}

function serialize() {
  if (manager != null) {
    return manager.serialize();
  }
}

function updateService() {
  if (manager != null) {
    manager.consumeDefinitionService(currentService);
  }
}

/**
 * This is the context view service that other Nuclide packages consume when they
 * want to provide context for a definition. A context provider must consume the
 * nuclide-context-view service and register themselves as a provider.
 */
var Service = {
  registerProvider: function registerProvider(provider) {
    (0, (_assert2 || _assert()).default)(manager != null, 'Cannot register context provider with null ContextViewManager');
    (0, (_assert2 || _assert()).default)(provider != null, 'Cannot register null context provider');
    manager.registerProvider(provider);
  },
  deregisterProvider: function deregisterProvider(providerId) {
    (0, (_assert2 || _assert()).default)(manager != null, 'Cannot deregister context provider from null ContextViewManager');
    (0, (_assert2 || _assert()).default)(providerId != null || providerId === '', 'Cannot deregister context provider given null/empty providerId');
    manager.deregisterProvider(providerId);
  }
};

function consumeDefinitionService(service) {
  (0, (_assert2 || _assert()).default)(currentService == null);
  currentService = service;
  updateService();
  return new (_atom2 || _atom()).Disposable(function () {
    (0, (_assert2 || _assert()).default)(currentService === service);
    currentService = null;
    updateService();
  });
}

function provideNuclideContextView() {
  return Service;
}