'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAdapters = createAdapters;
exports.validateLinter = validateLinter;

var _nuclideDiagnosticsProviderBase;

function _load_nuclideDiagnosticsProviderBase() {
  return _nuclideDiagnosticsProviderBase = require('../../nuclide-diagnostics-provider-base');
}

var _LinterAdapter;

function _load_LinterAdapter() {
  return _LinterAdapter = require('./LinterAdapter');
}

// Flow didn't like it when I tried import type here. This shouldn't affect
// performance though, since LinterAdapter requires this anyway.
function createSingleAdapter(provider, ProviderBase) {
  if (provider.disabledForNuclide) {
    return;
  }
  const validationErrors = validateLinter(provider);
  if (validationErrors.length === 0) {
    return new (_LinterAdapter || _load_LinterAdapter()).LinterAdapter(provider, ProviderBase);
  } else {
    const nameString = provider && provider.providerName ? ` (${provider.providerName})` : '';
    let message = `nuclide-diagnostics-store found problems with a linter${nameString}. ` + 'Diagnostic messages from that linter will be unavailable.\n';
    message += validationErrors.map(error => `- ${error}\n`).join('');
    atom.notifications.addError(message, { dismissable: true });
    return null;
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

function addSingleAdapter(adapters, provider, ProviderBase) {
  const adapter = createSingleAdapter(provider);
  if (adapter) {
    adapters.add(adapter);
  }
}

function createAdapters(providers, ProviderBase) {
  const adapters = new Set();
  if (Array.isArray(providers)) {
    for (const provider of providers) {
      addSingleAdapter(adapters, provider);
    }
  } else {
    addSingleAdapter(adapters, providers);
  }
  return adapters;
}

function validateLinter(provider) {
  const errors = [];
  validate(provider, 'Must not be undefined', errors);

  if (errors.length === 0) {
    validate(provider.grammarScopes, 'Must specify grammarScopes', errors);
    validate(Array.isArray(provider.grammarScopes), 'grammarScopes must be an Array', errors);
    if (errors.length === 0) {
      for (const grammar of provider.grammarScopes) {
        validate(typeof grammar === 'string', `Each grammarScope entry must be a string: ${grammar}`, errors);
      }
    }

    validate(provider.scope === 'file' || provider.scope === 'project', `Scope must be 'file' or 'project'; found '${provider.scope}'`, errors);

    validate(provider.lint, 'lint function must be specified', errors);
    validate(typeof provider.lint === 'function', 'lint must be a function', errors);

    if (provider.providerName) {
      validate(typeof provider.providerName === 'string', 'providerName must be a string', errors);
    }
  }

  return errors;
}

function validate(condition, msg, errors) {
  if (!condition) {
    errors.push(msg);
  }
}