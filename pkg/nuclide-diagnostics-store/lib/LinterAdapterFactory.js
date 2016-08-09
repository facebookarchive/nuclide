
// Flow didn't like it when I tried import type here. This shouldn't affect
// performance though, since LinterAdapter requires this anyway.

var _nuclideDiagnosticsProviderBase2;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _nuclideDiagnosticsProviderBase() {
  return _nuclideDiagnosticsProviderBase2 = require('../../nuclide-diagnostics-provider-base');
}

var _LinterAdapter2;

function _LinterAdapter() {
  return _LinterAdapter2 = require('./LinterAdapter');
}

function createSingleAdapter(provider, ProviderBase) {
  if (provider.disabledForNuclide) {
    return;
  }
  var validationErrors = validateLinter(provider);
  if (validationErrors.length === 0) {
    return new (_LinterAdapter2 || _LinterAdapter()).LinterAdapter(provider, ProviderBase);
  } else {
    var nameString = provider && provider.providerName ? ' (' + provider.providerName + ')' : '';
    var message = 'nuclide-diagnostics-store found problems with a linter' + nameString + '. ' + 'Diagnostic messages from that linter will be unavailable.\n';
    message += validationErrors.map(function (error) {
      return '- ' + error + '\n';
    }).join('');
    atom.notifications.addError(message, { dismissable: true });
    return null;
  }
}

function addSingleAdapter(adapters, provider, ProviderBase) {
  var adapter = createSingleAdapter(provider);
  if (adapter) {
    adapters.add(adapter);
  }
}

function createAdapters(providers, ProviderBase) {
  var adapters = new Set();
  if (Array.isArray(providers)) {
    for (var provider of providers) {
      addSingleAdapter(adapters, provider);
    }
  } else {
    addSingleAdapter(adapters, providers);
  }
  return adapters;
}

function validateLinter(provider) {
  var errors = [];
  validate(provider, 'Must not be undefined', errors);

  if (errors.length === 0) {
    validate(provider.grammarScopes, 'Must specify grammarScopes', errors);
    validate(Array.isArray(provider.grammarScopes), 'grammarScopes must be an Array', errors);
    if (errors.length === 0) {
      for (var grammar of provider.grammarScopes) {
        validate(typeof grammar === 'string', 'Each grammarScope entry must be a string: ' + grammar, errors);
      }
    }

    validate(provider.scope === 'file' || provider.scope === 'project', 'Scope must be \'file\' or \'project\'; found \'' + provider.scope + '\'', errors);

    if (provider.scope === 'project') {
      validate(!provider.lintOnFly, "lintOnFly must be false for a linter with 'project' scope", errors);
    }

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

module.exports = { createAdapters: createAdapters, validateLinter: validateLinter };