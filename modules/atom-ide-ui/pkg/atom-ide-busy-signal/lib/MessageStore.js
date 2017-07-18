'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

class MessageStore {
  // Messages will be de-duplicated: store a counter for each unique string.
  constructor() {
    this._currentMessages = new Map();
    this._messageStream = new _rxjsBundlesRxMinJs.BehaviorSubject([]);
  }

  getMessageStream() {
    return this._messageStream;
  }

  displayMessage(message) {
    const count = (this._currentMessages.get(message) || 0) + 1;
    this._currentMessages.set(message, count);
    if (count === 1) {
      this._publishMessages();
    }
    return new _atom.Disposable(() => {
      const remainingCount = this._currentMessages.get(message);

      if (!(remainingCount != null)) {
        throw new Error('Invariant violation: "remainingCount != null"');
      }

      if (remainingCount === 1) {
        this._currentMessages.delete(message);
        this._publishMessages();
      } else {
        this._currentMessages.set(message, remainingCount - 1);
      }
    });
  }

  _publishMessages() {
    this._messageStream.next(Array.from(this._currentMessages.keys()));
  }
}
exports.default = MessageStore; /**
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