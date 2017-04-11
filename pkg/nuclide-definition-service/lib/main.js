'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Service = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeDefinitionProvider = consumeDefinitionProvider;
exports.provideDefinitionService = provideDefinitionService;

var _atom = require('atom');

var _ProviderRegistry;

function _load_ProviderRegistry() {
  return _ProviderRegistry = _interopRequireDefault(require('../../commons-atom/ProviderRegistry'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Provides definitions given a file & position.
// Relies on per-language(grammar) providers to provide results.


// Provides definitions for a set of language grammars.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class Service {

  constructor() {
    this._providers = new (_ProviderRegistry || _load_ProviderRegistry()).default();
  }

  dispose() {}

  getDefinition(editor, position) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const provider = _this._providers.getProviderForEditor(editor);
      return provider == null ? null : provider.getDefinition(editor, position);
    })();
  }

  consumeDefinitionProvider(provider) {
    this._providers.addProvider(provider);
    return new _atom.Disposable(() => {
      this._providers.removeProvider(provider);
    });
  }
}

exports.Service = Service;
let activation = null;

function activate() {
  if (activation == null) {
    activation = new Service();
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function consumeDefinitionProvider(provider) {
  if (!(activation != null)) {
    throw new Error('Invariant violation: "activation != null"');
  }

  return activation.consumeDefinitionProvider(provider);
}

function provideDefinitionService() {
  if (!(activation != null)) {
    throw new Error('Invariant violation: "activation != null"');
  }

  return {
    getDefinition: activation.getDefinition.bind(activation)
  };
}