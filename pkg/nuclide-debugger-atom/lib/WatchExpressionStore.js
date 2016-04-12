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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideCommons = require('../../nuclide-commons');

var incompleteObservableFromPromise = _nuclideCommons.observables.incompleteObservableFromPromise;

var WatchExpressionStore = (function () {
  function WatchExpressionStore(bridge) {
    var _this = this;

    _classCallCheck(this, WatchExpressionStore);

    this._bridge = bridge;
    this._disposables = new _atom.CompositeDisposable();
    this._watchExpressions = new Map();
    // `this._previousEvaluationSubscriptions` can change at any time and are a distinct subset of
    // `this._disposables`.
    this._previousEvaluationSubscriptions = new _atom.CompositeDisposable();
    this._disposables.add(new _atom.Disposable(function () {
      _this._previousEvaluationSubscriptions.dispose();
    }));
  }

  _createClass(WatchExpressionStore, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: '_requestExpressionEvaluation',
    value: function _requestExpressionEvaluation(expression, subject) {
      this._previousEvaluationSubscriptions.add(incompleteObservableFromPromise(this._bridge.evaluateOnSelectedCallFrame(expression)).subscribe(subject));
    }

    /**
     * Returns an observable of evaluation results for a given expression.
     * Resources are automatically cleaned up once all subscribers of an expression have unsubscribed.
     */
  }, {
    key: 'evaluateWatchExpression',
    value: function evaluateWatchExpression(expression) {
      if (this._watchExpressions.has(expression)) {
        var cachedResult = this._watchExpressions.get(expression);
        (0, _assert2['default'])(cachedResult);
        return cachedResult;
      }
      var subject = new _rx2['default'].BehaviorSubject();
      this._requestExpressionEvaluation(expression, subject);
      this._watchExpressions.set(expression, subject);
      // Expose an observable rather than the raw subject.
      return subject.asObservable();
    }
  }, {
    key: 'triggerReevaluation',
    value: function triggerReevaluation() {
      // Cancel any outstanding evaluation requests to the Bridge
      this._previousEvaluationSubscriptions.dispose();
      this._previousEvaluationSubscriptions = new _atom.CompositeDisposable();
      for (var _ref3 of this._watchExpressions) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var expression = _ref2[0];
        var subject = _ref2[1];

        if (!subject.hasObservers()) {
          // Nobody is watching this expression anymore.
          this._watchExpressions['delete'](expression);
          continue;
        }
        this._requestExpressionEvaluation(expression, subject);
      }
    }
  }]);

  return WatchExpressionStore;
})();

