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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _rxjs2;

function _rxjs() {
  return _rxjs2 = _interopRequireDefault(require('rxjs'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideCommons2;

function _nuclideCommons() {
  return _nuclideCommons2 = require('../../nuclide-commons');
}

var incompleteObservableFromPromise = (_nuclideCommons2 || _nuclideCommons()).observables.incompleteObservableFromPromise;

var WatchExpressionStore = (function () {
  function WatchExpressionStore(bridge) {
    var _this = this;

    _classCallCheck(this, WatchExpressionStore);

    this._bridge = bridge;
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._watchExpressions = new Map();
    // `this._previousEvaluationSubscriptions` can change at any time and are a distinct subset of
    // `this._disposables`.
    this._previousEvaluationSubscriptions = new (_atom2 || _atom()).CompositeDisposable();
    this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
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
      this._previousEvaluationSubscriptions.add(new (_nuclideCommons2 || _nuclideCommons()).DisposableSubscription(incompleteObservableFromPromise(this._bridge.evaluateOnSelectedCallFrame(expression)).subscribe(subject)));
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
        (0, (_assert2 || _assert()).default)(cachedResult);
        return cachedResult;
      }
      var subject = new (_rxjs2 || _rxjs()).default.BehaviorSubject();
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
      this._previousEvaluationSubscriptions = new (_atom2 || _atom()).CompositeDisposable();
      for (var _ref3 of this._watchExpressions) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var expression = _ref2[0];
        var subject = _ref2[1];

        if (subject.observers == null || subject.observers.length === 0) {
          // Nobody is watching this expression anymore.
          this._watchExpressions.delete(expression);
          continue;
        }
        this._requestExpressionEvaluation(expression, subject);
      }
    }
  }]);

  return WatchExpressionStore;
})();

exports.WatchExpressionStore = WatchExpressionStore;