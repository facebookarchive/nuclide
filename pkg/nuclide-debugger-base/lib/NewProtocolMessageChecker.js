'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class NewProtocolMessageChecker {

  constructor() {
    this._outMessageIds = new Set();
  }

  registerSentMessage(message) {
    const id = this._getIdFromMessage(message);
    if (id == null) {
      return;
    }
    this._outMessageIds.add(id);
  }

  isSentMessageResponse(message, finishMessage) {
    const id = this._getIdFromMessage(message);
    if (this._outMessageIds.has(id)) {
      if (finishMessage) {
        this._outMessageIds.delete(id);
      }
      return true;
    }
    return false;
  }

  _getIdFromMessage(message) {
    const msgObj = JSON.parse(message);
    return msgObj.id;
  }

  isNewProtocolEventMessage(message) {
    const msgObj = JSON.parse(message);
    switch (msgObj.method) {
      case 'Debugger.breakpointResolved':
      case 'Debugger.breakpointHitCountChanged':
      case 'Debugger.paused':
      case 'Debugger.resumed':
      case 'Debugger.scriptParsed':
      case 'Debugger.threadUpdated':
      case 'Debugger.threadsUpdated':
        return true;
      default:
        return false;
    }
  }
}
exports.default = NewProtocolMessageChecker;