exports.WatchExpressionStore = WatchExpressionStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldhdGNoRXhwcmVzc2lvblN0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWlCTyxNQUFNOztrQkFDRSxJQUFJOzs7O3NCQUNHLFFBQVE7Ozs7OEJBQ0osdUJBQXVCOztJQUMxQywrQkFBK0IsK0JBQS9CLCtCQUErQjs7SUFJekIsb0JBQW9CO0FBTXBCLFdBTkEsb0JBQW9CLENBTW5CLE1BQWMsRUFBRTs7OzBCQU5qQixvQkFBb0I7O0FBTzdCLFFBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxZQUFZLEdBQUcsK0JBQXlCLENBQUM7QUFDOUMsUUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7OztBQUduQyxRQUFJLENBQUMsZ0NBQWdDLEdBQUcsK0JBQXlCLENBQUM7QUFDbEUsUUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMscUJBQWUsWUFBTTtBQUN6QyxZQUFLLGdDQUFnQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ2pELENBQUMsQ0FBQyxDQUFDO0dBQ0w7O2VBaEJVLG9CQUFvQjs7V0FrQnhCLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1dBRTJCLHNDQUMxQixVQUFzQixFQUN0QixPQUE4QyxFQUN4QztBQUNOLFVBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxHQUFHLENBQ3ZDLCtCQUErQixDQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLDJCQUEyQixDQUFDLFVBQVUsQ0FBQyxDQUNyRCxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FDckIsQ0FBQztLQUNIOzs7Ozs7OztXQU1zQixpQ0FBQyxVQUFzQixFQUFvQztBQUNoRixVQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDMUMsWUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM1RCxpQ0FBVSxZQUFZLENBQUMsQ0FBQztBQUN4QixlQUFPLFlBQVksQ0FBQztPQUNyQjtBQUNELFVBQU0sT0FBTyxHQUFHLElBQUksZ0JBQUcsZUFBZSxFQUFFLENBQUM7QUFDekMsVUFBSSxDQUFDLDRCQUE0QixDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN2RCxVQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFaEQsYUFBTyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUM7S0FDL0I7OztXQUVrQiwrQkFBUzs7QUFFMUIsVUFBSSxDQUFDLGdDQUFnQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2hELFVBQUksQ0FBQyxnQ0FBZ0MsR0FBRywrQkFBeUIsQ0FBQztBQUNsRSx3QkFBb0MsSUFBSSxDQUFDLGlCQUFpQixFQUFFOzs7WUFBaEQsVUFBVTtZQUFFLE9BQU87O0FBQzdCLFlBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUU7O0FBRTNCLGNBQUksQ0FBQyxpQkFBaUIsVUFBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzFDLG1CQUFTO1NBQ1Y7QUFDRCxZQUFJLENBQUMsNEJBQTRCLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQ3hEO0tBQ0Y7OztTQTlEVSxvQkFBb0IiLCJmaWxlIjoiV2F0Y2hFeHByZXNzaW9uU3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBCcmlkZ2UgZnJvbSAnLi9CcmlkZ2UnO1xuaW1wb3J0IHR5cGUge0V2YWx1YXRpb25SZXN1bHR9IGZyb20gJy4vQnJpZGdlJztcblxuaW1wb3J0IHtcbiAgQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgRGlzcG9zYWJsZSxcbn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtvYnNlcnZhYmxlc30gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmNvbnN0IHtpbmNvbXBsZXRlT2JzZXJ2YWJsZUZyb21Qcm9taXNlfSA9IG9ic2VydmFibGVzO1xuXG50eXBlIEV4cHJlc3Npb24gPSBzdHJpbmc7XG5cbmV4cG9ydCBjbGFzcyBXYXRjaEV4cHJlc3Npb25TdG9yZSB7XG4gIF9icmlkZ2U6IEJyaWRnZTtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfd2F0Y2hFeHByZXNzaW9uczogTWFwPEV4cHJlc3Npb24sIFJ4LkJlaGF2aW9yU3ViamVjdDw/RXZhbHVhdGlvblJlc3VsdD4+O1xuICBfcHJldmlvdXNFdmFsdWF0aW9uU3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihicmlkZ2U6IEJyaWRnZSkge1xuICAgIHRoaXMuX2JyaWRnZSA9IGJyaWRnZTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fd2F0Y2hFeHByZXNzaW9ucyA9IG5ldyBNYXAoKTtcbiAgICAvLyBgdGhpcy5fcHJldmlvdXNFdmFsdWF0aW9uU3Vic2NyaXB0aW9uc2AgY2FuIGNoYW5nZSBhdCBhbnkgdGltZSBhbmQgYXJlIGEgZGlzdGluY3Qgc3Vic2V0IG9mXG4gICAgLy8gYHRoaXMuX2Rpc3Bvc2FibGVzYC5cbiAgICB0aGlzLl9wcmV2aW91c0V2YWx1YXRpb25TdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5fcHJldmlvdXNFdmFsdWF0aW9uU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgfSkpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBfcmVxdWVzdEV4cHJlc3Npb25FdmFsdWF0aW9uKFxuICAgIGV4cHJlc3Npb246IEV4cHJlc3Npb24sXG4gICAgc3ViamVjdDogUnguQmVoYXZpb3JTdWJqZWN0PD9FdmFsdWF0aW9uUmVzdWx0PixcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5fcHJldmlvdXNFdmFsdWF0aW9uU3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBpbmNvbXBsZXRlT2JzZXJ2YWJsZUZyb21Qcm9taXNlKFxuICAgICAgICB0aGlzLl9icmlkZ2UuZXZhbHVhdGVPblNlbGVjdGVkQ2FsbEZyYW1lKGV4cHJlc3Npb24pXG4gICAgICApLnN1YnNjcmliZShzdWJqZWN0KVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBvYnNlcnZhYmxlIG9mIGV2YWx1YXRpb24gcmVzdWx0cyBmb3IgYSBnaXZlbiBleHByZXNzaW9uLlxuICAgKiBSZXNvdXJjZXMgYXJlIGF1dG9tYXRpY2FsbHkgY2xlYW5lZCB1cCBvbmNlIGFsbCBzdWJzY3JpYmVycyBvZiBhbiBleHByZXNzaW9uIGhhdmUgdW5zdWJzY3JpYmVkLlxuICAgKi9cbiAgZXZhbHVhdGVXYXRjaEV4cHJlc3Npb24oZXhwcmVzc2lvbjogRXhwcmVzc2lvbik6IFJ4Lk9ic2VydmFibGU8P0V2YWx1YXRpb25SZXN1bHQ+IHtcbiAgICBpZiAodGhpcy5fd2F0Y2hFeHByZXNzaW9ucy5oYXMoZXhwcmVzc2lvbikpIHtcbiAgICAgIGNvbnN0IGNhY2hlZFJlc3VsdCA9IHRoaXMuX3dhdGNoRXhwcmVzc2lvbnMuZ2V0KGV4cHJlc3Npb24pO1xuICAgICAgaW52YXJpYW50KGNhY2hlZFJlc3VsdCk7XG4gICAgICByZXR1cm4gY2FjaGVkUmVzdWx0O1xuICAgIH1cbiAgICBjb25zdCBzdWJqZWN0ID0gbmV3IFJ4LkJlaGF2aW9yU3ViamVjdCgpO1xuICAgIHRoaXMuX3JlcXVlc3RFeHByZXNzaW9uRXZhbHVhdGlvbihleHByZXNzaW9uLCBzdWJqZWN0KTtcbiAgICB0aGlzLl93YXRjaEV4cHJlc3Npb25zLnNldChleHByZXNzaW9uLCBzdWJqZWN0KTtcbiAgICAvLyBFeHBvc2UgYW4gb2JzZXJ2YWJsZSByYXRoZXIgdGhhbiB0aGUgcmF3IHN1YmplY3QuXG4gICAgcmV0dXJuIHN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICB0cmlnZ2VyUmVldmFsdWF0aW9uKCk6IHZvaWQge1xuICAgIC8vIENhbmNlbCBhbnkgb3V0c3RhbmRpbmcgZXZhbHVhdGlvbiByZXF1ZXN0cyB0byB0aGUgQnJpZGdlXG4gICAgdGhpcy5fcHJldmlvdXNFdmFsdWF0aW9uU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgdGhpcy5fcHJldmlvdXNFdmFsdWF0aW9uU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgZm9yIChjb25zdCBbZXhwcmVzc2lvbiwgc3ViamVjdF0gb2YgdGhpcy5fd2F0Y2hFeHByZXNzaW9ucykge1xuICAgICAgaWYgKCFzdWJqZWN0Lmhhc09ic2VydmVycygpKSB7XG4gICAgICAgIC8vIE5vYm9keSBpcyB3YXRjaGluZyB0aGlzIGV4cHJlc3Npb24gYW55bW9yZS5cbiAgICAgICAgdGhpcy5fd2F0Y2hFeHByZXNzaW9ucy5kZWxldGUoZXhwcmVzc2lvbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5fcmVxdWVzdEV4cHJlc3Npb25FdmFsdWF0aW9uKGV4cHJlc3Npb24sIHN1YmplY3QpO1xuICAgIH1cbiAgfVxufVxuIl19