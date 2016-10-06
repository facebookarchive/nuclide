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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _redux2;

function _redux() {
  return _redux2 = require('redux');
}

var _commonsNodeReduxObservable2;

function _commonsNodeReduxObservable() {
  return _commonsNodeReduxObservable2 = require('../../commons-node/redux-observable');
}

var _refactorReducers2;

function _refactorReducers() {
  return _refactorReducers2 = _interopRequireDefault(require('./refactorReducers'));
}

var _refactorEpics2;

function _refactorEpics() {
  return _refactorEpics2 = require('./refactorEpics');
}

function getStore(providers) {
  return (0, (_redux2 || _redux()).createStore)((_refactorReducers2 || _refactorReducers()).default, (0, (_redux2 || _redux()).applyMiddleware)((0, (_commonsNodeReduxObservable2 || _commonsNodeReduxObservable()).createEpicMiddleware)((0, (_commonsNodeReduxObservable2 || _commonsNodeReduxObservable()).combineEpics).apply(undefined, _toConsumableArray((0, (_refactorEpics2 || _refactorEpics()).getEpics)(providers))))));
}