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

exports.getStore = getStore;
exports.getErrors = getErrors;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _commonsNodeReduxObservable;

function _load_commonsNodeReduxObservable() {
  return _commonsNodeReduxObservable = require('../../commons-node/redux-observable');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _refactorReducers;

function _load_refactorReducers() {
  return _refactorReducers = _interopRequireDefault(require('./refactorReducers'));
}

var _refactorEpics;

function _load_refactorEpics() {
  return _refactorEpics = require('./refactorEpics');
}

// TODO create this lazily
var errors = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();

function handleError(error) {
  (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Uncaught exception in refactoring:', error);
  errors.next(error);
}

function getStore(providers) {
  var rootEpic = function rootEpic(actions, store) {
    return (0, (_commonsNodeReduxObservable || _load_commonsNodeReduxObservable()).combineEpics).apply(undefined, _toConsumableArray((0, (_refactorEpics || _load_refactorEpics()).getEpics)(providers)))(actions, store).catch(function (error, stream) {
      handleError(error);
      return stream;
    });
  };
  var exceptionHandler = function exceptionHandler(store) {
    return function (next) {
      return function (action) {
        try {
          return next(action);
        } catch (e) {
          handleError(e);
        }
      };
    };
  };
  return (0, (_redux || _load_redux()).createStore)((_refactorReducers || _load_refactorReducers()).default, (0, (_redux || _load_redux()).applyMiddleware)(exceptionHandler, (0, (_commonsNodeReduxObservable || _load_commonsNodeReduxObservable()).createEpicMiddleware)(rootEpic)));
}

function getErrors() {
  return errors.asObservable();
}