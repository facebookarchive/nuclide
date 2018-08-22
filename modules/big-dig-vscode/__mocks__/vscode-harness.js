"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.workspace = exports.window = exports.EventEmitter = exports.Uri = void 0;

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
class Uri {}

exports.Uri = Uri;
Uri.parse = jest.fn();

class EventEmitter {
  constructor() {
    this._listeners = new Set();
    this.event = jest.fn(listener => {
      const _listeners = this._listeners;

      _listeners.add(listener);

      return {
        dispose() {
          _listeners.delete(listener);
        }

      };
    });
    this.dispose = jest.fn(() => this._listeners.clear());
    this.fire = jest.fn(x => this._listeners.forEach(listener => listener(x)));
  }

}

exports.EventEmitter = EventEmitter;
const window = {
  showErrorMessage: jest.fn()
};
exports.window = window;
const workspace = {
  getConfiguration(property) {
    return {
      get: (name, defaultValue) => {
        return defaultValue;
      }
    };
  }

};
exports.workspace = workspace;