var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideCommons = require('../../nuclide-commons');

var _atom = require('atom');

var _ActionTypes = require('./ActionTypes');

var ActionTypes = _interopRequireWildcard(_ActionTypes);

var _Commands = require('./Commands');

var _Commands2 = _interopRequireDefault(_Commands);

var _createConsoleGadget = require('./createConsoleGadget');

var _createConsoleGadget2 = _interopRequireDefault(_createConsoleGadget);

var _createStateStream = require('./createStateStream');

var _createStateStream2 = _interopRequireDefault(_createStateStream);

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _OutputService = require('./OutputService');

var _OutputService2 = _interopRequireDefault(_OutputService);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _rxjs = require('rxjs');

var _rxjs2 = _interopRequireDefault(_rxjs);

var Activation = (function () {
  function Activation(rawState) {
    var _this = this;

    _classCallCheck(this, Activation);

    var action$ = new _rxjs2['default'].Subject();
    var initialState = deserializeAppState(rawState);
    this._state$ = new _rxjs2['default'].BehaviorSubject(initialState);
    (0, _createStateStream2['default'])(action$.asObservable(), initialState).sampleTime(100).subscribe(this._state$);
    this._commands = new _Commands2['default'](action$, function () {
      return _this._state$.getValue();
    });
    this._outputService = new _OutputService2['default'](this._commands);
    this._disposables = new _atom.CompositeDisposable(atom.contextMenu.add({
      '.nuclide-console-record': [{
        label: 'Copy Message',
        command: 'nuclide-console:copy-message'
      }]
    }), atom.commands.add('.nuclide-console-record', 'nuclide-console:copy-message', function (event) {
      var el = event.target;
      if (el == null || el.innerText == null) {
        return;
      }
      atom.clipboard.write(el.innerText);
    }), _nuclideFeatureConfig2['default'].observe('nuclide-console.maximumMessageCount', function (maxMessageCount) {
      return _this._commands.setMaxMessageCount(maxMessageCount);
    }),

    // Action side-effects
    new _nuclideCommons.DisposableSubscription(action$.subscribe(function (action) {
      if (action.type !== ActionTypes.EXECUTE) {
        return;
      }
      var _action$payload = action.payload;
      var executorId = _action$payload.executorId;
      var code = _action$payload.code;

      var executors = _this._state$.getValue().executors;
      var executor = executors.get(executorId);
      (0, _assert2['default'])(executor);
      executor.execute(code);
    })));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'consumeGadgetsService',
    value: function consumeGadgetsService(gadgetsApi) {
      var OutputGadget = (0, _createConsoleGadget2['default'])(this._state$.asObservable(), this._commands);
      return gadgetsApi.registerGadget(OutputGadget);
    }
  }, {
    key: 'provideOutputService',
    value: function provideOutputService() {
      return this._outputService;
    }
  }, {
    key: 'provideRegisterExecutor',
    value: function provideRegisterExecutor() {
      var _this2 = this;

      return function (executor) {
        _this2._commands.registerExecutor(executor);
        return new _atom.Disposable(function () {
          _this2._commands.unregisterExecutor(executor);
        });
      };
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      var state = this._state$.getValue();
      return {
        records: state.records
      };
    }
  }]);

  return Activation;
})();

function deserializeAppState(rawState) {
  rawState = rawState || {};
  return {
    executors: new Map(),
    currentExecutorId: null,
    records: rawState.records || [],
    providers: new Map(),
    providerSubscriptions: new Map(),

    // This value will be replaced with the value form the config. We just use `POSITIVE_INFINITY`
    // here to conform to the AppState type defintion.
    maxMessageCount: Number.POSITIVE_INFINITY
  };
}

module.exports = Activation;