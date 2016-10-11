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

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

var _commonsNodeReduxObservable;

function _load_commonsNodeReduxObservable() {
  return _commonsNodeReduxObservable = require('../../commons-node/redux-observable');
}

var _refactorReducers;

function _load_refactorReducers() {
  return _refactorReducers = _interopRequireDefault(require('./refactorReducers'));
}

var _refactorEpics;

function _load_refactorEpics() {
  return _refactorEpics = require('./refactorEpics');
}

function getStore(providers) {
  return (0, (_redux || _load_redux()).createStore)((_refactorReducers || _load_refactorReducers()).default, (0, (_redux || _load_redux()).applyMiddleware)((0, (_commonsNodeReduxObservable || _load_commonsNodeReduxObservable()).createEpicMiddleware)((0, (_commonsNodeReduxObservable || _load_commonsNodeReduxObservable()).combineEpics).apply(undefined, _toConsumableArray((0, (_refactorEpics || _load_refactorEpics()).getEpics)(providers))))));
}