"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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
class BusySignalSingleton {
  constructor(messageStore) {
    this._messageStore = messageStore;
  }

  dispose() {}

  reportBusy(title, options) {
    return this._messageStore.add(title, options || {});
  }
  /**
   * Publishes a 'busy' message with the given string. Marks it as done when the
   * promise returned by the given function is resolved or rejected.
   *
   * Used to indicate that some work is ongoing while the given asynchronous
   * function executes.
   */


  async reportBusyWhile(title, f, options) {
    const busySignal = this.reportBusy(title, options);

    try {
      return await f();
    } finally {
      busySignal.dispose();
    }
  }

}

exports.default = BusySignalSingleton;