"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _analytics() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/analytics"));

  _analytics = function () {
    return data;
  };

  return data;
}

function _getFragmentGrammar() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/getFragmentGrammar"));

  _getFragmentGrammar = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
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
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('nuclide-type-hint');

class TypeHintManager {
  /**
   * This helps determine if we should show the type hint when toggling it via
   * command. The toggle command first negates this, and then if this is true
   * shows a type hint, otherwise it hides the current typehint.
   */
  constructor() {
    this._typeHintProviders = [];
  }

  async datatip(editor, position) {
    const grammar = editor.getGrammar();
    const {
      scopeName
    } = grammar;

    const matchingProviders = this._getMatchingProvidersForScopeName(scopeName);

    return (0, _promise().asyncFind)(matchingProviders.map(provider => this._getDatatipFromProvider(editor, position, grammar, provider)), x => x);
  }

  async _getDatatipFromProvider(editor, position, grammar, provider) {
    if (provider == null) {
      return null;
    }

    let name;

    if (provider.providerName != null) {
      name = provider.providerName;
    } else {
      name = 'unknown';
      logger.error('Type hint provider has no name', provider);
    }

    const typeHint = await _analytics().default.trackTiming(name + '.typeHint', () => provider.typeHint(editor, position)); // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)

    if (!typeHint || this._marker || !typeHint.hint.length === 0) {
      return;
    }

    const {
      hint,
      range
    } = typeHint;
    const {
      scopeName
    } = grammar; // We track the timing above, but we still want to know the number of popups that are shown.

    _analytics().default.track('type-hint-popup', {
      scope: scopeName,
      message: hint
    });

    const markedStrings = hint.filter(h => {
      // Ignore all results of length 0. Maybe the next provider will do better?
      return h.value.length > 0;
    }).map(h => {
      // Flow doesn't like it when I don't specify these as literals.
      if (h.type === 'snippet') {
        return {
          type: 'snippet',
          value: h.value,
          grammar: (0, _getFragmentGrammar().default)(grammar)
        };
      } else {
        return {
          type: 'markdown',
          value: h.value
        };
      }
    });

    if (markedStrings.length === 0) {
      return null;
    }

    return {
      markedStrings,
      range
    };
  }

  _getMatchingProvidersForScopeName(scopeName) {
    return this._typeHintProviders.filter(provider => {
      const providerGrammars = provider.selector.split(/, ?/);
      return provider.inclusionPriority > 0 && providerGrammars.indexOf(scopeName) !== -1;
    }).sort((providerA, providerB) => {
      return providerA.inclusionPriority - providerB.inclusionPriority;
    });
  }

  addProvider(provider) {
    this._typeHintProviders.push(provider);
  }

  removeProvider(provider) {
    (0, _collection().arrayRemove)(this._typeHintProviders, provider);
  }

}

exports.default = TypeHintManager;