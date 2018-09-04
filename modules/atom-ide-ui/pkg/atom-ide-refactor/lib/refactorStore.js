"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStore = getStore;
exports.getErrors = getErrors;

function _reduxMin() {
  const data = require("redux/dist/redux.min.js");

  _reduxMin = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _reduxObservable() {
  const data = require("../../../../nuclide-commons/redux-observable");

  _reduxObservable = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _refactorReducers() {
  const data = _interopRequireDefault(require("./refactorReducers"));

  _refactorReducers = function () {
    return data;
  };

  return data;
}

function _refactorEpics() {
  const data = require("./refactorEpics");

  _refactorEpics = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
// $FlowFixMe - Redux is currently untyped!!
// TODO create this lazily
const errors = new _RxMin.Subject();

function handleError(error) {
  (0, _log4js().getLogger)('nuclide-refactorizer').error('Uncaught exception in refactoring:', error);
  errors.next(error);
}

function getStore(providers) {
  const rootEpic = (actions, store) => {
    return (0, _reduxObservable().combineEpics)(...(0, _refactorEpics().getEpics)(providers))(actions, store).catch((error, stream) => {
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

  return (0, _reduxMin().createStore)(_refactorReducers().default, (0, _reduxMin().applyMiddleware)(exceptionHandler, (0, _reduxObservable().createEpicMiddleware)(rootEpic)));
}

function getErrors() {
  return errors.asObservable();
}