'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('../redux/Actions'));
}

var _Selectors;

function _load_Selectors() {
  return _Selectors = _interopRequireWildcard(require('../redux/Selectors'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class DiagnosticUpdater {

  constructor(store) {
    this.getMessages = () => {
      return (_Selectors || _load_Selectors()).getMessages(this._store.getState());
    };

    this.getProjectMessages = () => {
      return (_Selectors || _load_Selectors()).getProjectMessages(this._store.getState());
    };

    this.getFileMessageUpdates = filePath => {
      return (_Selectors || _load_Selectors()).getFileMessageUpdates(this._store.getState(), filePath);
    };

    this.observeProjectMessages = callback => {
      return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._projectMessageUpdates.subscribe(callback));
    };

    this.observeMessages = callback => {
      return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._allMessageUpdates.subscribe(callback));
    };

    this.observeFileMessages = (filePath, callback) => {
      return new (_UniversalDisposable || _load_UniversalDisposable()).default(
      // TODO: As a potential perf improvement, we could cache so the mapping only happens once.
      // Whether that's worth it depends on how often this is actually called with the same path.
      this._states.distinctUntilChanged((a, b) => a.messages === b.messages).map(state => (_Selectors || _load_Selectors()).getFileMessageUpdates(state, filePath)).distinctUntilChanged((a, b) => (0, (_collection || _load_collection()).arrayEqual)(a.messages, b.messages)).subscribe(callback));
    };

    this.applyFix = message => {
      this._store.dispatch((_Actions || _load_Actions()).applyFix(message));
    };

    this.applyFixesForFile = file => {
      this._store.dispatch((_Actions || _load_Actions()).applyFixesForFile(file));
    };

    this._store = store;
    // $FlowIgnore: Flow doesn't know about Symbol.observable
    this._states = _rxjsBundlesRxMinJs.Observable.from(store);

    this._projectMessageUpdates = this._states.map((_Selectors || _load_Selectors()).getProjectMessages).distinctUntilChanged();

    this._allMessageUpdates = this._states.map((_Selectors || _load_Selectors()).getMessages).distinctUntilChanged();
  }

}
exports.default = DiagnosticUpdater; /**
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