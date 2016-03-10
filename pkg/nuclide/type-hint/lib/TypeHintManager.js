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

var _reactForAtom = require('react-for-atom');

var _commons = require('../../commons');

var _analytics = require('../../analytics');

var _TypeHintComponent = require('./TypeHintComponent');

var TypeHintManager = (function () {
  function TypeHintManager() {
    _classCallCheck(this, TypeHintManager);

    this._typeHintProviders = [];
  }

  _createClass(TypeHintManager, [{
    key: 'datatip',
    value: _asyncToGenerator(function* (editor, position) {
      var _editor$getGrammar = editor.getGrammar();

      var scopeName = _editor$getGrammar.scopeName;

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
        var logger = require('../../logging').getLogger();
        logger.error('Type hint provider has no name', provider);
      }
      var typeHint = yield (0, _analytics.trackOperationTiming)(name + '.typeHint', function () {
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
      (0, _analytics.track)('type-hint-popup', {
        'scope': scopeName,
        'message': hint
      });
      return {
        component: _reactForAtom.React.createElement(_TypeHintComponent.TypeHintComponent, { content: hintTree || hint }),
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
      _commons.array.remove(this._typeHintProviders, provider);
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
//# sourceMappingURL=data:application/json;base64,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Q0FBQyIsImZpbGUiOiJUeXBlSGludE1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7VHlwZUhpbnRQcm92aWRlcn0gZnJvbSAnLi4vLi4vdHlwZS1oaW50LWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUge0RhdGF0aXB9IGZyb20gJy4uLy4uL2RhdGF0aXAtaW50ZXJmYWNlcyc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7XG4gIFJlYWN0LFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHt0cmFjaywgdHJhY2tPcGVyYXRpb25UaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5cbmltcG9ydCB7VHlwZUhpbnRDb21wb25lbnR9IGZyb20gJy4vVHlwZUhpbnRDb21wb25lbnQnO1xuXG5jbGFzcyBUeXBlSGludE1hbmFnZXIge1xuICBfdHlwZUhpbnRQcm92aWRlcnM6IEFycmF5PFR5cGVIaW50UHJvdmlkZXI+O1xuICAvKipcbiAgICogVGhpcyBoZWxwcyBkZXRlcm1pbmUgaWYgd2Ugc2hvdWxkIHNob3cgdGhlIHR5cGUgaGludCB3aGVuIHRvZ2dsaW5nIGl0IHZpYVxuICAgKiBjb21tYW5kLiBUaGUgdG9nZ2xlIGNvbW1hbmQgZmlyc3QgbmVnYXRlcyB0aGlzLCBhbmQgdGhlbiBpZiB0aGlzIGlzIHRydWVcbiAgICogc2hvd3MgYSB0eXBlIGhpbnQsIG90aGVyd2lzZSBpdCBoaWRlcyB0aGUgY3VycmVudCB0eXBlaGludC5cbiAgICovXG4gIF90eXBlSGludFRvZ2dsZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl90eXBlSGludFByb3ZpZGVycyA9IFtdO1xuICB9XG5cbiAgYXN5bmMgZGF0YXRpcChlZGl0b3I6IFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KTogUHJvbWlzZTw/RGF0YXRpcD4ge1xuICAgIGNvbnN0IHtzY29wZU5hbWV9ID0gZWRpdG9yLmdldEdyYW1tYXIoKTtcbiAgICBjb25zdCBbcHJvdmlkZXJdID0gdGhpcy5fZ2V0TWF0Y2hpbmdQcm92aWRlcnNGb3JTY29wZU5hbWUoc2NvcGVOYW1lKTtcbiAgICBpZiAocHJvdmlkZXIgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCBuYW1lO1xuICAgIGlmIChwcm92aWRlci5wcm92aWRlck5hbWUgIT0gbnVsbCkge1xuICAgICAgbmFtZSA9IHByb3ZpZGVyLnByb3ZpZGVyTmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9ICd1bmtub3duJztcbiAgICAgIGNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbiAgICAgIGxvZ2dlci5lcnJvcignVHlwZSBoaW50IHByb3ZpZGVyIGhhcyBubyBuYW1lJywgcHJvdmlkZXIpO1xuICAgIH1cbiAgICBjb25zdCB0eXBlSGludCA9IGF3YWl0IHRyYWNrT3BlcmF0aW9uVGltaW5nKFxuICAgICAgbmFtZSArICcudHlwZUhpbnQnLFxuICAgICAgKCkgPT4gcHJvdmlkZXIudHlwZUhpbnQoZWRpdG9yLCBwb3NpdGlvbiksXG4gICAgKTtcbiAgICBpZiAoIXR5cGVIaW50IHx8IHRoaXMuX21hcmtlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7aGludCwgaGludFRyZWUsIHJhbmdlfSA9IHR5cGVIaW50O1xuICAgIC8vIEZvciBub3csIGFjdHVhbCBoaW50IHRleHQgaXMgcmVxdWlyZWQuXG4gICAgaW52YXJpYW50KGhpbnQgIT0gbnVsbCk7XG4gICAgLy8gV2UgdHJhY2sgdGhlIHRpbWluZyBhYm92ZSwgYnV0IHdlIHN0aWxsIHdhbnQgdG8ga25vdyB0aGUgbnVtYmVyIG9mIHBvcHVwcyB0aGF0IGFyZSBzaG93bi5cbiAgICB0cmFjaygndHlwZS1oaW50LXBvcHVwJywge1xuICAgICAgJ3Njb3BlJzogc2NvcGVOYW1lLFxuICAgICAgJ21lc3NhZ2UnOiBoaW50LFxuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICBjb21wb25lbnQ6IDxUeXBlSGludENvbXBvbmVudCBjb250ZW50PXtoaW50VHJlZSB8fCBoaW50fSAvPixcbiAgICAgIHJhbmdlLFxuICAgIH07XG4gIH1cblxuICBfZ2V0TWF0Y2hpbmdQcm92aWRlcnNGb3JTY29wZU5hbWUoc2NvcGVOYW1lOiBzdHJpbmcpOiBBcnJheTxUeXBlSGludFByb3ZpZGVyPiB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVIaW50UHJvdmlkZXJzLmZpbHRlcigocHJvdmlkZXI6IFR5cGVIaW50UHJvdmlkZXIpID0+IHtcbiAgICAgIGNvbnN0IHByb3ZpZGVyR3JhbW1hcnMgPSBwcm92aWRlci5zZWxlY3Rvci5zcGxpdCgvLCA/Lyk7XG4gICAgICByZXR1cm4gcHJvdmlkZXIuaW5jbHVzaW9uUHJpb3JpdHkgPiAwICYmIHByb3ZpZGVyR3JhbW1hcnMuaW5kZXhPZihzY29wZU5hbWUpICE9PSAtMTtcbiAgICB9KS5zb3J0KChwcm92aWRlckE6IFR5cGVIaW50UHJvdmlkZXIsIHByb3ZpZGVyQjogVHlwZUhpbnRQcm92aWRlcikgPT4ge1xuICAgICAgcmV0dXJuIHByb3ZpZGVyQS5pbmNsdXNpb25Qcmlvcml0eSAtIHByb3ZpZGVyQi5pbmNsdXNpb25Qcmlvcml0eTtcbiAgICB9KTtcbiAgfVxuXG4gIGFkZFByb3ZpZGVyKHByb3ZpZGVyOiBUeXBlSGludFByb3ZpZGVyKSB7XG4gICAgdGhpcy5fdHlwZUhpbnRQcm92aWRlcnMucHVzaChwcm92aWRlcik7XG4gIH1cblxuICByZW1vdmVQcm92aWRlcihwcm92aWRlcjogVHlwZUhpbnRQcm92aWRlcik6IHZvaWQge1xuICAgIGFycmF5LnJlbW92ZSh0aGlzLl90eXBlSGludFByb3ZpZGVycywgcHJvdmlkZXIpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHlwZUhpbnRNYW5hZ2VyO1xuIl19