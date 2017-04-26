'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DedupedBusySignalProviderBase = undefined;

var _atom = require('atom');

var _BusySignalProviderBase;

function _load_BusySignalProviderBase() {
  return _BusySignalProviderBase = require('./BusySignalProviderBase');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class DedupedBusySignalProviderBase extends (_BusySignalProviderBase || _load_BusySignalProviderBase()).BusySignalProviderBase {

  constructor() {
    super();
    this._messageRecords = new Map();
  }
  // Invariant: All contained MessageRecords must have a count greater than or equal to one.


  displayMessage(message, options) {
    this._incrementCount(message, options);
    return new _atom.Disposable(() => {
      this._decrementCount(message, options);
    });
  }

  _incrementCount(message, options) {
    const key = this._getKey(message, options);
    let record = this._messageRecords.get(key);
    if (record == null) {
      record = {
        disposable: super.displayMessage(message, options),
        count: 1
      };
      this._messageRecords.set(key, record);
    } else {
      record.count++;
    }
  }

  _decrementCount(message, options) {
    const key = this._getKey(message, options);
    const record = this._messageRecords.get(key);

    if (!(record != null)) {
      throw new Error('Invariant violation: "record != null"');
    }

    if (!(record.count > 0)) {
      throw new Error('Invariant violation: "record.count > 0"');
    }

    if (record.count === 1) {
      record.disposable.dispose();
      this._messageRecords.delete(key);
    } else {
      record.count--;
    }
  }

  _getKey(message, options) {
    return JSON.stringify({
      message,
      options
    });
  }
}
exports.DedupedBusySignalProviderBase = DedupedBusySignalProviderBase;