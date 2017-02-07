'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MessageStore = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _atom = require('atom');

class MessageStore {
  // provider to id to messages.
  constructor() {
    this._currentMessages = new Map();
    this._messageStream = new _rxjsBundlesRxMinJs.BehaviorSubject([]);
  }

  consumeProvider(provider) {
    const subscription = provider.messages.subscribe(message => this._processUpdate(provider, message));
    return new _atom.Disposable(() => {
      subscription.unsubscribe();
      this._currentMessages.delete(provider);
      this._publishMessages();
    });
  }

  getMessageStream() {
    return this._messageStream;
  }

  _processUpdate(provider, message) {
    let idMap = this._currentMessages.get(provider);
    if (idMap == null) {
      idMap = new Map();
      this._currentMessages.set(provider, idMap);
    }
    if (message.status === 'busy') {
      idMap.set(message.id, message);
    } else {
      if (!(message.status === 'done')) {
        throw new Error('Invariant violation: "message.status === \'done\'"');
      }

      idMap.delete(message.id);
    }
    this._publishMessages();
  }

  _publishMessages() {
    const messages = [];
    for (const idMap of this._currentMessages.values()) {
      for (const message of idMap.values()) {
        messages.push(message);
      }
    }
    this._messageStream.next(messages);
  }
}
exports.MessageStore = MessageStore; /**
                                      * Copyright (c) 2015-present, Facebook, Inc.
                                      * All rights reserved.
                                      *
                                      * This source code is licensed under the license found in the LICENSE file in
                                      * the root directory of this source tree.
                                      *
                                      * 
                                      */