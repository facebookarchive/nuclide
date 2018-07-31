"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.IndieLinterDelegate = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _LinterAdapter() {
  const data = require("../services/LinterAdapter");

  _LinterAdapter = function () {
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
 * 
 * @format
 */
class IndieLinterDelegate {
  // For compatibility with the Nuclide API.
  constructor(config) {
    this._name = config.name;
    this._supportedMessageKinds = config.supportedMessageKinds || ['lint'];
    this._uiSettings = Object.freeze(config.uiSettings ? config.uiSettings.slice() : []);
    this._messages = [];
    this._updates = new _RxMin.Subject();
    this._invalidations = new _RxMin.Subject();
    this._destroyed = new _RxMin.BehaviorSubject(false);
    this.updates = this._updates.asObservable();
    this.invalidations = this._invalidations.asObservable();
  }

  get name() {
    return this._name;
  }

  get supportedMessageKinds() {
    // We'll count on ourselves not to mutate this.
    return this._supportedMessageKinds;
  }

  get uiSettings() {
    return this._uiSettings;
  }

  getMessages() {
    return this._messages;
  }

  clearMessages() {
    this._messages = [];

    this._invalidations.next({
      scope: 'all'
    });
  }

  setMessages(filePath, messages) {
    this._messages = this._messages.filter(message => message.location.file !== filePath).concat(messages);

    this._updates.next((0, _LinterAdapter().linterMessagesToDiagnosticUpdate)(filePath, [...messages], this._name));
  }

  setAllMessages(messages) {
    this.clearMessages();
    this._messages = messages;

    this._updates.next((0, _LinterAdapter().linterMessagesToDiagnosticUpdate)(null, [...messages], this._name));
  }

  onDidUpdate(callback) {
    return new (_UniversalDisposable().default)(_RxMin.Observable.merge(this.updates, this.invalidations).subscribe(() => {
      callback(this._messages);
    }));
  }

  onDidDestroy(callback) {
    return new (_UniversalDisposable().default)(this._destroyed.filter(Boolean).take(1).subscribe(callback));
  }

  dispose() {
    // Guard against double-destruction.
    if (!this._destroyed.getValue()) {
      this.clearMessages();

      this._destroyed.next(true);
    }
  }

}

exports.IndieLinterDelegate = IndieLinterDelegate;

class IndieLinterRegistry {
  constructor() {
    this._delegates = new Set();
  }

  register(config) {
    const delegate = new IndieLinterDelegate(config);

    this._delegates.add(delegate);

    delegate.onDidDestroy(() => {
      this._delegates.delete(delegate);
    });
    return delegate;
  }

  dispose() {
    this._delegates.forEach(delegate => delegate.dispose());

    this._delegates.clear();
  }

}

exports.default = IndieLinterRegistry;