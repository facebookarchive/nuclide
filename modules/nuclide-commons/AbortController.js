'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.AbortSignal = undefined;var _eventTargetShim;



















function _load_eventTargetShim() {return _eventTargetShim = require('event-target-shim');}




class AbortSignal extends (_eventTargetShim || _load_eventTargetShim()).EventTarget {constructor(...args) {var _temp;return _temp = super(...args), this.
    aborted = false, _temp;}
  // Defined via defineEventAttribute below.


  // $FlowIssue: Computed properties are not supported
  get [Symbol.toStringTag]() {
    return 'AbortSignal';
  }}exports.AbortSignal = AbortSignal; /**
                                        * Copyright (c) 2017-present, Facebook, Inc.
                                        * All rights reserved.
                                        *
                                        * This source code is licensed under the BSD-style license found in the
                                        * LICENSE file in the root directory of this source tree. An additional grant
                                        * of patent rights can be found in the PATENTS file in the same directory.
                                        *
                                        * 
                                        * @format
                                        */ /**
                                            * This implements polyfills for AbortSignal and AbortController
                                            * from the whatwg spec: https://dom.spec.whatwg.org/#aborting-ongoing-activities
                                            * These will become available in Chrome 66.
                                            */ // Shim of EventTarget usable in Node.
// Note that even in Chrome, EventTarget also isn't instantiable until version 64.
(0, (_eventTargetShim || _load_eventTargetShim()).defineEventAttribute)(AbortSignal.prototype, 'abort');class AbortController {constructor() {this.signal = new AbortSignal();}abort() {// From whatwg spec, section 3.2:
    // If signal’s aborted flag is set, then return.
    if (this.signal.aborted) {return;} // Set signal’s aborted flag.
    this.signal.aborted = true; // Fire an event named abort at signal.
    // Note: event-target-shim converts objects to Events.
    this.signal.dispatchEvent({ type: 'abort' });} // $FlowIssue: Computed properties are not supported
  get [Symbol.toStringTag]() {
    return 'AbortController';
  }}exports.default = AbortController;