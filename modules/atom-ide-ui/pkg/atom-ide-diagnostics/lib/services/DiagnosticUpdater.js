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
  constructor(store, messageRangeTracker) {
    this._getMessagesSupportedByMessageRangeTracker = state => {
      const messages = Selectors().getMessages(state);
      return this._updateMessageRangeFromAtomRange(messages);
    };

    this._getFileMessageUpdatesSupportedByMessageRangeTracker = (filePath, state) => {
      const currentState = state ? state : this._store.getState();
      const diagnosticsMessages = Selectors().getFileMessageUpdates(currentState, filePath);
      return Object.assign({}, diagnosticsMessages, {
        messages: this._updateMessageRangeFromAtomRange(diagnosticsMessages.messages)
      });
    };

    this.getMessages = () => {
      return this._getMessagesSupportedByMessageRangeTracker(this._store.getState());
    };

    this.getFileMessageUpdates = filePath => {
      return this._getFileMessageUpdatesSupportedByMessageRangeTracker(filePath, this._store.getState());
    };

    this.observeMessages = callback => {
      return new (_UniversalDisposable().default)(this._allMessageUpdates.subscribe(callback));
    };

    this.observeFileMessages = (filePath, callback) => {
      return new (_UniversalDisposable().default)( // TODO: As a potential perf improvement, we could cache so the mapping only happens once.
      // Whether that's worth it depends on how often this is actually called with the same path.
      this._states.distinctUntilChanged((a, b) => a.messages === b.messages).map(state => this._getFileMessageUpdatesSupportedByMessageRangeTracker(filePath, state)).distinctUntilChanged((a, b) => (0, _collection().arrayEqual)(a.messages, b.messages)).subscribe(callback));
    };

    this.observeCodeActionsForMessage = callback => {
      return new (_UniversalDisposable().default)(this._states.map(state => state.codeActionsForMessage).distinctUntilChanged().subscribe(callback));
    };

    this.observeDescriptions = callback => {
      return new (_UniversalDisposable().default)(this._states.map(state => state.descriptions).distinctUntilChanged().subscribe(callback));
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

    this.fetchDescriptions = messages => {
      this._store.dispatch(Actions().fetchDescriptions(messages));
    };

    this._store = store; // $FlowIgnore: Flow doesn't know about Symbol.observable

    this._states = _RxMin.Observable.from(store);
    this._messageRangeTracker = messageRangeTracker;
    this._allMessageUpdates = this._states.distinctUntilChanged((a, b) => a.messages === b.messages).map(this._getMessagesSupportedByMessageRangeTracker).distinctUntilChanged((a, b) => (0, _collection().arrayEqual)(a, b));
  } // Following two helper function is to keep track of messages whose marker may
  // already shifted lines when an update is triggered. In that case, we replace
  // the message.range with the range we get from atom
  // wrapper on Selectors.getMessages


  _updateMessageRangeFromAtomRange(messages) {
    return messages.map(message => {
      const range = this._messageRangeTracker.getCurrentRange(message);

      return range ? Object.assign({}, message, {
        range
      }) : message;
    });
  }

}

exports.default = DiagnosticUpdater;