'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)(); /**
                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                              * All rights reserved.
                                                                              *
                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                              * the root directory of this source tree.
                                                                              *
                                                                              * 
                                                                              */

class TypeHintManager {

  constructor() {
    this._typeHintProviders = [];
  }
  /**
   * This helps determine if we should show the type hint when toggling it via
   * command. The toggle command first negates this, and then if this is true
   * shows a type hint, otherwise it hides the current typehint.
   */


  datatip(editor, position) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const grammar = editor.getGrammar();
      const { scopeName } = grammar;
      const [provider] = _this._getMatchingProvidersForScopeName(scopeName);
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
      const typeHint = yield (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(name + '.typeHint', function () {
        return provider.typeHint(editor, position);
      });
      if (!typeHint || _this._marker) {
        return;
      }
      const { hint, range } = typeHint;
      // We track the timing above, but we still want to know the number of popups that are shown.
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('type-hint-popup', {
        scope: scopeName,
        message: hint
      });
      return {
        markedStrings: [{ type: 'snippet', value: hint, grammar }],
        range
      };
    })();
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