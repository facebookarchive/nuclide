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

/**
 * Calls the given functions and returns the first non-null return value.
 */

var findTruthyReturnValue = _asyncToGenerator(function* (fns) {
  /* eslint-disable babel/no-await-in-loop */
  for (var fn of fns) {
    var result = typeof fn === 'function' ? (yield fn()) : null;
    if (result) {
      return result;
    }
  }
  /* eslint-enable babel/no-await-in-loop */
}

/**
 * Construct this object to enable Hyperclick in the Atom workspace.
 * Call `dispose` to disable the feature.
 */
);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _HyperclickForTextEditor2;

function _HyperclickForTextEditor() {
  return _HyperclickForTextEditor2 = _interopRequireDefault(require('./HyperclickForTextEditor'));
}

var _SuggestionList2;

function _SuggestionList() {
  return _SuggestionList2 = _interopRequireDefault(require('./SuggestionList'));
}

var _SuggestionListElement2;

function _SuggestionListElement() {
  return _SuggestionListElement2 = _interopRequireDefault(require('./SuggestionListElement'));
}

var _hyperclickUtils2;

function _hyperclickUtils() {
  return _hyperclickUtils2 = require('./hyperclick-utils');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var Hyperclick = (function () {
  function Hyperclick() {
    _classCallCheck(this, Hyperclick);

    this._consumedProviders = [];

    this._suggestionList = new (_SuggestionList2 || _SuggestionList()).default();
    this._suggestionListViewSubscription = atom.views.addViewProvider((_SuggestionList2 || _SuggestionList()).default, function (model) {
      return new (_SuggestionListElement2 || _SuggestionListElement()).default().initialize(model);
    });

    this._hyperclickForTextEditors = new Set();
    this._textEditorSubscription = atom.workspace.observeTextEditors(this.observeTextEditor.bind(this));
  }

  /** Returns the provider name or a default value */

  _createClass(Hyperclick, [{
    key: 'observeTextEditor',
    value: function observeTextEditor(textEditor) {
      var _this = this;

      var hyperclickForTextEditor = new (_HyperclickForTextEditor2 || _HyperclickForTextEditor()).default(textEditor, this);
      this._hyperclickForTextEditors.add(hyperclickForTextEditor);
      textEditor.onDidDestroy(function () {
        hyperclickForTextEditor.dispose();
        _this._hyperclickForTextEditors.delete(hyperclickForTextEditor);
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._suggestionListViewSubscription) {
        this._suggestionListViewSubscription.dispose();
      }
      if (this._textEditorSubscription) {
        this._textEditorSubscription.dispose();
      }
      this._hyperclickForTextEditors.forEach(function (hyperclick) {
        return hyperclick.dispose();
      });
      this._hyperclickForTextEditors.clear();
    }
  }, {
    key: '_applyToAll',
    value: function _applyToAll(item, f) {
      if (Array.isArray(item)) {
        item.forEach(function (x) {
          return f(x);
        });
      } else {
        f(item);
      }
    }
  }, {
    key: 'consumeProvider',
    value: function consumeProvider(provider) {
      var _this2 = this;

      this._applyToAll(provider, function (singleProvider) {
        return _this2._consumeSingleProvider(singleProvider);
      });
    }
  }, {
    key: 'removeProvider',
    value: function removeProvider(provider) {
      var _this3 = this;

      this._applyToAll(provider, function (singleProvider) {
        return _this3._removeSingleProvider(singleProvider);
      });
    }
  }, {
    key: '_consumeSingleProvider',
    value: function _consumeSingleProvider(provider) {
      var priority = provider.priority || 0;
      for (var i = 0, len = this._consumedProviders.length; i < len; i++) {
        var item = this._consumedProviders[i];
        if (provider === item) {
          return;
        }

        var itemPriority = item.priority || 0;
        if (priority > itemPriority) {
          this._consumedProviders.splice(i, 0, provider);
          return;
        }
      }

      // If we made it all the way through the loop, provider must be lower
      // priority than all of the existing providers, so add it to the end.
      this._consumedProviders.push(provider);
    }
  }, {
    key: '_removeSingleProvider',
    value: function _removeSingleProvider(provider) {
      var index = this._consumedProviders.indexOf(provider);
      if (index >= 0) {
        this._consumedProviders.splice(index, 1);
      }
    }

    /**
     * Returns the first suggestion from the consumed providers.
     */
  }, {
    key: 'getSuggestion',
    value: function getSuggestion(textEditor, position) {
      // Get the default word RegExp for this editor.
      var defaultWordRegExp = (0, (_hyperclickUtils2 || _hyperclickUtils()).defaultWordRegExpForEditor)(textEditor);

      return findTruthyReturnValue(this._consumedProviders.map(function (provider) {
        if (provider.getSuggestion) {
          var _ret = (function () {
            var getSuggestion = provider.getSuggestion.bind(provider);
            return {
              v: function () {
                return (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackOperationTiming)(getProviderName(provider) + '.getSuggestion', function () {
                  return getSuggestion(textEditor, position);
                });
              }
            };
          })();

          if (typeof _ret === 'object') return _ret.v;
        } else if (provider.getSuggestionForWord) {
          var _ret2 = (function () {
            var getSuggestionForWord = provider.getSuggestionForWord.bind(provider);
            return {
              v: function () {
                var wordRegExp = provider.wordRegExp || defaultWordRegExp;

                var _ref = (0, (_hyperclickUtils2 || _hyperclickUtils()).getWordTextAndRange)(textEditor, position, wordRegExp);

                var text = _ref.text;
                var range = _ref.range;

                return (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackOperationTiming)(getProviderName(provider) + '.getSuggestionForWord', function () {
                  return getSuggestionForWord(textEditor, text, range);
                });
              }
            };
          })();

          if (typeof _ret2 === 'object') return _ret2.v;
        }

        throw new Error('Hyperclick must have either `getSuggestion` or `getSuggestionForWord`');
      }));
    }
  }, {
    key: 'showSuggestionList',
    value: function showSuggestionList(textEditor, suggestion) {
      this._suggestionList.show(textEditor, suggestion);
    }
  }]);

  return Hyperclick;
})();

exports.default = Hyperclick;
function getProviderName(provider) {
  if (provider.providerName != null) {
    return provider.providerName;
  } else {
    return 'unnamed-hyperclick-provider';
  }
}
module.exports = exports.default;