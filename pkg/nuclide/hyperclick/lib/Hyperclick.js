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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _HyperclickForTextEditor = require('./HyperclickForTextEditor');

var _HyperclickForTextEditor2 = _interopRequireDefault(_HyperclickForTextEditor);

var _SuggestionList = require('./SuggestionList');

var _SuggestionList2 = _interopRequireDefault(_SuggestionList);

var _SuggestionListElement = require('./SuggestionListElement');

var _SuggestionListElement2 = _interopRequireDefault(_SuggestionListElement);

var _getWordTextAndRange2 = require('./get-word-text-and-range');

var _getWordTextAndRange3 = _interopRequireDefault(_getWordTextAndRange2);

var _hyperclickUtils = require('./hyperclick-utils');

var _commons = require('../../commons');

var _analytics = require('../../analytics');

var Hyperclick = (function () {
  function Hyperclick() {
    _classCallCheck(this, Hyperclick);

    this._consumedProviders = [];

    this._suggestionList = new _SuggestionList2['default']();
    this._suggestionListViewSubscription = atom.views.addViewProvider(_SuggestionList2['default'], function (model) {
      return new _SuggestionListElement2['default']().initialize(model);
    });

    this._hyperclickForTextEditors = new Set();
    this._textEditorSubscription = atom.workspace.observeTextEditors(this.observeTextEditor.bind(this));
  }

  _createClass(Hyperclick, [{
    key: 'observeTextEditor',
    value: function observeTextEditor(textEditor) {
      var _this = this;

      var hyperclickForTextEditor = new _HyperclickForTextEditor2['default'](textEditor, this);
      this._hyperclickForTextEditors.add(hyperclickForTextEditor);
      textEditor.onDidDestroy(function () {
        hyperclickForTextEditor.dispose();
        _this._hyperclickForTextEditors['delete'](hyperclickForTextEditor);
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
      _commons.array.remove(this._consumedProviders, provider);
    }

    /**
     * Returns the first suggestion from the consumed providers.
     */
  }, {
    key: 'getSuggestion',
    value: function getSuggestion(textEditor, position) {
      // Get the default word RegExp for this editor.
      var defaultWordRegExp = (0, _hyperclickUtils.defaultWordRegExpForEditor)(textEditor);

      return findTruthyReturnValue(this._consumedProviders.map(function (provider) {
        if (provider.getSuggestion) {
          var _ret = (function () {
            var getSuggestion = provider.getSuggestion.bind(provider);
            return {
              v: function () {
                return (0, _analytics.trackOperationTiming)(provider.providerName + '.getSuggestion', function () {
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

                var _getWordTextAndRange = (0, _getWordTextAndRange3['default'])(textEditor, position, wordRegExp);

                var text = _getWordTextAndRange.text;
                var range = _getWordTextAndRange.range;

                return (0, _analytics.trackOperationTiming)(provider.providerName + '.getSuggestionForWord', function () {
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

module.exports = Hyperclick;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBd0JlLHFCQUFxQixxQkFBcEMsV0FBcUMsR0FBcUMsRUFBZ0I7O0FBRXhGLE9BQUssSUFBTSxFQUFFLElBQUksR0FBRyxFQUFFO0FBQ3BCLFFBQU0sTUFBTSxHQUFHLE9BQU8sRUFBRSxLQUFLLFVBQVUsSUFBRyxNQUFNLEVBQUUsRUFBRSxDQUFBLEdBQUcsSUFBSSxDQUFDO0FBQzVELFFBQUksTUFBTSxFQUFFO0FBQ1YsYUFBTyxNQUFNLENBQUM7S0FDZjtHQUNGOztDQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3VDQXBCbUMsMkJBQTJCOzs7OzhCQUNwQyxrQkFBa0I7Ozs7cUNBQ1gseUJBQXlCOzs7O29DQUMzQiwyQkFBMkI7Ozs7K0JBQ2xCLG9CQUFvQjs7dUJBQ3pDLGVBQWU7O3lCQUNBLGlCQUFpQjs7SUFvQjlDLFVBQVU7QUFPSCxXQVBQLFVBQVUsR0FPQTswQkFQVixVQUFVOztBQVFaLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7O0FBRTdCLFFBQUksQ0FBQyxlQUFlLEdBQUcsaUNBQW9CLENBQUM7QUFDNUMsUUFBSSxDQUFDLCtCQUErQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSw4QkFFN0QsVUFBQSxLQUFLO2FBQUksd0NBQTJCLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztLQUFBLENBQUMsQ0FBQzs7QUFFNUQsUUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDM0MsUUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQzlELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztHQUN0Qzs7ZUFsQkcsVUFBVTs7V0FvQkcsMkJBQUMsVUFBc0IsRUFBRTs7O0FBQ3hDLFVBQU0sdUJBQXVCLEdBQUcseUNBQTRCLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM5RSxVQUFJLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDNUQsZ0JBQVUsQ0FBQyxZQUFZLENBQUMsWUFBTTtBQUM1QiwrQkFBdUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxjQUFLLHlCQUF5QixVQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztPQUNoRSxDQUFDLENBQUM7S0FDSjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLElBQUksQ0FBQywrQkFBK0IsRUFBRTtBQUN4QyxZQUFJLENBQUMsK0JBQStCLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDaEQ7QUFDRCxVQUFJLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtBQUNoQyxZQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDeEM7QUFDRCxVQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLFVBQUEsVUFBVTtlQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUU7T0FBQSxDQUFDLENBQUM7QUFDM0UsVUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3hDOzs7V0FFYSxxQkFBQyxJQUFrQixFQUFFLENBQWlCLEVBQVE7QUFDMUQsVUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3ZCLFlBQUksQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDO2lCQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBQSxDQUFDLENBQUM7T0FDekIsTUFBTTtBQUNMLFNBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUNUO0tBQ0Y7OztXQUVjLHlCQUFDLFFBQXdELEVBQVE7OztBQUM5RSxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxVQUFBLGNBQWM7ZUFBSSxPQUFLLHNCQUFzQixDQUFDLGNBQWMsQ0FBQztPQUFBLENBQUMsQ0FBQztLQUMzRjs7O1dBRWEsd0JBQUMsUUFBd0QsRUFBUTs7O0FBQzdFLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLFVBQUEsY0FBYztlQUFJLE9BQUsscUJBQXFCLENBQUMsY0FBYyxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQzFGOzs7V0FFcUIsZ0NBQUMsUUFBNEIsRUFBUTtBQUN6RCxVQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQztBQUN4QyxXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2xFLFlBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QyxZQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7QUFDckIsaUJBQU87U0FDUjs7QUFFRCxZQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQztBQUN4QyxZQUFJLFFBQVEsR0FBRyxZQUFZLEVBQUU7QUFDM0IsY0FBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQy9DLGlCQUFPO1NBQ1I7T0FDRjs7OztBQUlELFVBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDeEM7OztXQUVvQiwrQkFBQyxRQUE0QixFQUFRO0FBQ3hELHFCQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDakQ7Ozs7Ozs7V0FLWSx1QkFBQyxVQUFzQixFQUFFLFFBQW9CLEVBQVc7O0FBRW5FLFVBQU0saUJBQWlCLEdBQUcsaURBQTJCLFVBQVUsQ0FBQyxDQUFDOztBQUVqRSxhQUFPLHFCQUFxQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsVUFBQyxRQUFRLEVBQXlCO0FBQ3pGLFlBQUksUUFBUSxDQUFDLGFBQWEsRUFBRTs7QUFDMUIsZ0JBQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzVEO2lCQUFPO3VCQUFNLHFDQUNULFFBQVEsQ0FBQyxZQUFZLEdBQUcsZ0JBQWdCLEVBQ3hDO3lCQUFNLGFBQWEsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDO2lCQUFBLENBQUM7ZUFBQTtjQUFDOzs7O1NBQ2hELE1BQU0sSUFBSSxRQUFRLENBQUMsb0JBQW9CLEVBQUU7O0FBQ3hDLGdCQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDMUU7aUJBQU8sWUFBTTtBQUNYLG9CQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxJQUFJLGlCQUFpQixDQUFDOzsyQ0FDdEMsc0NBQW9CLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDOztvQkFBcEUsSUFBSSx3QkFBSixJQUFJO29CQUFFLEtBQUssd0JBQUwsS0FBSzs7QUFDbEIsdUJBQU8scUNBQ0wsUUFBUSxDQUFDLFlBQVksR0FBRyx1QkFBdUIsRUFDL0M7eUJBQU0sb0JBQW9CLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUM7aUJBQUEsQ0FBQyxDQUFDO2VBQ3hEO2NBQUM7Ozs7U0FDSDs7QUFFRCxjQUFNLElBQUksS0FBSyxDQUFDLHVFQUF1RSxDQUFDLENBQUM7T0FDMUYsQ0FBQyxDQUFDLENBQUM7S0FDTDs7O1dBRWlCLDRCQUFDLFVBQXNCLEVBQUUsVUFBZ0MsRUFBUTtBQUNqRixVQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDbkQ7OztTQTlHRyxVQUFVOzs7QUFpSGhCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDIiwiZmlsZSI6Ikh5cGVyY2xpY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SHlwZXJjbGlja1N1Z2dlc3Rpb24sIEh5cGVyY2xpY2tQcm92aWRlcn0gZnJvbSAnLi4vLi4vaHlwZXJjbGljay1pbnRlcmZhY2VzJztcblxuaW1wb3J0IEh5cGVyY2xpY2tGb3JUZXh0RWRpdG9yIGZyb20gJy4vSHlwZXJjbGlja0ZvclRleHRFZGl0b3InO1xuaW1wb3J0IFN1Z2dlc3Rpb25MaXN0IGZyb20gJy4vU3VnZ2VzdGlvbkxpc3QnO1xuaW1wb3J0IFN1Z2dlc3Rpb25MaXN0RWxlbWVudCBmcm9tICcuL1N1Z2dlc3Rpb25MaXN0RWxlbWVudCc7XG5pbXBvcnQgZ2V0V29yZFRleHRBbmRSYW5nZSBmcm9tICcuL2dldC13b3JkLXRleHQtYW5kLXJhbmdlJztcbmltcG9ydCB7ZGVmYXVsdFdvcmRSZWdFeHBGb3JFZGl0b3J9IGZyb20gJy4vaHlwZXJjbGljay11dGlscyc7XG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7dHJhY2tPcGVyYXRpb25UaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5cbi8qKlxuICogQ2FsbHMgdGhlIGdpdmVuIGZ1bmN0aW9ucyBhbmQgcmV0dXJucyB0aGUgZmlyc3Qgbm9uLW51bGwgcmV0dXJuIHZhbHVlLlxuICovXG5hc3luYyBmdW5jdGlvbiBmaW5kVHJ1dGh5UmV0dXJuVmFsdWUoZm5zOiBBcnJheTx2b2lkIHwgKCkgPT4gUHJvbWlzZTxhbnk+Pik6IFByb21pc2U8YW55PiB7XG4gIC8qIGVzbGludC1kaXNhYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgZm9yIChjb25zdCBmbiBvZiBmbnMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicgPyBhd2FpdCBmbigpIDogbnVsbDtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3QgdGhpcyBvYmplY3QgdG8gZW5hYmxlIEh5cGVyY2xpY2sgaW4gdGhlIEF0b20gd29ya3NwYWNlLlxuICogQ2FsbCBgZGlzcG9zZWAgdG8gZGlzYWJsZSB0aGUgZmVhdHVyZS5cbiAqL1xuY2xhc3MgSHlwZXJjbGljayB7XG4gIF9jb25zdW1lZFByb3ZpZGVyczogQXJyYXk8SHlwZXJjbGlja1Byb3ZpZGVyPjtcbiAgX3N1Z2dlc3Rpb25MaXN0OiBTdWdnZXN0aW9uTGlzdDtcbiAgX3N1Z2dlc3Rpb25MaXN0Vmlld1N1YnNjcmlwdGlvbjogYXRvbSREaXNwb3NhYmxlO1xuICBfaHlwZXJjbGlja0ZvclRleHRFZGl0b3JzOiBTZXQ8SHlwZXJjbGlja0ZvclRleHRFZGl0b3I+O1xuICBfdGV4dEVkaXRvclN1YnNjcmlwdGlvbjogYXRvbSREaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2NvbnN1bWVkUHJvdmlkZXJzID0gW107XG5cbiAgICB0aGlzLl9zdWdnZXN0aW9uTGlzdCA9IG5ldyBTdWdnZXN0aW9uTGlzdCgpO1xuICAgIHRoaXMuX3N1Z2dlc3Rpb25MaXN0Vmlld1N1YnNjcmlwdGlvbiA9IGF0b20udmlld3MuYWRkVmlld1Byb3ZpZGVyKFxuICAgICAgICBTdWdnZXN0aW9uTGlzdCxcbiAgICAgICAgbW9kZWwgPT4gbmV3IFN1Z2dlc3Rpb25MaXN0RWxlbWVudCgpLmluaXRpYWxpemUobW9kZWwpKTtcblxuICAgIHRoaXMuX2h5cGVyY2xpY2tGb3JUZXh0RWRpdG9ycyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl90ZXh0RWRpdG9yU3Vic2NyaXB0aW9uID0gYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKFxuICAgICAgdGhpcy5vYnNlcnZlVGV4dEVkaXRvci5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIG9ic2VydmVUZXh0RWRpdG9yKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgICBjb25zdCBoeXBlcmNsaWNrRm9yVGV4dEVkaXRvciA9IG5ldyBIeXBlcmNsaWNrRm9yVGV4dEVkaXRvcih0ZXh0RWRpdG9yLCB0aGlzKTtcbiAgICB0aGlzLl9oeXBlcmNsaWNrRm9yVGV4dEVkaXRvcnMuYWRkKGh5cGVyY2xpY2tGb3JUZXh0RWRpdG9yKTtcbiAgICB0ZXh0RWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICBoeXBlcmNsaWNrRm9yVGV4dEVkaXRvci5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9oeXBlcmNsaWNrRm9yVGV4dEVkaXRvcnMuZGVsZXRlKGh5cGVyY2xpY2tGb3JUZXh0RWRpdG9yKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKHRoaXMuX3N1Z2dlc3Rpb25MaXN0Vmlld1N1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fc3VnZ2VzdGlvbkxpc3RWaWV3U3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3RleHRFZGl0b3JTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX3RleHRFZGl0b3JTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9oeXBlcmNsaWNrRm9yVGV4dEVkaXRvcnMuZm9yRWFjaChoeXBlcmNsaWNrID0+IGh5cGVyY2xpY2suZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9oeXBlcmNsaWNrRm9yVGV4dEVkaXRvcnMuY2xlYXIoKTtcbiAgfVxuXG4gIF9hcHBseVRvQWxsPFQ+KGl0ZW06IEFycmF5PFQ+IHwgVCwgZjogKHg6IFQpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShpdGVtKSkge1xuICAgICAgaXRlbS5mb3JFYWNoKHggPT4gZih4KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGYoaXRlbSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3VtZVByb3ZpZGVyKHByb3ZpZGVyOiBIeXBlcmNsaWNrUHJvdmlkZXIgfCBBcnJheTxIeXBlcmNsaWNrUHJvdmlkZXI+KTogdm9pZCB7XG4gICAgdGhpcy5fYXBwbHlUb0FsbChwcm92aWRlciwgc2luZ2xlUHJvdmlkZXIgPT4gdGhpcy5fY29uc3VtZVNpbmdsZVByb3ZpZGVyKHNpbmdsZVByb3ZpZGVyKSk7XG4gIH1cblxuICByZW1vdmVQcm92aWRlcihwcm92aWRlcjogSHlwZXJjbGlja1Byb3ZpZGVyIHwgQXJyYXk8SHlwZXJjbGlja1Byb3ZpZGVyPik6IHZvaWQge1xuICAgIHRoaXMuX2FwcGx5VG9BbGwocHJvdmlkZXIsIHNpbmdsZVByb3ZpZGVyID0+IHRoaXMuX3JlbW92ZVNpbmdsZVByb3ZpZGVyKHNpbmdsZVByb3ZpZGVyKSk7XG4gIH1cblxuICBfY29uc3VtZVNpbmdsZVByb3ZpZGVyKHByb3ZpZGVyOiBIeXBlcmNsaWNrUHJvdmlkZXIpOiB2b2lkIHtcbiAgICBjb25zdCBwcmlvcml0eSA9IHByb3ZpZGVyLnByaW9yaXR5IHx8IDA7XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHRoaXMuX2NvbnN1bWVkUHJvdmlkZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBpdGVtID0gdGhpcy5fY29uc3VtZWRQcm92aWRlcnNbaV07XG4gICAgICBpZiAocHJvdmlkZXIgPT09IGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpdGVtUHJpb3JpdHkgPSBpdGVtLnByaW9yaXR5IHx8IDA7XG4gICAgICBpZiAocHJpb3JpdHkgPiBpdGVtUHJpb3JpdHkpIHtcbiAgICAgICAgdGhpcy5fY29uc3VtZWRQcm92aWRlcnMuc3BsaWNlKGksIDAsIHByb3ZpZGVyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHdlIG1hZGUgaXQgYWxsIHRoZSB3YXkgdGhyb3VnaCB0aGUgbG9vcCwgcHJvdmlkZXIgbXVzdCBiZSBsb3dlclxuICAgIC8vIHByaW9yaXR5IHRoYW4gYWxsIG9mIHRoZSBleGlzdGluZyBwcm92aWRlcnMsIHNvIGFkZCBpdCB0byB0aGUgZW5kLlxuICAgIHRoaXMuX2NvbnN1bWVkUHJvdmlkZXJzLnB1c2gocHJvdmlkZXIpO1xuICB9XG5cbiAgX3JlbW92ZVNpbmdsZVByb3ZpZGVyKHByb3ZpZGVyOiBIeXBlcmNsaWNrUHJvdmlkZXIpOiB2b2lkIHtcbiAgICBhcnJheS5yZW1vdmUodGhpcy5fY29uc3VtZWRQcm92aWRlcnMsIHByb3ZpZGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBzdWdnZXN0aW9uIGZyb20gdGhlIGNvbnN1bWVkIHByb3ZpZGVycy5cbiAgICovXG4gIGdldFN1Z2dlc3Rpb24odGV4dEVkaXRvcjogVGV4dEVkaXRvciwgcG9zaXRpb246IGF0b20kUG9pbnQpOiBQcm9taXNlIHtcbiAgICAvLyBHZXQgdGhlIGRlZmF1bHQgd29yZCBSZWdFeHAgZm9yIHRoaXMgZWRpdG9yLlxuICAgIGNvbnN0IGRlZmF1bHRXb3JkUmVnRXhwID0gZGVmYXVsdFdvcmRSZWdFeHBGb3JFZGl0b3IodGV4dEVkaXRvcik7XG5cbiAgICByZXR1cm4gZmluZFRydXRoeVJldHVyblZhbHVlKHRoaXMuX2NvbnN1bWVkUHJvdmlkZXJzLm1hcCgocHJvdmlkZXI6IEh5cGVyY2xpY2tQcm92aWRlcikgPT4ge1xuICAgICAgaWYgKHByb3ZpZGVyLmdldFN1Z2dlc3Rpb24pIHtcbiAgICAgICAgY29uc3QgZ2V0U3VnZ2VzdGlvbiA9IHByb3ZpZGVyLmdldFN1Z2dlc3Rpb24uYmluZChwcm92aWRlcik7XG4gICAgICAgIHJldHVybiAoKSA9PiB0cmFja09wZXJhdGlvblRpbWluZyhcbiAgICAgICAgICAgIHByb3ZpZGVyLnByb3ZpZGVyTmFtZSArICcuZ2V0U3VnZ2VzdGlvbicsXG4gICAgICAgICAgICAoKSA9PiBnZXRTdWdnZXN0aW9uKHRleHRFZGl0b3IsIHBvc2l0aW9uKSk7XG4gICAgICB9IGVsc2UgaWYgKHByb3ZpZGVyLmdldFN1Z2dlc3Rpb25Gb3JXb3JkKSB7XG4gICAgICAgIGNvbnN0IGdldFN1Z2dlc3Rpb25Gb3JXb3JkID0gcHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbkZvcldvcmQuYmluZChwcm92aWRlcik7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgd29yZFJlZ0V4cCA9IHByb3ZpZGVyLndvcmRSZWdFeHAgfHwgZGVmYXVsdFdvcmRSZWdFeHA7XG4gICAgICAgICAgY29uc3Qge3RleHQsIHJhbmdlfSA9IGdldFdvcmRUZXh0QW5kUmFuZ2UodGV4dEVkaXRvciwgcG9zaXRpb24sIHdvcmRSZWdFeHApO1xuICAgICAgICAgIHJldHVybiB0cmFja09wZXJhdGlvblRpbWluZyhcbiAgICAgICAgICAgIHByb3ZpZGVyLnByb3ZpZGVyTmFtZSArICcuZ2V0U3VnZ2VzdGlvbkZvcldvcmQnLFxuICAgICAgICAgICAgKCkgPT4gZ2V0U3VnZ2VzdGlvbkZvcldvcmQodGV4dEVkaXRvciwgdGV4dCwgcmFuZ2UpKTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdIeXBlcmNsaWNrIG11c3QgaGF2ZSBlaXRoZXIgYGdldFN1Z2dlc3Rpb25gIG9yIGBnZXRTdWdnZXN0aW9uRm9yV29yZGAnKTtcbiAgICB9KSk7XG4gIH1cblxuICBzaG93U3VnZ2VzdGlvbkxpc3QodGV4dEVkaXRvcjogVGV4dEVkaXRvciwgc3VnZ2VzdGlvbjogSHlwZXJjbGlja1N1Z2dlc3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLl9zdWdnZXN0aW9uTGlzdC5zaG93KHRleHRFZGl0b3IsIHN1Z2dlc3Rpb24pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSHlwZXJjbGljaztcbiJdfQ==