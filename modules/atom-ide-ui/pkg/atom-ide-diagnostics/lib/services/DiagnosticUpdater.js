"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function Actions() {
  const data = _interopRequireWildcard(require("../redux/Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function Selectors() {
  const data = _interopRequireWildcard(require("../redux/Selectors"));

  Selectors = function () {
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

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class DiagnosticUpdater {
  constructor(store) {
    this.getMessages = () => {
      return Selectors().getMessages(this._store.getState());
    };

    this.getFileMessageUpdates = filePath => {
      return Selectors().getFileMessageUpdates(this._store.getState(), filePath);
    };

    this.observeMessages = callback => {
      return new (_UniversalDisposable().default)(this._allMessageUpdates.subscribe(callback));
    };

    this.observeFileMessages = (filePath, callback) => {
      return new (_UniversalDisposable().default)( // TODO: As a potential perf improvement, we could cache so the mapping only happens once.
      // Whether that's worth it depends on how often this is actually called with the same path.
      this._states.distinctUntilChanged((a, b) => a.messages === b.messages).map(state => Selectors().getFileMessageUpdates(state, filePath)).distinctUntilChanged((a, b) => (0, _collection().arrayEqual)(a.messages, b.messages)).subscribe(callback));
    };

    this.observeCodeActionsForMessage = callback => {
      return new (_UniversalDisposable().default)(this._states.map(state => state.codeActionsForMessage).distinctUntilChanged().subscribe(callback));
    };

    this.observeSupportedMessageKinds = callback => {
      return new (_UniversalDisposable().default)(this._states.map(Selectors().getSupportedMessageKinds).subscribe(callback));
    };

    this.observeUiConfig = callback => {
      return new (_UniversalDisposable().default)(this._states.map(Selectors().getUiConfig).subscribe(callback));
    };

    this.applyFix = message => {
      this._store.dispatch(Actions().applyFix(message));
    };

    this.applyFixesForFile = file => {
      this._store.dispatch(Actions().applyFixesForFile(file));
    };

    this.fetchCodeActions = (editor, messages) => {
      this._store.dispatch(Actions().fetchCodeActions(editor, messages));
    };

    this._store = store; // $FlowIgnore: Flow doesn't know about Symbol.observable

    this._states = _RxMin.Observable.from(store);
    this._allMessageUpdates = this._states.map(Selectors().getMessages).distinctUntilChanged();
  }

}

exports.default = DiagnosticUpdater;