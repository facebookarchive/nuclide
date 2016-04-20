var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _TypeHintComponent = require('./TypeHintComponent');

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
      var typeHint = yield (0, _nuclideAnalytics.trackOperationTiming)(name + '.typeHint', function () {
        return provider.typeHint(editor, position);
      });
      if (!typeHint || this._marker) {
        return;
      }
      var hint = typeHint.hint;
      var hintTree = typeHint.hintTree;
      var range = typeHint.range;

      // For now, actual hint text is required.
      (0, _assert2['default'])(hint != null);
      // We track the timing above, but we still want to know the number of popups that are shown.
      (0, _nuclideAnalytics.track)('type-hint-popup', {
        'scope': scopeName,
        'message': hint
      });
      return {
        component: (0, _TypeHintComponent.makeTypeHintComponent)(hintTree || hint, grammar),
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
      _nuclideCommons.array.remove(this._typeHintProviders, provider);
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
//# sourceMappingURL=data:application/json;base64,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TyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJUeXBlSGludE1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7VHlwZUhpbnRQcm92aWRlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS10eXBlLWhpbnQtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7RGF0YXRpcH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kYXRhdGlwLWludGVyZmFjZXMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHt0cmFjaywgdHJhY2tPcGVyYXRpb25UaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcblxuaW1wb3J0IHttYWtlVHlwZUhpbnRDb21wb25lbnR9IGZyb20gJy4vVHlwZUhpbnRDb21wb25lbnQnO1xuXG5jbGFzcyBUeXBlSGludE1hbmFnZXIge1xuICBfdHlwZUhpbnRQcm92aWRlcnM6IEFycmF5PFR5cGVIaW50UHJvdmlkZXI+O1xuICAvKipcbiAgICogVGhpcyBoZWxwcyBkZXRlcm1pbmUgaWYgd2Ugc2hvdWxkIHNob3cgdGhlIHR5cGUgaGludCB3aGVuIHRvZ2dsaW5nIGl0IHZpYVxuICAgKiBjb21tYW5kLiBUaGUgdG9nZ2xlIGNvbW1hbmQgZmlyc3QgbmVnYXRlcyB0aGlzLCBhbmQgdGhlbiBpZiB0aGlzIGlzIHRydWVcbiAgICogc2hvd3MgYSB0eXBlIGhpbnQsIG90aGVyd2lzZSBpdCBoaWRlcyB0aGUgY3VycmVudCB0eXBlaGludC5cbiAgICovXG4gIF90eXBlSGludFRvZ2dsZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl90eXBlSGludFByb3ZpZGVycyA9IFtdO1xuICB9XG5cbiAgYXN5bmMgZGF0YXRpcChlZGl0b3I6IFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KTogUHJvbWlzZTw/RGF0YXRpcD4ge1xuICAgIGNvbnN0IGdyYW1tYXIgPSBlZGl0b3IuZ2V0R3JhbW1hcigpO1xuICAgIGNvbnN0IHtzY29wZU5hbWV9ID0gZ3JhbW1hcjtcbiAgICBjb25zdCBbcHJvdmlkZXJdID0gdGhpcy5fZ2V0TWF0Y2hpbmdQcm92aWRlcnNGb3JTY29wZU5hbWUoc2NvcGVOYW1lKTtcbiAgICBpZiAocHJvdmlkZXIgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCBuYW1lO1xuICAgIGlmIChwcm92aWRlci5wcm92aWRlck5hbWUgIT0gbnVsbCkge1xuICAgICAgbmFtZSA9IHByb3ZpZGVyLnByb3ZpZGVyTmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9ICd1bmtub3duJztcbiAgICAgIGNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpO1xuICAgICAgbG9nZ2VyLmVycm9yKCdUeXBlIGhpbnQgcHJvdmlkZXIgaGFzIG5vIG5hbWUnLCBwcm92aWRlcik7XG4gICAgfVxuICAgIGNvbnN0IHR5cGVIaW50ID0gYXdhaXQgdHJhY2tPcGVyYXRpb25UaW1pbmcoXG4gICAgICBuYW1lICsgJy50eXBlSGludCcsXG4gICAgICAoKSA9PiBwcm92aWRlci50eXBlSGludChlZGl0b3IsIHBvc2l0aW9uKSxcbiAgICApO1xuICAgIGlmICghdHlwZUhpbnQgfHwgdGhpcy5fbWFya2VyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHtoaW50LCBoaW50VHJlZSwgcmFuZ2V9ID0gdHlwZUhpbnQ7XG4gICAgLy8gRm9yIG5vdywgYWN0dWFsIGhpbnQgdGV4dCBpcyByZXF1aXJlZC5cbiAgICBpbnZhcmlhbnQoaGludCAhPSBudWxsKTtcbiAgICAvLyBXZSB0cmFjayB0aGUgdGltaW5nIGFib3ZlLCBidXQgd2Ugc3RpbGwgd2FudCB0byBrbm93IHRoZSBudW1iZXIgb2YgcG9wdXBzIHRoYXQgYXJlIHNob3duLlxuICAgIHRyYWNrKCd0eXBlLWhpbnQtcG9wdXAnLCB7XG4gICAgICAnc2NvcGUnOiBzY29wZU5hbWUsXG4gICAgICAnbWVzc2FnZSc6IGhpbnQsXG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbXBvbmVudDogbWFrZVR5cGVIaW50Q29tcG9uZW50KGhpbnRUcmVlIHx8IGhpbnQsIGdyYW1tYXIpLFxuICAgICAgcmFuZ2UsXG4gICAgfTtcbiAgfVxuXG4gIF9nZXRNYXRjaGluZ1Byb3ZpZGVyc0ZvclNjb3BlTmFtZShzY29wZU5hbWU6IHN0cmluZyk6IEFycmF5PFR5cGVIaW50UHJvdmlkZXI+IHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUhpbnRQcm92aWRlcnMuZmlsdGVyKChwcm92aWRlcjogVHlwZUhpbnRQcm92aWRlcikgPT4ge1xuICAgICAgY29uc3QgcHJvdmlkZXJHcmFtbWFycyA9IHByb3ZpZGVyLnNlbGVjdG9yLnNwbGl0KC8sID8vKTtcbiAgICAgIHJldHVybiBwcm92aWRlci5pbmNsdXNpb25Qcmlvcml0eSA+IDAgJiYgcHJvdmlkZXJHcmFtbWFycy5pbmRleE9mKHNjb3BlTmFtZSkgIT09IC0xO1xuICAgIH0pLnNvcnQoKHByb3ZpZGVyQTogVHlwZUhpbnRQcm92aWRlciwgcHJvdmlkZXJCOiBUeXBlSGludFByb3ZpZGVyKSA9PiB7XG4gICAgICByZXR1cm4gcHJvdmlkZXJBLmluY2x1c2lvblByaW9yaXR5IC0gcHJvdmlkZXJCLmluY2x1c2lvblByaW9yaXR5O1xuICAgIH0pO1xuICB9XG5cbiAgYWRkUHJvdmlkZXIocHJvdmlkZXI6IFR5cGVIaW50UHJvdmlkZXIpIHtcbiAgICB0aGlzLl90eXBlSGludFByb3ZpZGVycy5wdXNoKHByb3ZpZGVyKTtcbiAgfVxuXG4gIHJlbW92ZVByb3ZpZGVyKHByb3ZpZGVyOiBUeXBlSGludFByb3ZpZGVyKTogdm9pZCB7XG4gICAgYXJyYXkucmVtb3ZlKHRoaXMuX3R5cGVIaW50UHJvdmlkZXJzLCBwcm92aWRlcik7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUeXBlSGludE1hbmFnZXI7XG4iXX0=