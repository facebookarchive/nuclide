"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createStore;

function _reduxObservable() {
  const data = require("../../../../../nuclide-commons/redux-observable");

  _reduxObservable = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../../../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../../../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function Reducers() {
  const data = _interopRequireWildcard(require("./Reducers"));

  Reducers = function () {
    return data;
  };

  return data;
}

function Epics() {
  const data = _interopRequireWildcard(require("./Epics"));

  Epics = function () {
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

function _reduxMin() {
  const data = require("redux/dist/redux.min.js");

  _reduxMin = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
  const epics = Object.keys(Epics()).map(k => Epics()[k]).filter(epic => typeof epic === 'function');

  const rootEpic = (actions, store) => (0, _reduxObservable().combineEpics)(...epics)(actions, store, {
    messageRangeTracker
  }) // Log errors and continue.
  .catch((err, stream) => {
    (0, _log4js().getLogger)('atom-ide-diagnostics').error(err);
    return stream;
  });

  const store = (0, _reduxMin().createStore)((0, _reduxMin().combineReducers)(Reducers()), initialState, (0, _reduxMin().applyMiddleware)((0, _reduxObservable().createEpicMiddleware)(rootEpic))); // When we get new messages with fixes, track them.

  const messagesWithFixes = getFileMessages(store).map(messageSet => (0, _collection().setFilter)(messageSet, message => message.fix != null)).filter(messageSet => messageSet.size > 0);
  messagesWithFixes.let((0, _observable().diffSets)()).subscribe(({
    added,
    removed
  }) => {
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
  const states = _RxMin.Observable.from(store);

  return states.map(state => state.messages).distinctUntilChanged().map(messages => {
    const pathsToFileMessages = [...messages.values()];
    const allMessages = (0, _collection().arrayFlatten)(pathsToFileMessages.map(map => (0, _collection().arrayFlatten)([...map.values()])));
    return new Set(allMessages);
  });
}