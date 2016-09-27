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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _DebuggerStore2;

function _DebuggerStore() {
  return _DebuggerStore2 = require('./DebuggerStore');
}

var _Constants2;

function _Constants() {
  return _Constants2 = require('./Constants');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _normalizeRemoteObjectValue2;

function _normalizeRemoteObjectValue() {
  return _normalizeRemoteObjectValue2 = require('./normalizeRemoteObjectValue');
}

var WatchExpressionStore = (function () {
  function WatchExpressionStore(dispatcher, bridge) {
    var _this = this;

    _classCallCheck(this, WatchExpressionStore);

    this._evaluationId = 0;
    this._isPaused = false;
    this._bridge = bridge;
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._watchExpressions = new Map();
    this._evaluationRequestsInFlight = new Map();
    this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
      return _this._watchExpressions.clear();
    }));
    // `this._previousEvaluationSubscriptions` can change at any time and are a distinct subset of
    // `this._disposables`.
    this._previousEvaluationSubscriptions = new (_atom2 || _atom()).CompositeDisposable();
    this._disposables.add(this._previousEvaluationSubscriptions);
    var _dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
      dispatcher.unregister(_dispatcherToken);
    }));
  }

  _createClass(WatchExpressionStore, [{
    key: '_handlePayload',
    value: function _handlePayload(payload) {
      switch (payload.actionType) {
        case (_Constants2 || _Constants()).Actions.CLEAR_INTERFACE:
          {
            this._clearEvaluationValues();
            break;
          }
        case (_Constants2 || _Constants()).Actions.DEBUGGER_MODE_CHANGE:
          {
            this._isPaused = false;
            if (payload.data === (_DebuggerStore2 || _DebuggerStore()).DebuggerMode.PAUSED) {
              this._isPaused = true;
              this._triggerReevaluation();
            } else if (payload.data === (_DebuggerStore2 || _DebuggerStore()).DebuggerMode.STOPPED) {
              this._cancelRequestsToBridge();
              this._clearEvaluationValues();
            }
            break;
          }
        case (_Constants2 || _Constants()).Actions.RECEIVED_GET_PROPERTIES_RESPONSE:
          {
            var _payload$data = payload.data;
            var id = _payload$data.id;
            var response = _payload$data.response;

            this._handleResponseForPendingRequest(id, response);
            break;
          }
        case (_Constants2 || _Constants()).Actions.RECEIVED_EXPRESSION_EVALUATION_RESPONSE:
          {
            var _payload$data2 = payload.data;
            var id = _payload$data2.id;
            var response = _payload$data2.response;

            response.result = (0, (_normalizeRemoteObjectValue2 || _normalizeRemoteObjectValue()).normalizeRemoteObjectValue)(response.result);
            this._handleResponseForPendingRequest(id, response);
            break;
          }
        default:
          {
            return;
          }
      }
    }
  }, {
    key: '_triggerReevaluation',
    value: function _triggerReevaluation() {
      this._cancelRequestsToBridge();
      for (var _ref3 of this._watchExpressions) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var expression = _ref2[0];
        var subject = _ref2[1];

        if (subject.observers == null || subject.observers.length === 0) {
          // Nobody is watching this expression anymore.
          this._watchExpressions.delete(expression);
          continue;
        }
        this._requestExpressionEvaluation(expression, subject, false /* no REPL support */);
      }
    }
  }, {
    key: '_cancelRequestsToBridge',
    value: function _cancelRequestsToBridge() {
      this._previousEvaluationSubscriptions.dispose();
      this._previousEvaluationSubscriptions = new (_atom2 || _atom()).CompositeDisposable();
    }

    // Resets all values to N/A, for examples when the debugger resumes or stops.
  }, {
    key: '_clearEvaluationValues',
    value: function _clearEvaluationValues() {
      for (var subject of this._watchExpressions.values()) {
        subject.next(null);
      }
    }

    /**
     * Returns an observable of child properties for the given objectId.
     * Resources are automatically cleaned up once all subscribers of an expression have unsubscribed.
     */
  }, {
    key: 'getProperties',
    value: function getProperties(objectId) {
      var getPropertiesPromise = this._sendEvaluationCommand('getProperties', objectId);
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromPromise(getPropertiesPromise);
    }
  }, {
    key: 'evaluateConsoleExpression',
    value: function evaluateConsoleExpression(expression) {
      return this._evaluateExpression(expression, true /* support REPL */);
    }
  }, {
    key: 'evaluateWatchExpression',
    value: function evaluateWatchExpression(expression) {
      return this._evaluateExpression(expression, false /* do not support REPL */);
    }

    /**
     * Returns an observable of evaluation results for a given expression.
     * Resources are automatically cleaned up once all subscribers of an expression have unsubscribed.
     *
     * The supportRepl boolean indicates if we allow evaluation in a non-paused state.
     */
  }, {
    key: '_evaluateExpression',
    value: function _evaluateExpression(expression, supportRepl) {
      if (!supportRepl && this._watchExpressions.has(expression)) {
        var cachedResult = this._watchExpressions.get(expression);
        (0, (_assert2 || _assert()).default)(cachedResult);
        return cachedResult;
      }
      var subject = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).BehaviorSubject();
      this._requestExpressionEvaluation(expression, subject, supportRepl);
      if (!supportRepl) {
        this._watchExpressions.set(expression, subject);
      }
      // Expose an observable rather than the raw subject.
      return subject.asObservable();
    }
  }, {
    key: '_requestExpressionEvaluation',
    value: function _requestExpressionEvaluation(expression, subject, supportRepl) {
      var evaluationPromise = undefined;
      if (supportRepl) {
        evaluationPromise = this._isPaused ? this._evaluateOnSelectedCallFrame(expression, 'console') : this._runtimeEvaluate(expression);
      } else {
        evaluationPromise = this._evaluateOnSelectedCallFrame(expression, 'watch-group');
      }

      var evaluationDisposable = new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromPromise(evaluationPromise).merge((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.never()) // So that we do not unsubscribe `subject` when disposed.
      .subscribe(subject));

      // Non-REPL environments will want to record these requests so they can be canceled on
      // re-evaluation, e.g. in the case of stepping.  REPL environments should let them complete so
      // we can have e.g. a history of evaluations in the console.
      if (!supportRepl) {
        this._previousEvaluationSubscriptions.add(evaluationDisposable);
      } else {
        this._disposables.add(evaluationDisposable);
      }
    }
  }, {
    key: '_evaluateOnSelectedCallFrame',
    value: _asyncToGenerator(function* (expression, objectGroup) {
      var result = yield this._sendEvaluationCommand('evaluateOnSelectedCallFrame', expression, objectGroup);
      if (result == null) {
        // TODO: It would be nice to expose a better error from the backend here.
        return {
          type: 'text',
          value: 'Failed to evaluate: ' + expression
        };
      } else {
        return result;
      }
    })
  }, {
    key: '_runtimeEvaluate',
    value: _asyncToGenerator(function* (expression) {
      var result = yield this._sendEvaluationCommand('runtimeEvaluate', expression);
      if (result == null) {
        // TODO: It would be nice to expose a better error from the backend here.
        return {
          type: 'text',
          value: 'Failed to evaluate: ' + expression
        };
      } else {
        return result;
      }
    })
  }, {
    key: '_sendEvaluationCommand',
    value: _asyncToGenerator(function* (command) {
      var _bridge;

      var deferred = new (_commonsNodePromise2 || _commonsNodePromise()).Deferred();
      var evalId = this._evaluationId;
      ++this._evaluationId;
      this._evaluationRequestsInFlight.set(evalId, deferred);

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      (_bridge = this._bridge).sendEvaluationCommand.apply(_bridge, [command, evalId].concat(args));
      var result = null;
      try {
        result = yield deferred.promise;
      } catch (e) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().warn(command + ': Error getting result.', e);
      }
      this._evaluationRequestsInFlight.delete(evalId);
      return result;
    })
  }, {
    key: '_handleResponseForPendingRequest',
    value: function _handleResponseForPendingRequest(id, response) {
      var result = response.result;
      var error = response.error;

      var deferred = this._evaluationRequestsInFlight.get(id);
      if (deferred == null) {
        // Nobody is listening for the result of this expression.
        return;
      }
      if (error != null) {
        deferred.reject(error);
      } else {
        deferred.resolve(result);
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return WatchExpressionStore;
})();

exports.WatchExpressionStore = WatchExpressionStore;