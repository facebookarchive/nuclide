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
                return (0, _analytics.trackOperationTiming)(getProviderName(provider) + '.getSuggestion', function () {
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

                return (0, _analytics.trackOperationTiming)(getProviderName(provider) + '.getSuggestionForWord', function () {
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
//# sourceMappingURL=data:application/json;base64,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NkJBQTZCLENBQUM7R0FDdEM7Q0FDRjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyIsImZpbGUiOiJIeXBlcmNsaWNrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0h5cGVyY2xpY2tTdWdnZXN0aW9uLCBIeXBlcmNsaWNrUHJvdmlkZXJ9IGZyb20gJy4uLy4uL2h5cGVyY2xpY2staW50ZXJmYWNlcyc7XG5cbmltcG9ydCBIeXBlcmNsaWNrRm9yVGV4dEVkaXRvciBmcm9tICcuL0h5cGVyY2xpY2tGb3JUZXh0RWRpdG9yJztcbmltcG9ydCBTdWdnZXN0aW9uTGlzdCBmcm9tICcuL1N1Z2dlc3Rpb25MaXN0JztcbmltcG9ydCBTdWdnZXN0aW9uTGlzdEVsZW1lbnQgZnJvbSAnLi9TdWdnZXN0aW9uTGlzdEVsZW1lbnQnO1xuaW1wb3J0IGdldFdvcmRUZXh0QW5kUmFuZ2UgZnJvbSAnLi9nZXQtd29yZC10ZXh0LWFuZC1yYW5nZSc7XG5pbXBvcnQge2RlZmF1bHRXb3JkUmVnRXhwRm9yRWRpdG9yfSBmcm9tICcuL2h5cGVyY2xpY2stdXRpbHMnO1xuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge3RyYWNrT3BlcmF0aW9uVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG4vKipcbiAqIENhbGxzIHRoZSBnaXZlbiBmdW5jdGlvbnMgYW5kIHJldHVybnMgdGhlIGZpcnN0IG5vbi1udWxsIHJldHVybiB2YWx1ZS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZmluZFRydXRoeVJldHVyblZhbHVlKGZuczogQXJyYXk8dm9pZCB8ICgpID0+IFByb21pc2U8YW55Pj4pOiBQcm9taXNlPGFueT4ge1xuICAvKiBlc2xpbnQtZGlzYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gIGZvciAoY29uc3QgZm4gb2YgZm5zKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nID8gYXdhaXQgZm4oKSA6IG51bGw7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG59XG5cbi8qKlxuICogQ29uc3RydWN0IHRoaXMgb2JqZWN0IHRvIGVuYWJsZSBIeXBlcmNsaWNrIGluIHRoZSBBdG9tIHdvcmtzcGFjZS5cbiAqIENhbGwgYGRpc3Bvc2VgIHRvIGRpc2FibGUgdGhlIGZlYXR1cmUuXG4gKi9cbmNsYXNzIEh5cGVyY2xpY2sge1xuICBfY29uc3VtZWRQcm92aWRlcnM6IEFycmF5PEh5cGVyY2xpY2tQcm92aWRlcj47XG4gIF9zdWdnZXN0aW9uTGlzdDogU3VnZ2VzdGlvbkxpc3Q7XG4gIF9zdWdnZXN0aW9uTGlzdFZpZXdTdWJzY3JpcHRpb246IElEaXNwb3NhYmxlO1xuICBfaHlwZXJjbGlja0ZvclRleHRFZGl0b3JzOiBTZXQ8SHlwZXJjbGlja0ZvclRleHRFZGl0b3I+O1xuICBfdGV4dEVkaXRvclN1YnNjcmlwdGlvbjogSURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fY29uc3VtZWRQcm92aWRlcnMgPSBbXTtcblxuICAgIHRoaXMuX3N1Z2dlc3Rpb25MaXN0ID0gbmV3IFN1Z2dlc3Rpb25MaXN0KCk7XG4gICAgdGhpcy5fc3VnZ2VzdGlvbkxpc3RWaWV3U3Vic2NyaXB0aW9uID0gYXRvbS52aWV3cy5hZGRWaWV3UHJvdmlkZXIoXG4gICAgICAgIFN1Z2dlc3Rpb25MaXN0LFxuICAgICAgICBtb2RlbCA9PiBuZXcgU3VnZ2VzdGlvbkxpc3RFbGVtZW50KCkuaW5pdGlhbGl6ZShtb2RlbCkpO1xuXG4gICAgdGhpcy5faHlwZXJjbGlja0ZvclRleHRFZGl0b3JzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX3RleHRFZGl0b3JTdWJzY3JpcHRpb24gPSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoXG4gICAgICB0aGlzLm9ic2VydmVUZXh0RWRpdG9yLmJpbmQodGhpcykpO1xuICB9XG5cbiAgb2JzZXJ2ZVRleHRFZGl0b3IodGV4dEVkaXRvcjogVGV4dEVkaXRvcikge1xuICAgIGNvbnN0IGh5cGVyY2xpY2tGb3JUZXh0RWRpdG9yID0gbmV3IEh5cGVyY2xpY2tGb3JUZXh0RWRpdG9yKHRleHRFZGl0b3IsIHRoaXMpO1xuICAgIHRoaXMuX2h5cGVyY2xpY2tGb3JUZXh0RWRpdG9ycy5hZGQoaHlwZXJjbGlja0ZvclRleHRFZGl0b3IpO1xuICAgIHRleHRFZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgIGh5cGVyY2xpY2tGb3JUZXh0RWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2h5cGVyY2xpY2tGb3JUZXh0RWRpdG9ycy5kZWxldGUoaHlwZXJjbGlja0ZvclRleHRFZGl0b3IpO1xuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5fc3VnZ2VzdGlvbkxpc3RWaWV3U3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl9zdWdnZXN0aW9uTGlzdFZpZXdTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fdGV4dEVkaXRvclN1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fdGV4dEVkaXRvclN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX2h5cGVyY2xpY2tGb3JUZXh0RWRpdG9ycy5mb3JFYWNoKGh5cGVyY2xpY2sgPT4gaHlwZXJjbGljay5kaXNwb3NlKCkpO1xuICAgIHRoaXMuX2h5cGVyY2xpY2tGb3JUZXh0RWRpdG9ycy5jbGVhcigpO1xuICB9XG5cbiAgX2FwcGx5VG9BbGw8VD4oaXRlbTogQXJyYXk8VD4gfCBULCBmOiAoeDogVCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGl0ZW0pKSB7XG4gICAgICBpdGVtLmZvckVhY2goeCA9PiBmKHgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZihpdGVtKTtcbiAgICB9XG4gIH1cblxuICBjb25zdW1lUHJvdmlkZXIocHJvdmlkZXI6IEh5cGVyY2xpY2tQcm92aWRlciB8IEFycmF5PEh5cGVyY2xpY2tQcm92aWRlcj4pOiB2b2lkIHtcbiAgICB0aGlzLl9hcHBseVRvQWxsKHByb3ZpZGVyLCBzaW5nbGVQcm92aWRlciA9PiB0aGlzLl9jb25zdW1lU2luZ2xlUHJvdmlkZXIoc2luZ2xlUHJvdmlkZXIpKTtcbiAgfVxuXG4gIHJlbW92ZVByb3ZpZGVyKHByb3ZpZGVyOiBIeXBlcmNsaWNrUHJvdmlkZXIgfCBBcnJheTxIeXBlcmNsaWNrUHJvdmlkZXI+KTogdm9pZCB7XG4gICAgdGhpcy5fYXBwbHlUb0FsbChwcm92aWRlciwgc2luZ2xlUHJvdmlkZXIgPT4gdGhpcy5fcmVtb3ZlU2luZ2xlUHJvdmlkZXIoc2luZ2xlUHJvdmlkZXIpKTtcbiAgfVxuXG4gIF9jb25zdW1lU2luZ2xlUHJvdmlkZXIocHJvdmlkZXI6IEh5cGVyY2xpY2tQcm92aWRlcik6IHZvaWQge1xuICAgIGNvbnN0IHByaW9yaXR5ID0gcHJvdmlkZXIucHJpb3JpdHkgfHwgMDtcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gdGhpcy5fY29uc3VtZWRQcm92aWRlcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl9jb25zdW1lZFByb3ZpZGVyc1tpXTtcbiAgICAgIGlmIChwcm92aWRlciA9PT0gaXRlbSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGl0ZW1Qcmlvcml0eSA9IGl0ZW0ucHJpb3JpdHkgfHwgMDtcbiAgICAgIGlmIChwcmlvcml0eSA+IGl0ZW1Qcmlvcml0eSkge1xuICAgICAgICB0aGlzLl9jb25zdW1lZFByb3ZpZGVycy5zcGxpY2UoaSwgMCwgcHJvdmlkZXIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgbWFkZSBpdCBhbGwgdGhlIHdheSB0aHJvdWdoIHRoZSBsb29wLCBwcm92aWRlciBtdXN0IGJlIGxvd2VyXG4gICAgLy8gcHJpb3JpdHkgdGhhbiBhbGwgb2YgdGhlIGV4aXN0aW5nIHByb3ZpZGVycywgc28gYWRkIGl0IHRvIHRoZSBlbmQuXG4gICAgdGhpcy5fY29uc3VtZWRQcm92aWRlcnMucHVzaChwcm92aWRlcik7XG4gIH1cblxuICBfcmVtb3ZlU2luZ2xlUHJvdmlkZXIocHJvdmlkZXI6IEh5cGVyY2xpY2tQcm92aWRlcik6IHZvaWQge1xuICAgIGFycmF5LnJlbW92ZSh0aGlzLl9jb25zdW1lZFByb3ZpZGVycywgcHJvdmlkZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGZpcnN0IHN1Z2dlc3Rpb24gZnJvbSB0aGUgY29uc3VtZWQgcHJvdmlkZXJzLlxuICAgKi9cbiAgZ2V0U3VnZ2VzdGlvbih0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yLCBwb3NpdGlvbjogYXRvbSRQb2ludCk6IFByb21pc2Uge1xuICAgIC8vIEdldCB0aGUgZGVmYXVsdCB3b3JkIFJlZ0V4cCBmb3IgdGhpcyBlZGl0b3IuXG4gICAgY29uc3QgZGVmYXVsdFdvcmRSZWdFeHAgPSBkZWZhdWx0V29yZFJlZ0V4cEZvckVkaXRvcih0ZXh0RWRpdG9yKTtcblxuICAgIHJldHVybiBmaW5kVHJ1dGh5UmV0dXJuVmFsdWUodGhpcy5fY29uc3VtZWRQcm92aWRlcnMubWFwKChwcm92aWRlcjogSHlwZXJjbGlja1Byb3ZpZGVyKSA9PiB7XG4gICAgICBpZiAocHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbikge1xuICAgICAgICBjb25zdCBnZXRTdWdnZXN0aW9uID0gcHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbi5iaW5kKHByb3ZpZGVyKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHRyYWNrT3BlcmF0aW9uVGltaW5nKFxuICAgICAgICAgICAgZ2V0UHJvdmlkZXJOYW1lKHByb3ZpZGVyKSArICcuZ2V0U3VnZ2VzdGlvbicsXG4gICAgICAgICAgICAoKSA9PiBnZXRTdWdnZXN0aW9uKHRleHRFZGl0b3IsIHBvc2l0aW9uKSk7XG4gICAgICB9IGVsc2UgaWYgKHByb3ZpZGVyLmdldFN1Z2dlc3Rpb25Gb3JXb3JkKSB7XG4gICAgICAgIGNvbnN0IGdldFN1Z2dlc3Rpb25Gb3JXb3JkID0gcHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbkZvcldvcmQuYmluZChwcm92aWRlcik7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgd29yZFJlZ0V4cCA9IHByb3ZpZGVyLndvcmRSZWdFeHAgfHwgZGVmYXVsdFdvcmRSZWdFeHA7XG4gICAgICAgICAgY29uc3Qge3RleHQsIHJhbmdlfSA9IGdldFdvcmRUZXh0QW5kUmFuZ2UodGV4dEVkaXRvciwgcG9zaXRpb24sIHdvcmRSZWdFeHApO1xuICAgICAgICAgIHJldHVybiB0cmFja09wZXJhdGlvblRpbWluZyhcbiAgICAgICAgICAgIGdldFByb3ZpZGVyTmFtZShwcm92aWRlcikgKyAnLmdldFN1Z2dlc3Rpb25Gb3JXb3JkJyxcbiAgICAgICAgICAgICgpID0+IGdldFN1Z2dlc3Rpb25Gb3JXb3JkKHRleHRFZGl0b3IsIHRleHQsIHJhbmdlKSk7XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHRocm93IG5ldyBFcnJvcignSHlwZXJjbGljayBtdXN0IGhhdmUgZWl0aGVyIGBnZXRTdWdnZXN0aW9uYCBvciBgZ2V0U3VnZ2VzdGlvbkZvcldvcmRgJyk7XG4gICAgfSkpO1xuICB9XG5cbiAgc2hvd1N1Z2dlc3Rpb25MaXN0KHRleHRFZGl0b3I6IFRleHRFZGl0b3IsIHN1Z2dlc3Rpb246IEh5cGVyY2xpY2tTdWdnZXN0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5fc3VnZ2VzdGlvbkxpc3Quc2hvdyh0ZXh0RWRpdG9yLCBzdWdnZXN0aW9uKTtcbiAgfVxufVxuXG4vKiogUmV0dXJucyB0aGUgcHJvdmlkZXIgbmFtZSBvciBhIGRlZmF1bHQgdmFsdWUgKi9cbmZ1bmN0aW9uIGdldFByb3ZpZGVyTmFtZShwcm92aWRlcjogSHlwZXJjbGlja1Byb3ZpZGVyKTogc3RyaW5nIHtcbiAgaWYgKHByb3ZpZGVyLnByb3ZpZGVyTmFtZSAhPSBudWxsKSB7XG4gICAgcmV0dXJuIHByb3ZpZGVyLnByb3ZpZGVyTmFtZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJ3VubmFtZWQtaHlwZXJjbGljay1wcm92aWRlcic7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIeXBlcmNsaWNrO1xuIl19