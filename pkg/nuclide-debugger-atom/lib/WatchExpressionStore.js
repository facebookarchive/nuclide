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

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

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
      this._previousEvaluationSubscriptions.add(new _nuclideCommons.DisposableSubscription(incompleteObservableFromPromise(this._bridge.evaluateOnSelectedCallFrame(expression)).subscribe(subject)));
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
      var subject = new _reactivexRxjs2['default'].BehaviorSubject();
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

        if (subject.observers == null || subject.observers.length === 0) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldhdGNoRXhwcmVzc2lvblN0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWlCTyxNQUFNOzs2QkFDRSxpQkFBaUI7Ozs7c0JBQ1YsUUFBUTs7Ozs4QkFDb0IsdUJBQXVCOztJQUNsRSwrQkFBK0IsK0JBQS9CLCtCQUErQjs7SUFJekIsb0JBQW9CO0FBTXBCLFdBTkEsb0JBQW9CLENBTW5CLE1BQWMsRUFBRTs7OzBCQU5qQixvQkFBb0I7O0FBTzdCLFFBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxZQUFZLEdBQUcsK0JBQXlCLENBQUM7QUFDOUMsUUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7OztBQUduQyxRQUFJLENBQUMsZ0NBQWdDLEdBQUcsK0JBQXlCLENBQUM7QUFDbEUsUUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMscUJBQWUsWUFBTTtBQUN6QyxZQUFLLGdDQUFnQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ2pELENBQUMsQ0FBQyxDQUFDO0dBQ0w7O2VBaEJVLG9CQUFvQjs7V0FrQnhCLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1dBRTJCLHNDQUMxQixVQUFzQixFQUN0QixPQUE4QyxFQUN4QztBQUNOLFVBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxHQUFHLENBQ3ZDLDJDQUNFLCtCQUErQixDQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLDJCQUEyQixDQUFDLFVBQVUsQ0FBQyxDQUNyRCxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FDckIsQ0FDRixDQUFDO0tBQ0g7Ozs7Ozs7O1dBTXNCLGlDQUFDLFVBQXNCLEVBQW9DO0FBQ2hGLFVBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUMxQyxZQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzVELGlDQUFVLFlBQVksQ0FBQyxDQUFDO0FBQ3hCLGVBQU8sWUFBWSxDQUFDO09BQ3JCO0FBQ0QsVUFBTSxPQUFPLEdBQUcsSUFBSSwyQkFBRyxlQUFlLEVBQUUsQ0FBQztBQUN6QyxVQUFJLENBQUMsNEJBQTRCLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZELFVBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUVoRCxhQUFPLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztLQUMvQjs7O1dBRWtCLCtCQUFTOztBQUUxQixVQUFJLENBQUMsZ0NBQWdDLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDaEQsVUFBSSxDQUFDLGdDQUFnQyxHQUFHLCtCQUF5QixDQUFDO0FBQ2xFLHdCQUFvQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7OztZQUFoRCxVQUFVO1lBQUUsT0FBTzs7QUFDN0IsWUFBSSxPQUFPLENBQUMsU0FBUyxJQUFJLElBQUksSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7O0FBRS9ELGNBQUksQ0FBQyxpQkFBaUIsVUFBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzFDLG1CQUFTO1NBQ1Y7QUFDRCxZQUFJLENBQUMsNEJBQTRCLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQ3hEO0tBQ0Y7OztTQWhFVSxvQkFBb0IiLCJmaWxlIjoiV2F0Y2hFeHByZXNzaW9uU3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBCcmlkZ2UgZnJvbSAnLi9CcmlkZ2UnO1xuaW1wb3J0IHR5cGUge0V2YWx1YXRpb25SZXN1bHR9IGZyb20gJy4vQnJpZGdlJztcblxuaW1wb3J0IHtcbiAgQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgRGlzcG9zYWJsZSxcbn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgUnggZnJvbSAnQHJlYWN0aXZleC9yeGpzJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7RGlzcG9zYWJsZVN1YnNjcmlwdGlvbiwgb2JzZXJ2YWJsZXN9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5jb25zdCB7aW5jb21wbGV0ZU9ic2VydmFibGVGcm9tUHJvbWlzZX0gPSBvYnNlcnZhYmxlcztcblxudHlwZSBFeHByZXNzaW9uID0gc3RyaW5nO1xuXG5leHBvcnQgY2xhc3MgV2F0Y2hFeHByZXNzaW9uU3RvcmUge1xuICBfYnJpZGdlOiBCcmlkZ2U7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3dhdGNoRXhwcmVzc2lvbnM6IE1hcDxFeHByZXNzaW9uLCBSeC5CZWhhdmlvclN1YmplY3Q8P0V2YWx1YXRpb25SZXN1bHQ+PjtcbiAgX3ByZXZpb3VzRXZhbHVhdGlvblN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoYnJpZGdlOiBCcmlkZ2UpIHtcbiAgICB0aGlzLl9icmlkZ2UgPSBicmlkZ2U7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3dhdGNoRXhwcmVzc2lvbnMgPSBuZXcgTWFwKCk7XG4gICAgLy8gYHRoaXMuX3ByZXZpb3VzRXZhbHVhdGlvblN1YnNjcmlwdGlvbnNgIGNhbiBjaGFuZ2UgYXQgYW55IHRpbWUgYW5kIGFyZSBhIGRpc3RpbmN0IHN1YnNldCBvZlxuICAgIC8vIGB0aGlzLl9kaXNwb3NhYmxlc2AuXG4gICAgdGhpcy5fcHJldmlvdXNFdmFsdWF0aW9uU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHRoaXMuX3ByZXZpb3VzRXZhbHVhdGlvblN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIH0pKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX3JlcXVlc3RFeHByZXNzaW9uRXZhbHVhdGlvbihcbiAgICBleHByZXNzaW9uOiBFeHByZXNzaW9uLFxuICAgIHN1YmplY3Q6IFJ4LkJlaGF2aW9yU3ViamVjdDw/RXZhbHVhdGlvblJlc3VsdD4sXG4gICk6IHZvaWQge1xuICAgIHRoaXMuX3ByZXZpb3VzRXZhbHVhdGlvblN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgbmV3IERpc3Bvc2FibGVTdWJzY3JpcHRpb24oXG4gICAgICAgIGluY29tcGxldGVPYnNlcnZhYmxlRnJvbVByb21pc2UoXG4gICAgICAgICAgdGhpcy5fYnJpZGdlLmV2YWx1YXRlT25TZWxlY3RlZENhbGxGcmFtZShleHByZXNzaW9uKVxuICAgICAgICApLnN1YnNjcmliZShzdWJqZWN0KVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBvYnNlcnZhYmxlIG9mIGV2YWx1YXRpb24gcmVzdWx0cyBmb3IgYSBnaXZlbiBleHByZXNzaW9uLlxuICAgKiBSZXNvdXJjZXMgYXJlIGF1dG9tYXRpY2FsbHkgY2xlYW5lZCB1cCBvbmNlIGFsbCBzdWJzY3JpYmVycyBvZiBhbiBleHByZXNzaW9uIGhhdmUgdW5zdWJzY3JpYmVkLlxuICAgKi9cbiAgZXZhbHVhdGVXYXRjaEV4cHJlc3Npb24oZXhwcmVzc2lvbjogRXhwcmVzc2lvbik6IFJ4Lk9ic2VydmFibGU8P0V2YWx1YXRpb25SZXN1bHQ+IHtcbiAgICBpZiAodGhpcy5fd2F0Y2hFeHByZXNzaW9ucy5oYXMoZXhwcmVzc2lvbikpIHtcbiAgICAgIGNvbnN0IGNhY2hlZFJlc3VsdCA9IHRoaXMuX3dhdGNoRXhwcmVzc2lvbnMuZ2V0KGV4cHJlc3Npb24pO1xuICAgICAgaW52YXJpYW50KGNhY2hlZFJlc3VsdCk7XG4gICAgICByZXR1cm4gY2FjaGVkUmVzdWx0O1xuICAgIH1cbiAgICBjb25zdCBzdWJqZWN0ID0gbmV3IFJ4LkJlaGF2aW9yU3ViamVjdCgpO1xuICAgIHRoaXMuX3JlcXVlc3RFeHByZXNzaW9uRXZhbHVhdGlvbihleHByZXNzaW9uLCBzdWJqZWN0KTtcbiAgICB0aGlzLl93YXRjaEV4cHJlc3Npb25zLnNldChleHByZXNzaW9uLCBzdWJqZWN0KTtcbiAgICAvLyBFeHBvc2UgYW4gb2JzZXJ2YWJsZSByYXRoZXIgdGhhbiB0aGUgcmF3IHN1YmplY3QuXG4gICAgcmV0dXJuIHN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICB0cmlnZ2VyUmVldmFsdWF0aW9uKCk6IHZvaWQge1xuICAgIC8vIENhbmNlbCBhbnkgb3V0c3RhbmRpbmcgZXZhbHVhdGlvbiByZXF1ZXN0cyB0byB0aGUgQnJpZGdlXG4gICAgdGhpcy5fcHJldmlvdXNFdmFsdWF0aW9uU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgdGhpcy5fcHJldmlvdXNFdmFsdWF0aW9uU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgZm9yIChjb25zdCBbZXhwcmVzc2lvbiwgc3ViamVjdF0gb2YgdGhpcy5fd2F0Y2hFeHByZXNzaW9ucykge1xuICAgICAgaWYgKHN1YmplY3Qub2JzZXJ2ZXJzID09IG51bGwgfHwgc3ViamVjdC5vYnNlcnZlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIC8vIE5vYm9keSBpcyB3YXRjaGluZyB0aGlzIGV4cHJlc3Npb24gYW55bW9yZS5cbiAgICAgICAgdGhpcy5fd2F0Y2hFeHByZXNzaW9ucy5kZWxldGUoZXhwcmVzc2lvbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5fcmVxdWVzdEV4cHJlc3Npb25FdmFsdWF0aW9uKGV4cHJlc3Npb24sIHN1YmplY3QpO1xuICAgIH1cbiAgfVxufVxuIl19