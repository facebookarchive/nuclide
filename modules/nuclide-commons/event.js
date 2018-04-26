'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.



















attachEvent = attachEvent;exports.













observableFromSubscribeFunction = observableFromSubscribeFunction;var _UniversalDisposable;function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('./UniversalDisposable'));}var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                                                                    * Add an event listener an return a disposable for removing it. Note that this function assumes
                                                                                                                                                                                                                                                                                                                                                                                    * node EventEmitter semantics: namely, that adding the same combination of eventName and callback
                                                                                                                                                                                                                                                                                                                                                                                    * adds a second listener.
                                                                                                                                                                                                                                                                                                                                                                                    */ /**
                                                                                                                                                                                                                                                                                                                                                                                        * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                        * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                                                                        * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                        * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                        * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                                                                        * 
                                                                                                                                                                                                                                                                                                                                                                                        * @format
                                                                                                                                                                                                                                                                                                                                                                                        */function attachEvent(emitter, eventName, callback) {emitter.addListener(eventName, callback);return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {emitter.removeListener(eventName, callback);});}function observableFromSubscribeFunction(fn) {return _rxjsBundlesRxMinJs.Observable.create(observer => {const disposable = fn(observer.next.bind(observer));return () => {disposable.dispose();};});}