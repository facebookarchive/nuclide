'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('../redux/Actions'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// All observables here will issue an initial value on subscribe.
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

class ObservableDiagnosticUpdater {

  constructor(store) {
    this._store = store;
    // $FlowIgnore: Flow doesn't know about Symbol.observable
    this._states = _rxjsBundlesRxMinJs.Observable.from(store).share();

    // Cache so the mapping only happens once per update, and only when we have subscribers.
    this.projectMessageUpdates = (0, (_observable || _load_observable()).cacheWhileSubscribed)(_rxjsBundlesRxMinJs.Observable.defer(() => this._states.startWith(this._store.getState()).map(state => state.projectMessages).distinctUntilChanged().map(projectMessages => (0, (_collection || _load_collection()).arrayFlatten)([...projectMessages.values()]))));

    // Cache so the mapping only happens once per update, and only when we have subscribers.
    // TODO: As a potential perf improvement, we could precalculate this in the reducer.
    this.allMessageUpdates = (0, (_observable || _load_observable()).cacheWhileSubscribed)(_rxjsBundlesRxMinJs.Observable.defer(() => this._states.startWith(this._store.getState()).map(state => {
      const projectMessages = (0, (_collection || _load_collection()).arrayFlatten)(Array.from(state.projectMessages.values()));
      const fileScopedMessageMaps = Array.from(state.messages.values());
      const ungrouped = fileScopedMessageMaps.map(map => Array.from(map.values()));
      const flattened = (0, (_collection || _load_collection()).arrayFlatten)((0, (_collection || _load_collection()).arrayFlatten)(ungrouped));
      return [...projectMessages, ...flattened];
    })));
  }

  getFileMessageUpdates(filePath) {
    // TODO: As a potential perf improvement, we could cache so the mapping only happens once.
    // Whether that's worth it depends on how often this is actually called with the same path.
    return this._states.startWith(this._store.getState()).map(state => state.messages).distinctUntilChanged().map(pathsToMessages => {
      const pathToMessageMaps = Array.from(pathsToMessages.values());
      const messages = (0, (_collection || _load_collection()).arrayFlatten)(pathToMessageMaps.map(pathToMessageMap => pathToMessageMap.get(filePath) || []));
      return messages;
    }).distinctUntilChanged((_collection || _load_collection()).arrayEqual).map(messages => ({ filePath, messages }));
  }

  applyFix(message) {
    this._store.dispatch((_Actions || _load_Actions()).applyFix(message));
  }

  applyFixesForFile(file) {
    this._store.dispatch((_Actions || _load_Actions()).applyFixesForFile(file));
  }
}
exports.default = ObservableDiagnosticUpdater;