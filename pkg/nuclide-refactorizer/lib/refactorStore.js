'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStore = getStore;
exports.getErrors = getErrors;

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('nuclide-commons/redux-observable');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _refactorReducers;

function _load_refactorReducers() {
  return _refactorReducers = _interopRequireDefault(require('./refactorReducers'));
}

var _refactorEpics;

function _load_refactorEpics() {
  return _refactorEpics = require('./refactorEpics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO create this lazily
const errors = new _rxjsBundlesRxMinJs.Subject(); /**
                                                   * Copyright (c) 2015-present, Facebook, Inc.
                                                   * All rights reserved.
                                                   *
                                                   * This source code is licensed under the license found in the LICENSE file in
                                                   * the root directory of this source tree.
                                                   *
                                                   * 
                                                   * @format
                                                   */

function handleError(error) {
  (0, (_log4js || _load_log4js()).getLogger)('nuclide-refactorizer').error('Uncaught exception in refactoring:', error);
  errors.next(error);
}

function getStore(providers) {
  const rootEpic = (actions, store) => {
    return (0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...(0, (_refactorEpics || _load_refactorEpics()).getEpics)(providers))(actions, store).catch((error, stream) => {
      handleError(error);
      return stream;
    });
  };
  const exceptionHandler = store => next => action => {
    try {
      return next(action);
    } catch (e) {
      handleError(e);
    }
  };
  return (0, (_redux || _load_redux()).createStore)((_refactorReducers || _load_refactorReducers()).default, (0, (_redux || _load_redux()).applyMiddleware)(exceptionHandler, (0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)(rootEpic)));
}

function getErrors() {
  return errors.asObservable();
}