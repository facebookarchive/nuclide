'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default =

















function (send, eventsFromService) {
  return {
    // TODO: Update these to be `(object: any, ...objects: Array<any>): void` to allow for logging objects.
    log(...args) {
      send(createMessageEvent('log', args));
    },
    error(...args) {
      send(createMessageEvent('error', args));
    },
    warn(...args) {
      send(createMessageEvent('warning', args));
    },
    info(...args) {
      send(createMessageEvent('info', args));
    },
    success(...args) {
      send(createMessageEvent('success', args));
    } };

};

function createMessageEvent(level, args) {
  return {
    type: 'message',
    data: { level, args } };

} /**
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