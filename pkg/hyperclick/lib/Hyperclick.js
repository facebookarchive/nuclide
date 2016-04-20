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

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideAnalytics = require('../../nuclide-analytics');

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

  /** Returns the provider name or a default value */

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
      _nuclideCommons.array.remove(this._consumedProviders, provider);
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
                return (0, _nuclideAnalytics.trackOperationTiming)(getProviderName(provider) + '.getSuggestion', function () {
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

                return (0, _nuclideAnalytics.trackOperationTiming)(getProviderName(provider) + '.getSuggestionForWord', function () {
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

function getProviderName(provider) {
  if (provider.providerName != null) {
    return provider.providerName;
  } else {
    return 'unnamed-hyperclick-provider';
  }
}

module.exports = Hyperclick;
//# sourceMappingURL=data:application/json;base64,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Tyw2QkFBNkIsQ0FBQztHQUN0QztDQUNGOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDIiwiZmlsZSI6Ikh5cGVyY2xpY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEh5cGVyY2xpY2tTdWdnZXN0aW9uLFxuICBIeXBlcmNsaWNrUHJvdmlkZXIsXG59IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQgSHlwZXJjbGlja0ZvclRleHRFZGl0b3IgZnJvbSAnLi9IeXBlcmNsaWNrRm9yVGV4dEVkaXRvcic7XG5pbXBvcnQgU3VnZ2VzdGlvbkxpc3QgZnJvbSAnLi9TdWdnZXN0aW9uTGlzdCc7XG5pbXBvcnQgU3VnZ2VzdGlvbkxpc3RFbGVtZW50IGZyb20gJy4vU3VnZ2VzdGlvbkxpc3RFbGVtZW50JztcbmltcG9ydCBnZXRXb3JkVGV4dEFuZFJhbmdlIGZyb20gJy4vZ2V0LXdvcmQtdGV4dC1hbmQtcmFuZ2UnO1xuaW1wb3J0IHtkZWZhdWx0V29yZFJlZ0V4cEZvckVkaXRvcn0gZnJvbSAnLi9oeXBlcmNsaWNrLXV0aWxzJztcbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge3RyYWNrT3BlcmF0aW9uVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5cbi8qKlxuICogQ2FsbHMgdGhlIGdpdmVuIGZ1bmN0aW9ucyBhbmQgcmV0dXJucyB0aGUgZmlyc3Qgbm9uLW51bGwgcmV0dXJuIHZhbHVlLlxuICovXG5hc3luYyBmdW5jdGlvbiBmaW5kVHJ1dGh5UmV0dXJuVmFsdWUoZm5zOiBBcnJheTx2b2lkIHwgKCkgPT4gUHJvbWlzZTxhbnk+Pik6IFByb21pc2U8YW55PiB7XG4gIC8qIGVzbGludC1kaXNhYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgZm9yIChjb25zdCBmbiBvZiBmbnMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicgPyBhd2FpdCBmbigpIDogbnVsbDtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3QgdGhpcyBvYmplY3QgdG8gZW5hYmxlIEh5cGVyY2xpY2sgaW4gdGhlIEF0b20gd29ya3NwYWNlLlxuICogQ2FsbCBgZGlzcG9zZWAgdG8gZGlzYWJsZSB0aGUgZmVhdHVyZS5cbiAqL1xuY2xhc3MgSHlwZXJjbGljayB7XG4gIF9jb25zdW1lZFByb3ZpZGVyczogQXJyYXk8SHlwZXJjbGlja1Byb3ZpZGVyPjtcbiAgX3N1Z2dlc3Rpb25MaXN0OiBTdWdnZXN0aW9uTGlzdDtcbiAgX3N1Z2dlc3Rpb25MaXN0Vmlld1N1YnNjcmlwdGlvbjogSURpc3Bvc2FibGU7XG4gIF9oeXBlcmNsaWNrRm9yVGV4dEVkaXRvcnM6IFNldDxIeXBlcmNsaWNrRm9yVGV4dEVkaXRvcj47XG4gIF90ZXh0RWRpdG9yU3Vic2NyaXB0aW9uOiBJRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9jb25zdW1lZFByb3ZpZGVycyA9IFtdO1xuXG4gICAgdGhpcy5fc3VnZ2VzdGlvbkxpc3QgPSBuZXcgU3VnZ2VzdGlvbkxpc3QoKTtcbiAgICB0aGlzLl9zdWdnZXN0aW9uTGlzdFZpZXdTdWJzY3JpcHRpb24gPSBhdG9tLnZpZXdzLmFkZFZpZXdQcm92aWRlcihcbiAgICAgICAgU3VnZ2VzdGlvbkxpc3QsXG4gICAgICAgIG1vZGVsID0+IG5ldyBTdWdnZXN0aW9uTGlzdEVsZW1lbnQoKS5pbml0aWFsaXplKG1vZGVsKSk7XG5cbiAgICB0aGlzLl9oeXBlcmNsaWNrRm9yVGV4dEVkaXRvcnMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fdGV4dEVkaXRvclN1YnNjcmlwdGlvbiA9IGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyhcbiAgICAgIHRoaXMub2JzZXJ2ZVRleHRFZGl0b3IuYmluZCh0aGlzKSk7XG4gIH1cblxuICBvYnNlcnZlVGV4dEVkaXRvcih0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gICAgY29uc3QgaHlwZXJjbGlja0ZvclRleHRFZGl0b3IgPSBuZXcgSHlwZXJjbGlja0ZvclRleHRFZGl0b3IodGV4dEVkaXRvciwgdGhpcyk7XG4gICAgdGhpcy5faHlwZXJjbGlja0ZvclRleHRFZGl0b3JzLmFkZChoeXBlcmNsaWNrRm9yVGV4dEVkaXRvcik7XG4gICAgdGV4dEVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgaHlwZXJjbGlja0ZvclRleHRFZGl0b3IuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5faHlwZXJjbGlja0ZvclRleHRFZGl0b3JzLmRlbGV0ZShoeXBlcmNsaWNrRm9yVGV4dEVkaXRvcik7XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIGlmICh0aGlzLl9zdWdnZXN0aW9uTGlzdFZpZXdTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX3N1Z2dlc3Rpb25MaXN0Vmlld1N1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLl90ZXh0RWRpdG9yU3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl90ZXh0RWRpdG9yU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgdGhpcy5faHlwZXJjbGlja0ZvclRleHRFZGl0b3JzLmZvckVhY2goaHlwZXJjbGljayA9PiBoeXBlcmNsaWNrLmRpc3Bvc2UoKSk7XG4gICAgdGhpcy5faHlwZXJjbGlja0ZvclRleHRFZGl0b3JzLmNsZWFyKCk7XG4gIH1cblxuICBfYXBwbHlUb0FsbDxUPihpdGVtOiBBcnJheTxUPiB8IFQsIGY6ICh4OiBUKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoaXRlbSkpIHtcbiAgICAgIGl0ZW0uZm9yRWFjaCh4ID0+IGYoeCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmKGl0ZW0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN1bWVQcm92aWRlcihwcm92aWRlcjogSHlwZXJjbGlja1Byb3ZpZGVyIHwgQXJyYXk8SHlwZXJjbGlja1Byb3ZpZGVyPik6IHZvaWQge1xuICAgIHRoaXMuX2FwcGx5VG9BbGwocHJvdmlkZXIsIHNpbmdsZVByb3ZpZGVyID0+IHRoaXMuX2NvbnN1bWVTaW5nbGVQcm92aWRlcihzaW5nbGVQcm92aWRlcikpO1xuICB9XG5cbiAgcmVtb3ZlUHJvdmlkZXIocHJvdmlkZXI6IEh5cGVyY2xpY2tQcm92aWRlciB8IEFycmF5PEh5cGVyY2xpY2tQcm92aWRlcj4pOiB2b2lkIHtcbiAgICB0aGlzLl9hcHBseVRvQWxsKHByb3ZpZGVyLCBzaW5nbGVQcm92aWRlciA9PiB0aGlzLl9yZW1vdmVTaW5nbGVQcm92aWRlcihzaW5nbGVQcm92aWRlcikpO1xuICB9XG5cbiAgX2NvbnN1bWVTaW5nbGVQcm92aWRlcihwcm92aWRlcjogSHlwZXJjbGlja1Byb3ZpZGVyKTogdm9pZCB7XG4gICAgY29uc3QgcHJpb3JpdHkgPSBwcm92aWRlci5wcmlvcml0eSB8fCAwO1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB0aGlzLl9jb25zdW1lZFByb3ZpZGVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgaXRlbSA9IHRoaXMuX2NvbnN1bWVkUHJvdmlkZXJzW2ldO1xuICAgICAgaWYgKHByb3ZpZGVyID09PSBpdGVtKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaXRlbVByaW9yaXR5ID0gaXRlbS5wcmlvcml0eSB8fCAwO1xuICAgICAgaWYgKHByaW9yaXR5ID4gaXRlbVByaW9yaXR5KSB7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVkUHJvdmlkZXJzLnNwbGljZShpLCAwLCBwcm92aWRlcik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBtYWRlIGl0IGFsbCB0aGUgd2F5IHRocm91Z2ggdGhlIGxvb3AsIHByb3ZpZGVyIG11c3QgYmUgbG93ZXJcbiAgICAvLyBwcmlvcml0eSB0aGFuIGFsbCBvZiB0aGUgZXhpc3RpbmcgcHJvdmlkZXJzLCBzbyBhZGQgaXQgdG8gdGhlIGVuZC5cbiAgICB0aGlzLl9jb25zdW1lZFByb3ZpZGVycy5wdXNoKHByb3ZpZGVyKTtcbiAgfVxuXG4gIF9yZW1vdmVTaW5nbGVQcm92aWRlcihwcm92aWRlcjogSHlwZXJjbGlja1Byb3ZpZGVyKTogdm9pZCB7XG4gICAgYXJyYXkucmVtb3ZlKHRoaXMuX2NvbnN1bWVkUHJvdmlkZXJzLCBwcm92aWRlcik7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZmlyc3Qgc3VnZ2VzdGlvbiBmcm9tIHRoZSBjb25zdW1lZCBwcm92aWRlcnMuXG4gICAqL1xuICBnZXRTdWdnZXN0aW9uKHRleHRFZGl0b3I6IFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KTogUHJvbWlzZSB7XG4gICAgLy8gR2V0IHRoZSBkZWZhdWx0IHdvcmQgUmVnRXhwIGZvciB0aGlzIGVkaXRvci5cbiAgICBjb25zdCBkZWZhdWx0V29yZFJlZ0V4cCA9IGRlZmF1bHRXb3JkUmVnRXhwRm9yRWRpdG9yKHRleHRFZGl0b3IpO1xuXG4gICAgcmV0dXJuIGZpbmRUcnV0aHlSZXR1cm5WYWx1ZSh0aGlzLl9jb25zdW1lZFByb3ZpZGVycy5tYXAoKHByb3ZpZGVyOiBIeXBlcmNsaWNrUHJvdmlkZXIpID0+IHtcbiAgICAgIGlmIChwcm92aWRlci5nZXRTdWdnZXN0aW9uKSB7XG4gICAgICAgIGNvbnN0IGdldFN1Z2dlc3Rpb24gPSBwcm92aWRlci5nZXRTdWdnZXN0aW9uLmJpbmQocHJvdmlkZXIpO1xuICAgICAgICByZXR1cm4gKCkgPT4gdHJhY2tPcGVyYXRpb25UaW1pbmcoXG4gICAgICAgICAgICBnZXRQcm92aWRlck5hbWUocHJvdmlkZXIpICsgJy5nZXRTdWdnZXN0aW9uJyxcbiAgICAgICAgICAgICgpID0+IGdldFN1Z2dlc3Rpb24odGV4dEVkaXRvciwgcG9zaXRpb24pKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbkZvcldvcmQpIHtcbiAgICAgICAgY29uc3QgZ2V0U3VnZ2VzdGlvbkZvcldvcmQgPSBwcm92aWRlci5nZXRTdWdnZXN0aW9uRm9yV29yZC5iaW5kKHByb3ZpZGVyKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICBjb25zdCB3b3JkUmVnRXhwID0gcHJvdmlkZXIud29yZFJlZ0V4cCB8fCBkZWZhdWx0V29yZFJlZ0V4cDtcbiAgICAgICAgICBjb25zdCB7dGV4dCwgcmFuZ2V9ID0gZ2V0V29yZFRleHRBbmRSYW5nZSh0ZXh0RWRpdG9yLCBwb3NpdGlvbiwgd29yZFJlZ0V4cCk7XG4gICAgICAgICAgcmV0dXJuIHRyYWNrT3BlcmF0aW9uVGltaW5nKFxuICAgICAgICAgICAgZ2V0UHJvdmlkZXJOYW1lKHByb3ZpZGVyKSArICcuZ2V0U3VnZ2VzdGlvbkZvcldvcmQnLFxuICAgICAgICAgICAgKCkgPT4gZ2V0U3VnZ2VzdGlvbkZvcldvcmQodGV4dEVkaXRvciwgdGV4dCwgcmFuZ2UpKTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdIeXBlcmNsaWNrIG11c3QgaGF2ZSBlaXRoZXIgYGdldFN1Z2dlc3Rpb25gIG9yIGBnZXRTdWdnZXN0aW9uRm9yV29yZGAnKTtcbiAgICB9KSk7XG4gIH1cblxuICBzaG93U3VnZ2VzdGlvbkxpc3QodGV4dEVkaXRvcjogVGV4dEVkaXRvciwgc3VnZ2VzdGlvbjogSHlwZXJjbGlja1N1Z2dlc3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLl9zdWdnZXN0aW9uTGlzdC5zaG93KHRleHRFZGl0b3IsIHN1Z2dlc3Rpb24pO1xuICB9XG59XG5cbi8qKiBSZXR1cm5zIHRoZSBwcm92aWRlciBuYW1lIG9yIGEgZGVmYXVsdCB2YWx1ZSAqL1xuZnVuY3Rpb24gZ2V0UHJvdmlkZXJOYW1lKHByb3ZpZGVyOiBIeXBlcmNsaWNrUHJvdmlkZXIpOiBzdHJpbmcge1xuICBpZiAocHJvdmlkZXIucHJvdmlkZXJOYW1lICE9IG51bGwpIHtcbiAgICByZXR1cm4gcHJvdmlkZXIucHJvdmlkZXJOYW1lO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAndW5uYW1lZC1oeXBlcmNsaWNrLXByb3ZpZGVyJztcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEh5cGVyY2xpY2s7XG4iXX0=