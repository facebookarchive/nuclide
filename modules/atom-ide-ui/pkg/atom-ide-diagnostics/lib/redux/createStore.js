'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createStore;

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('nuclide-commons/redux-observable');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _Reducers;

function _load_Reducers() {
  return _Reducers = _interopRequireWildcard(require('./Reducers'));
}

var _Epics;

function _load_Epics() {
  return _Epics = _interopRequireWildcard(require('./Epics'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

function createStore(messageRangeTracker, initialState = INITIAL_STATE) {
  const epics = Object.keys(_Epics || _load_Epics()).map(k => (_Epics || _load_Epics())[k]).filter(epic => typeof epic === 'function');
  const rootEpic = (actions, store) => (0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics)(actions, store, { messageRangeTracker })
  // Log errors and continue.
  .catch((err, stream) => {
    (0, (_log4js || _load_log4js()).getLogger)('atom-ide-diagnostics').error(err);
    return stream;
  });
  const store = (0, (_redux || _load_redux()).createStore)((0, (_redux || _load_redux()).combineReducers)(_Reducers || _load_Reducers()), initialState, (0, (_redux || _load_redux()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)(rootEpic)));

  // When we get new messages with fixes, track them.
  const messagesWithFixes = getFileMessages(store).map(messageSet => (0, (_collection || _load_collection()).setFilter)(messageSet, message => message.fix != null)).filter(messageSet => messageSet.size > 0);
  messagesWithFixes.let((0, (_observable || _load_observable()).diffSets)()).subscribe(({ added, removed }) => {
    if (added.size > 0) {
      messageRangeTracker.addFileMessages(added);
    }
    if (removed.size > 0) {
      messageRangeTracker.removeFileMessages(removed);
    }
  });

  return store;
}

const INITIAL_STATE = {
  messages: new Map(),
  codeActionFetcher: null,
  codeActionsForMessage: new Map(),
  providers: new Set()
};

function getFileMessages(store) {
  // $FlowFixMe: Flow doesn't understand Symbol.observable.
  const states = _rxjsBundlesRxMinJs.Observable.from(store);
  return states.map(state => state.messages).distinctUntilChanged().map(messages => {
    const pathsToFileMessages = [...messages.values()];
    const allMessages = (0, (_collection || _load_collection()).arrayFlatten)(pathsToFileMessages.map(map => (0, (_collection || _load_collection()).arrayFlatten)([...map.values()])));
    return new Set(allMessages);
  });
}