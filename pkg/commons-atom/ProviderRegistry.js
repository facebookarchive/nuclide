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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ProviderRegistry = (function () {
  function ProviderRegistry() {
    _classCallCheck(this, ProviderRegistry);

    this._providers = new Set();
  }

  _createClass(ProviderRegistry, [{
    key: 'addProvider',
    value: function addProvider(provider) {
      this._providers.add(provider);
    }
  }, {
    key: 'removeProvider',
    value: function removeProvider(provider) {
      this._providers.delete(provider);
    }
  }, {
    key: 'getProviderForEditor',
    value: function getProviderForEditor(editor) {
      var grammar = editor.getGrammar().scopeName;
      return this.findProvider(grammar);
    }
  }, {
    key: 'findProvider',
    value: function findProvider(grammar) {
      var bestProvider = null;
      var bestPriority = Number.NEGATIVE_INFINITY;
      for (var provider of this._providers) {
        if (provider.grammarScopes.indexOf(grammar) !== -1) {
          if (provider.priority > bestPriority) {
            bestProvider = provider;
            bestPriority = provider.priority;
          }
        }
      }
      return bestProvider;
    }
  }]);

  return ProviderRegistry;
})();

exports.default = ProviderRegistry;
module.exports = exports.default;