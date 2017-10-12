'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _WebInspector;

function _load_WebInspector() {
  return _WebInspector = _interopRequireDefault(require('../../lib/WebInspector'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wrapper around `WebInspector.Object` to act like `atom.Emitter`.
 */
class Emitter {

  constructor() {
    this._underlying = new (_WebInspector || _load_WebInspector()).default.Object();
  }

  on(eventType, callback) {
    const listener = event => callback(event.data);
    this._underlying.addEventListener(eventType, listener);
    return {
      dispose: () => {
        this._underlying.removeEventListener(eventType, listener);
      }
    };
  }

  emit(eventType, value) {
    this._underlying.dispatchEventToListeners(eventType, value);
  }
}
exports.default = Emitter; /**
                            * Copyright (c) 2015-present, Facebook, Inc.
                            * All rights reserved.
                            *
                            * This source code is licensed under the license found in the LICENSE file in
                            * the root directory of this source tree.
                            *
                            * 
                            * @format
                            */