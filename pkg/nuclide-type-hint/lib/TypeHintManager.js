'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _analytics;

function _load_analytics() {
  return _analytics = _interopRequireDefault(require('../../../modules/nuclide-commons/analytics'));
}

var _getFragmentGrammar;

function _load_getFragmentGrammar() {
  return _getFragmentGrammar = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/getFragmentGrammar'));
}

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
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

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-type-hint');

class TypeHintManager {

  constructor() {
    this._typeHintProviders = [];
  }
  /**
   * This helps determine if we should show the type hint when toggling it via
   * command. The toggle command first negates this, and then if this is true
   * shows a type hint, otherwise it hides the current typehint.
   */


  async datatip(editor, position) {
    const grammar = editor.getGrammar();
    const { scopeName } = grammar;
    const [provider] = this._getMatchingProvidersForScopeName(scopeName);
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
    const typeHint = await (_analytics || _load_analytics()).default.trackTiming(name + '.typeHint', () => provider.typeHint(editor, position));
    // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
    if (!typeHint || this._marker || !typeHint.hint.length === 0) {
      return;
    }
    const { hint, range } = typeHint;
    // We track the timing above, but we still want to know the number of popups that are shown.
    (_analytics || _load_analytics()).default.track('type-hint-popup', {
      scope: scopeName,
      message: hint
    });

    const markedStrings = hint.map(h => {
      // Flow doesn't like it when I don't specify these as literals.
      if (h.type === 'snippet') {
        return {
          type: 'snippet',
          value: h.value,
          grammar: (0, (_getFragmentGrammar || _load_getFragmentGrammar()).default)(grammar)
        };
      } else {
        return { type: 'markdown', value: h.value };
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
    (0, (_collection || _load_collection()).arrayRemove)(this._typeHintProviders, provider);
  }
}
exports.default = TypeHintManager;