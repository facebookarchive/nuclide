var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _TypeHintComponent2;

function _TypeHintComponent() {
  return _TypeHintComponent2 = require('./TypeHintComponent');
}

var TypeHintManager = (function () {
  function TypeHintManager() {
    _classCallCheck(this, TypeHintManager);

    this._typeHintProviders = [];
  }

  _createClass(TypeHintManager, [{
    key: 'datatip',
    value: _asyncToGenerator(function* (editor, position) {
      var grammar = editor.getGrammar();
      var scopeName = grammar.scopeName;

      var _getMatchingProvidersForScopeName2 = this._getMatchingProvidersForScopeName(scopeName);

      var _getMatchingProvidersForScopeName22 = _slicedToArray(_getMatchingProvidersForScopeName2, 1);

      var provider = _getMatchingProvidersForScopeName22[0];

      if (provider == null) {
        return null;
      }
      var name = undefined;
      if (provider.providerName != null) {
        name = provider.providerName;
      } else {
        name = 'unknown';
        var logger = require('../../nuclide-logging').getLogger();
        logger.error('Type hint provider has no name', provider);
      }
      var typeHint = yield (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackOperationTiming)(name + '.typeHint', function () {
        return provider.typeHint(editor, position);
      });
      if (!typeHint || this._marker) {
        return;
      }
      var hint = typeHint.hint;
      var hintTree = typeHint.hintTree;
      var range = typeHint.range;

      // For now, actual hint text is required.
      (0, (_assert2 || _assert()).default)(hint != null);
      // We track the timing above, but we still want to know the number of popups that are shown.
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('type-hint-popup', {
        scope: scopeName,
        message: hint
      });
      return {
        component: (0, (_TypeHintComponent2 || _TypeHintComponent()).makeTypeHintComponent)(hintTree || hint, grammar),
        range: range
      };
    })
  }, {
    key: '_getMatchingProvidersForScopeName',
    value: function _getMatchingProvidersForScopeName(scopeName) {
      return this._typeHintProviders.filter(function (provider) {
        var providerGrammars = provider.selector.split(/, ?/);
        return provider.inclusionPriority > 0 && providerGrammars.indexOf(scopeName) !== -1;
      }).sort(function (providerA, providerB) {
        return providerA.inclusionPriority - providerB.inclusionPriority;
      });
    }
  }, {
    key: 'addProvider',
    value: function addProvider(provider) {
      this._typeHintProviders.push(provider);
    }
  }, {
    key: 'removeProvider',
    value: function removeProvider(provider) {
      (0, (_commonsNodeCollection2 || _commonsNodeCollection()).arrayRemove)(this._typeHintProviders, provider);
    }
  }]);

  return TypeHintManager;
})();

module.exports = TypeHintManager;

/**
 * This helps determine if we should show the type hint when toggling it via
 * command. The toggle command first negates this, and then if this is true
 * shows a type hint, otherwise it hides the current typehint.
 */